/**
 * 天气预报对比应用
 */

// 高德API Key
const AMAP_KEY = '575be28eae5056df0dca62cfe31571d8';

class WeatherCompare {
    constructor() {
        this.cities = CITIES;
        this.providers = PROVIDERS;
        this.currentCity = DEFAULT_CITY;
        this.weatherData = {};
        this.isLoading = false;
        this.searchTimeout = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadWeatherData();
    }

    bindEvents() {
        document.querySelectorAll('.city-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const cityId = e.currentTarget.dataset.city;
                this.switchCity(cityId);
            });
        });

        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        this.bindModalClose();
        this.bindCitySearch();
    }

    bindModalClose() {
        const modalClose = document.getElementById('modal-close');
        const modalOverlay = document.getElementById('detail-modal');

        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });

        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) this.closeModal();
            });
        }
    }

    // 绑定城市搜索功能
    bindCitySearch() {
        const searchInput = document.getElementById('city-search-input');
        const searchResults = document.getElementById('city-search-results');

        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.trim();

            clearTimeout(this.searchTimeout);

            if (keyword.length < 2) {
                searchResults.classList.remove('active');
                searchResults.innerHTML = '';
                return;
            }

            this.searchTimeout = setTimeout(() => {
                this.searchCities(keyword);
            }, 300);
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length >= 2) {
                searchResults.classList.add('active');
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.city-search')) {
                searchResults.classList.remove('active');
            }
        });
    }

    // 搜索城市
    async searchCities(keyword) {
        const searchResults = document.getElementById('city-search-results');
        if (!searchResults) return;

        try {
            const url = `https://restapi.amap.com/v3/config/district?keywords=${encodeURIComponent(keyword)}&subdistrict=0&key=${AMAP_KEY}&extensions=base`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === '1' && data.districts && data.districts.length > 0) {
                const cities = data.districts.filter(d => d.level === 'city' || d.level === 'province');
                this.renderSearchResults(cities, searchResults);
            } else {
                searchResults.innerHTML = '<div class="city-search-item"><span class="city-info">未找到城市</span></div>';
                searchResults.classList.add('active');
            }
        } catch (error) {
            console.error('城市搜索失败:', error);
            searchResults.innerHTML = '<div class="city-search-item"><span class="city-info">搜索失败，请重试</span></div>';
            searchResults.classList.add('active');
        }
    }

    // 渲染搜索结果
    renderSearchResults(cities, container) {
        if (cities.length === 0) {
            container.innerHTML = '<div class="city-search-item"><span class="city-info">未找到城市</span></div>';
            container.classList.add('active');
            return;
        }

        const html = cities.map(city => {
            const [lng, lat] = city.center.split(',');
            return `
                <div class="city-search-item" data-name="${city.name}" data-lat="${lat}" data-lng="${lng}" data-adcode="${city.adcode}">
                    <span class="city-icon">🔍</span>
                    <div class="city-info">
                        <span class="city-name">${city.name}</span>
                        <span class="city-coords">${parseFloat(lat).toFixed(2)}°N, ${parseFloat(lng).toFixed(2)}°E</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        container.classList.add('active');

        // 绑定点击事件
        container.querySelectorAll('.city-search-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const name = item.dataset.name;
                const lat = parseFloat(item.dataset.lat);
                const lng = parseFloat(item.dataset.lng);
                const adcode = item.dataset.adcode;
                this.addAndSwitchCity(name, lat, lng, adcode);
            });
        });
    }

    // 搜索并直接显示天气
    addAndSwitchCity(name, lat, lng, adcode) {
        // 生成临时城市ID
        const cityId = 'search_' + Date.now();

        // 创建临时城市数据（不保存到全局）
        const tempCity = {
            name: name,
            latitude: lat,
            longitude: lng,
            province: '',
            amapCode: adcode,
            isSearch: true
        };

        // 更新当前城市
        this.currentCity = cityId;
        this.cities[cityId] = tempCity;

        // 更新UI - 移除所有自定义城市的选中状态
        document.querySelectorAll('.city-item').forEach(item => {
            item.classList.remove('active');
        });

        // 清空搜索框和结果
        const searchInput = document.getElementById('city-search-input');
        const searchResults = document.getElementById('city-search-results');
        if (searchInput) searchInput.value = '';
        if (searchResults) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
        }

        // 更新副标题
        const subtitle = document.getElementById('subtitle');
        if (subtitle) {
            subtitle.textContent = `${name} · 未来5天预报`;
        }

        // 加载天气数据
        this.loadWeatherData();
    }

    switchCity(cityId) {
        if (this.isLoading || cityId === this.currentCity) return;

        document.querySelectorAll('.city-item').forEach(item => {
            item.classList.toggle('active', item.dataset.city === cityId);
        });

        this.currentCity = cityId;

        // 恢复默认副标题
        const subtitle = document.getElementById('subtitle');
        if (subtitle) {
            const city = this.cities[cityId];
            if (city && !city.isSearch) {
                subtitle.textContent = `安达市 vs 甘南县 · 未来5天预报`;
            }
        }

        this.loadWeatherData();
    }

    async loadWeatherData() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading(true);
        this.hideError();

        const city = this.cities[this.currentCity];
        if (!city) {
            this.showError('未知城市');
            this.isLoading = false;
            return;
        }

        this.updateCityHeader(city);

        try {
            const results = await this.fetchAllProviders(city);
            this.weatherData = this.mergeWeatherData(results);
            this.renderWeather();
            this.updateLastRefreshTime();
        } catch (error) {
            console.error('获取天气数据失败:', error);
            this.showError('加载失败，请稍后重试');
        }

        this.isLoading = false;
        this.showLoading(false);
    }

    async fetchAllProviders(city) {
        const providerIds = ['openmeteo', 'openweathermap', 'weatherapi', 'amap'];
        const results = {};

        const promises = providerIds.map(async (providerId) => {
            try {
                const api = new WeatherAPI(providerId);
                const data = await api.getForecast(city);
                results[providerId] = { success: true, data };
            } catch (error) {
                console.error(`${providerId} 获取失败:`, error);
                results[providerId] = {
                    success: false,
                    error: error.message,
                    providerName: this.providers[providerId]?.nameCn || providerId
                };
            }
        });

        await Promise.all(promises);
        return results;
    }

    mergeWeatherData(results) {
        const merged = { city: null, days: {} };

        Object.entries(results).forEach(([providerId, result]) => {
            const provider = this.providers[providerId];

            if (result.success && result.data) {
                if (!merged.city) merged.city = result.data.city;

                result.data.forecasts.forEach((forecast) => {
                    const dateKey = forecast.date;
                    if (!merged.days[dateKey]) {
                        merged.days[dateKey] = {
                            date: forecast.date,
                            tempHigh: null,
                            tempLow: null,
                            weatherIcon: null,
                            weatherDesc: null,
                            sunrise: null,
                            sunset: null,
                            providers: {}
                        };
                    }

                    merged.days[dateKey].providers[providerId] = {
                        providerId,
                        providerName: provider.nameCn,
                        icon: provider.icon,
                        color: provider.color,
                        ...forecast
                    };

                    // 使用第一个有效数据作为默认显示
                    if (merged.days[dateKey].tempHigh === null) {
                        merged.days[dateKey].tempHigh = forecast.tempHigh;
                        merged.days[dateKey].tempLow = forecast.tempLow;
                        merged.days[dateKey].weatherIcon = forecast.weatherIcon;
                        merged.days[dateKey].weatherDesc = forecast.weatherDesc;
                    }

                    // 优先使用Open-Meteo的日出日落数据
                    if (providerId === 'openmeteo' && forecast.sunrise && forecast.sunset) {
                        merged.days[dateKey].sunrise = forecast.sunrise;
                        merged.days[dateKey].sunset = forecast.sunset;
                    }
                });
            }
        });

        return merged;
    }

    // 获取排序后的供应商列表（高德排第一）
    getSortedProviders(providers) {
        const order = ['amap', 'openmeteo', 'openweathermap', 'weatherapi'];
        return Object.values(providers).sort((a, b) => {
            return order.indexOf(a.providerId) - order.indexOf(b.providerId);
        });
    }

    // 格式化日出日落时间
    formatSunTime(timeStr) {
        if (!timeStr) return '--';
        
        // WeatherAPI格式: "08:56 AM" 或 "06:50 PM"
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            let hour24 = hours;
            if (period === 'PM' && hours !== 12) {
                hour24 = hours + 12;
            } else if (period === 'AM' && hours === 12) {
                hour24 = 0;
            }
            return `${String(hour24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }
        
        // Open-Meteo格式: "2026-02-06T06:55" 或其他ISO格式
        if (timeStr.includes('T')) {
            return timeStr.substring(11, 16);
        }
        
        return timeStr;
    }

    // 判断昼夜
    getDayPhase(sunrise, sunset) {
        if (!sunrise || !sunset) return null;
        const now = new Date();
        const currentHour = now.getHours();
        const sunriseHour = parseInt(this.formatSunTime(sunrise).split(':')[0]);
        const sunsetHour = parseInt(this.formatSunTime(sunset).split(':')[0]);

        if (currentHour >= sunriseHour && currentHour < sunsetHour) {
            return 'day';
        }
        return 'night';
    }

    renderWeather() {
        const container = document.getElementById('weather-content');
        if (!container) return;

        container.innerHTML = '';

        if (!this.weatherData.days || Object.keys(this.weatherData.days).length === 0) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>暂无天气数据</span>
                </div>
            `;
            return;
        }

        Object.values(this.weatherData.days)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(day => {
                container.appendChild(this.createDaySection(day));
            });
    }

    getWeatherIcon(weatherDesc) {
        const iconMap = {
            '晴': '☀️', '晴朗': '☀️',
            '晴间多云': '🌤️', '少云': '🌤️',
            '多云': '⛅', '阴': '☁️', '阴天': '☁️',
            '雾': '🌫️', '霾': '🌫️',
            '小雨': '🌧️', '中雨': '🌧️', '大雨': '🌧️', '暴雨': '🌧️', '阵雨': '🌦️',
            '雷阵雨': '⛈️', '雨夹雪': '🌧️',
            '小雪': '🌨️', '中雪': '🌨️', '大雪': '❄️', '暴雪': '❄️'
        };
        return iconMap[weatherDesc] || '🌤️';
    }

    createDaySection(day) {
        const section = document.createElement('div');
        section.className = 'day-section';
        section.dataset.date = day.date;

        const dateInfo = formatDate(day.date);
        const high = formatTemp(day.tempHigh);
        const low = formatTemp(day.tempLow);
        const sortedProviders = this.getSortedProviders(day.providers);

        // 使用Open-Meteo的日出日落数据（统一显示）
        const sunrise = day.sunrise ? this.formatSunTime(day.sunrise) : '--';
        const sunset = day.sunset ? this.formatSunTime(day.sunset) : '--';

        // 生成表格列头
        const headerHtml = `
            <div class="table-header-cell">供应商</div>
            <div class="table-header-cell">最高温</div>
            <div class="table-header-cell">最低温</div>
            <div class="table-header-cell">天气</div>
            <div class="table-header-cell">日照</div>
        `;

        // 生成表格行 - 所有供应商都显示Open-Meteo的日照数据
        const rowsHtml = sortedProviders.map(p => {
            // 所有供应商都使用Open-Meteo的日出日落数据
            const sunData = day.sunrise && day.sunset ? {
                sunrise: day.sunrise,
                sunset: day.sunset
            } : p.sunrise && p.sunset ? {
                sunrise: p.sunrise,
                sunset: p.sunset
            } : null;

            return `
                <div class="table-row" onclick="weatherCompare.showDayDetail('${day.date}', '${p.providerId}')">
                    <div class="provider-cell">
                        <div class="provider-icon" style="background: ${p.color};">${p.icon}</div>
                        <span class="provider-name">${p.providerName}</span>
                    </div>
                    <div class="temp-cell">${formatTemp(p.tempHigh)}</div>
                    <div class="temp-cell">${formatTemp(p.tempLow)}</div>
                    <div class="weather-cell">
                        ${this.getWeatherIcon(p.weatherDesc)} ${p.weatherDesc || '--'}
                    </div>
                    <div class="sun-cell">
                        <span class="sun-time"><i class="fas fa-sun"></i> ${sunData ? this.formatSunTime(sunData.sunrise) : '--'}</span>
                        <span class="sun-time"><i class="fas fa-moon"></i> ${sunData ? this.formatSunTime(sunData.sunset) : '--'}</span>
                    </div>
                </div>
            `;
        }).join('');

        section.innerHTML = `
            <div class="day-header" onclick="weatherCompare.toggleDay('${day.date}')">
                <div class="day-title">
                    <span class="day-date">${dateInfo.full}</span>
                    <span class="day-weekday">${dateInfo.weekday}</span>
                </div>
                <div class="day-weather">
                    <span class="day-weather-icon">${this.getWeatherIcon(day.weatherDesc)}</span>
                    <span class="day-weather-desc">${day.weatherDesc || '--'}</span>
                    <span class="day-temp">
                        <span class="high">${high}</span>
                        <span class="low">/${low}</span>
                    </span>
                    <div class="day-sun">
                        <span><i class="fas fa-sun"></i> ${sunrise}</span>
                        <span><i class="fas fa-moon"></i> ${sunset}</span>
                    </div>
                </div>
            </div>
            <div class="provider-table">
                <div class="table-header">
                    ${headerHtml}
                </div>
                ${rowsHtml}
            </div>
            <div class="expand-toggle" onclick="weatherCompare.toggleDay('${day.date}')">
                <span>${day.expanded ? '收起' : '查看详情'}</span>
                <i class="fas fa-chevron-${day.expanded ? 'up' : 'down'}"></i>
            </div>
        `;

        return section;
    }

    toggleDay(dateKey) {
        const section = document.querySelector(`.day-section[data-date="${dateKey}"]`);
        if (section) {
            section.classList.toggle('expanded');
        }
    }

    async showDayDetail(dateKey, providerId) {
        const day = this.weatherData.days[dateKey];
        const provider = day?.providers[providerId];
        if (!provider) return;

        const dateInfo = formatDate(dateKey);
        const city = this.cities[this.currentCity];

        const sunrise = day.sunrise ? this.formatSunTime(day.sunrise) : '--';
        const sunset = day.sunset ? this.formatSunTime(day.sunset) : '--';

        const modalHeader = document.getElementById('modal-header');
        const modalBody = document.getElementById('modal-body');

        modalHeader.innerHTML = `
            <div class="modal-city-title">${city.name}</div>
            <div class="modal-date-title">${dateInfo.full} · ${dateInfo.weekday}</div>
            <div class="modal-weather-summary">
                <div class="summary-item">
                    <div class="summary-icon">${this.getWeatherIcon(provider.weatherDesc)}</div>
                    <div class="summary-desc">${provider.weatherDesc || '--'}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-temp">
                        <span class="summary-temp-high">${formatTemp(provider.tempHigh)}</span>
                        <span style="color: #adb5bd;">/</span>
                        <span class="summary-temp-low">${formatTemp(provider.tempLow)}</span>
                    </div>
                </div>
            </div>
        `;

        const detailContent = `
            <div class="detail-grid">
                <div class="detail-card" style="border-left-color: ${provider.color};">
                    <div class="provider-info">
                        <div class="provider-icon" style="background: ${provider.color};">${provider.icon}</div>
                        <span class="provider-name">${provider.providerName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">体感温度</span>
                        <span class="detail-value">${formatTemp(provider.tempApparentHigh)} / ${formatTemp(provider.tempApparentLow)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">降水概率</span>
                        <span class="detail-value">${provider.precipitationProb !== undefined ? provider.precipitationProb + '%' : '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">降水量</span>
                        <span class="detail-value">${provider.precipitation !== undefined ? provider.precipitation + ' mm' : '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">风速</span>
                        <span class="detail-value">${provider.windSpeed !== undefined ? provider.windSpeed + ' km/h' : '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">紫外线指数</span>
                        <span class="detail-value">${provider.uvIndex !== undefined ? provider.uvIndex : '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">日出</span>
                        <span class="detail-value">${sunrise}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">日落</span>
                        <span class="detail-value">${sunset}</span>
                    </div>
                </div>
            </div>
            <div class="hourly-section" id="hourly-section">
                <div class="hourly-header">
                    <i class="fas fa-clock"></i>
                    <span>24小时预报</span>
                </div>
                <div class="hourly-loading" id="hourly-loading">
                    <div class="spinner-small"></div>
                    <span>加载中...</span>
                </div>
                <div class="hourly-container" id="hourly-container" style="display: none;"></div>
            </div>
        `;

        modalBody.innerHTML = detailContent;
        document.getElementById('detail-modal').classList.add('active');

        this.loadHourlyWeather(dateKey);
    }

    async loadHourlyWeather(dateKey) {
        const hourlyContainer = document.getElementById('hourly-container');
        const hourlyLoading = document.getElementById('hourly-loading');

        if (!hourlyContainer) return;

        try {
            const city = this.cities[this.currentCity];
            const api = new WeatherAPI('openmeteo');
            const hourlyData = await api.fetchHourly(city, dateKey);

            if (hourlyData && hourlyData.length > 0) {
                this.renderHourlyWeather(hourlyData, hourlyContainer);
                hourlyLoading.style.display = 'none';
                hourlyContainer.style.display = 'grid';
            } else {
                throw new Error('无小时数据');
            }
        } catch (error) {
            console.error('获取小时天气失败:', error);
            hourlyLoading.innerHTML = '<span class="hourly-error">暂无可用的小时预报</span>';
        }
    }

    renderHourlyWeather(hourlyData, container) {
        const currentHour = new Date().getHours();
        const relevantHours = hourlyData.filter((_, index) => index % 2 === 0 || index === hourlyData.length - 1);

        const html = relevantHours.map(hour => {
            const hourNum = parseInt(hour.time.split(':')[0]);
            const isCurrentHour = hourNum === currentHour;

            return `
                <div class="hourly-item ${isCurrentHour ? 'current' : ''}">
                    <div class="hourly-time">${hour.time}</div>
                    <div class="hourly-icon">${hour.weatherIcon}</div>
                    <div class="hourly-temp">${hour.temp}°</div>
                    <div class="hourly-precip">
                        <i class="fas fa-tint"></i>
                        ${hour.precipProb}%
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    formatTime(timeStr) {
        if (!timeStr) return '--';
        if (typeof timeStr === 'string' && timeStr.includes('T')) {
            return timeStr.substring(0, 5);
        }
        return timeStr;
    }

    closeModal() {
        document.getElementById('detail-modal').classList.remove('active');
    }

    updateCityHeader(city) {
        const nameEl = document.getElementById('current-city-name');
        const coordsEl = document.getElementById('current-city-coords');
        if (nameEl) nameEl.textContent = city.name;
        if (coordsEl) coordsEl.textContent = `${city.latitude}°N, ${city.longitude}°E`;
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const content = document.getElementById('weather-content');
        const refreshBtn = document.getElementById('refresh-btn');

        if (loading) loading.classList.toggle('active', show);
        if (content) {
            content.style.opacity = show ? '0.5' : '1';
            content.style.pointerEvents = show ? 'none' : 'auto';
        }
        if (refreshBtn) refreshBtn.classList.toggle('loading', show);
    }

    showError(message) {
        const errorEl = document.getElementById('error-message');
        const textEl = document.getElementById('error-text');
        const content = document.getElementById('weather-content');

        if (errorEl) {
            errorEl.style.display = 'flex';
            if (textEl) textEl.textContent = message;
        }
        if (content) content.innerHTML = '';
    }

    hideError() {
        const errorEl = document.getElementById('error-message');
        if (errorEl) errorEl.style.display = 'none';
    }

    refresh() {
        this.weatherData = {};
        this.loadWeatherData();
    }

    updateLastRefreshTime() {
        const updateEl = document.getElementById('last-updated');
        if (updateEl) {
            const now = new Date();
            updateEl.textContent = `最后更新：${now.toLocaleString('zh-CN')}`;
        }
    }
}

let weatherCompare = null;

document.addEventListener('DOMContentLoaded', () => {
    weatherCompare = new WeatherCompare();
});
