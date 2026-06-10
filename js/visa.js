// visa.js - Passport Visa Information
// Data based on Henley Passport Index 2025

const PASSPORT_DATA = {
    "日本 🇯🇵": { free: 193, evisa: 0, voa: 3, required: 7, top: ["美国", "英国", "法国", "德国", "意大利", "西班牙", "澳大利亚"] },
    "新加坡 🇸🇬": { free: 192, evisa: 1, voa: 3, required: 7, top: ["美国", "英国", "法国", "德国", "日本", "澳大利亚", "加拿大"] },
    "法国 🇫🇷": { free: 191, evisa: 1, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新西兰", "新加坡"] },
    "德国 🇩🇪": { free: 191, evisa: 1, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新西兰", "新加坡"] },
    "意大利 🇮🇹": { free: 191, evisa: 1, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新西兰", "新加坡"] },
    "西班牙 🇪🇸": { free: 191, evisa: 1, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新西兰", "新加坡"] },
    "芬兰 🇫🇮": { free: 190, evisa: 2, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "荷兰 🇳🇱": { free: 190, evisa: 2, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "奥地利 🇦🇹": { free: 190, evisa: 2, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "丹麦 🇩🇰": { free: 190, evisa: 2, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "比利时 🇧🇪": { free: 190, evisa: 2, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "瑞典 🇸🇪": { free: 190, evisa: 2, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "爱尔兰 🇮🇪": { free: 190, evisa: 2, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "葡萄牙 🇵🇹": { free: 190, evisa: 2, voa: 4, required: 7, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "英国 🇬🇧": { free: 189, evisa: 2, voa: 5, required: 7, top: ["美国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰", "法国"] },
    "美国 🇺🇸": { free: 186, evisa: 2, voa: 6, required: 9, top: ["英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰", "法国"] },
    "加拿大 🇨🇦": { free: 185, evisa: 3, voa: 6, required: 9, top: ["英国", "美国", "日本", "澳大利亚", "新加坡", "新西兰", "法国"] },
    "澳大利亚 🇦🇺": { free: 185, evisa: 3, voa: 6, required: 9, top: ["英国", "美国", "日本", "加拿大", "新加坡", "新西兰", "法国"] },
    "新西兰 🇳🇿": { free: 185, evisa: 3, voa: 6, required: 9, top: ["英国", "美国", "日本", "澳大利亚", "加拿大", "新加坡", "法国"] },
    "瑞士 🇨🇭": { free: 189, evisa: 2, voa: 4, required: 8, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "挪威 🇳🇴": { free: 189, evisa: 2, voa: 4, required: 8, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "卢森堡 🇱🇺": { free: 189, evisa: 2, voa: 4, required: 8, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "希腊 🇬🇷": { free: 188, evisa: 2, voa: 4, required: 9, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "捷克 🇨🇿": { free: 188, evisa: 2, voa: 4, required: 9, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "波兰 🇵🇱": { free: 188, evisa: 2, voa: 4, required: 9, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "匈牙利 🇭🇺": { free: 186, evisa: 2, voa: 5, required: 10, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "立陶宛 🇱🇹": { free: 187, evisa: 2, voa: 4, required: 10, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "拉脱维亚 🇱🇻": { free: 187, evisa: 2, voa: 4, required: 10, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "爱沙尼亚 🇪🇪": { free: 187, evisa: 2, voa: 4, required: 10, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "斯洛伐克 🇸🇰": { free: 187, evisa: 2, voa: 4, required: 10, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "斯洛文尼亚 🇸🇮": { free: 187, evisa: 2, voa: 4, required: 10, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "马耳他 🇲🇹": { free: 186, evisa: 2, voa: 5, required: 10, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "冰岛 🇮🇸": { free: 187, evisa: 2, voa: 4, required: 10, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "罗马尼亚 🇷🇴": { free: 174, evisa: 5, voa: 10, required: 14, top: ["英国", "法国", "德国", "意大利", "西班牙", "荷兰", "比利时"] },
    "保加利亚 🇧🇬": { free: 174, evisa: 5, voa: 10, required: 14, top: ["英国", "法国", "德国", "意大利", "西班牙", "荷兰", "比利时"] },
    "克罗地亚 🇭🇷": { free: 178, evisa: 4, voa: 8, required: 13, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "塞浦路斯 🇨🇾": { free: 177, evisa: 4, voa: 8, required: 14, top: ["英国", "法国", "德国", "意大利", "西班牙", "荷兰", "比利时"] },
    "韩国 🇰🇷": { free: 189, evisa: 2, voa: 4, required: 8, top: ["美国", "英国", "日本", "澳大利亚", "加拿大", "新加坡", "新西兰"] },
    "香港 🇭🇰": { free: 165, evisa: 6, voa: 12, required: 20, top: ["英国", "法国", "德国", "日本", "澳大利亚", "加拿大", "新西兰"] },
    "台湾 🇹🇼": { free: 146, evisa: 8, voa: 14, required: 35, top: ["日本", "英国", "法国", "德国", "澳大利亚", "加拿大", "新西兰"] },
    "马来西亚 🇲🇾": { free: 179, evisa: 4, voa: 8, required: 12, top: ["日本", "英国", "法国", "德国", "澳大利亚", "新西兰", "新加坡"] },
    "阿联酋 🇦🇪": { free: 180, evisa: 4, voa: 8, required: 11, top: ["英国", "法国", "德国", "日本", "澳大利亚", "加拿大", "新西兰"] },
    "以色列 🇮🇱": { free: 160, evisa: 6, voa: 14, required: 23, top: ["美国", "英国", "法国", "德国", "澳大利亚", "加拿大", "新西兰"] },
    "中国 🇨🇳": { free: 85, evisa: 20, voa: 30, required: 68, top: ["泰国", "马来西亚", "新加坡", "印尼", "越南", "俄罗斯", "塞尔维亚"] },
    "俄罗斯 🇷🇺": { free: 119, evisa: 15, voa: 25, required: 44, top: ["中国", "土耳其", "泰国", "越南", "塞尔维亚", "巴西", "古巴"] },
    "印度 🇮🇳": { free: 58, evisa: 25, voa: 35, required: 85, top: ["泰国", "印尼", "马尔代夫", "尼泊尔", "不丹", "毛里求斯", "斐济"] },
    "巴西 🇧🇷": { free: 170, evisa: 5, voa: 10, required: 18, top: ["美国", "英国", "法国", "德国", "日本", "澳大利亚", "加拿大"] },
    "墨西哥 🇲🇽": { free: 160, evisa: 6, voa: 12, required: 25, top: ["美国", "英国", "法国", "德国", "日本", "澳大利亚", "加拿大"] },
    "阿根廷 🇦🇷": { free: 170, evisa: 5, voa: 10, required: 18, top: ["美国", "英国", "法国", "德国", "日本", "澳大利亚", "加拿大"] },
    "智利 🇨🇱": { free: 175, evisa: 5, voa: 8, required: 15, top: ["美国", "英国", "法国", "德国", "日本", "澳大利亚", "加拿大"] },
    "哥伦比亚 🇨🇴": { free: 150, evisa: 8, voa: 12, required: 33, top: ["美国", "英国", "法国", "德国", "日本", "澳大利亚", "加拿大"] },
    "南非 🇿🇦": { free: 105, evisa: 18, voa: 28, required: 52, top: ["英国", "法国", "德国", "日本", "澳大利亚", "新西兰", "加拿大"] },
    "土耳其 🇹🇷": { free: 110, evisa: 15, voa: 32, required: 46, top: ["日本", "新加坡", "德国", "英国", "法国", "澳大利亚", "加拿大"] },
    "埃及 🇪🇬": { free: 53, evisa: 20, voa: 32, required: 98, top: ["阿拉伯国家", "土耳其", "约旦", "黎巴嫩", "突尼斯", "摩洛哥", "伊斯兰国家"] },
    "泰国 🇹🇭": { free: 80, evisa: 22, voa: 30, required: 71, top: ["柬埔寨", "缅甸", "老挝", "越南", "印尼", "马来西亚", "新加坡"] },
    "越南 🇻🇳": { free: 55, evisa: 25, voa: 38, required: 85, top: ["泰国", "柬埔寨", "老挝", "缅甸", "菲律宾", "马来西亚", "印尼"] },
    "菲律宾 🇵🇭": { free: 67, evisa: 22, voa: 38, required: 76, top: ["泰国", "新加坡", "马来西亚", "印尼", "越南", "柬埔寨", "日本"] },
    "印度尼西亚 🇮🇩": { free: 75, evisa: 20, voa: 35, required: 73, top: ["泰国", "新加坡", "马来西亚", "越南", "柬埔寨", "菲律宾", "日本"] },
    "巴基斯坦 🇵🇰": { free: 33, evisa: 15, voa: 28, required: 127, top: ["中国", "土耳其", "伊朗", "阿联酋", "沙特", "马来西亚", "泰国"] },
    "尼日利亚 🇳🇬": { free: 46, evisa: 18, voa: 30, required: 109, top: ["西非国家", "加纳", "贝宁", "喀麦隆", "肯尼亚", "南非", "乌干达"] },
    "肯尼亚 🇰🇪": { free: 72, evisa: 20, voa: 30, required: 81, top: ["东非国家", "埃塞俄比亚", "坦桑尼亚", "乌干达", "卢旺达", "南非", "毛里求斯"] },
    "沙特阿拉伯 🇸🇦": { free: 82, evisa: 20, voa: 28, required: 73, top: ["阿联酋", "科威特", "巴林", "卡塔尔", "约旦", "土耳其", "马来西亚"] },
    "伊朗 🇮🇷": { free: 42, evisa: 15, voa: 30, required: 116, top: ["土耳其", "格鲁吉亚", "亚美尼亚", "阿塞拜疆", "中国", "俄罗斯", "巴基斯坦"] },
    "以色列 🇮🇱": { free: 160, evisa: 6, voa: 14, required: 23, top: ["美国", "英国", "法国", "德国", "澳大利亚", "加拿大", "新西兰"] },
    "卡塔尔 🇶🇦": { free: 103, evisa: 20, voa: 30, required: 50, top: ["阿联酋", "沙特", "土耳其", "日本", "新加坡", "英国", "法国"] },
    "科威特 🇰🇼": { free: 90, evisa: 18, voa: 30, required: 65, top: ["阿联酋", "沙特", "土耳其", "日本", "新加坡", "英国", "法国"] },
    "约旦 🇯🇴": { free: 72, evisa: 18, voa: 30, required: 83, top: ["阿拉伯国家", "土耳其", "马来西亚", "新加坡", "泰国", "印尼", "黎巴嫩"] },
    "摩洛哥 🇲🇦": { free: 68, evisa: 18, voa: 30, required: 87, top: ["非洲国家", "土耳其", "阿联酋", "法国", "西班牙", "葡萄牙", "突尼斯"] },
    "阿尔及利亚 🇩🇿": { free: 52, evisa: 15, voa: 28, required: 108, top: ["非洲国家", "土耳其", "中国", "俄罗斯", "马来西亚", "突尼斯", "摩洛哥"] },
    "加纳 🇬🇭": { free: 68, evisa: 18, voa: 28, required: 89, top: ["西非国家", "南非", "肯尼亚", "卢旺达", "毛里求斯", "埃塞俄比亚", "尼日利亚"] },
    "埃塞俄比亚 🇪🇹": { free: 42, evisa: 15, voa: 30, required: 116, top: ["东非国家", "肯尼亚", "坦桑尼亚", "卢旺达", "乌干达", "南非", "毛里求斯"] },
    "坦桑尼亚 🇹🇿": { free: 50, evisa: 18, voa: 30, required: 105, top: ["东非国家", "肯尼亚", "乌干达", "卢旺达", "南非", "毛里求斯", "埃塞俄比亚"] },
    "乌克兰 🇺🇦": { free: 148, evisa: 8, voa: 18, required: 29, top: ["欧盟国家", "土耳其", "格鲁吉亚", "阿塞拜疆", "摩尔多瓦", "以色列", "加拿大"] },
    "塞尔维亚 🇷🇸": { free: 140, evisa: 8, voa: 18, required: 37, top: ["欧盟国家", "俄罗斯", "中国", "土耳其", "阿联酋", "以色列", "白俄罗斯"] },
    "格鲁吉亚 🇬🇪": { free: 117, evisa: 15, voa: 25, required: 46, top: ["俄罗斯", "土耳其", "欧盟国家", "以色列", "阿联酋", "中国", "伊朗"] },
    "亚美尼亚 🇦🇲": { free: 65, evisa: 18, voa: 30, required: 90, top: ["俄罗斯", "格鲁吉亚", "伊朗", "欧盟国家", "阿联酋", "中国", "白俄罗斯"] },
    "哈萨克斯坦 🇰🇿": { free: 76, evisa: 18, voa: 30, required: 79, top: ["俄罗斯", "中国", "土耳其", "阿联酋", "泰国", "马来西亚", "格鲁吉亚"] },
    "乌兹别克斯坦 🇺🇿": { free: 55, evisa: 18, voa: 30, required: 100, top: ["俄罗斯", "中国", "土耳其", "阿联酋", "泰国", "马来西亚", "格鲁吉亚"] },
    "秘鲁 🇵🇪": { free: 135, evisa: 8, voa: 20, required: 40, top: ["美国", "英国", "法国", "德国", "日本", "澳大利亚", "加拿大"] },
    "厄瓜多尔 🇪🇨": { free: 135, evisa: 8, voa: 20, required: 40, top: ["美国", "英国", "法国", "德国", "日本", "澳大利亚", "加拿大"] },
    "委内瑞拉 🇻🇪": { free: 130, evisa: 8, voa: 20, required: 45, top: ["美国", "英国", "法国", "德国", "日本", "澳大利亚", "加拿大"] },
    "古巴 🇨🇺": { free: 65, evisa: 18, voa: 28, required: 92, top: ["俄罗斯", "中国", "越南", "朝鲜", "安哥拉", "莫桑比克", "纳米比亚"] },
    "朝鲜 🇰🇵": { free: 42, evisa: 5, voa: 10, required: 146, top: ["中国", "俄罗斯", "越南", "古巴", "伊朗", "叙利亚", "利比亚"] },
    "缅甸 🇲🇲": { free: 48, evisa: 18, voa: 28, required: 109, top: ["泰国", "老挝", "中国", "印度", "孟加拉国", "新加坡", "马来西亚"] },
    "柬埔寨 🇰🇭": { free: 55, evisa: 18, voa: 30, required: 100, top: ["泰国", "越南", "老挝", "中国", "新加坡", "马来西亚", "印尼"] },
    "老挝 🇱🇦": { free: 52, evisa: 18, voa: 30, required: 103, top: ["泰国", "越南", "柬埔寨", "中国", "缅甸", "新加坡", "马来西亚"] },
    "孟加拉国 🇧🇩": { free: 41, evisa: 15, voa: 30, required: 117, top: ["印度", "泰国", "马来西亚", "新加坡", "印尼", "中国", "土耳其"] },
    "斯里兰卡 🇱🇰": { free: 48, evisa: 20, voa: 30, required: 105, top: ["印度", "泰国", "马来西亚", "新加坡", "印尼", "中国", "土耳其"] },
    "尼泊尔 🇳🇵": { free: 38, evisa: 15, voa: 30, required: 120, top: ["印度", "泰国", "中国", "马来西亚", "新加坡", "印尼", "土耳其"] },
    "阿富汗 🇦🇫": { free: 28, evisa: 10, voa: 20, required: 145, top: ["伊朗", "巴基斯坦", "土耳其", "中国", "阿联酋", "沙特", "马来西亚"] },
    "伊拉克 🇮🇶": { free: 31, evisa: 10, voa: 22, required: 140, top: ["伊朗", "土耳其", "约旦", "阿联酋", "沙特", "中国", "马来西亚"] },
    "叙利亚 🇸🇾": { free: 30, evisa: 8, voa: 20, required: 145, top: ["伊朗", "俄罗斯", "中国", "土耳其", "阿联酋", "沙特", "马来西亚"] },
    "利比亚 🇱🇾": { free: 25, evisa: 8, voa: 18, required: 152, top: ["北非国家", "土耳其", "中国", "俄罗斯", "阿联酋", "沙特", "马来西亚"] },
    "索马里 🇸🇴": { free: 35, evisa: 8, voa: 20, required: 140, top: ["东非国家", "土耳其", "阿联酋", "沙特", "中国", "马来西亚", "印尼"] },
    "也门 🇾🇪": { free: 36, evisa: 8, voa: 20, required: 139, top: ["阿拉伯国家", "土耳其", "中国", "马来西亚", "印尼", "沙特", "阿联酋"] },
    "苏丹 🇸🇩": { free: 48, evisa: 10, voa: 25, required: 120, top: ["非洲国家", "阿拉伯国家", "土耳其", "中国", "俄罗斯", "马来西亚", "印尼"] },
    "刚果 🇨🇩": { free: 44, evisa: 10, voa: 22, required: 127, top: ["非洲国家", "中国", "俄罗斯", "土耳其", "阿联酋", "马来西亚", "印尼"] },
    "安哥拉 🇦🇴": { free: 48, evisa: 12, voa: 25, required: 118, top: ["非洲国家", "中国", "俄罗斯", "巴西", "葡萄牙", "法国", "英国"] },
    "莫桑比克 🇲🇿": { free: 50, evisa: 15, voa: 28, required: 110, top: ["非洲国家", "中国", "巴西", "葡萄牙", "英国", "法国", "德国"] },
    "津巴布韦 🇿🇼": { free: 45, evisa: 12, voa: 25, required: 121, top: ["南非", "赞比亚", "莫桑比克", "博茨瓦纳", "肯尼亚", "坦桑尼亚", "中国"] },
    "巴勒斯坦 🇵🇸": { free: 38, evisa: 10, voa: 22, required: 133, top: ["约旦", "土耳其", "阿联酋", "沙特", "中国", "俄罗斯", "马来西亚"] }
};

let visaPanelOpen = false;

function toggleVisaPanel() {
    const panel = document.getElementById('visa-panel');
    const overlay = document.getElementById('visa-overlay');
    visaPanelOpen = !visaPanelOpen;

    if (visaPanelOpen) {
        panel.style.display = 'flex';
        overlay.style.display = 'block';
        renderPassportList('');
    } else {
        panel.style.display = 'none';
        overlay.style.display = 'none';
        document.getElementById('visa-detail').style.display = 'none';
        document.getElementById('visa-list').style.display = 'block';
    }
}

function renderPassportList(searchTerm) {
    const listEl = document.getElementById('visa-list');
    listEl.innerHTML = '';

    const filtered = Object.entries(PASSPORT_DATA).filter(([name]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) {
        listEl.innerHTML = '<p style="padding:12px;color:#888;">未找到结果</p>';
        return;
    }

    filtered.sort((a, b) => b[1].free - a[1].free);

    filtered.forEach(([name, data]) => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 10px 14px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        item.onmouseenter = () => item.style.background = '#f5f5f5';
        item.onmouseleave = () => item.style.background = '';

        item.innerHTML = `
            <span style="font-size:0.9rem;">${name}</span>
            <span style="font-size:0.8rem; color:#4f46e5; font-weight:bold;">免签${data.free}国</span>
        `;
        item.addEventListener('click', () => showVisaDetail(name, data));
        listEl.appendChild(item);
    });
}

function showVisaDetail(name, data) {
    document.getElementById('visa-list').style.display = 'none';
    const detail = document.getElementById('visa-detail');
    detail.style.display = 'block';

    const total = data.free + data.evisa + data.voa + data.required;

    detail.innerHTML = `
        <div style="padding:12px 14px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:8px;">
            <button onclick="showVisaList()" style="background:none;border:none;cursor:pointer;font-size:1rem;">←</button>
            <span style="font-weight:bold;">${name}</span>
        </div>
        <div style="padding:14px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px;">
                <div style="background:#e8f5e9;border-radius:8px;padding:10px;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:bold;color:#2d7a2d;">${data.free}</div>
                    <div style="font-size:0.75rem;color:#555;">免签 🟢</div>
                </div>
                <div style="background:#e3f2fd;border-radius:8px;padding:10px;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:bold;color:#1565c0;">${data.evisa}</div>
                    <div style="font-size:0.75rem;color:#555;">电子签 🔵</div>
                </div>
                <div style="background:#fff8e1;border-radius:8px;padding:10px;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:bold;color:#f57f17;">${data.voa}</div>
                    <div style="font-size:0.75rem;color:#555;">落地签 🟡</div>
                </div>
                <div style="background:#fce4ec;border-radius:8px;padding:10px;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:bold;color:#c62828;">${data.required}</div>
                    <div style="font-size:0.75rem;color:#555;">需要签证 🔴</div>
                </div>
            </div>
            <div style="font-size:0.8rem;color:#888;margin-bottom:10px;">共可前往 ${total} 个国家/地区</div>
            <div style="font-weight:bold;font-size:0.85rem;margin-bottom:8px;">🌟 热门免签目的地</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${data.top.map(c => `<span style="background:#f0f0f0;border-radius:12px;padding:3px 10px;font-size:0.8rem;">${c}</span>`).join('')}
            </div>
            <div style="margin-top:14px;padding:10px;background:#fff3e0;border-radius:8px;font-size:0.75rem;color:#666;">
                ⚠️ 数据仅供参考，出行前请查阅官方最新签证政策
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
