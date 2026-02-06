/**
 * 城市配置数据
 */

// 高德天气城市编码映射（已预配置，避免CORS问题）
const AMAP_CITY_CODES = {
    anda: '231281',      // 安达市
    gannan: '230225'     // 甘南县
};

const CITIES = {
    anda: {
        id: 'anda',
        name: '安达市',
        nameEn: 'Anda',
        province: '黑龙江省',
        latitude: 46.39,
        longitude: 125.32,
        amapCode: '231281',
        description: '黑龙江省西南部重要石油化工城市'
    },
    gannan: {
        id: 'gannan',
        name: '甘南县',
        nameEn: 'Gannan',
        province: '黑龙江省',
        latitude: 47.92,
        longitude: 123.50,
        amapCode: '230225',
        description: '黑龙江省西北部农业县'
    }
};

const DEFAULT_CITY = 'anda';

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CITIES, DEFAULT_CITY, AMAP_CITY_CODES };
}
