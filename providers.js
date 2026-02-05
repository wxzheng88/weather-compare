/**
 * 天气供应商API配置
 * 包含4家天气数据源的配置和API调用方法
 */

// API Keys配置（用户提供的Key）
const API_KEYS = {
    openweathermap: '3116159f12308c8d20f49ef93a789752',
    weatherapi: '245ec6387e80426dac120202260502',
    qweather: 'f4658096a13e4b078317d0580a5bb4bc',
    accuweather: 'hFgGzL4AykO2BkXkB8Ck8G5O9lB8Ql2Z'  // AccuWeather Key
};

// 供应商配置
const PROVIDERS = {
    openmeteo: {
        id: 'openmeteo',
        name: 'Open-Meteo',
        nameCn: 'Open-Meteo',
        icon: '🌤️',
        color: '#6c5ce7',
        baseUrl: 'https://api.open-meteo.com/v1/forecast',
        requiresKey: false,
        free: true
    },
    openweathermap: {
        id: 'openweathermap',
        name: 'OpenWeatherMap',
        nameCn: 'OpenWeatherMap',
        icon: '🌥️',
        color: '#e17055',
        baseUrl: 'https://api.openweathermap.org/data/2.5/forecast',
        requiresKey: true,
        apiKey: API_KEYS.openweathermap,
        free: true
    },
    weatherapi: {
        id: 'weatherapi',
        name: 'WeatherAPI.com',
        nameCn: 'WeatherAPI',
        icon: '🌡️',
        color: '#0984e3',
        baseUrl: 'https://api.weatherapi.com/v1/forecast.json',
        requiresKey: true,
        apiKey: API_KEYS.weatherapi,
        free: true
    },
    qweather: {
        id: 'qweather',
        name: '和风天气',
        nameCn: '和风天气',
        icon: '🌪️',
        color: '#00b894',
        baseUrl: 'https://devapi.qweather.com/v7/weather/3d',
        requiresKey: true,
        apiKey: API_KEYS.qweather,
        free: true
    },
    accuweather: {
        id: 'accuweather',
        name: 'AccuWeather',
        nameCn: 'AccuWeather',
        icon: '🌡️',
        color: '#e84351',
        baseUrl: 'http://dataservice.accuweather.com/forecasts/v1/daily/5day',
        requiresKey: true,
        apiKey: API_KEYS.accuweather,
        free: true
    }
};

