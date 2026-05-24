// map-panel.js
// Supabase config
const SUPABASE_URL = 'https://brxbaaxhzflqwmkfieid.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeGJhYXhoemZscXdta2ZpZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzU0MzcsImV4cCI6MjA5NTExMTQzN30.iVKmvcUAYsI_-MzGrFEkF7KNxfQBsKCD1zkkyd8xPSI';
const AMAP_KEY = 'd22286ac342a5152d00afbb62674e814';

let map = null;
let markers = {};
let supabaseClient = null;
let locationChannel = null;
let chatChannel = null;
let watchId = null;
let isSharingLocation = false;
let polylines = {}; // store track lines per user

// Get logged in user info
function getCurrentUser() {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    return { username, userId };
}

// Initialize Supabase
function initSupabase() {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
}

// Initialize map
function initMap() {
    if (map) return;

    map = L.map('map-container', {
        center: [35.8617, 104.1954],
        zoom: 4,
        zoomControl: true
    });

    // OpenStreetMap - covers whole world
    const osmLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 18,
            attribution: '© OpenStreetMap'
        }
    );

    // Amap - China detail
    const amapLayer = L.tileLayer(
        `https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}&key=${AMAP_KEY}`,
        {
            subdomains: ['1', '2', '3', '4'],
            maxZoom: 18,
            attribution: '© 高德地图'
        }
    );

    // amap as default
    amapLayer.addTo(map);

    // Layer switcher top right
    L.control.layers({
        'China Map': amapLayer,
        'World Map': osmLayer
    }).addTo(map);
}

