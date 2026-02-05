/**
 * 高德地图模块
 */

class WeatherMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.isInitialized = false;
    }

    /**
     * 初始化地图
     * @param {string} containerId - 地图容器ID
     */
    init(containerId = 'amap-container') {
        return new Promise((resolve, reject) => {
            if (typeof AMap === 'undefined') {
                console.warn('高德地图JS API未加载，使用备用方案');
                resolve(null);
                return;
            }

            try {
                this.map = new AMap.Map(containerId, {
                    zoom: 10,
                    center: [125.32, 46.39],
                    mapStyle: 'amap://styles/light'
                });

                this.map.on('load', () => {
                    this.isInitialized = true;
                    resolve(this.map);
                });
            } catch (error) {
                console.error('地图初始化失败:', error);
                resolve(null);
            }
        });
    }

    /**
     * 显示城市位置
     * @param {Object} city - 城市对象
     */
    showCity(city) {
        if (!this.map) {
            console.warn('地图未初始化');
            return;
        }

        this.clearMarkers();

        const position = [city.longitude, city.latitude];

        // 添加标记
        const marker = new AMap.Marker({
            position: position,
            title: city.name,
            icon: new AMap.Icon({
                size: new AMap.Size(40, 40),
                image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                imageSize: new AMap.Size(20, 30)
            })
        });

        // 添加信息窗口
        const infoWindow = new AMap.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h4 style="margin: 0 0 8px;">${city.name}</h4>
                    <p style="margin: 0; color: #666;">经度: ${city.longitude}°E</p>
                    <p style="margin: 4px 0 0; color: #666;">纬度: ${city.latitude}°N</p>
                    <p style="margin: 4px 0 0; color: #666;">${city.province}</p>
                </div>
            `,
            offset: new AMap.Pixel(0, -30)
        });

        marker.on('click', () => {
            infoWindow.open(this.map, marker.getPosition());
        });

        this.markers.push(marker);
        this.map.add(marker);
        infoWindow.open(this.map, position);

        // 设置中心点
        this.map.setCenter(position);
        this.map.setZoom(12);
    }

    /**
     * 清除所有标记
     */
    clearMarkers() {
        if (this.map && this.markers.length > 0) {
            this.map.remove(this.markers);
            this.markers = [];
        }
    }

    /**
     * 关闭地图弹窗
     */
    close() {
        const modal = document.getElementById('map-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * 打开地图弹窗
     * @param {Object} city - 城市对象
     */
    async open(city) {
        const modal = document.getElementById('map-modal');
        if (!modal) return;

        modal.classList.add('active');

        if (!this.map) {
            await this.init();
        }

        if (this.map) {
            this.showCity(city);
        } else {
            // 备用方案：显示城市信息
            this.showCityInfoFallback(city);
        }
    }

    /**
     * 备用方案：显示城市信息（当地图无法加载时）
     */
    showCityInfoFallback(city) {
        const container = document.getElementById('amap-container');
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; background: #f5f5f5;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">🗺️</div>
                    <h3 style="margin: 0 0 8px; color: #333;">${city.name}</h3>
                    <p style="margin: 0; color: #666;">${city.province}</p>
                    <p style="margin: 8px 0 0; color: #999; font-size: 0.9rem;">
                        位置: ${city.latitude}°N, ${city.longitude}°E
                    </p>
                </div>
            `;
        }
    }

    /**
     * 添加天气标记（显示各供应商数据）
     * @param {Array} providers - 供应商数据数组
     */
    async showWeatherMarkers(providers) {
        if (!this.map || providers.length === 0) return;

        providers.forEach((provider, index) => {
            // 为每个供应商添加标记
            const offset = 0.05; // 5km偏移量
            const position = [
                provider.position?.[0] || 125.32 + (Math.random() - 0.5) * offset,
                provider.position?.[1] || 46.39 + (Math.random() - 0.5) * offset
            ];

            const marker = new AMap.Marker({
                position: position,
                title: provider.providerName,
                content: `
                    <div style="
                        width: 36px;
                        height: 36px;
                        background: ${provider.color || '#667eea'};
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.2rem;
                        color: white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    ">${provider.icon || '☀️'}</div>
                `
            });

            const infoWindow = new AMap.InfoWindow({
                content: `
                    <div style="padding: 12px; min-width: 150px;">
                        <h4 style="margin: 0 0 8px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.2rem;">${provider.icon || '☀️'}</span>
                            ${provider.providerName}
                        </h4>
                        <p style="margin: 0; color: #666;">${provider.weatherDesc || '暂无数据'}</p>
                        <p style="margin: 8px 0 0; font-size: 1.2rem; font-weight: bold;">
                            ${provider.tempHigh ? provider.tempHigh + '°C' : '--'}
                            <span style="color: #3182ce;">/ ${provider.tempLow ? provider.tempLow + '°C' : '--'}</span>
                        </p>
                    </div>
                `,
                offset: new AMap.Pixel(0, -40)
            });

            marker.on('click', () => {
                infoWindow.open(this.map, marker.getPosition());
            });

            this.markers.push(marker);
            this.map.add(marker);
        });

        // 如果只有一个城市，调整视图
        if (providers.length === 1 && providers[0].position) {
            this.map.setCenter(providers[0].position);
            this.map.setZoom(12);
        } else {
            // 多个标记时自适应视图
            this.map.setFitView();
        }
    }
}

// 创建全局地图实例
let weatherMap = null;

document.addEventListener('DOMContentLoaded', () => {
    weatherMap = new WeatherMap();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WeatherMap };
}
