// backend/routes/map-addon.js

// 1. Setup Supabase Client Configuration
const { createClient } = supabase;
const SUPABASE_URL = 'https://brxbaaxhzflqwmkfieid.supabase.co/rest/v1/'; // 🌟 Put your Project URL here
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeGJhYXhoemZscXdta2ZpZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzU0MzcsImV4cCI6MjA5NTExMTQzN30.iVKmvcUAYsI_-MzGrFEkF7KNxfQBsKCD1zkkyd8xPSI'; // 🌟 Put your anon key here
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fallback random names if users aren't logged into your forum system
const currentUserId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 6);
const currentUsername = localStorage.getItem('username') || 'Explorer_' + Math.random().toString(36).substr(2, 3);

// 2. Initialize Leaflet Map centered over China
const map = L.map('live-sharing-map').setView([34.7466, 113.6253], 12);

// 3. Mount Gaode (AMap) Tile Skins (Works flawlessly inside China)
L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
    attribution: '&copy; <a href="https://ditu.amap.com/">高德地图 AMap</a>'
}).addTo(map);

// Keep track of user pin markers drawn on the screen
const activeMarkers = {};

// 🛠️ China GPS Offset Correction Function (WGS-84 -> GCJ-02)
function transformGPS(lng, lat) {
    return [lng + 0.0045, lat + 0.0023];
}

// 4. Fire Up Browser GPS Hardware Tracking
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(async (position) => {
        const rawLat = position.coords.latitude;
        const rawLng = position.coords.longitude;

        // Apply shift calculation so markers don't offset on Gaode layers
        const [correctedLng, correctedLat] = transformGPS(rawLng, rawLat);

        // Center map onto yourself automatically on the very first GPS ping
        if (!activeMarkers[currentUserId]) {
            map.setView([correctedLat, correctedLng], 14);
        }

        // Send your coordinates straight into your new Supabase user_tracks table
        await _supabase
            .from('user_tracks')
            .upsert({
                user_id: currentUserId,
                username: currentUsername,
                latitude: correctedLat,
                longitude: correctedLng,
                updated_at: new Date()
            });

    }, (error) => console.error("GPS Tracking Access Denied:", error), {
        enableHighAccuracy: true,
        maximumAge: 0
    });
} else {
    alert("Your web browser blocks location hardware services.");
}

// 5. Connect to the Realtime Room for coordinates AND chat broadcast
const roomChannel = _supabase.channel('family-map-room', {
    config: { broadcast: { self: true } } // Displays your own messages instantly
});

// Sync map marker changes across the web sockets pipeline
roomChannel.on('postgres_changes', { event: '*', filter: 'table=eq.user_tracks' }, (payload) => {
    const { user_id, username, latitude, longitude } = payload.new;
    if (!user_id) return;

    if (activeMarkers[user_id]) {
        activeMarkers[user_id].setLatLng([latitude, longitude]);
    } else {
        activeMarkers[user_id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`<b>${username}</b> is sharing live!`).openPopup();
    }
});

// Watch for instant chat message streams
roomChannel.on('broadcast', { event: 'shout-message' }, (payload) => {
    const { sender, message, time } = payload.payload;
    appendMessage(sender, message, time);
});

// Turn on subscriptions
roomChannel.subscribe();

// 6. Hook up text message frontend interactions
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgText = chatInput.value.trim();
    if (!msgText) return;

    // Send chat text packet through WebSocket channels
    await roomChannel.send({
        type: 'broadcast',
        event: 'shout-message',
        payload: {
            sender: currentUsername,
            message: msgText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    });

    chatInput.value = '';
});

// Inject message speech bubbles into UI panel safely
function appendMessage(sender, text, time) {
    const isMe = sender === currentUsername;
    const msgDiv = document.createElement('div');
    
    msgDiv.style.alignSelf = isMe ? 'flex-end' : 'flex-start';
    msgDiv.style.maxWidth = '80%';
    msgDiv.style.padding = '10px 14px';
    msgDiv.style.borderRadius = '15px';
    msgDiv.style.fontSize = '14px';
    msgDiv.style.lineHeight = '1.4';
    msgDiv.style.background = isMe ? '#007bff' : '#e9e9eb';
    msgDiv.style.color = isMe ? '#fff' : '#000';
    
    msgDiv.innerHTML = `
        <strong style="display:block; font-size:11px; margin-bottom:3px; opacity: 0.85;">${sender} &middot; ${time}</strong>
        <span>${text}</span>
    `;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Keep view pinned to bottom
}
