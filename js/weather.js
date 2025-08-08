class WeatherWidget {
    constructor() {
        this.defaultLat = -37.8136; // Melbourne default
        this.defaultLon = 144.9631;
        this.currentLat = this.defaultLat;
        this.currentLon = this.defaultLon;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromStorage();
        this.loadWeather();
        this.setUpdateInterval();
    }

    bindEvents() {
        const locationBtn = document.getElementById('location-btn');
        locationBtn.addEventListener('click', () => this.getUserLocation());
    }

    async loadWeather(lat = this.currentLat, lon = this.currentLon) {
        const weatherContent = document.getElementById('weather-content');
        weatherContent.innerHTML = '<div class="loading">Loading weather data...</div>';

        try {
            const weatherData = await this.fetchWeatherData(lat, lon);
            const locationData = await this.fetchLocationName(lat, lon);
            this.renderWeather(weatherData, locationData);
            this.addLocalStorage(); // Save successful location
        } catch (error) {
            this.renderError(error.message);
        }
    }

    async fetchWeatherData(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&hourly=temperature_2m,relative_humidity_2m,windspeed_10m&timezone=auto&forecast_days=3`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        return await response.json();
    }

    async fetchLocationName(lat, lon) {
        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const data = await response.json();
            return data.city || data.locality || 'Unknown Location';
        } catch (error) {
            return 'Unknown Location';
        }
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLat = position.coords.latitude;
                    this.currentLon = position.coords.longitude;
                    this.loadWeather(this.currentLat, this.currentLon);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Unable to get your location. Using default location.');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    getWeatherIcon(weatherCode) {
        const weatherIcons = {
            0: '☀️', // Clear sky
            1: '🌤️', // Mainly clear
            2: '⛅', // Partly cloudy
            3: '☁️', // Overcast
            45: '🌫️', // Fog
            48: '🌫️', // Depositing rime fog
            51: '🌦️', // Light drizzle
            53: '🌦️', // Moderate drizzle
            55: '🌦️', // Dense drizzle
            61: '🌧️', // Slight rain
            63: '🌧️', // Moderate rain
            65: '🌧️', // Heavy rain
            71: '🌨️', // Slight snow
            73: '🌨️', // Moderate snow
            75: '🌨️', // Heavy snow
            77: '🌨️', // Snow grains
            80: '🌦️', // Slight rain showers
            81: '🌧️', // Moderate rain showers
            82: '🌧️', // Violent rain showers
            85: '🌨️', // Slight snow showers
            86: '🌨️', // Heavy snow showers
            95: '⛈️', // Thunderstorm
            96: '⛈️', // Thunderstorm with slight hail
            99: '⛈️'  // Thunderstorm with heavy hail
        };
        return weatherIcons[weatherCode] || '🌡️';
    }

    renderWeather(data, locationName) {
        const current = data.current_weather;
        const daily = data.daily;
        
        // Update the weather header with location and icon
        const weatherHeader = document.querySelector('.weather-header h3');
        weatherHeader.innerHTML = `${locationName} ${this.getWeatherIcon(current.weathercode)}`;
        
        const html = `
            <div class="weather-content-wrapper">
                <div class="current-weather">
                    <div class="temperature">${Math.round(current.temperature)}°C</div>
                </div>
                <div class="forecast">
                    ${daily.time.slice(0, 3).map((date, index) => `
                        <div class="forecast-item">
                            <div class="forecast-day">${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div class="forecast-icon">${this.getWeatherIcon(daily.weathercode[index])}</div>
                            <div class="forecast-temp">${Math.round(daily.temperature_2m_min[index])}° / ${Math.round(daily.temperature_2m_max[index])}°</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('weather-content').innerHTML = html;
    }

    renderError(message) {
        document.getElementById('weather-content').innerHTML = `
            <div class="error">
                <p>Error loading weather data: ${message}</p>
                <button onclick="weatherWidget.loadWeather()">Try Again</button>
            </div>
        `;
    }

    setUpdateInterval() {
        // Update weather every 10 minutes
        setInterval(() => {
            this.loadWeather();
        }, 600000);
    }

    addLocalStorage() {
        // Save last known location
        localStorage.setItem('lastLat', this.currentLat);
        localStorage.setItem('lastLon', this.currentLon);
    }

    loadFromStorage() {
        // Load saved location
        const savedLat = localStorage.getItem('lastLat');
        const savedLon = localStorage.getItem('lastLon');
        if (savedLat && savedLon) {
            this.currentLat = parseFloat(savedLat);
            this.currentLon = parseFloat(savedLon);
        }
    }
}

// Initialize the weather widget when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.weatherWidget = new WeatherWidget();
});
