// skeleton.js - Skeleton loading with Pulp Fiction style dancing SVG

function showSkeleton() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    postList.innerHTML = `
        <!-- Dancing figure -->
        <div id="skeleton-dancer-container" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 0 10px;
            gap: 6px;
        ">
            <svg width="100" height="160" viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
                <!-- Head -->
                <g class="dancer-head">
                    <circle cx="50" cy="28" r="14" fill="rgba(255,255,255,0.85)" />
                    <!-- Face -->
                    <circle cx="45" cy="26" r="2" fill="#333"/>
                    <circle cx="55" cy="26" r="2" fill="#333"/>
                    <path d="M 44 32 Q 50 37 56 32" stroke="#333" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <!-- Hair -->
                    <path d="M 36 22 Q 50 10 64 22" stroke="rgba(255,255,255,0.9)" stroke-width="3" fill="none"/>
                </g>

                <!-- Body -->
                <g class="dancer-body">
                    <!-- Torso -->
                    <rect x="40" y="44" width="20" height="30" rx="4" fill="rgba(255,255,255,0.75)"/>
                    <!-- Tie (Pulp Fiction style) -->
                    <polygon points="50,46 47,58 50,62 53,58" fill="rgba(200,50,50,0.9)"/>
                </g>

                <!-- Left arm -->
                <g class="dancer-left-arm">
                    <line x1="40" y1="48" x2="22" y2="68" stroke="rgba(255,255,255,0.8)" stroke-width="5" stroke-linecap="round"/>
                    <!-- Left hand pointing -->
                    <circle cx="22" cy="68" r="4" fill="rgba(255,255,255,0.85)"/>
                    <line x1="22" y1="64" x2="18" y2="58" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-linecap="round"/>
                </g>

                <!-- Right arm -->
                <g class="dancer-right-arm">
                    <line x1="60" y1="48" x2="78" y2="68" stroke="rgba(255,255,255,0.8)" stroke-width="5" stroke-linecap="round"/>
                    <!-- Right hand pointing -->
                    <circle cx="78" cy="68" r="4" fill="rgba(255,255,255,0.85)"/>
                    <line x1="78" y1="64" x2="82" y2="58" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-linecap="round"/>
                </g>

                <!-- Hips -->
                <rect x="38" y="72" width="24" height="12" rx="4" fill="rgba(255,255,255,0.7)"/>

                <!-- Left leg -->
                <g class="dancer-left-leg">
                    <line x1="43" y1="82" x2="35" y2="115" stroke="rgba(255,255,255,0.8)" stroke-width="5" stroke-linecap="round"/>
                    <!-- Left foot -->
                    <ellipse cx="32" cy="118" rx="8" ry="4" fill="rgba(255,255,255,0.85)"/>
                </g>

                <!-- Right leg -->
                <g class="dancer-right-leg">
                    <line x1="57" y1="82" x2="65" y2="115" stroke="rgba(255,255,255,0.8)" stroke-width="5" stroke-linecap="round"/>
                    <!-- Right foot -->
                    <ellipse cx="68" cy="118" rx="8" ry="4" fill="rgba(255,255,255,0.85)"/>
                </g>
            </svg>
            <p style="color:rgba(255,255,255,0.7);font-size:0.8rem;margin:0;animation:fadeText 1.5s ease-in-out infinite alternate;">
                加载中...
            </p>
        </div>

        <!-- Skeleton post rows -->
        ${[1,2,3,4,5].map(() => `
        <div class="skeleton-post" style="
            background: rgba(255,255,255,0.12);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 10px;
            overflow: hidden;
            position: relative;
        ">
            <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                <div class="skeleton-text" style="
                    background: rgba(255,255,255,0.18);
                    border-radius: 4px;
                    height: 14px;
                    width: 70%;
                "></div>
                <div class="skeleton-text" style="
                    background: rgba(255,255,255,0.12);
                    border-radius: 4px;
                    height: 11px;
                    width: 45%;
                "></div>
            </div>
            <div style="
                width: 70px;
                height: 70px;
                border-radius: 4px;
                background: rgba(255,255,255,0.12);
                flex-shrink: 0;
            "></div>
        </div>
        `).join('')}
    `;
}

function hideSkeleton() {
    // Skeleton is replaced when posts load — no action needed
}

window.showSkeleton = showSkeleton;
window.hideSkeleton = hideSkeleton;
