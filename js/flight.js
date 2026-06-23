// flight.js - Live Flight Tracker
// OpenSky Network (free, no key) + AviationStack (flight search)

const AVIATION_KEY = '4f61cc85d33d815115734e6169f41a0e';

let flightPanelOpen = false;
let flightMap = null;
let planeMarkers = {};
let flightUpdateInterval = null;
let activeTab = 'map'; // 'map' or 'search'

// ✅ Toggle panel
function toggleFlightPanel() {
    const panel = document.getElementById('flight-panel');
    const overlay = document.getElementById('flight-overlay');
    flightPanelOpen = !flightPanelOpen;

    if (flightPanelOpen) {
        panel.style.display = 'flex';
        overlay.style.display = 'block';
        setTimeout(() => {
            initFlightMap();
        }, 100);
    } else {
        panel.style.display = 'none';
        overlay.style.display = 'none';
        if (flightUpdateInterval) {
            clearInterval(flightUpdateInterval);
            flightUpdateInterval = null;
        }
    }
}

// ✅ Switch tabs
function switchFlightTab(tab) {
    activeTab = tab;
    const mapTab = document.getElementById('flight-map-tab');
    const searchTab = document.getElementById('flight-search-tab');
    const mapContent = document.getElementById('flight-map-content');
    const searchContent = document.getElementById('flight-search-content');

    if (tab === 'map') {
        mapTab.style.background = '#4f46e5';
        mapTab.style.color = 'white';
        searchTab.style.background = 'transparent';
        searchTab.style.color = '#4f46e5';
        mapContent.style.display = 'block';
        searchContent.style.display = 'none';
        setTimeout(() => {
            if (flightMap) flightMap.invalidateSize();
        }, 100);
    } else {
        searchTab.style.background = '#4f46e5';
        searchTab.style.color = 'white';
        mapTab.style.background = 'transparent';
        mapTab.style.color = '#4f46e5';
        mapContent.style.display = 'none';
        searchContent.style.display = 'block';
    }
}

// ✅ Initialize flight map
function initFlightMap() {
    if (flightMap) {
        flightMap.invalidateSize();
        loadLivePlanes();
        return;
    }

    flightMap = L.map('flight-map-container', {
        center: [30, 105],
        zoom: 4,
        zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap'
    }).addTo(flightMap);

    loadLivePlanes();

    // Refresh every 15 seconds
    flightUpdateInterval = setInterval(loadLivePlanes, 60000);
}

