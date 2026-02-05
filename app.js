/**
 * 天气预报对比应用
 */

class WeatherCompare {
    constructor() {
        this.cities = CITIES;
        this.providers = PROVIDERS;
        this.currentCity = DEFAULT_CITY;
        this.weatherData = {};
        this.isLoading = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadWeatherData();
    }

    bindEvents() {
        // 城市选择
        document.querySelectorAll('.city-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const cityId = e.currentTarget.dataset.city;
                this.switchCity(cityId);
            });
        });

        // 刷新按钮
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        // 关闭弹窗
        this.bindModalClose();
    }

    bindModalClose() {
        const modalClose = document.getElementById('modal-close');

        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // 点击弹窗外部关闭
        const modalOverlay = document.getElementById('detail-modal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }
    }

    switchCity(cityId) {
        if (this.isLoading || cityId === this.currentCity) return;

        // 更新选中状态
        document.querySelectorAll('.city-item').forEach(item => {
            item.classList.toggle('active', item.dataset.city === cityId);
        });

        this.currentCity = cityId;
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

        // 更新标题
        this.updateCityHeader(city);

        try {
            // 获取4家供应商数据
            const results = await this.fetchAllProviders(city);

            // 合并数据
            this.weatherData = this.mergeWeatherData(results);

            // 渲染
            this.renderWeather();
            this.updateLastRefreshTime();

        } catch (error) {
            console.error('获取天气数据失败:', error);
            this.showError(`加载失败: ${error.message}`);
        }

        this.isLoading = false;
        this.showLoading(false);
    }

    async fetchAllProviders(city) {
        const providerIds = ['openmeteo', 'openweathermap', 'weatherapi'];
        const results = {};

        const promises = providerIds.map(async (providerId) => {
            try {
                const api = new WeatherAPI(providerId);
                const data = await api.getForecast(city);
                results[providerId] = {
                    success: true,
                    data: data
                };
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
        const merged = {
            city: null,
            days: {}
        };

        Object.entries(results).forEach(([providerId, result]) => {
            const provider = this.providers[providerId];

            if (result.success && result.data) {
                if (!merged.city) {
                    merged.city = result.data.city;
                }

                result.data.forecasts.forEach((forecast, index) => {
                    const dateKey = forecast.date;
                    if (!merged.days[dateKey]) {
                        merged.days[dateKey] = {
                            date: forecast.date,
                            tempHigh: null,
                            tempLow: null,
                            weatherIcon: null,
                            weatherDesc: null,
                            providers: {}
                        };
                    }

                    merged.days[dateKey].providers[providerId] = {
                        providerId: providerId,
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
                });
            }
        });

        return merged;
    }

    renderWeather() {
        const container = document.getElementById('weather-content');
        if (!container) return;

        container.innerHTML = '';

        if (!this.weatherData.days || Object.keys(this.weatherData.days).length === 0) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>暂无天气数据，请检查网络或API配置</span>
                </div>
            `;
            return;
        }

        // 按日期排序并渲染
        Object.values(this.weatherData.days)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(day => {
                const dayElement = this.createDaySection(day);
                container.appendChild(dayElement);
            });
    }

    createDaySection(day) {
        const section = document.createElement('div');
        section.className = 'day-section';
        section.dataset.date = day.date;

        const dateInfo = formatDate(day.date);

        section.innerHTML = `
            <div class="day-header" onclick="weatherCompare.toggleDay('${day.date}')">
                <div class="day-title">
                    <span class="day-date">${dateInfo.full}</span>
                    <span class="day-weekday">${dateInfo.weekday}</span>
                </div>
                <div class="day-weather">
                    <span class="day-weather-icon">${day.weatherIcon || '☀️'}</span>
                    <span class="day-weather-desc">${day.weatherDesc || '暂无数据'}</span>
                </div>
            </div>
            <div class="provider-table">
                <div class="table-header">
                    <div class="table-header-cell">供应商</div>
                    <div class="table-header-cell">最高温</div>
                    <div class="table-header-cell">最低温</div>
                    <div class="table-header-cell">天气状况</div>
                </div>
                ${Object.values(day.providers).map(p => `
                    <div class="table-row" onclick="weatherCompare.showDayDetail('${day.date}', '${p.providerId}')">
                        <div class="provider-cell">
                            <div class="provider-icon" style="background: ${p.color || '#667eea'};">${p.icon || '☀️'}</div>
                            <span class="provider-name">${p.providerName}</span>
                        </div>
                        <div class="temp-cell">
                            <span class="temp-high">${formatTemp(p.tempHigh)}</span>
                        </div>
                        <div class="temp-cell">
                            <span class="temp-low">${formatTemp(p.tempLow)}</span>
                        </div>
                        <div class="temp-cell">
                            <span>${p.weatherIcon || '-'} ${p.weatherDesc || '-'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="expand-toggle">
                <span>点击展开详情</span>
                <i class="fas fa-chevron-down"></i>
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

    showDayDetail(dateKey, providerId) {
        const day = this.weatherData.days[dateKey];
        const provider = day?.providers[providerId];

        if (!provider) return;

        const dateInfo = formatDate(dateKey);
        const city = this.cities[this.currentCity];

        const modalHeader = document.getElementById('modal-header');
        const modalBody = document.getElementById('modal-body');

        modalHeader.innerHTML = `
            <div class="modal-city-title">${city.name}</div>
            <div class="modal-date-title">${dateInfo.full} ${dateInfo.weekday}</div>
            <div class="modal-weather-summary">
                <div class="summary-item">
                    <div class="summary-icon">${provider.weatherIcon || '☀️'}</div>
                    <div class="summary-desc">${provider.weatherDesc || '暂无数据'}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-temp">
                        <span class="summary-temp-high">${formatTemp(provider.tempHigh)}</span>
                        <span> / </span>
                        <span class="summary-temp-low">${formatTemp(provider.tempLow)}</span>
                    </div>
                </div>
            </div>
        `;

        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-card" style="border-top: 4px solid ${provider.color};">
                    <div class="provider-icon" style="background: ${provider.color};">${provider.icon || '☀️'}</div>
                    <div class="provider-name">${provider.providerName}</div>
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
                        <span class="detail-value">${provider.precipitation !== undefined ? provider.precipitation + 'mm' : '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">风速</span>
                        <span class="detail-value">${provider.windSpeed !== undefined ? provider.windSpeed + 'km/h' : '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">紫外线指数</span>
                        <span class="detail-value">${provider.uvIndex !== undefined ? provider.uvIndex : '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">日出</span>
                        <span class="detail-value">${provider.sunrise ? this.formatTime(provider.sunrise) : '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">日落</span>
                        <span class="detail-value">${provider.sunset ? this.formatTime(provider.sunset) : '--'}</span>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('detail-modal').classList.add('active');
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

        if (loading) {
            loading.classList.toggle('active', show);
        }

        if (content) {
            content.style.opacity = show ? '0.5' : '1';
            content.style.pointerEvents = show ? 'none' : 'auto';
        }

        if (refreshBtn) {
            refreshBtn.classList.toggle('loading', show);
        }
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
            updateEl.textContent = `最后更新: ${now.toLocaleString('zh-CN')}`;
        }
    }
}

// 初始化应用
let weatherCompare = null;

document.addEventListener('DOMContentLoaded', () => {
    weatherCompare = new WeatherCompare();
});
