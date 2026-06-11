// skeleton.js - Skeleton loading with Pulp Fiction style dancing SVG

function showSkeleton() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    postList.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px 0 8px;
            gap: 4px;
            overflow: hidden;
        ">
            <svg width="100" height="150" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg" style="overflow:hidden;">
                <!-- 💀 Head -->
                <text x="50" y="36" text-anchor="middle" font-size="32"
                    style="animation: headBob 0.4s ease-in-out infinite alternate;">💀</text>

                <!-- Body -->
                <g style="animation: bodyTwist 0.4s ease-in-out infinite alternate; transform-origin: 50px 68px;">
                    <rect x="40" y="44" width="20" height="28" rx="4" fill="rgba(255,255,255,0.8)"/>
                    <polygon points="50,46 47,56 50,60 53,56" fill="rgba(220,40,40,0.9)"/>
                </g>

                <!-- Left arm -->
                <g style="animation: leftArmRaise 0.4s ease-in-out infinite alternate; transform-origin: 40px 52px;">
                    <line x1="40" y1="52" x2="22" y2="38" stroke="rgba(255,255,255,0.85)" stroke-width="5" stroke-linecap="round"/>
                    <line x1="22" y1="38" x2="18" y2="28" stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-linecap="round"/>
                </g>

                <!-- Right arm -->
                <g style="animation: rightArmWave 0.4s ease-in-out infinite alternate; transform-origin: 60px 52px;">
                    <line x1="60" y1="52" x2="78" y2="38" stroke="rgba(255,255,255,0.85)" stroke-width="5" stroke-linecap="round"/>
                    <line x1="78" y1="38" x2="82" y2="28" stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-linecap="round"/>
                </g>

                <!-- Hips -->
                <g style="animation: hipShake 0.3s ease-in-out infinite alternate; transform-origin: 50px 76px;">
                    <rect x="38" y="72" width="24" height="10" rx="4" fill="rgba(255,255,255,0.7)"/>
                </g>

                <!-- Left leg -->
                <g style="animation: leftLegKick 0.4s ease-in-out infinite alternate; transform-origin: 44px 82px;">
                    <line x1="44" y1="82" x2="34" y2="112" stroke="rgba(255,255,255,0.85)" stroke-width="5" stroke-linecap="round"/>
                    <line x1="34" y1="112" x2="26" y2="102" stroke="rgba(255,255,255,0.85)" stroke-width="5" stroke-linecap="round"/>
                    <ellipse cx="24" cy="100" rx="7" ry="4" fill="rgba(255,255,255,0.85)"/>
                </g>

                <!-- Right leg -->
                <g style="animation: rightLegStep 0.4s ease-in-out infinite alternate; transform-origin: 56px 82px;">
                    <line x1="56" y1="82" x2="66" y2="112" stroke="rgba(255,255,255,0.85)" stroke-width="5" stroke-linecap="round"/>
                    <line x1="66" y1="112" x2="74" y2="102" stroke="rgba(255,255,255,0.85)" stroke-width="5" stroke-linecap="round"/>
                    <ellipse cx="76" cy="100" rx="7" ry="4" fill="rgba(255,255,255,0.85)"/>
                </g>

                <!-- Shadow -->
                <ellipse cx="50" cy="130" rx="20" ry="4" fill="rgba(0,0,0,0.2)"
                    style="animation: shadowPulse 0.4s ease-in-out infinite alternate;"/>
            </svg>

            <p style="
                color:rgba(255,255,255,0.75);
                font-size:0.8rem;
                margin:0;
                animation: fadeText 0.8s ease-in-out infinite alternate;
            ">加载中...</p>
        </div>

        ${[1,2,3,4,5].map(() => `
        <div style="
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
            <div style="
                position: absolute;
                top: 0; left: -100%;
                width: 60%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                animation: shimmer 1.5s infinite;
            "></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                <div style="
                    background:rgba(255,255,255,0.2);
                    border-radius:4px;height:14px;width:70%;
                "></div>
                <div style="
                    background:rgba(255,255,255,0.13);
                    border-radius:4px;height:11px;width:45%;
                "></div>
            </div>
            <div style="
                width:70px;height:70px;
                border-radius:4px;
                background:rgba(255,255,255,0.13);
                flex-shrink:0;
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