// 天气代码映射 - 统一使用中文描述
const WEATHER_CODES = {
    openmeteo: {
        0: { desc: '晴朗', icon: '☀️' },
        1: { desc: '晴朗', icon: '☀️' },
        2: { desc: '多云', icon: '⛅' },
        3: { desc: '阴天', icon: '☁️' },
        45: { desc: '雾', icon: '🌫️' },
        48: { desc: '雾凇', icon: '🌫️' },
        51: { desc: '毛毛雨', icon: '🌧️' },
        53: { desc: '毛毛雨', icon: '🌧️' },
        55: { desc: '毛毛雨', icon: '🌧️' },
        61: { desc: '小雨', icon: '🌧️' },
        63: { desc: '中雨', icon: '🌧️' },
        65: { desc: '大雨', icon: '🌧️' },
        71: { desc: '小雪', icon: '❄️' },
        73: { desc: '中雪', icon: '❄️' },
        75: { desc: '大雪', icon: '❄️' },
        77: { desc: '雪粒', icon: '🌨️' },
        80: { desc: '阵雨', icon: '🌦️' },
        81: { desc: '阵雨', icon: '🌦️' },
        82: { desc: '强阵雨', icon: '🌦️' },
        85: { desc: '小阵雪', icon: '🌨️' },
        86: { desc: '大阵雪', icon: '🌨️' },
        95: { desc: '雷阵雨', icon: '⛈️' },
        96: { desc: '雷阵雨+小冰雹', icon: '⛈️' },
        99: { desc: '雷阵雨+大冰雹', icon: '⛈️' }
    },
    openweathermap: {
        0: { desc: '晴朗', icon: '☀️' },
        1: { desc: '晴朗', icon: '☀️' },
        2: { desc: '少云', icon: '🌤️' },
        3: { desc: '多云', icon: '⛅' },
        45: { desc: '雾', icon: '🌫️' },
        48: { desc: '雾凇', icon: '🌫️' },
        51: { desc: '毛毛雨', icon: '🌧️' },
        53: { desc: '毛毛雨', icon: '🌧️' },
        55: { desc: '毛毛雨', icon: '🌧️' },
        61: { desc: '小雨', icon: '🌧️' },
        63: { desc: '中雨', icon: '🌧️' },
        65: { desc: '大雨', icon: '🌧️' },
        71: { desc: '小雪', icon: '❄️' },
        73: { desc: '中雪', icon: '❄️' },
        75: { desc: '大雪', icon: '❄️' },
        77: { desc: '雪粒', icon: '🌨️' },
        80: { desc: '阵雨', icon: '🌦️' },
        81: { desc: '阵雨', icon: '🌦️' },
        82: { desc: '强阵雨', icon: '🌦️' },
        85: { desc: '小阵雪', icon: '🌨️' },
        86: { desc: '大阵雪', icon: '🌨️' },
        95: { desc: '雷阵雨', icon: '⛈️' },
        96: { desc: '雷阵雨+冰雹', icon: '⛈️' },
        99: { desc: '雷阵雨+大冰雹', icon: '⛈️' }
    },
    weatherapi: {
        1000: { desc: '晴朗', icon: '☀️' },
        1003: { desc: '晴间多云', icon: '🌤️' },
        1006: { desc: '多云', icon: '⛅' },
        1009: { desc: '阴天', icon: '☁️' },
        1030: { desc: '雾', icon: '🌫️' },
        1063: { desc: '阵雨', icon: '🌦️' },
        1066: { desc: '阵雪', icon: '🌨️' },
        1069: { desc: '雨夹雪', icon: '🌧️' },
        1087: { desc: '雷阵雨', icon: '⛈️' },
        1114: { desc: '吹雪', icon: '❄️' },
        1117: { desc: '暴风雪', icon: '🌨️' },
        1135: { desc: '雾', icon: '🌫️' },
        1147: { desc: '冻雾', icon: '🌫️' },
        1150: { desc: '毛毛雨', icon: '🌧️' },
        1153: { desc: '毛毛雨', icon: '🌧️' },
        1168: { desc: '冻毛毛雨', icon: '🌧️' },
        1171: { desc: '冻雨', icon: '🌧️' },
        1180: { desc: '阵雨', icon: '🌦️' },
        1183: { desc: '阵雨', icon: '🌦️' },
        1186: { desc: '阵雨', icon: '🌦️' },
        1189: { desc: '大雨', icon: '🌧️' },
        1192: { desc: '大雨', icon: '🌧️' },
        1195: { desc: '大雨', icon: '🌧️' },
        1201: { desc: '大雨', icon: '🌧️' },
        1204: { desc: '雨夹雪', icon: '🌧️' },
        1210: { desc: '小雪', icon: '❄️' },
        1213: { desc: '小雪', icon: '❄️' },
        1216: { desc: '中雪', icon: '❄️' },
        1219: { desc: '中雪', icon: '❄️' },
        1222: { desc: '大雪', icon: '❄️' },
        1225: { desc: '大雪', icon: '❄️' },
        1230: { desc: '冻雪', icon: '❄️' },
        1240: { desc: '阵雨', icon: '🌦️' },
        1243: { desc: '大雨', icon: '🌧️' },
        1246: { desc: '冻雨', icon: '🌧️' },
        1249: { desc: '雨夹雪', icon: '🌧️' },
        1255: { desc: '小雪', icon: '❄️' },
        1258: { desc: '中雪', icon: '❄️' },
        1261: { desc: '冻雪', icon: '❄️' },
        1264: { desc: '大雪', icon: '❄️' },
        1273: { desc: '雷阵雨+阵雨', icon: '⛈️' },
        1276: { desc: '雷阵雨+大雨', icon: '⛈️' },
        1279: { desc: '雷阵雨+小雪', icon: '⛈️' },
        1282: { desc: '雷阵雨+大雪', icon: '⛈️' }
    },
    accuweather: {
        0: { desc: '晴朗', icon: '☀️' },
        1: { desc: '晴朗', icon: '☀️' },
        2: { desc: '大部晴朗', icon: '🌤️' },
        3: { desc: '多云', icon: '⛅' },
        4: { desc: '间晴', icon: '🌤️' },
        5: { desc: '间多云', icon: '⛅' },
        6: { desc: '多云间阴', icon: '☁️' },
        7: { desc: '阴', icon: '☁️' },
        8: { desc: '阴', icon: '☁️' },
        11: { desc: '雾', icon: '🌫️' },
        12: { desc: '阵雨', icon: '🌦️' },
        13: { desc: '阵雨', icon: '🌦️' },
        14: { desc: '雷阵雨', icon: '⛈️' },
        15: { desc: '雷阵雨', icon: '⛈️' },
        16: { desc: '雷阵雨', icon: '⛈️' },
        17: { desc: '雷阵雨', icon: '⛈️' },
        18: { desc: '大雨', icon: '🌧️' },
        19: { desc: '冻雨', icon: '🌧️' },
        20: { desc: '雨夹雪', icon: '🌧️' },
        21: { desc: '小雪', icon: '❄️' },
        22: { desc: '中雪', icon: '❄️' },
        23: { desc: '大雪', icon: '❄️' },
        24: { desc: '冻雪', icon: '❄️' },
        25: { desc: '阵雪', icon: '🌨️' },
        26: { desc: '小阵雪', icon: '🌨️' },
        27: { desc: '中阵雪', icon: '🌨️' },
        28: { desc: '大阵雪', icon: '🌨️' },
        29: { desc: '浮尘', icon: '🌫️' },
        30: { desc: '扬沙', icon: '🌪️' },
        31: { desc: '沙尘暴', icon: '🌪️' }
    }
};

