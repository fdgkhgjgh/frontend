// Currency converter using ExchangeRate-API
const API_KEY = 'c7d15e9f7e70fca59d2678d5';

// Currency names in Chinese
const CURRENCY_NAMES = {
    'USD': '美元 🇺🇸', 'CNY': '人民币 🇨🇳', 'EUR': '欧元 🇪🇺',
    'GBP': '英镑 🇬🇧', 'JPY': '日元 🇯🇵', 'HKD': '港币 🇭🇰',
    'TWD': '新台币 🇹🇼', 'KRW': '韩元 🇰🇷', 'SGD': '新加坡元 🇸🇬',
    'AUD': '澳元 🇦🇺', 'CAD': '加元 🇨🇦', 'CHF': '瑞士法郎 🇨🇭',
    'THB': '泰铢 🇹🇭', 'MYR': '马来西亚令吉 🇲🇾', 'IDR': '印尼盾 🇮🇩',
    'VND': '越南盾 🇻🇳', 'PHP': '菲律宾比索 🇵🇭', 'INR': '印度卢比 🇮🇳',
    'RUB': '俄罗斯卢布 🇷🇺', 'MXN': '墨西哥比索 🇲🇽', 'BRL': '巴西雷亚尔 🇧🇷',
    'ZAR': '南非兰特 🇿🇦', 'NOK': '挪威克朗 🇳🇴', 'SEK': '瑞典克朗 🇸🇪',
    'DKK': '丹麦克朗 🇩🇰', 'NZD': '新西兰元 🇳🇿', 'AED': '阿联酋迪拉姆 🇦🇪',
    'SAR': '沙特里亚尔 🇸🇦', 'TRY': '土耳其里拉 🇹🇷', 'PLN': '波兰兹罗提 🇵🇱',
    'CZK': '捷克克朗 🇨🇿', 'HUF': '匈牙利福林 🇭🇺', 'ILS': '以色列谢克尔 🇮🇱',
    'CLP': '智利比索 🇨🇱', 'COP': '哥伦比亚比索 🇨🇴', 'PEN': '秘鲁索尔 🇵🇪',
    'ARS': '阿根廷比索 🇦🇷', 'EGP': '埃及镑 🇪🇬', 'NGN': '尼日利亚奈拉 🇳🇬',
    'KES': '肯尼亚先令 🇰🇪', 'GHS': '加纳塞地 🇬🇭', 'MAD': '摩洛哥迪拉姆 🇲🇦',
    'PKR': '巴基斯坦卢比 🇵🇰', 'BDT': '孟加拉塔卡 🇧🇩', 'LKR': '斯里兰卡卢比 🇱🇰',
    'NPR': '尼泊尔卢比 🇳🇵', 'MMK': '缅元 🇲🇲', 'KHR': '柬埔寨瑞尔 🇰🇭',
    'LAK': '老挝基普 🇱🇦', 'BND': '文莱元 🇧🇳', 'MOP': '澳门元 🇲🇴',
    'MNT': '蒙古图格里克 🇲🇳', 'KZT': '哈萨克坚戈 🇰🇿', 'UZS': '乌兹别克苏姆 🇺🇿',
    'GEL': '格鲁吉亚拉里 🇬🇪', 'AMD': '亚美尼亚德拉姆 🇦🇲', 'AZN': '阿塞拜疆马纳特 🇦🇿',
    'UAH': '乌克兰格里夫纳 🇺🇦', 'BYN': '白俄罗斯卢布 🇧🇾', 'MDL': '摩尔多瓦列伊 🇲🇩',
    'RON': '罗马尼亚列伊 🇷🇴', 'BGN': '保加利亚列弗 🇧🇬', 'HRK': '克罗地亚库纳 🇭🇷',
    'RSD': '塞尔维亚第纳尔 🇷🇸', 'BAM': '波黑可兑换马克 🇧🇦', 'MKD': '北马其顿代纳尔 🇲🇰',
    'ALL': '阿尔巴尼亚列克 🇦🇱', 'ISK': '冰岛克朗 🇮🇸', 'QAR': '卡塔尔里亚尔 🇶🇦',
    'KWD': '科威特第纳尔 🇰🇼', 'BHD': '巴林第纳尔 🇧🇭', 'OMR': '阿曼里亚尔 🇴🇲',
    'JOD': '约旦第纳尔 🇯🇴', 'LBP': '黎巴嫩镑 🇱🇧', 'IQD': '伊拉克第纳尔 🇮🇶',
    'IRR': '伊朗里亚尔 🇮🇷', 'AFN': '阿富汗尼 🇦🇫', 'GTQ': '危地马拉格查尔 🇬🇹',
    'HNL': '洪都拉斯伦皮拉 🇭🇳', 'NIO': '尼加拉瓜科多巴 🇳🇮', 'CRC': '哥斯达黎加科朗 🇨🇷',
    'PAB': '巴拿马巴波亚 🇵🇦', 'DOP': '多米尼加比索 🇩🇴', 'CUP': '古巴比索 🇨🇺',
    'JMD': '牙买加元 🇯🇲', 'TTD': '特立尼达元 🇹🇹', 'BBD': '巴巴多斯元 🇧🇧',
    'BSD': '巴哈马元 🇧🇸', 'HTG': '海地古德 🇭🇹', 'UYU': '乌拉圭比索 🇺🇾',
    'PYG': '巴拉圭瓜拉尼 🇵🇾', 'BOB': '玻利维亚诺 🇧🇴', 'VES': '委内瑞拉玻利瓦尔 🇻🇪',
    'GYD': '圭亚那元 🇬🇾', 'SRD': '苏里南元 🇸🇷', 'AWG': '阿鲁巴弗罗林 🇦🇼',
    'TZS': '坦桑尼亚先令 🇹🇿', 'UGX': '乌干达先令 🇺🇬', 'RWF': '卢旺达法郎 🇷🇼',
    'ETB': '埃塞俄比亚比尔 🇪🇹', 'SOS': '索马里先令 🇸🇴', 'SDG': '苏丹镑 🇸🇩',
    'DZD': '阿尔及利亚第纳尔 🇩🇿', 'TND': '突尼斯第纳尔 🇹🇳', 'LYD': '利比亚第纳尔 🇱🇾',
    'MUR': '毛里求斯卢比 🇲🇺', 'SCR': '塞舌尔卢比 🇸🇨', 'MZN': '莫桑比克梅蒂卡尔 🇲🇿',
    'ZMW': '赞比亚克瓦查 🇿🇲', 'BWP': '博茨瓦纳普拉 🇧🇼', 'NAD': '纳米比亚元 🇳🇦',
    'MWK': '马拉维克瓦查 🇲🇼', 'XOF': '西非法郎 🌍', 'XAF': '中非法郎 🌍',
    'FJD': '斐济元 🇫🇯', 'PGK': '巴布亚新几内亚基那 🇵🇬', 'WST': '萨摩亚塔拉 🇼🇸',
    'SBD': '所罗门群岛元 🇸🇧', 'VUV': '瓦努阿图瓦图 🇻🇺', 'TOP': '汤加潘阿加 🇹🇴'
};

