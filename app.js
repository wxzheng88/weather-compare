/**
 * 天气预报对比应用
 * 使用 Open-Meteo API 获取天气数据
 */

class WeatherComparison {
    constructor() {
        this.cities = CITIES;
        this.weatherData = {};
        this.isLoading = { anda: false, gannan: false };
        this.apiBase = 'https://api.open-meteo.com/v1/forecast';
        
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.bindEvents();
        this.loadWeatherData();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAll());
        }

        const modalClose = document.getElementById('modal-close');
        const modalOverlay = document.getElementById('detail-modal');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    /**
     * 加载所有城市的天气数据
     */
    async loadWeatherData() {
        const promises = [
            this.fetchWeatherData('anda'),
            this.fetchWeatherData('gannan')
        ];

        try {
            await Promise.all(promises);
            this.updateLastRefreshTime();
        } catch (error) {
            console.error('加载天气数据失败:', error);
            this.showError('anda', '加载数据失败，请刷新页面重试');
            this.showError('gannan', '加载数据失败，请刷新页面重试');
        }
    }

    /**
     * 刷新所有数据
     */
    async refreshAll() {
        this.clearData();
        await this.loadWeatherData();
    }

    /**
     * 清空现有数据
     */
    clearData() {
        document.getElementById('anda-weather').innerHTML = '';
        document.getElementById('gannan-weather').innerHTML = '';
        this.showLoading('anda');
        this.showLoading('gannan');
    }

    /**
     * 获取单个城市的天气数据
     * @param {string} cityId - 城市ID
     */
    async fetchWeatherData(cityId) {
        const city = this.cities[cityId];
        if (!city) return;

        this.isLoading[cityId] = true;
        this.showLoading(cityId);

        try {
            const params = new URLSearchParams({
                latitude: city.latitude,
                longitude: city.longitude,
                daily: [
                    'weathercode',
                    'temperature_2m_max',
                    'temperature_2m_min',
                    'apparent_temperature_max',
                    'apparent_temperature_min',
                    'precipitation_sum',
                    'precipitation_probability_max',
                    'windspeed_10m_max',
                    'relative_humidity_2m',
                    'uv_index_max',
                    'sunrise',
                    'sunset'
                ].join(','),
                timezone: city.timezone,
                forecast_days: 5
            });

            const response = await fetch(`${this.apiBase}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.weatherData[cityId] = data;
            this.hideLoading(cityId);
            this.renderWeatherCards(cityId, data);

        } catch (error) {
            console.error(`获取${city.name}天气数据失败:`, error);
            this.hideLoading(cityId);
            this.showError(cityId, `无法获取天气数据: ${error.message}`);
        }
    }

    /**
     * 渲染天气卡片
     * @param {string} cityId - 城市ID
     * @param {Object} data - 天气数据
     */
    renderWeatherCards(cityId, data) {
        const container = document.getElementById(`${cityId}-weather`);
        if (!container) return;

        container.innerHTML = '';
        const daily = data.daily;

        daily.time.forEach((dateStr, index) => {
            const card = this.createWeatherCard(cityId, dateStr, daily, index);
            container.appendChild(card);
        });

        this.updateLastUpdated(cityId);
    }

    /**
     * 创建单个天气卡片
     * @param {string} cityId - 城市ID
     * @param {string} dateStr - 日期字符串
     * @param {Object} daily - 每日数据
     * @param {number} index - 索引
     * @returns {HTMLElement} 卡片元素
     */
    createWeatherCard(cityId, dateStr, daily, index) {
        const card = document.createElement('div');
        card.className = 'weather-card';
        card.dataset.city = cityId;
        card.dataset.index = index;

        const dateInfo = formatDate(dateStr);
        const weatherInfo = getWeatherInfo(daily.weathercode[index]);
        const tempMax = daily.temperature_2m_max[index];
        const tempMin = daily.temperature_2m_min[index];
        const apparentMax = daily.apparent_temperature_max[index];
        const apparentMin = daily.apparent_temperature_min[index];

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <span class="card-date">${dateInfo.full}</span>
                    <span class="card-weekday"> ${dateInfo.weekday}</span>
                </div>
            </div>
            <div class="card-main">
                <div class="weather-icon">${weatherInfo.icon}</div>
                <div class="weather-desc">${weatherInfo.desc}</div>
                <div class="temp-range">
                    <span class="temp-high">${formatTemp(tempMax)}</span>
                    <span class="temp-low"> / ${formatTemp(tempMin)}</span>
                </div>
            </div>
            <div class="expand-toggle">
                <span>点击查看详情</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="weather-details">
                <div class="details-grid">
                    <div class="detail-item">
                        <i class="fas fa-thermometer-half"></i>
                        <span>体感温度:</span>
                        <span class="value">${formatTemp(apparentMax)} / ${formatTemp(apparentMin)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-tint"></i>
                        <span>降水概率:</span>
                        <span class="value">${formatPercent(daily.precipitation_probability_max[index])}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-cloud-rain"></i>
                        <span>降水量:</span>
                        <span class="value">${daily.precipitation_sum[index] || 0} mm</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-wind"></i>
                        <span>风速:</span>
                        <span class="value">${formatWindSpeed(daily.windspeed_10m_max[index])}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-water"></i>
                        <span>湿度:</span>
                        <span class="value">${daily.relative_humidity_2m[index] || '--'}%</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-sun"></i>
                        <span>紫外线指数:</span>
                        <span class="value">${daily.uv_index_max[index] || '--'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-sunrise"></i>
                        <span>日出:</span>
                        <span class="value">${formatTime(daily.sunrise[index])}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-sunset"></i>
                        <span>日落:</span>
                        <span class="value">${formatTime(daily.sunset[index])}</span>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => this.toggleCard(card));

        return card;
    }

    /**
     * 切换卡片展开状态
     * @param {HTMLElement} card - 卡片元素
     */
    toggleCard(card) {
        const wasExpanded = card.classList.contains('expanded');
        
        document.querySelectorAll('.weather-card.expanded').forEach(c => {
            c.classList.remove('expanded');
        });

        if (!wasExpanded) {
            card.classList.add('expanded');
            this.showCardDetails(card);
        }
    }

    /**
     * 显示卡片详细信息（弹窗）
     * @param {HTMLElement} card - 卡片元素
     */
    showCardDetails(card) {
        const cityId = card.dataset.city;
        const index = parseInt(card.dataset.index);
        const city = this.cities[cityId];
        const data = this.weatherData[cityId];
        
        if (!data || !city) return;

        const daily = data.daily;
        const dateStr = daily.time[index];
        const dateInfo = formatDate(dateStr);
        const weatherInfo = getWeatherInfo(daily.weathercode[index]);

        const modalHeader = document.getElementById('modal-header');
        const modalBody = document.getElementById('modal-body');

        modalHeader.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 10px;">${weatherInfo.icon}</div>
            <h2 style="font-size: 1.5rem; margin-bottom: 5px;">${city.name}</h2>
            <p style="color: var(--text-secondary);">${dateInfo.full} ${dateInfo.weekday}</p>
            <p style="font-size: 1.2rem; color: #667eea; margin-top: 10px;">${weatherInfo.desc}</p>
            <div style="font-size: 2rem; font-weight: 700; margin-top: 10px;">
                <span style="color: #e53e3e;">${formatTemp(daily.temperature_2m_max[index])}</span>
                <span style="color: var(--text-secondary);"> / </span>
                <span style="color: #3182ce;">${formatTemp(daily.temperature_2m_min[index])}</span>
            </div>
        `;

        modalBody.innerHTML = `
            <div class="details-grid">
                <div class="detail-item">
                    <i class="fas fa-thermometer-half"></i>
                    <span>体感温度:</span>
                    <span class="value">${formatTemp(daily.apparent_temperature_max[index])} / ${formatTemp(daily.apparent_temperature_min[index])}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-tint"></i>
                    <span>降水概率:</span>
                    <span class="value">${formatPercent(daily.precipitation_probability_max[index])}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-cloud-rain"></i>
                    <span>降水量:</span>
                    <span class="value">${daily.precipitation_sum[index] || 0} mm</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-wind"></i>
                    <span>风速:</span>
                    <span class="value">${formatWindSpeed(daily.windspeed_10m_max[index])}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-water"></i>
                    <span>湿度:</span>
                    <span class="value">${daily.relative_humidity_2m[index] || '--'}%</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-sun"></i>
                    <span>紫外线指数:</span>
                    <span class="value">${this.getUVLevel(daily.uv_index_max[index])}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-sunrise"></i>
                    <span>日出时间:</span>
                    <span class="value">${formatTime(daily.sunrise[index])}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-sunset"></i>
                    <span>日落时间:</span>
                    <span class="value">${formatTime(daily.sunset[index])}</span>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
                    <i class="fas fa-info-circle"></i> 紫外线指数说明
                </p>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <span style="padding: 4px 8px; background: #48bb78; color: white; border-radius: 4px; font-size: 0.75rem;">低 0-2</span>
                    <span style="padding: 4px 8px; background: #ecc94b; color: #744210; border-radius: 4px; font-size: 0.75rem;">中 3-5</span>
                    <span style="padding: 4px 8px; background: #ed8936; color: white; border-radius: 4px; font-size: 0.75rem;">高 6-7</span>
                    <span style="padding: 4px 8px; background: #e53e3e; color: white; border-radius: 4px; font-size: 0.75rem;">甚高 8-10</span>
                    <span style="padding: 4px 8px; background: #805ad5; color: white; border-radius: 4px; font-size: 0.75rem;">极高 11+</span>
                </div>
            </div>
        `;

        document.getElementById('detail-modal').classList.add('active');
    }

    /**
     * 获取紫外线等级描述
     * @param {number} uv - 紫外线指数
     * @returns {string} 等级描述
     */
    getUVLevel(uv) {
        if (uv === null || uv === undefined) return '--';
        const level = Math.round(uv);
        if (level <= 2) return `${level} (低)`;
        if (level <= 5) return `${level} (中)`;
        if (level <= 7) return `${level} (高)`;
        if (level <= 10) return `${level} (甚高)`;
        return `${level} (极高)`;
    }

    /**
     * 关闭弹窗
     */
    closeModal() {
        document.getElementById('detail-modal').classList.remove('active');
        document.querySelectorAll('.weather-card.expanded').forEach(c => {
            c.classList.remove('expanded');
        });
    }

    /**
     * 显示加载状态
     * @param {string} cityId - 城市ID
     */
    showLoading(cityId) {
        const loading = document.getElementById(`${cityId}-loading`);
        const weatherGrid = document.getElementById(`${cityId}-weather`);
        const errorDiv = document.getElementById(`${cityId}-error`);
        
        if (loading) loading.style.display = 'flex';
        if (weatherGrid) weatherGrid.innerHTML = '';
        if (errorDiv) errorDiv.style.display = 'none';
    }

    /**
     * 隐藏加载状态
     * @param {string} cityId - 城市ID
     */
    hideLoading(cityId) {
        const loading = document.getElementById(`${cityId}-loading`);
        if (loading) loading.style.display = 'none';
    }

    /**
     * 显示错误信息
     * @param {string} cityId - 城市ID
     * @param {string} message - 错误消息
     */
    showError(cityId, message) {
        const errorDiv = document.getElementById(`${cityId}-error`);
        const weatherGrid = document.getElementById(`${cityId}-weather`);
        const loading = document.getElementById(`${cityId}-loading`);
        
        if (errorDiv) {
            errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            errorDiv.style.display = 'block';
        }
        if (weatherGrid) weatherGrid.innerHTML = '';
        if (loading) loading.style.display = 'none';
    }

    /**
     * 更新时间戳
     * @param {string} cityId - 城市ID
     */
    updateLastUpdated(cityId) {
        const updatedDiv = document.getElementById(`${cityId}-updated`);
        if (updatedDiv) {
            const now = new Date();
            updatedDiv.innerHTML = `<i class="fas fa-clock"></i> ${now.toLocaleTimeString('zh-CN')} 更新`;
        }
    }

    /**
     * 更新全局刷新时间
     */
    updateLastRefreshTime() {
        const globalUpdated = document.getElementById('global-updated');
        if (globalUpdated) {
            const now = new Date();
            globalUpdated.textContent = `最后更新: ${now.toLocaleString('zh-CN')}`;
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new WeatherComparison();
});
