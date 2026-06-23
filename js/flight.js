// flight.js - Live Flight Tracker (External Link Version)
// Uses AviationStack for flight data lookups + Direct routing to Flightradar24

const AVIATION_KEY = '4f61cc85d33d815115734e6169f41a0e';

let flightPanelOpen = false;
let activeTab = 'map'; // 'map' or 'search'

// ✅ Helper: Redirect cleanly to Flightradar24 in a new tab
function redirectToFlightradar24(flightCode = '') {
    let url = 'https://www.flightradar24.com';
    
    if (flightCode) {
        const cleanCode = flightCode.trim().toUpperCase();
        // Direct deep-link routing structure for specific flight paths
        url = `https://www.flightradar24.com/data/flights/${cleanCode}`;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
}

// ✅ Toggle flight panel visibility
function toggleFlightPanel() {
    const panel = document.getElementById('flight-panel');
    const overlay = document.getElementById('flight-overlay');
    flightPanelOpen = !flightPanelOpen;

    if (flightPanelOpen) {
        panel.style.display = 'flex';
        overlay.style.display = 'block';
        setTimeout(() => {
            initFlightMap(); // Initializes the redirect menu interface
        }, 100);
    } else {
        panel.style.display = 'none';
        overlay.style.display = 'none';
    }
}

// ✅ Switch tabs within the panel
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
    } else {
        searchTab.style.background = '#4f46e5';
        searchTab.style.color = 'white';
        mapTab.style.background = 'transparent';
        mapTab.style.color = '#4f46e5';
        mapContent.style.display = 'none';
        searchContent.style.display = 'block';
    }
}

// ✅ Render a beautiful layout redirect inside the old map container element
function initFlightMap() {
    const container = document.getElementById('flight-map-container');
    if (container) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #f8fafc; padding: 24px; text-align: center; box-sizing: border-box;">
                <div style="font-size: 3.5rem; margin-bottom: 12px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">✈️</div>
                <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 1.1rem; font-weight: bold;">全球雷达实时追踪</h3>
                <p style="color: #64748b; font-size: 0.82rem; max-width: 280px; margin: 0 0 20px 0; line-height: 1.5;">
                    由于外部API限制，推荐使用专业的 Flightradar24 平台，查看无延迟的全球高精度实时客机飞行轨迹(可能已不支持网页浏览追踪地图，需下载其手机app)。
                </p>
                <button onclick="redirectToFlightradar24()" style="background: #4f46e5; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); transition: all 0.2s;">
                    🗺️ 打开 Flightradar24 全球地图
                </button>
            </div>
        `;
    }

    const statusEl = document.getElementById('flight-map-status');
    if (statusEl) {
        statusEl.textContent = '已连接到 Flightradar24 外部航班流驱动';
    }
}

// ✅ Search flight by number using AviationStack
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
            const targetFlightCode = flight.flight.iata || input;

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
                margin-bottom: 12px;
                border-left: 4px solid ${statusColor};
                font-size: 0.82rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            `;
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <strong style="font-size:0.95rem;">✈️ ${targetFlightCode}</strong>
                    <span style="color:${statusColor};font-weight:bold;">${statusText}</span>
                </div>
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                    <div style="flex:1;background:white;border-radius:8px;padding:8px;text-align:center;">
                        <div style="font-size:1.1rem;font-weight:bold;">${dep.iata || '?'}</div>
                        <div style="color:#666;font-size:0.75rem;">${dep.airport || '出发机场'}</div>
                        <div style="color:#333;margin-top:4px;font-size:0.72rem;line-height:1.3;">
                            计划: ${dep.scheduled ? new Date(dep.scheduled).toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}) : '--'}<br/>
                            实际: ${dep.actual ? new Date(dep.actual).toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}) : '--'}
                        </div>
                        ${dep.delay ? `<div style="color:#c62828;margin-top:2px;font-size:0.7rem;">延误 ${dep.delay} 分钟</div>` : ''}
                    </div>
                    <div style="display:flex;align-items:center;font-size:1.2rem;color:#cbd5e1;">→</div>
                    <div style="flex:1;background:white;border-radius:8px;padding:8px;text-align:center;">
                        <div style="font-size:1.1rem;font-weight:bold;">${arr.iata || '?'}</div>
                        <div style="color:#666;font-size:0.75rem;">${arr.airport || '到达机场'}</div>
                        <div style="color:#333;margin-top:4px;font-size:0.72rem;line-height:1.3;">
                            计划: ${arr.scheduled ? new Date(arr.scheduled).toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}) : '--'}<br/>
                            实际: ${arr.actual ? new Date(arr.actual).toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}) : '--'}
                        </div>
                        ${arr.delay ? `<div style="color:#c62828;margin-top:2px;font-size:0.7rem;">延误 ${arr.delay} 分钟</div>` : ''}
                    </div>
                </div>
                <div style="color:#666;font-size:0.78rem;margin-bottom:10px; display:flex; justify-content:space-between;">
                    <span>航空公司: ${flight.airline.name || '未知'}</span>
                    <span>机型: ${flight.aircraft?.iata || '未知'}</span>
                </div>
                <button onclick="redirectToFlightradar24('${targetFlightCode}')" style="width: 100%; background: #0f172a; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    🌐 在 Flightradar24 中实时追踪该航班
                </button>
            `;
            resultEl.appendChild(card);
        });

    } catch (err) {
        resultEl.innerHTML = '<p style="color:#c62828;font-size:0.85rem;">搜索失败，请稍后重试</p>';
        console.error('AviationStack error:', err);
    }
}

// Global scope mapping exposure
window.toggleFlightPanel = toggleFlightPanel;
window.switchFlightTab = switchFlightTab;
window.searchFlight = searchFlight;
window.redirectToFlightradar24 = redirectToFlightradar24;
