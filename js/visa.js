// visa.js - Passport Visa Information
// Opens passportindex.org and henleypassportindex.com for accurate data

const COUNTRIES = [
    { name: '日本 🇯🇵', code: 'jp', slug: 'japan' },
    { name: '新加坡 🇸🇬', code: 'sg', slug: 'singapore' },
    { name: '中国 🇨🇳', code: 'cn', slug: 'china' },
    { name: '香港 🇭🇰', code: 'hk', slug: 'hong-kong' },
    { name: '台湾 🇹🇼', code: 'tw', slug: 'taiwan' },
    { name: '韩国 🇰🇷', code: 'kr', slug: 'south-korea' },
    { name: '美国 🇺🇸', code: 'us', slug: 'united-states' },
    { name: '英国 🇬🇧', code: 'gb', slug: 'united-kingdom' },
    { name: '法国 🇫🇷', code: 'fr', slug: 'france' },
    { name: '德国 🇩🇪', code: 'de', slug: 'germany' },
    { name: '意大利 🇮🇹', code: 'it', slug: 'italy' },
    { name: '西班牙 🇪🇸', code: 'es', slug: 'spain' },
    { name: '葡萄牙 🇵🇹', code: 'pt', slug: 'portugal' },
    { name: '荷兰 🇳🇱', code: 'nl', slug: 'netherlands' },
    { name: '比利时 🇧🇪', code: 'be', slug: 'belgium' },
    { name: '瑞士 🇨🇭', code: 'ch', slug: 'switzerland' },
    { name: '奥地利 🇦🇹', code: 'at', slug: 'austria' },
    { name: '瑞典 🇸🇪', code: 'se', slug: 'sweden' },
    { name: '挪威 🇳🇴', code: 'no', slug: 'norway' },
    { name: '丹麦 🇩🇰', code: 'dk', slug: 'denmark' },
    { name: '芬兰 🇫🇮', code: 'fi', slug: 'finland' },
    { name: '爱尔兰 🇮🇪', code: 'ie', slug: 'ireland' },
    { name: '希腊 🇬🇷', code: 'gr', slug: 'greece' },
    { name: '波兰 🇵🇱', code: 'pl', slug: 'poland' },
    { name: '捷克 🇨🇿', code: 'cz', slug: 'czech-republic' },
    { name: '匈牙利 🇭🇺', code: 'hu', slug: 'hungary' },
    { name: '罗马尼亚 🇷🇴', code: 'ro', slug: 'romania' },
    { name: '保加利亚 🇧🇬', code: 'bg', slug: 'bulgaria' },
    { name: '克罗地亚 🇭🇷', code: 'hr', slug: 'croatia' },
    { name: '塞浦路斯 🇨🇾', code: 'cy', slug: 'cyprus' },
    { name: '卢森堡 🇱🇺', code: 'lu', slug: 'luxembourg' },
    { name: '马耳他 🇲🇹', code: 'mt', slug: 'malta' },
    { name: '冰岛 🇮🇸', code: 'is', slug: 'iceland' },
    { name: '立陶宛 🇱🇹', code: 'lt', slug: 'lithuania' },
    { name: '拉脱维亚 🇱🇻', code: 'lv', slug: 'latvia' },
    { name: '爱沙尼亚 🇪🇪', code: 'ee', slug: 'estonia' },
    { name: '斯洛伐克 🇸🇰', code: 'sk', slug: 'slovakia' },
    { name: '斯洛文尼亚 🇸🇮', code: 'si', slug: 'slovenia' },
    { name: '澳大利亚 🇦🇺', code: 'au', slug: 'australia' },
    { name: '新西兰 🇳🇿', code: 'nz', slug: 'new-zealand' },
    { name: '加拿大 🇨🇦', code: 'ca', slug: 'canada' },
    { name: '墨西哥 🇲🇽', code: 'mx', slug: 'mexico' },
    { name: '巴西 🇧🇷', code: 'br', slug: 'brazil' },
    { name: '阿根廷 🇦🇷', code: 'ar', slug: 'argentina' },
    { name: '智利 🇨🇱', code: 'cl', slug: 'chile' },
    { name: '哥伦比亚 🇨🇴', code: 'co', slug: 'colombia' },
    { name: '秘鲁 🇵🇪', code: 'pe', slug: 'peru' },
    { name: '俄罗斯 🇷🇺', code: 'ru', slug: 'russia' },
    { name: '乌克兰 🇺🇦', code: 'ua', slug: 'ukraine' },
    { name: '土耳其 🇹🇷', code: 'tr', slug: 'turkey' },
    { name: '以色列 🇮🇱', code: 'il', slug: 'israel' },
    { name: '阿联酋 🇦🇪', code: 'ae', slug: 'united-arab-emirates' },
    { name: '沙特阿拉伯 🇸🇦', code: 'sa', slug: 'saudi-arabia' },
    { name: '卡塔尔 🇶🇦', code: 'qa', slug: 'qatar' },
    { name: '科威特 🇰🇼', code: 'kw', slug: 'kuwait' },
    { name: '约旦 🇯🇴', code: 'jo', slug: 'jordan' },
    { name: '伊朗 🇮🇷', code: 'ir', slug: 'iran' },
    { name: '伊拉克 🇮🇶', code: 'iq', slug: 'iraq' },
    { name: '巴基斯坦 🇵🇰', code: 'pk', slug: 'pakistan' },
    { name: '印度 🇮🇳', code: 'in', slug: 'india' },
    { name: '孟加拉国 🇧🇩', code: 'bd', slug: 'bangladesh' },
    { name: '斯里兰卡 🇱🇰', code: 'lk', slug: 'sri-lanka' },
    { name: '尼泊尔 🇳🇵', code: 'np', slug: 'nepal' },
    { name: '泰国 🇹🇭', code: 'th', slug: 'thailand' },
    { name: '越南 🇻🇳', code: 'vn', slug: 'vietnam' },
    { name: '菲律宾 🇵🇭', code: 'ph', slug: 'philippines' },
    { name: '印度尼西亚 🇮🇩', code: 'id', slug: 'indonesia' },
    { name: '马来西亚 🇲🇾', code: 'my', slug: 'malaysia' },
    { name: '缅甸 🇲🇲', code: 'mm', slug: 'myanmar' },
    { name: '柬埔寨 🇰🇭', code: 'kh', slug: 'cambodia' },
    { name: '老挝 🇱🇦', code: 'la', slug: 'laos' },
    { name: '蒙古 🇲🇳', code: 'mn', slug: 'mongolia' },
    { name: '哈萨克斯坦 🇰🇿', code: 'kz', slug: 'kazakhstan' },
    { name: '乌兹别克斯坦 🇺🇿', code: 'uz', slug: 'uzbekistan' },
    { name: '格鲁吉亚 🇬🇪', code: 'ge', slug: 'georgia' },
    { name: '亚美尼亚 🇦🇲', code: 'am', slug: 'armenia' },
    { name: '阿塞拜疆 🇦🇿', code: 'az', slug: 'azerbaijan' },
    { name: '塞尔维亚 🇷🇸', code: 'rs', slug: 'serbia' },
    { name: '摩洛哥 🇲🇦', code: 'ma', slug: 'morocco' },
    { name: '埃及 🇪🇬', code: 'eg', slug: 'egypt' },
    { name: '南非 🇿🇦', code: 'za', slug: 'south-africa' },
    { name: '尼日利亚 🇳🇬', code: 'ng', slug: 'nigeria' },
    { name: '肯尼亚 🇰🇪', code: 'ke', slug: 'kenya' },
    { name: '埃塞俄比亚 🇪🇹', code: 'et', slug: 'ethiopia' },
    { name: '坦桑尼亚 🇹🇿', code: 'tz', slug: 'tanzania' },
    { name: '加纳 🇬🇭', code: 'gh', slug: 'ghana' },
    { name: '古巴 🇨🇺', code: 'cu', slug: 'cuba' },
    { name: '朝鲜 🇰🇵', code: 'kp', slug: 'north-korea' },
    { name: '阿富汗 🇦🇫', code: 'af', slug: 'afghanistan' },
    { name: '叙利亚 🇸🇾', code: 'sy', slug: 'syria' },
    { name: '也门 🇾🇪', code: 'ye', slug: 'yemen' },
    { name: '苏丹 🇸🇩', code: 'sd', slug: 'sudan' },
    { name: '利比亚 🇱🇾', code: 'ly', slug: 'libya' },
    { name: '安哥拉 🇦🇴', code: 'ao', slug: 'angola' },
    { name: '莫桑比克 🇲🇿', code: 'mz', slug: 'mozambique' },
    { name: '津巴布韦 🇿🇼', code: 'zw', slug: 'zimbabwe' },
    { name: '刚果 🇨🇩', code: 'cd', slug: 'dr-congo' },
    { name: '巴勒斯坦 🇵🇸', code: 'ps', slug: 'palestine' }
];

