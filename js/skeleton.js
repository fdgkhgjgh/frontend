// skeleton.js - Skeleton loading with Pulp Fiction style dancing SVG

function showSkeleton() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    postList.innerHTML = `
        <div style="
            position:relative;
            min-height:600px;
        ">

            <div style="
                position:absolute;
                inset:0;

                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;

                background:rgba(15,15,15,0.92);
                backdrop-filter:blur(4px);

                z-index:999;
            ">

                <svg width="120" height="170"
                     viewBox="0 0 100 150"
                     xmlns="http://www.w3.org/2000/svg"
                     style="overflow:visible;">

                    <text x="50" y="36"
                        text-anchor="middle"
                        font-size="32"
                        style="animation: headBob .4s ease-in-out infinite alternate;">
                        💀
                    </text>

                    <g style="
                        animation: bodyTwist .4s ease-in-out infinite alternate;
                        transform-origin:50px 68px;
                    ">
                        <rect x="40" y="44"
                            width="20"
                            height="28"
                            rx="4"
                            fill="rgba(255,255,255,.85)"/>

                        <polygon
                            points="50,46 47,56 50,60 53,56"
                            fill="rgba(220,40,40,.9)"/>
                    </g>

                    <g style="
                        animation:leftArmRaise .4s ease-in-out infinite alternate;
                        transform-origin:40px 52px;
                    ">
                        <line x1="40" y1="52"
                            x2="22" y2="38"
                            stroke="white"
                            stroke-width="5"
                            stroke-linecap="round"/>

                        <line x1="22" y1="38"
                            x2="18" y2="28"
                            stroke="white"
                            stroke-width="3"
                            stroke-linecap="round"/>
                    </g>

                    <g style="
                        animation:rightArmWave .4s ease-in-out infinite alternate;
                        transform-origin:60px 52px;
                    ">
                        <line x1="60" y1="52"
                            x2="78" y2="38"
                            stroke="white"
                            stroke-width="5"
                            stroke-linecap="round"/>

                        <line x1="78" y1="38"
                            x2="82" y2="28"
                            stroke="white"
                            stroke-width="3"
                            stroke-linecap="round"/>
                    </g>

                    <g style="
                        animation:hipShake .3s ease-in-out infinite alternate;
                        transform-origin:50px 76px;
                    ">
                        <rect x="38"
                            y="72"
                            width="24"
                            height="10"
                            rx="4"
                            fill="rgba(255,255,255,.7)"/>
                    </g>

                    <g style="
                        animation:leftLegKick .4s ease-in-out infinite alternate;
                        transform-origin:44px 82px;
                    ">
                        <line x1="44" y1="82"
                            x2="34" y2="112"
                            stroke="white"
                            stroke-width="5"
                            stroke-linecap="round"/>

                        <line x1="34" y1="112"
                            x2="26" y2="102"
                            stroke="white"
                            stroke-width="5"
                            stroke-linecap="round"/>

                        <ellipse cx="24"
                            cy="100"
                            rx="7"
                            ry="4"
                            fill="white"/>
                    </g>

                    <g style="
                        animation:rightLegStep .4s ease-in-out infinite alternate;
                        transform-origin:56px 82px;
                    ">
                        <line x1="56" y1="82"
                            x2="66" y2="112"
                            stroke="white"
                            stroke-width="5"
                            stroke-linecap="round"/>

                        <line x1="66" y1="112"
                            x2="74" y2="102"
                            stroke="white"
                            stroke-width="5"
                            stroke-linecap="round"/>

                        <ellipse cx="76"
                            cy="100"
                            rx="7"
                            ry="4"
                            fill="white"/>
                    </g>

                </svg>

                <div id="loading-text"
                    style="
                        margin-top:10px;
                        color:#ddd;
                        font-size:.9rem;
                    ">
                    💀 Waking up Render server...
                </div>

            </div>

        </div>
    `;

    const messages = [
        "💀 Waking up Render server...",
        "☕ Backend is making coffee...",
        "🦥 Free plan detected...",
        "📦 Loading posts...",
        "⚡ Summoning data...",
        "🎉 Almost there..."
    ];

    let i = 0;

    clearInterval(window.loadingMsgInterval);

    window.loadingMsgInterval = setInterval(() => {
        const el = document.getElementById('loading-text');

        if (el) {
            el.textContent = messages[i % messages.length];
            i++;
        }
    }, 3000);
}


function hideSkeleton() {
    // Skeleton is replaced when posts load — no action needed
}

window.showSkeleton = showSkeleton;
window.hideSkeleton = hideSkeleton;
