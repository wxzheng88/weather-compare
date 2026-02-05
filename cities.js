/**
 * 城市配置数据
 * 包含安达市和甘南县的地理位置信息
 */

const CITIES = {
    anda: {
        id: 'anda',
        name: '安达市',
        nameEn: 'Anda',
        province: '黑龙江省',
        latitude: 46.39,
        longitude: 125.32,
        timezone: 'Asia/Shanghai',
        description: '黑龙江省西南部重要的石油化工城市'
    },
    gannan: {
        id: 'gannan',
        name: '甘南县',
        nameEn: 'Gannan',
        province: '黑龙江省',
        latitude: 47.92,
        longitude: 123.50,
        timezone: 'Asia/Shanghai',
        description: '黑龙江省西北部农业县，以绿色食品闻名'
    }
};

/**
 * 天气代码到中文描述的映射
 */
const WEATHER_DESCRIPTIONS = {
    0: { desc: '晴朗', icon: '☀️', bg: 'sunny' },
    1: { desc: '大部晴朗', icon: '🌤️', bg: 'partly-cloudy' },
    2: { desc: '多云', icon: '⛅', bg: 'cloudy' },
    3: { desc: '阴天', icon: '☁️', bg: 'overcast' },
    45: { desc: '雾', icon: '🌫️', bg: 'fog' },
    48: { desc: '雾凇', icon: '🌫️', bg: 'rime' },
    51: { desc: '小毛毛雨', icon: '🌧️', bg: 'drizzle' },
    53: { desc: '中毛毛雨', icon: '🌧️', bg: 'drizzle' },
    55: { desc: '大毛毛雨', icon: '🌧️', bg: 'drizzle' },
    61: { desc: '小雨', icon: '🌧️', bg: 'rain' },
    63: { desc: '中雨', icon: '🌧️', bg: 'rain' },
    65: { desc: '大雨', icon: '🌧️', bg: 'rain' },
    71: { desc: '小雪', icon: '❄️', bg: 'snow' },
    73: { desc: '中雪', icon: '❄️', bg: 'snow' },
    75: { desc: '大雪', icon: '❄️', bg: 'snow' },
    77: { desc: '雪粒', icon: '🌨️', bg: 'snow' },
    80: { desc: '小阵雨', icon: '🌦️', bg: 'showers' },
    81: { desc: '中阵雨', icon: '🌦️', bg: 'showers' },
    82: { desc: '大阵雨', icon: '🌦️', bg: 'showers' },
    85: { desc: '小阵雪', icon: '🌨️', bg: 'snow-showers' },
    86: { desc: '大阵雪', icon: '🌨️', bg: 'snow-showers' },
    95: { desc: '雷暴', icon: '⛈️', bg: 'thunderstorm' },
    96: { desc: '雷暴+小冰雹', icon: '⛈️', bg: 'thunderstorm-hail' },
    99: { desc: '雷暴+大冰雹', icon: '⛈️', bg: 'thunderstorm-hail' }
};

/**
 * 获取天气描述信息
 * @param {number} code - 天气代码
 * @returns {Object} 描述对象
 */
function getWeatherInfo(code) {
    return WEATHER_DESCRIPTIONS[code] || { desc: '未知', icon: '❓', bg: 'unknown' };
}

/**
 * 格式化日期
 * @param {string} dateStr - ISO日期字符串
 * @returns {Object} 格式化后的日期信息
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    return {
        month: months[date.getMonth()],
        day: String(date.getDate()).padStart(2, '0'),
        weekday: weekdays[date.getDay()],
        full: `${months[date.getMonth()]}月${String(date.getDate()).padStart(2, '0')}日`,
        dateObj: date
    };
}

/**
 * 格式化时间
 * @param {string} timeStr - ISO时间字符串
 * @returns {string} 格式化的时间
 */
function formatTime(timeStr) {
    if (!timeStr) return '--';
    return timeStr.substring(0, 5);
}

/**
 * 格式化温度
 * @param {number} temp - 温度值
 * @returns {string} 格式化后的温度字符串
 */
function formatTemp(temp) {
    if (temp === null || temp === undefined) return '--';
    return `${Math.round(temp)}°C`;
}

/**
 * 格式化百分比
 * @param {number} value - 百分比值
 * @returns {string} 格式化后的百分比字符串
 */
function formatPercent(value) {
    if (value === null || value === undefined) return '--%';
    return `${value}%`;
}

/**
 * 格式化风速
 * @param {number} speed - 风速值(km/h)
 * @returns {string} 格式化后的风速字符串
 */
function formatWindSpeed(speed) {
    if (speed === null || speed === undefined) return '-- km/h';
    return `${speed} km/h`;
}

/**
 * 获取体感温度等级
 * @param {number} temp - 温度
 * @returns {string} 等级描述
 */
function getApparentLevel(temp) {
    if (temp === null || temp === undefined) return '--';
    if (temp >= 26) return '热';
    if (temp >= 20) return '温暖';
    if (temp >= 10) return '舒适';
    if (temp >= 0) return '凉';
    if (temp >= -10) return '冷';
    return '寒冷';
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CITIES, WEATHER_DESCRIPTIONS, getWeatherInfo, formatDate, formatTime, formatTemp, formatPercent, formatWindSpeed, getApparentLevel };
}