let visaPanelOpen = false;

function toggleVisaPanel() {
    const panel = document.getElementById('visa-panel');
    const overlay = document.getElementById('visa-overlay');
    visaPanelOpen = !visaPanelOpen;

    if (visaPanelOpen) {
        panel.style.display = 'flex';
        overlay.style.display = 'block';
        renderCountryList('');
        document.getElementById('visa-search').value = '';
        document.getElementById('visa-detail').style.display = 'none';
        document.getElementById('visa-list').style.display = 'block';
    } else {
        panel.style.display = 'none';
        overlay.style.display = 'none';
    }
}

function renderCountryList(searchTerm) {
    const listEl = document.getElementById('visa-list');
    listEl.innerHTML = '';

    const filtered = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) {
        listEl.innerHTML = '<p style="padding:12px;color:#888;font-size:0.85rem;">未找到结果</p>';
        return;
    }

    filtered.forEach(country => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 10px 14px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            display: flex;
            align-items: center;
            font-size: 0.9rem;
        `;
        item.onmouseenter = () => item.style.background = '#f5f5f5';
        item.onmouseleave = () => item.style.background = '';
        item.textContent = country.name;
        item.addEventListener('click', () => showVisaDetail(country));
        listEl.appendChild(item);
    });
}

function showVisaDetail(country) {
    document.getElementById('visa-list').style.display = 'none';
    const detail = document.getElementById('visa-detail');
    detail.style.display = 'block';

    const passportIndexUrl = `https://cn.passportindex.org/passport/${country.slug}/`;
    const henleyUrl = `https://www.henleypassportindex.com/passport/${country.slug}`;

    detail.innerHTML = `
        <div style="padding:12px 14px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:8px; flex-shrink:0;">
            <button onclick="showVisaList()" style="background:none;border:none;cursor:pointer;font-size:1rem;">←</button>
            <span style="font-weight:bold;">${country.name}</span>
        </div>
        <div style="padding:16px; display:flex; flex-direction:column; gap:10px;">
            <p style="font-size:0.85rem; color:#555; margin:0;">
                选择以下链接查看 ${country.name} 护照的最新签证要求及免签国家列表：
            </p>
            <a href="${passportIndexUrl}" target="_blank" style="
                display:flex;
                align-items:center;
                gap:10px;
                background:#4f46e5;
                color:white;
                padding:12px 16px;
                border-radius:10px;
                text-decoration:none;
                font-size:0.85rem;
                font-weight:bold;
            ">
                <span style="font-size:1.2rem;">🛂</span>
                <div>
                    <div>Passport Index</div>
                    <div style="font-size:0.75rem;opacity:0.85;">免签/落地签/电子签/需签证 详细列表</div>
                </div>
            </a>
            <a href="${henleyUrl}" target="_blank" style="
                display:flex;
                align-items:center;
                gap:10px;
                background:#2d7a2d;
                color:white;
                padding:12px 16px;
                border-radius:10px;
                text-decoration:none;
                font-size:0.85rem;
                font-weight:bold;
            ">
                <span style="font-size:1.2rem;">📊</span>
                <div>
                    <div>Henley Passport Index</div>
                    <div style="font-size:0.75rem;opacity:0.85;">全球护照排名及免签数量</div>
                </div>
            </a>
            <div style="margin-top:6px;padding:10px;background:#fff3e0;border-radius:8px;font-size:0.75rem;color:#666;line-height:1.5;">
                ⚠️ 签证政策随时变化，出行前请务必查阅官方最新信息
            </div>
        </div>
    `;
}

function showVisaList() {
    document.getElementById('visa-detail').style.display = 'none';
    document.getElementById('visa-list').style.display = 'block';
}

window.toggleVisaPanel = toggleVisaPanel;
window.showVisaList = showVisaList;
window.renderCountryList = renderCountryList;