// Create custom marker icon
function createMarkerIcon(username, isCurrentUser, profilePicUrl) {
    const color = isCurrentUser ? '#4f46e5' : '#e53e3e';
    const initial = username ? username.charAt(0).toUpperCase() : '?';

    const innerContent = profilePicUrl
        ? `<img src="${profilePicUrl}" style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                object-fit: cover;
            "/>`
        : `<div style="
                background: ${color};
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
            ">${initial}</div>`;

    return L.divIcon({
        className: '',
        html: `
            <div style="position: relative; width: 36px; height: 44px;">
                <!-- Pulsing ring -->
                <div style="
                    position: absolute;
                    top: -6px;
                    left: -6px;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: ${color};
                    opacity: 0.3;
                    animation: pulse 1.5s infinite;
                "></div>
                <!-- Profile pic or initial -->
                <div style="
                    position: relative;
                    border: 3px solid ${color};
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    width: 36px;
                    height: 36px;
                    overflow: hidden;
                ">
                    ${innerContent}
                </div>
            </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44]
    });
}

//track line
async function loadTracks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseClient
        .from('location_tracks')
        .select('*')
        .gte('recorded_at', today.toISOString())
        .order('recorded_at', { ascending: true });

    if (error) { console.error('Load tracks error:', error); return; }

    // Group by user_id
    const grouped = {};
    data.forEach(point => {
        if (!grouped[point.user_id]) grouped[point.user_id] = [];
        grouped[point.user_id].push([point.latitude, point.longitude]);
    });

    // Draw polyline for each user
    Object.entries(grouped).forEach(([userId, points]) => {
        if (polylines[userId]) {
            map.removeLayer(polylines[userId]);
        }
        if (points.length > 1) {
            polylines[userId] = L.polyline(points, {
                color: userId === getCurrentUser().userId ? '#4f46e5' : '#e53e3e',
                weight: 3,
                opacity: 0.7,
                dashArray: '6, 4'
            }).addTo(map);
        }
    });
}

//track part
let tracksVisible = false;

function toggleTracks() {
    const btn = document.getElementById('toggle-tracks-btn');
    if (tracksVisible) {
        Object.values(polylines).forEach(line => map.removeLayer(line));
        polylines = {};
        tracksVisible = false;
        btn.textContent = '显示轨迹';
    } else {
        loadTracks();
        tracksVisible = true;
        btn.textContent = '隐藏轨迹';
    }
}

// Update or create marker for a user
function updateMarker(userId, username, lat, lng, profilePic) {
    const { userId: currentUserId } = getCurrentUser();
    const isCurrentUser = userId === currentUserId;

    if (markers[userId]) {
        markers[userId].setLatLng([lat, lng]);
        markers[userId].setIcon(createMarkerIcon(username, isCurrentUser, profilePic));
    } else {
        const marker = L.marker([lat, lng], {
            icon: createMarkerIcon(username, isCurrentUser, profilePic)
        }).addTo(map);
        marker.bindPopup(`<strong>${username}</strong>`).openPopup();
        markers[userId] = marker;
    }
}

// Remove marker
function removeMarker(userId) {
    if (markers[userId]) {
        map.removeLayer(markers[userId]);
        delete markers[userId];
    }
}

// Load all current locations
async function loadLocations() {
    const { data, error } = await supabaseClient
        .from('locations')
        .select('*');

    if (error) { console.error('Load locations error:', error); return; }

    data.forEach(loc => {
        updateMarker(loc.user_id, loc.username, loc.latitude, loc.longitude, loc.profile_pic);
    });
}

// Subscribe to realtime location updates
function subscribeLocations() {
    locationChannel = supabaseClient
        .channel('locations-channel')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'locations'
        }, payload => {
            if (payload.eventType === 'DELETE') {
                removeMarker(payload.old.user_id);
            } else {
                const loc = payload.new;
updateMarker(loc.user_id, loc.username, loc.latitude, loc.longitude, loc.profile_pic);
            }
        })
        .subscribe();
}

// Share my location
async function startSharingLocation() {
    const { username, userId } = getCurrentUser();
    if (!userId) {
        alert('请登录后再分享位置Please login to share your location');
        return;
    }

    // Get profile pic from localStorage (saved during login)
    const profilePic = localStorage.getItem('profilePictureUrl') || null;

    isSharingLocation = true;
    document.getElementById('share-location-btn').textContent = '停止分享Stop Sharing';
    document.getElementById('share-location-btn').style.background = '#e53e3e';

    let firstUpdate = true;

    watchId = navigator.geolocation.watchPosition(async (pos) => {
    const raw = pos.coords;

    // ✅ Convert to GCJ-02 for accurate display on Amap
    const converted = wgs84ToGcj02(raw.latitude, raw.longitude);
    const latitude = converted.lat;
    const longitude = converted.lng;

        await supabaseClient.from('locations').upsert({
            user_id: userId,
            username: username || 'Anonymous',
            latitude,
            longitude,
            profile_pic: profilePic,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        await supabaseClient.from('location_tracks').insert({
            user_id: userId,
            username: username || 'Anonymous',
            latitude,
            longitude
        });

        await loadTracks();

        // ✅ Only center map on first update, not every update
        if (firstUpdate) {
            map.setView([latitude, longitude], 14);
            firstUpdate = false;
        }

    }, (err) => {
        console.error('Geolocation error:', err);
    }, {
        enableHighAccuracy: false,
        maximumAge: 30000,
        timeout: 10000
    });
}

// Stop sharing location
async function stopSharingLocation() {
    const { userId } = getCurrentUser();
    isSharingLocation = false;

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    // Remove from database
    if (userId) {
        await supabaseClient.from('locations').delete().eq('user_id', userId);
        removeMarker(userId);
    }

    document.getElementById('share-location-btn').textContent = '继续分享位置Share My Location';
    document.getElementById('share-location-btn').style.background = '#4f46e5';
}

// Toggle location sharing
function toggleLocationSharing() {
    if (isSharingLocation) {
        stopSharingLocation();
    } else {
        startSharingLocation();
    }
}

// Convert WGS-84 (GPS) to GCJ-02 (China maps)
function wgs84ToGcj02(lat, lng) {
    const a = 6378245.0;
    const ee = 0.00669342162296594323;

    function outOfChina(lat, lng) {
        return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
    }

    function transformLat(x, y) {
        let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
        return ret;
    }

    function transformLng(x, y) {
        let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
        return ret;
    }

    if (outOfChina(lat, lng)) {
        return { lat, lng }; // outside China, no conversion needed
    }

    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);

    return {
        lat: lat + dLat,
        lng: lng + dLng
    };
}

// Load chat messages
async function loadChatMessages() {
    const { data, error } = await supabaseClient
        .from('map_chat')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

    if (error) { console.error('Load chat error:', error); return; }

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    data.forEach(msg => appendChatMessage(msg));
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Append a chat message to the UI
function appendChatMessage(msg) {
    const { username: currentUsername } = getCurrentUser();
    const chatMessages = document.getElementById('chat-messages');
    const isMe = msg.username === currentUsername;

    const div = document.createElement('div');
    div.style.cssText = `
        margin-bottom: 8px;
        text-align: ${isMe ? 'right' : 'left'};
    `;
    div.innerHTML = `
        <span style="font-size:0.75rem; color:#888;">${msg.username}</span><br>
        <span style="
            display: inline-block;
            background: ${isMe ? '#4f46e5' : '#e2e8f0'};
            color: ${isMe ? '#fff' : '#333'};
            padding: 6px 10px;
            border-radius: 12px;
            font-size: 0.85rem;
            max-width: 80%;
            word-break: break-word;
        ">${msg.message}</span>
    `;
    chatMessages.appendChild(div);
}

// Subscribe to realtime chat
function subscribeChat() {
    chatChannel = supabaseClient
        .channel('chat-channel')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'map_chat'
        }, payload => {
            appendChatMessage(payload.new);
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .subscribe();
}

// Send chat message
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    const { username, userId } = getCurrentUser();
    const displayName = username || 'Guest';

    const { error } = await supabaseClient.from('map_chat').insert({
        username: displayName,
        message
    });

    if (error) { console.error('Send chat error:', error); return; }
    input.value = '';
}

// Initialize the whole map panel
async function initMapPanel() {
    initSupabase();
    initMap();
    await loadLocations();
    subscribeLocations();
    await loadChatMessages();
    subscribeChat();
    await loadTracks();
}

// Toggle map panel visibility
function toggleMapPanel() {
    const panel = document.getElementById('map-panel');
    const btn = document.getElementById('map-toggle-btn');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';

    if (isHidden) {
        panel.style.display = 'flex';
        btn.textContent = '🗺️收起地图Hide Map';
        // Init map only when first opened
        if (!map) {
            setTimeout(initMapPanel, 100);
        } else {
            map.invalidateSize();
        }
    } else {
        panel.style.display = 'none';
        btn.textContent = '🗺️家庭地图Family Map';
    }
}