// 获取天气描述
function getWeatherDesc(provider, code) {
    const codes = WEATHER_CODES[provider] || {};
    return codes[code] || { desc: '未知', icon: '❓' };
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return {
        month: months[date.getMonth()],
        day: String(date.getDate()).padStart(2, '0'),
        weekday: weekdays[date.getDay()],
        full: `${months[date.getMonth()]}月${String(date.getDate()).padStart(2, '0')}日`,
        dateObj: date,
        dateKey: dateStr
    };
}

// 格式化温度
function formatTemp(temp) {
    if (temp === null || temp === undefined || isNaN(temp)) return '--';
    return `${Math.round(temp)}°C`;
}

// API调用类
class WeatherAPI {
    constructor(provider) {
        this.provider = PROVIDERS[provider];
        if (!this.provider) {
            throw new Error(`未知供应商: ${provider}`);
        }
    }

    // 获取城市天气数据
    async getForecast(city) {
        const methods = {
            openmeteo: () => this.fetchOpenMeteo(city),
            openweathermap: () => this.fetchOpenWeatherMap(city),
            weatherapi: () => this.fetchWeatherAPI(city),
            qweather: () => this.fetchQWeather(city),
            accuweather: () => this.fetchAccuWeather(city)
        };

        if (methods[this.provider.id]) {
            return await methods[this.provider.id]();
        }
        throw new Error(`不支持的供应商: ${this.provider.id}`);
    }