// ✅ Create plane icon
function createPlaneIcon(heading) {
    return L.divIcon({
        className: '',
        html: `<div style="
            font-size: 18px;
            transform: rotate(${heading || 0}deg);
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
            line-height: 1;
        ">✈️</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

// ✅ Load live planes from OpenSky
async function loadLivePlanes() {
    const statusEl = document.getElementById('flight-map-status');
    if (statusEl) statusEl.textContent = '加载中...';

    try {
        // Get planes over China and surrounding area
        const response = await fetch(
    'https://opensky-network.org/api/states/all?lamin=15&lomin=70&lamax=55&lomax=140',
    {
        headers: {
            'Authorization': 'Basic ' + btoa('wsmymm123@outlook.com:sipHat-kabhuf-4fivhy')
        }
    }
);


        if (!response.ok) throw new Error('API error');
        const data = await response.json();

        if (!data.states || data.states.length === 0) {
            if (statusEl) statusEl.textContent = '暂无航班数据';
            return;
        }

        // Clear old markers
        Object.values(planeMarkers).forEach(m => flightMap.removeLayer(m));
        planeMarkers = {};

        let count = 0;
        data.states.forEach(state => {
            const icao = state[0];
            const callsign = (state[1] || '').trim();
            const lon = state[5];
            const lat = state[6];
            const altitude = state[7];
            const velocity = state[9];
            const heading = state[10];
            const onGround = state[8];

            if (!lat || !lon || onGround) return;

            const marker = L.marker([lat, lon], {
                icon: createPlaneIcon(heading)
            }).addTo(flightMap);

            marker.bindPopup(`
                <div style="font-size:0.8rem;min-width:140px;">
                    <strong>✈️ ${callsign || icao}</strong><br/>
                    <span>高度: ${altitude ? Math.round(altitude) + ' 米' : '未知'}</span><br/>
                    <span>速度: ${velocity ? Math.round(velocity * 3.6) + ' km/h' : '未知'}</span><br/>
                    <span>航向: ${heading ? Math.round(heading) + '°' : '未知'}</span>
                </div>
            `);

            planeMarkers[icao] = marker;
            count++;
        });

        if (statusEl) statusEl.textContent = `显示 ${count} 架航班 · 15秒自动刷新`;

    } catch (err) {
        if (statusEl) statusEl.textContent = '加载失败，请稍后重试';
        console.error('OpenSky error:', err);
    }
}

// ✅ Search flight by number
async function searchFlight() {
    const input = document.getElementById('flight-search-input').value.trim().toUpperCase();
    const resultEl = document.getElementById('flight-search-result');

    if (!input) {
        resultEl.innerHTML = '<p style="color:#888;font-size:0.85rem;">请输入航班号，例如：CA123</p>';
        return;
    }

    resultEl.innerHTML = '<p style="color:#888;font-size:0.85rem;">搜索中...</p>';

    try {
        const response = await fetch(
            `https://api.aviationstack.com/v1/flights?access_key=${AVIATION_KEY}&flight_iata=${input}&limit=3`
        );
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            resultEl.innerHTML = '<p style="color:#888;font-size:0.85rem;">未找到航班信息</p>';
            return;
        }

        resultEl.innerHTML = '';
        data.data.forEach(flight => {
            const dep = flight.departure;
            const arr = flight.arrival;
            const status = flight.flight_status;

            const statusColor = {
                'active': '#2d7a2d',
                'landed': '#4f46e5',
                'scheduled': '#f57f17',
                'cancelled': '#c62828',
                'diverted': '#e65100'
            }[status] || '#888';

            const statusText = {
                'active': '飞行中 ✈️',
                'landed': '已降落 ✅',
                'scheduled': '计划中 🕐',
                'cancelled': '已取消 ❌',
                'diverted': '改降 ⚠️'
            }[status] || status;

            const card = document.createElement('div');
            card.style.cssText = `
                background: #f9f9f9;
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 10px;
                border-left: 4px solid ${statusColor};
                font-size: 0.82rem;
            `;
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <strong style="font-size:0.95rem;">✈️ ${flight.flight.iata || input}</strong>
                    <span style="color:${statusColor};font-weight:bold;">${statusText}</span>
                </div>
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                    <div style="flex:1;background:white;border-radius:8px;padding:8px;text-align:center;">
                        <div style="font-size:1.1rem;font-weight:bold;">${dep.iata || '?'}</div>
                        <div style="color:#666;">${dep.airport || '出发机场'}</div>
                        <div style="color:#333;margin-top:4px;">
                            计划: ${dep.scheduled ? new Date(dep.scheduled).toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}) : '--'}<br/>
                            实际: ${dep.actual ? new Date(dep.actual).toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}) : '--'}
                        </div>
                        ${dep.delay ? `<div style="color:#c62828;margin-top:2px;">延误 ${dep.delay} 分钟</div>` : ''}
                    </div>
                    <div style="display:flex;align-items:center;font-size:1.2rem;">→</div>
                    <div style="flex:1;background:white;border-radius:8px;padding:8px;text-align:center;">
                        <div style="font-size:1.1rem;font-weight:bold;">${arr.iata || '?'}</div>
                        <div style="color:#666;">${arr.airport || '到达机场'}</div>
                        <div style="color:#333;margin-top:4px;">
                            计划: ${arr.scheduled ? new Date(arr.scheduled).toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}) : '--'}<br/>
                            实际: ${arr.actual ? new Date(arr.actual).toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}) : '--'}
                        </div>
                        ${arr.delay ? `<div style="color:#c62828;margin-top:2px;">延误 ${arr.delay} 分钟</div>` : ''}
                    </div>
                </div>
                <div style="color:#666;font-size:0.78rem;">
                    航空公司: ${flight.airline.name || '未知'} &nbsp;|&nbsp;
                    机型: ${flight.aircraft?.iata || '未知'}
                </div>
            `;
            resultEl.appendChild(card);
        });

    } catch (err) {
        resultEl.innerHTML = '<p style="color:#c62828;font-size:0.85rem;">搜索失败，请稍后重试</p>';
        console.error('AviationStack error:', err);
    }
}

window.toggleFlightPanel = toggleFlightPanel;
window.switchFlightTab = switchFlightTab;
window.searchFlight = searchFlight;
