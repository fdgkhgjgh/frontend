// skeleton.js - Skeleton loading with Pulp Fiction style dancing SVG

function showSkeleton() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    postList.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px 0 8px;
            gap: 4px;
        ">
            <svg width="120" height="180" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">

                <!-- 💀 Head as emoji -->
                <text class="dancer-head" x="50%" y="38" 
                    text-anchor="middle" 
                    font-size="38"
                    style="animation: headBob 0.4s ease-in-out infinite alternate;">💀</text>

                <!-- Body/torso -->
                <g class="dancer-body" style="animation: bodyTwist 0.4s ease-in-out infinite alternate; transform-origin: 60px 80px;">
                    <rect x="48" y="52" width="24" height="32" rx="5" fill="rgba(255,255,255,0.8)"/>
                    <!-- Tie -->
                    <polygon points="60,54 57,66 60,70 63,66" fill="rgba(220,40,40,0.9)"/>
                </g>

                <!-- Left arm - raise the roof move -->
                <g style="animation: leftArmRaise 0.4s ease-in-out infinite alternate; transform-origin: 48px 58px;">
                    <line x1="48" y1="58" x2="26" y2="42" stroke="rgba(255,255,255,0.85)" stroke-width="6" stroke-linecap="round"/>
                    <circle cx="26" cy="42" r="5" fill="rgba(255,255,255,0.85)"/>
                    <!-- Pointing finger up -->
                    <line x1="26" y1="42" x2="22" y2="30" stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-linecap="round"/>
                </g>

                <!-- Right arm - wave move -->
                <g style="animation: rightArmWave 0.4s ease-in-out infinite alternate; transform-origin: 72px 58px;">
                    <line x1="72" y1="58" x2="94" y2="42" stroke="rgba(255,255,255,0.85)" stroke-width="6" stroke-linecap="round"/>
                    <circle cx="94" cy="42" r="5" fill="rgba(255,255,255,0.85)"/>
                    <line x1="94" y1="42" x2="98" y2="30" stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-linecap="round"/>
                </g>

                <!-- Hips -->
                <g style="animation: hipShake 0.3s ease-in-out infinite alternate; transform-origin: 60px 88px;">
                    <rect x="46" y="82" width="28" height="12" rx="5" fill="rgba(255,255,255,0.75)"/>
                </g>

                <!-- Left leg - kick -->
                <g style="animation: leftLegKick 0.4s ease-in-out infinite alternate; transform-origin: 52px 94px;">
                    <line x1="52" y1="94" x2="38" y2="130" stroke="rgba(255,255,255,0.85)" stroke-width="6" stroke-linecap="round"/>
                    <!-- Knee bend -->
                    <line x1="38" y1="130" x2="28" y2="118" stroke="rgba(255,255,255,0.85)" stroke-width="6" stroke-linecap="round"/>
                    <ellipse cx="26" cy="116" rx="9" ry="5" fill="rgba(255,255,255,0.85)"/>
                </g>

                <!-- Right leg - step -->
                <g style="animation: rightLegStep 0.4s ease-in-out infinite alternate; transform-origin: 68px 94px;">
                    <line x1="68" y1="94" x2="82" y2="130" stroke="rgba(255,255,255,0.85)" stroke-width="6" stroke-linecap="round"/>
                    <line x1="82" y1="130" x2="92" y2="118" stroke="rgba(255,255,255,0.85)" stroke-width="6" stroke-linecap="round"/>
                    <ellipse cx="94" cy="116" rx="9" ry="5" fill="rgba(255,255,255,0.85)"/>
                </g>

                <!-- Shadow -->
                <ellipse cx="60" cy="148" rx="25" ry="5" fill="rgba(0,0,0,0.2)" 
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
            <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                <div style="background:rgba(255,255,255,0.18);border-radius:4px;height:14px;width:70%;"></div>
                <div style="background:rgba(255,255,255,0.12);border-radius:4px;height:11px;width:45%;"></div>
            </div>
            <div style="width:70px;height:70px;border-radius:4px;background:rgba(255,255,255,0.12);flex-shrink:0;"></div>
        </div>
        `).join('')}
    `;
}


function hideSkeleton() {
    // Skeleton is replaced when posts load — no action needed
}

window.showSkeleton = showSkeleton;
window.hideSkeleton = hideSkeleton;
