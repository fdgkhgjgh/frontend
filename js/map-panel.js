// map-panel.js
// Supabase config
const MAP_SUPABASE_URL = 'https://brxbaaxhzflqwmkfieid.supabase.co';
const MAP_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeGJhYXhoemZscXdta2ZpZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzU0MzcsImV4cCI6MjA5NTExMTQzN30.iVKmvcUAYsI_-MzGrFEkF7KNxfQBsKCD1zkkyd8xPSI';
const AMAP_KEY = 'd22286ac342a5152d00afbb62674e814';

let map = null;
let markers = {};
let supabaseClient = null;
let locationChannel = null;
let chatChannel = null;
let watchId = null;
let isSharingLocation = false;
let polylines = {}; // store track lines per user
let currentMapLayer = 'amap';
let lastSavedLat = null;
let lastSavedLng = null;


// Get logged in user info
function getCurrentUser() {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    return { username, userId };
}

// Initialize Supabase
function initSupabase() {
    if (window.sharedSupabaseClient) {
        supabaseClient = window.sharedSupabaseClient;
    } else {
        supabaseClient = window.supabase.createClient(MAP_SUPABASE_URL, MAP_SUPABASE_ANON);
        window.sharedSupabaseClient = supabaseClient;
    }
}

// Initialize map
function initMap() {
    if (map) return;

    map = L.map('map-container', {
        center: [35.8617, 104.1954],
        zoom: 4,
        zoomControl: true
    });

    // Yandex Maps - works in China and worldwide
    const yandexLayer = L.tileLayer(
        'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=en_US',
        {
            maxZoom: 18,
            attribution: '© Yandex Maps'
        }
    );

    // Amap for China detail
    const amapLayer = L.tileLayer(
        `https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}&key=${AMAP_KEY}`,
         {
            subdomains: ['1', '2', '3', '4'],
            maxZoom: 18,
            attribution: '© 高德地图'
        }
    );

    // ✅ Yandex as default
    amapLayer.addTo(map);

    L.control.layers({
        'World Map (Yandex)': yandexLayer,
        'China Map (Amap)': amapLayer
    }).addTo(map);

    map.on('baselayerchange', (e) => {
    if (e.name.includes('Amap') || e.name.includes('China')) {
        currentMapLayer = 'amap';
    } else {
        currentMapLayer = 'yandex';
    }
});
} // closes initMap

// Create custom marker icon
function createMarkerIcon(username, isCurrentUser, profilePicUrl) {
    const color = isCurrentUser ? '#4f46e5' : '#e53e3e';

    const innerContent = profilePicUrl
        ? `<img src="${profilePicUrl}" style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                object-fit: cover;
                display: block;
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
                line-height: 1;
            ">${username.charAt(0).toUpperCase()}</div>`;

    return L.divIcon({
        className: '',
        html: `
            <div style="position: relative; width: 36px; height: 44px;">
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
                <div style="
                    position: relative;
                    border: 3px solid ${color};
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    width: 36px;
                    height: 36px;
                    overflow: hidden;
                ">${innerContent}</div>
            </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44]
    });
}


//track line
async function loadTracks(days = 15) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 1. Change sorting to descending (false) to prioritize your LATEST positions
    const { data, error } = await supabaseClient
        .from('location_tracks')
        .select('*')
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false }) 
        .limit(2000); // Raise the roof on max points fetched if needed

    if (error) {
        console.error('Load tracks error:', error);
        return;
    }

    if (!data || data.length === 0) return;

    // 2. Flip the array back around so Leaflet draws the lines chronologically
    const chronologicalData = [...data].reverse();

    // Group by user_id
    const grouped = {};
    chronologicalData.forEach(point => {
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
        const latitude = raw.latitude;
        const longitude = raw.longitude;

        // Always upsert current live location marker
        await supabaseClient.from('locations').upsert({
            user_id: userId,
            username: username || 'Anonymous',
            latitude,
            longitude,
            profile_pic: profilePic,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        // 🧠 Optimization: Only save a history track line point if moved significantly
        const hasMoved = lastSavedLat === null || 
                         Math.abs(latitude - lastSavedLat) > 0.0002 || 
                         Math.abs(longitude - lastSavedLng) > 0.0002;

        if (hasMoved) {
            await supabaseClient.from('location_tracks').insert({
                user_id: userId,
                username: username || 'Anonymous',
                latitude,
                longitude
            });
            lastSavedLat = latitude;
            lastSavedLng = longitude;
        }

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
        maximumAge: 5000,
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

    // Generate consistent random color for username
    function getUserColor(username) {
        const colors = ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce', '#805ad5', '#d53f8c', '#2c7a7b'];
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    // Format date to detailed time
    const date = new Date(msg.created_at);
    const formattedTime = date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const userColor = getUserColor(msg.username);

    const div = document.createElement('div');
    div.style.cssText = `
        margin-bottom: 8px;
        text-align: ${isMe ? 'right' : 'left'};
    `;
    div.innerHTML = `
    <span style="font-size:0.75rem; color:${userColor}; font-weight:bold;">${msg.username}</span>
    <span style="font-size:0.75rem; color:#888; margin-left:6px;">${formattedTime}</span><br>
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
// chat extension 
let mapChatExpanded = false;

function toggleMapChat() {
    const chatBody = document.getElementById('map-chat-body');
    const btn = document.getElementById('map-chat-toggle');
    mapChatExpanded = !mapChatExpanded;
    
    if (mapChatExpanded) {
        chatBody.style.height = '400px';
        btn.textContent = '收起';
    } else {
        chatBody.style.height = '220px';
        btn.textContent = '展开';
    }

    // Scroll to bottom
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.toggleMapChat = toggleMapChat;


// Toggle map panel visibility
function toggleMapPanel() {
    const panel = document.getElementById('map-panel');
    const btn = document.getElementById('map-toggle-btn');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';

    if (isHidden) {
        panel.style.display = 'flex';
        btn.textContent = '🗺️收起地图Hide Map';
        btn.style.background = '#e53e3e';
        // Init map only when first opened
        if (!map) {
            setTimeout(initMapPanel, 100);
        } else {
            map.invalidateSize();
        }
    } else {
        panel.style.display = 'none';
        btn.textContent = '🗺️家庭地图Family Map';
        btn.style.background = '#1DA1F2';
    }
}

let searchMarker = null;

async function searchMapLocation() {
    const input = document.getElementById('map-search-input').value.trim();
    if (!input) return;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'zh-CN,zh' } }
        );
        const data = await response.json();

        if (!data || data.length === 0) {
            alert('未找到该地点');
            return;
        }

        const { lat, lon, display_name } = data[0];

        // Remove old search marker
        if (searchMarker) map.removeLayer(searchMarker);

        // Add new marker
        searchMarker = L.marker([parseFloat(lat), parseFloat(lon)], {
            icon: L.divIcon({
                className: '',
                html: `<div style="
                    background: #e53e3e;
                    color: white;
                    padding: 1px 2px;
                    border-radius: 2px;
                    font-size: 0.75rem;
                    white-space: nowrap;
                    box-shadow: 0 2px 3px rgba(0,0,0,0.3);
                ">📍 ${input}</div>`,
                iconAnchor: [0, 20]
            })
        }).addTo(map);

        searchMarker.bindPopup(display_name).openPopup();
        map.setView([parseFloat(lat), parseFloat(lon)], 12);

    } catch (err) {
        alert('搜索失败，请稍后重试');
        console.error('Search error:', err);
    }
}

window.searchMapLocation = searchMapLocation;

