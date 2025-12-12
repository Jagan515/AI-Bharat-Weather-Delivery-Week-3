const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
    this.defaultLat = parseFloat(process.env.DEFAULT_LAT) || 37.7749;
    this.defaultLon = parseFloat(process.env.DEFAULT_LON) || -122.4194;
  }

  async getCurrentWeather(lat = this.defaultLat, lon = this.defaultLon) {
    try {
      if (!this.apiKey) {
        // Return simulated data if no API key
        return this.generateSimulatedWeather();
      }

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        rainfall: data.rain ? data.rain['1h'] || 0 : 0,
        windSpeed: data.wind.speed,
        cloudiness: data.clouds.all,
        description: data.weather[0].description,
        location: {
          lat,
          lon,
          city: data.name
        }
      };
    } catch (error) {
      console.warn('Weather API error, using simulated data:', error.message);
      return this.generateSimulatedWeather();
    }
  }

  generateSimulatedWeather() {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Simulate realistic weather patterns
    const baseTemp = 20 + Math.sin((hour - 6) / 24 * 2 * Math.PI) * 8; // Daily temperature cycle
    const seasonalVariation = Math.sin(new Date().getMonth() / 12 * 2 * Math.PI) * 10;
    
    const temperature = baseTemp + seasonalVariation + (Math.random() - 0.5) * 4;
    const humidity = 40 + Math.random() * 40; // 40-80%
    const rainfall = Math.random() < 0.2 ? Math.random() * 5 : 0; // 20% chance of rain
    
    return {
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      pressure: 1013 + (Math.random() - 0.5) * 20,
      rainfall: Math.round(rainfall * 10) / 10,
      windSpeed: Math.random() * 15,
      cloudiness: Math.round(Math.random() * 100),
      description: rainfall > 0 ? 'light rain' : 
                  temperature > 25 ? 'clear sky' : 'partly cloudy',
      location: {
        lat: this.defaultLat,
        lon: this.defaultLon,
        city: 'San Francisco'
      }
    };
  }

  async getWeatherForecast(lat = this.defaultLat, lon = this.defaultLon) {
    try {
      if (!this.apiKey) {
        return this.generateSimulatedForecast();
      }

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return response.data.list.map(item => ({
        timestamp: new Date(item.dt * 1000).toISOString(),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        rainfall: item.rain ? item.rain['3h'] || 0 : 0,
        description: item.weather[0].description
      }));
    } catch (error) {
      console.warn('Forecast API error, using simulated data:', error.message);
      return this.generateSimulatedForecast();
    }
  }

  generateSimulatedForecast() {
    const forecast = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const futureTime = new Date(now.getTime() + i * 3 * 60 * 60 * 1000); // 3-hour intervals
      const hour = futureTime.getHours();
      
      const baseTemp = 20 + Math.sin((hour - 6) / 24 * 2 * Math.PI) * 8;
      const temperature = baseTemp + (Math.random() - 0.5) * 3;
      
      forecast.push({
        timestamp: futureTime.toISOString(),
        temperature: Math.round(temperature * 10) / 10,
        humidity: 40 + Math.random() * 40,
        rainfall: Math.random() < 0.15 ? Math.random() * 3 : 0,
        description: Math.random() < 0.7 ? 'clear sky' : 'partly cloudy'
      });
    }
    
    return forecast;
  }
}

module.exports = new WeatherService();