let ratesCache = null;
let ratesCacheTime = null;
let availableCurrencies = [];

async function fetchRates(baseCurrency) {
    // ✅ Use cache if less than 1 hour old
    if (ratesCache && ratesCacheTime && Date.now() - ratesCacheTime < 7200000) {
        return ratesCache;
    }

    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/c7d15e9f7e70fca59d2678d5/latest/${baseCurrency}`);
        const data = await response.json();
        if (data.result === 'success') {
            ratesCache = data.conversion_rates;
            ratesCacheTime = Date.now();
            return data.conversion_rates;
        }
    } catch (err) {
        console.error('Exchange rate fetch error:', err);
    }
    return null;
}

async function initCurrencyConverter() {
    const fromSelect = document.getElementById('currency-from');
    const toSelect = document.getElementById('currency-to');
    if (!fromSelect || !toSelect) return;

    // Fetch available currencies
    const rates = await fetchRates('USD');
    if (!rates) {
        document.getElementById('currency-result').textContent = '汇率加载失败';
        return;
    }

    availableCurrencies = Object.keys(rates).sort();

    // Populate dropdowns — show Chinese name if available, else just code
    availableCurrencies.forEach(code => {
        const name = CURRENCY_NAMES[code] || code;
        const opt1 = document.createElement('option');
        opt1.value = code;
        opt1.textContent = `${code} ${name}`;
        fromSelect.appendChild(opt1);

        const opt2 = opt1.cloneNode(true);
        toSelect.appendChild(opt2);
    });

    fromSelect.value = 'USD';
    toSelect.value = 'CNY';

    convertCurrency();
}

async function convertCurrency() {
    const amount = parseFloat(document.getElementById('currency-amount').value);
    const from = document.getElementById('currency-from').value;
    const to = document.getElementById('currency-to').value;
    const resultEl = document.getElementById('currency-result');

    if (!amount || isNaN(amount) || amount < 0) {
        resultEl.textContent = '请输入有效金额';
        return;
    }

    if (from === to) {
        resultEl.textContent = `${amount} ${from} = ${amount} ${to}`;
        return;
    }

    resultEl.textContent = '换算中...';

    try {
        const rates = await fetchRates(from);
        if (!rates) throw new Error('fetch failed');

        const result = (rates[to] * amount).toFixed(4);
        const fromName = CURRENCY_NAMES[from] ? CURRENCY_NAMES[from].split(' ')[0] : from;
        const toName = CURRENCY_NAMES[to] ? CURRENCY_NAMES[to].split(' ')[0] : to;
        resultEl.textContent = `${amount} ${from}(${fromName}) = ${parseFloat(result).toLocaleString()} ${to}(${toName})`;
    } catch (err) {
        resultEl.textContent = '换算失败，请稍后重试';
    }
}

window.convertCurrency = convertCurrency;

document.addEventListener('DOMContentLoaded', () => {
    initCurrencyConverter();

    document.getElementById('currency-amount').addEventListener('change', convertCurrency);
});
