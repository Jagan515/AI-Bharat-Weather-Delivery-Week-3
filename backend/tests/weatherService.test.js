const weatherService = require('../services/weatherService');

describe('Weather Service', () => {
  describe('generateSimulatedWeather', () => {
    test('should generate realistic weather data', () => {
      const weather = weatherService.generateSimulatedWeather();
      
      expect(weather).toHaveProperty('temperature');
      expect(weather).toHaveProperty('humidity');
      expect(weather).toHaveProperty('rainfall');
      expect(weather).toHaveProperty('windSpeed');
      expect(weather).toHaveProperty('cloudiness');
      expect(weather).toHaveProperty('description');
      expect(weather).toHaveProperty('location');
      
      // Temperature should be reasonable
      expect(weather.temperature).toBeGreaterThan(-20);
      expect(weather.temperature).toBeLessThan(50);
      
      // Humidity should be 0-100%
      expect(weather.humidity).toBeGreaterThanOrEqual(0);
      expect(weather.humidity).toBeLessThanOrEqual(100);
      
      // Rainfall should be non-negative
      expect(weather.rainfall).toBeGreaterThanOrEqual(0);
      
      // Wind speed should be reasonable
      expect(weather.windSpeed).toBeGreaterThanOrEqual(0);
      expect(weather.windSpeed).toBeLessThan(50);
      
      // Cloudiness should be 0-100%
      expect(weather.cloudiness).toBeGreaterThanOrEqual(0);
      expect(weather.cloudiness).toBeLessThanOrEqual(100);
    });
    
    test('should generate consistent location data', () => {
      const weather = weatherService.generateSimulatedWeather();
      
      expect(weather.location).toHaveProperty('lat');
      expect(weather.location).toHaveProperty('lon');
      expect(weather.location).toHaveProperty('city');
      
      expect(typeof weather.location.lat).toBe('number');
      expect(typeof weather.location.lon).toBe('number');
      expect(typeof weather.location.city).toBe('string');
    });
    
    test('should generate different weather on multiple calls', () => {
      const weather1 = weatherService.generateSimulatedWeather();
      const weather2 = weatherService.generateSimulatedWeather();
      
      // At least one property should be different (due to randomization)
      const isDifferent = 
        weather1.temperature !== weather2.temperature ||
        weather1.humidity !== weather2.humidity ||
        weather1.rainfall !== weather2.rainfall;
      
      expect(isDifferent).toBe(true);
    });
  });
  
  describe('generateSimulatedForecast', () => {
    test('should generate 24 forecast points', () => {
      const forecast = weatherService.generateSimulatedForecast();
      
      expect(Array.isArray(forecast)).toBe(true);
      expect(forecast).toHaveLength(24);
    });
    
    test('should have proper forecast structure', () => {
      const forecast = weatherService.generateSimulatedForecast();
      
      forecast.forEach(point => {
        expect(point).toHaveProperty('timestamp');
        expect(point).toHaveProperty('temperature');
        expect(point).toHaveProperty('humidity');
        expect(point).toHaveProperty('rainfall');
        expect(point).toHaveProperty('description');
        
        expect(new Date(point.timestamp)).toBeInstanceOf(Date);
        expect(typeof point.temperature).toBe('number');
        expect(typeof point.humidity).toBe('number');
        expect(typeof point.rainfall).toBe('number');
        expect(typeof point.description).toBe('string');
      });
    });
    
    test('should generate future timestamps', () => {
      const forecast = weatherService.generateSimulatedForecast();
      const now = new Date();
      
      forecast.forEach(point => {
        const pointTime = new Date(point.timestamp);
        expect(pointTime.getTime()).toBeGreaterThan(now.getTime());
      });
    });
  });
});