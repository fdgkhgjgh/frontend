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
        center: [35.8617, 104.1954], // Center of China
        zoom: 4,
        zoomControl: true
    });

    // Amap tile layer
    L.tileLayer(
        `https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}&key=${AMAP_KEY}`,
        {
            subdomains: ['1', '2', '3', '4'],
            maxZoom: 18,
            attribution: 'Â© é«˜å¾·åœ°å›¾'
        }
    ).addTo(map);
}

// Create custom marker icon
function createMarkerIcon(username, isCurrentUser) {
    const color = isCurrentUser ? '#4f46e5' : '#e53e3e';
    const initial = username ? username.charAt(0).toUpperCase() : '?';
    return L.divIcon({
        className: '',
        html: `
            <div style="
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
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${initial}</div>
            <div style="
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid ${color};
                margin: -2px auto 0;
                width: fit-content;
            "></div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44]
    });
}

// Update or create marker for a user
function updateMarker(userId, username, lat, lng) {
    const { userId: currentUserId } = getCurrentUser();
    const isCurrentUser = userId === currentUserId;

    if (markers[userId]) {
        markers[userId].setLatLng([lat, lng]);
    } else {
        const marker = L.marker([lat, lng], {
            icon: createMarkerIcon(username, isCurrentUser)
        }).addTo(map);
        marker.bindPopup(`<strong>${username}</strong>`);
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
        updateMarker(loc.user_id, loc.username, loc.latitude, loc.longitude);
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
                updateMarker(loc.user_id, loc.username, loc.latitude, loc.longitude);
            }
        })
        .subscribe();
}

// Share my location
async function startSharingLocation() {
    const { username, userId } = getCurrentUser();
    if (!userId) {
        alert('Please login to share your location');
        return;
    }

    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    isSharingLocation = true;
    document.getElementById('share-location-btn').textContent = '📍停止分享位置Stop Sharing';
    document.getElementById('share-location-btn').style.background = '#e53e3e';

    watchId = navigator.geolocation.watchPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Upsert location to Supabase
        await supabaseClient.from('locations').upsert({
            user_id: userId,
            username: username || 'Anonymous',
            latitude,
            longitude,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        // Center map on my location first time
        map.setView([latitude, longitude], 14);

    }, (err) => {
        console.error('Geolocation error:', err);
    }, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
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

    document.getElementById('share-location-btn').textContent = '📍分享我的位置Share My Location';
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
}

// Toggle map panel visibility
function toggleMapPanel() {
    const panel = document.getElementById('map-panel');
    const btn = document.getElementById('map-toggle-btn');
    const isHidden = panel.style.display === 'none' || panel.style.display === '';

    if (isHidden) {
        panel.style.display = 'flex';
        btn.textContent = '🗺️收起Hide Map';
        // Init map only when first opened
        if (!map) {
            setTimeout(initMapPanel, 100);
        } else {
            map.invalidateSize();
        }
    } else {
        panel.style.display = 'none';
        btn.textContent = '🗺️家庭地图 Family Map';
    }
}