    // Open-Meteo API
    async fetchOpenMeteo(city) {
        const params = new URLSearchParams({
            latitude: city.latitude,
            longitude: city.longitude,
            daily: 'weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,uv_index_max,sunrise,sunset',
            timezone: 'Asia/Shanghai',
            forecast_days: 5
        });

        const url = `${this.provider.baseUrl}?${params}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Open-Meteo API错误: ${response.status}`);
        }

        const data = await response.json();
        return this.normalizeOpenMeteo(data, city);
    }

    normalizeOpenMeteo(data, city) {
        const daily = data.daily;
        const forecasts = [];

        for (let i = 0; i < daily.time.length; i++) {
            const weatherInfo = getWeatherDesc('openmeteo', daily.weathercode[i]);
            forecasts.push({
                date: daily.time[i],
                tempHigh: daily.temperature_2m_max[i],
                tempLow: daily.temperature_2m_min[i],
                tempApparentHigh: daily.apparent_temperature_max[i],
                tempApparentLow: daily.apparent_temperature_min[i],
                precipitation: daily.precipitation_sum[i],
                precipitationProb: daily.precipitation_probability_max[i],
                windSpeed: daily.windspeed_10m_max[i],
                uvIndex: daily.uv_index_max[i],
                sunrise: daily.sunrise[i],
                sunset: daily.sunset[i],
                weatherCode: daily.weathercode[i],
                weatherDesc: weatherInfo.desc,
                weatherIcon: weatherInfo.icon
            });
        }

        return {
            provider: 'openmeteo',
            providerName: 'Open-Meteo',
            city: city.name,
            forecasts: forecasts
        };
    }

    // OpenWeatherMap API (免费版 - 使用5天/3小时预报)
    async fetchOpenWeatherMap(city) {
        const params = new URLSearchParams({
            lat: city.latitude,
            lon: city.longitude,
            appid: this.provider.apiKey,
            units: 'metric',
            lang: 'zh_cn'
        });

        const url = `${this.provider.baseUrl}?${params}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`OpenWeatherMap API错误: ${response.status}`);
        }

        const data = await response.json();
        return this.normalizeOpenWeatherMap(data, city);
    }

    normalizeOpenWeatherMap(data, city) {
        const forecasts = [];
        const daily = data.list || [];

        // 按天分组数据（OWM返回每3小时一条）
        const days = {};
        daily.forEach(item => {
            const date = item.dt_txt?.split(' ')[0];
            if (!days[date]) {
                days[date] = [];
            }
            days[date].push(item);
        });

        // 取每天的数据
        Object.keys(days).slice(0, 5).forEach((date, index) => {
            const dayItems = days[date];
            const temps = dayItems.map(item => item.main?.temp_max || 0);
            const tempsMin = dayItems.map(item => item.main?.temp_min || 0);
            const pops = dayItems.map(item => item.pop || 0);
            const weather = dayItems[0];

            const weatherInfo = getWeatherDesc('openweathermap', weather?.weather?.[0]?.id || 0);

            forecasts.push({
                date: date,
                tempHigh: Math.max(...temps),
                tempLow: Math.min(...tempsMin),
                tempApparentHigh: weather?.main?.feels_like,
                tempApparentLow: weather?.main?.feels_like,
                precipitation: weather?.rain?.['3h'] || 0,
                precipitationProb: Math.max(...pops) * 100,
                windSpeed: weather?.wind?.speed || 0,
                weatherCode: weather?.weather?.[0]?.id || 0,
                weatherDesc: weather?.weather?.[0]?.description || weatherInfo.desc,
                weatherIcon: weatherInfo.icon
            });
        });

        return {
            provider: 'openweathermap',
            providerName: 'OpenWeatherMap',
            city: city.name,
            forecasts: forecasts
        };
    }

    // WeatherAPI (心知天气)
    async fetchWeatherAPI(city) {
        const params = new URLSearchParams({
            key: this.provider.apiKey,
            q: `${city.latitude},${city.longitude}`,
            days: 5,
            aqi: 'no',
            alerts: 'no'
        });

        const url = `${this.provider.baseUrl}?${params}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`WeatherAPI错误: ${response.status}`);
        }

        const data = await response.json();
        return this.normalizeWeatherAPI(data, city);
    }

    normalizeWeatherAPI(data, city) {
        const forecasts = [];
        const daily = data.forecast?.forecastday || [];

        for (let i = 0; i < daily.length; i++) {
            const day = daily[i];
            const weatherInfo = getWeatherDesc('weatherapi', day.day?.condition?.code || 0);
            forecasts.push({
                date: day.date,
                tempHigh: day.day?.maxtemp_c,
                tempLow: day.day?.mintemp_c,
                tempApparentHigh: day.day?.feelslike_c,
                tempApparentLow: day.day?.feelslike_c,
                precipitation: day.day?.totalprecip_mm,
                precipitationProb: day.day?.daily_chance_of_rain || 0,
                windSpeed: day.day?.maxwind_kph,
                uvIndex: day.day?.uv,
                sunrise: day.astro?.sunrise,
                sunset: day.astro?.sunset,
                weatherCode: day.day?.condition?.code,
                weatherDesc: day.day?.condition?.text,
                weatherIcon: weatherInfo.icon
            });
        }

        return {
            provider: 'weatherapi',
            providerName: 'WeatherAPI',
            city: city.name,
            forecasts: forecasts
        };
    }

    // 和风天气 API
    async fetchQWeather(city) {
        const params = new URLSearchParams({
            location: `${city.longitude},${city.latitude}`,
            key: this.provider.apiKey
        });

        const url = `${this.provider.baseUrl}?${params}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept-Encoding': 'gzip, deflate'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`和风天气API错误: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            if (data.code !== '200') {
                throw new Error(`和风天气错误: ${data.code} - ${data.message || '未知错误'}`);
            }
            
            return this.normalizeQWeather(data, city);
        } catch (error) {
            console.error('和风天气API失败:', error);
            throw error;
        }
    }

    normalizeQWeather(data, city) {
        const forecasts = [];
        const daily = data.daily || [];

        for (let i = 0; i < Math.min(daily.length, 5); i++) {
            const day = daily[i];
            const weatherInfo = getWeatherDesc('qweather', day.weatherCodeDay || 0);
            forecasts.push({
                date: day.date,
                tempHigh: day.tempMax,
                tempLow: day.tempMin,
                tempApparentHigh: day.tempMax,
                tempApparentLow: day.tempMin,
                precipitation: day.precipitation || 0,
                precipitationProb: day.pop || 0,
                windSpeed: day.windSpeedDay || 0,
                sunrise: day.sunrise,
                sunset: day.sunset,
                weatherCode: day.weatherCodeDay || 0,
                weatherDesc: day.weatherTextDay || weatherInfo.desc,
                weatherIcon: weatherInfo.icon
            });
        }

        return {
            provider: 'qweather',
            providerName: '和风天气',
            city: city.name,
            forecasts: forecasts
        };
    }

    // AccuWeather API
    async fetchAccuWeather(city) {
        try {
            // 先获取location key
            const locationParams = new URLSearchParams({
                apikey: this.provider.apiKey,
                q: `${city.latitude},${city.longitude}`,
                language: 'zh-cn'
            });
            
            const locationUrl = `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?${locationParams}`;
            const locationResponse = await fetch(locationUrl);
            
            if (!locationResponse.ok) {
                throw new Error(`AccuWeather位置查询错误: ${locationResponse.status}`);
            }
            
            const locationData = await locationResponse.json();
            const locationKey = locationData.Key || locationData.key;
            
            if (!locationKey) {
                throw new Error('无法获取AccuWeather位置Key');
            }
            
            // 获取天气预报
            const forecastParams = new URLSearchParams({
                apikey: this.provider.apiKey,
                language: 'zh-cn',
                details: 'true',
                metric: 'true'
            });
            
            const forecastUrl = `${this.provider.baseUrl}/${locationKey}?${forecastParams}`;
            const forecastResponse = await fetch(forecastUrl);
            
            if (!forecastResponse.ok) {
                throw new Error(`AccuWeather预报查询错误: ${forecastResponse.status}`);
            }
            
            const forecastData = await forecastResponse.json();
            return this.normalizeAccuWeather(forecastData, city, locationData);
            
        } catch (error) {
            console.error('AccuWeather API失败:', error);
            throw error;
        }
    }

    normalizeAccuWeather(data, city, locationData) {
        const forecasts = [];
        const daily = data.DailyForecasts || [];

        for (let i = 0; i < Math.min(daily.length, 5); i++) {
            const day = daily[i];
            const weatherInfo = getWeatherDesc('accuweather', day.Day?.Icon || 0);
            
            forecasts.push({
                date: day.Date?.split('T')[0],
                tempHigh: day.Temperature?.Maximum?.Value,
                tempLow: day.Temperature?.Minimum?.Value,
                tempApparentHigh: day.RealFeelTemperature?.Maximum?.Value,
                tempApparentLow: day.RealFeelTemperature?.Minimum?.Value,
                precipitation: day.Day?.PrecipitationProbability || 0,
                precipitationProb: day.Day?.PrecipitationProbability || 0,
                windSpeed: day.Day?.Wind?.Speed?.Value || 0,
                weatherCode: day.Day?.Icon || 0,
                weatherDesc: day.Day?.IconPhrase || weatherInfo.desc,
                weatherIcon: weatherInfo.icon
            });
        }

        return {
            provider: 'accuweather',
            providerName: 'AccuWeather',
            city: city.name,
            forecasts: forecasts
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PROVIDERS, API_KEYS, WEATHER_CODES, getWeatherDesc, formatDate, formatTemp, WeatherAPI };
}
