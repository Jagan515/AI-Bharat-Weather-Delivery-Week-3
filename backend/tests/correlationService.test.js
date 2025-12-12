const correlationService = require('../services/correlationService');

describe('Correlation Service', () => {
  const mockWeatherData = [
    { timestamp: '2023-12-01T10:00:00Z', temperature: 20, humidity: 60, rainfall: 0, windSpeed: 5 },
    { timestamp: '2023-12-01T11:00:00Z', temperature: 22, humidity: 65, rainfall: 2, windSpeed: 7 },
    { timestamp: '2023-12-01T12:00:00Z', temperature: 25, humidity: 70, rainfall: 0, windSpeed: 3 },
  ];
  
  const mockDeliveryData = [
    { timestamp: '2023-12-01T10:30:00Z', orderValue: 35, type: 'food', location: { neighborhood: 'Downtown' } },
    { timestamp: '2023-12-01T11:15:00Z', orderValue: 45, type: 'food', location: { neighborhood: 'Mission' } },
    { timestamp: '2023-12-01T11:45:00Z', orderValue: 25, type: 'grocery', location: { neighborhood: 'Downtown' } },
    { timestamp: '2023-12-01T12:20:00Z', orderValue: 55, type: 'retail', location: { neighborhood: 'Castro' } },
  ];
  
  describe('calculateCorrelations', () => {
    test('should return message for insufficient data', () => {
      const result = correlationService.calculateCorrelations([], []);
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Insufficient data');
    });
    
    test('should calculate correlations with sufficient data', () => {
      const result = correlationService.calculateCorrelations(mockWeatherData, mockDeliveryData);
      
      expect(result).toHaveProperty('correlations');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('dataPoints');
      expect(result).toHaveProperty('lastCalculated');
      
      expect(result.correlations).toHaveProperty('temperature');
      expect(result.correlations).toHaveProperty('rainfall');
      expect(result.correlations).toHaveProperty('humidity');
      expect(result.correlations).toHaveProperty('windSpeed');
    });
    
    test('should include data point counts', () => {
      const result = correlationService.calculateCorrelations(mockWeatherData, mockDeliveryData);
      
      expect(result.dataPoints).toHaveProperty('weather');
      expect(result.dataPoints).toHaveProperty('deliveries');
      expect(result.dataPoints).toHaveProperty('hours');
      
      expect(result.dataPoints.weather).toBe(mockWeatherData.length);
      expect(result.dataPoints.deliveries).toBe(mockDeliveryData.length);
    });
  });
  
  describe('groupDeliveriesByHour', () => {
    test('should group deliveries by hour correctly', () => {
      const grouped = correlationService.groupDeliveriesByHour(mockDeliveryData);
      
      expect(typeof grouped).toBe('object');
      
      // Check that deliveries are grouped by hour
      const hours = Object.keys(grouped);
      expect(hours.length).toBeGreaterThan(0);
      
      // Each hour should have count and totalValue
      hours.forEach(hour => {
        expect(grouped[hour]).toHaveProperty('count');
        expect(grouped[hour]).toHaveProperty('totalValue');
        expect(grouped[hour]).toHaveProperty('avgValue');
        expect(grouped[hour]).toHaveProperty('types');
        expect(grouped[hour]).toHaveProperty('neighborhoods');
        
        expect(typeof grouped[hour].count).toBe('number');
        expect(typeof grouped[hour].totalValue).toBe('number');
        expect(typeof grouped[hour].avgValue).toBe('number');
      });
    });
    
    test('should calculate average values correctly', () => {
      const grouped = correlationService.groupDeliveriesByHour(mockDeliveryData);
      
      Object.values(grouped).forEach(hourData => {
        const expectedAvg = hourData.totalValue / hourData.count;
        expect(hourData.avgValue).toBeCloseTo(expectedAvg, 2);
      });
    });
  });
  
  describe('groupWeatherByHour', () => {
    test('should group weather data by hour', () => {
      const grouped = correlationService.groupWeatherByHour(mockWeatherData);
      
      expect(typeof grouped).toBe('object');
      
      const hours = Object.keys(grouped);
      expect(hours.length).toBe(mockWeatherData.length);
      
      // Each hour should contain weather data
      hours.forEach(hour => {
        expect(grouped[hour]).toHaveProperty('temperature');
        expect(grouped[hour]).toHaveProperty('humidity');
        expect(grouped[hour]).toHaveProperty('rainfall');
        expect(grouped[hour]).toHaveProperty('windSpeed');
      });
    });
  });
  
  describe('calculateCorrelation', () => {
    test('should return zero correlation for insufficient data', () => {
      const weatherData = { '2023-12-01T10': { temperature: 20 } };
      const deliveryData = {};
      
      const result = correlationService.calculateCorrelation(
        weatherData, deliveryData, 'temperature', 'count'
      );
      
      expect(result.coefficient).toBe(0);
      expect(result.strength).toBe('insufficient data');
      expect(result.pairs).toBe(0);
    });
    
    test('should calculate correlation coefficient', () => {
      const weatherData = {
        '2023-12-01T10': { temperature: 20 },
        '2023-12-01T11': { temperature: 25 },
        '2023-12-01T12': { temperature: 30 }
      };
      
      const deliveryData = {
        '2023-12-01T10': { count: 5 },
        '2023-12-01T11': { count: 8 },
        '2023-12-01T12': { count: 12 }
      };
      
      const result = correlationService.calculateCorrelation(
        weatherData, deliveryData, 'temperature', 'count'
      );
      
      expect(typeof result.coefficient).toBe('number');
      expect(result.coefficient).toBeGreaterThanOrEqual(-1);
      expect(result.coefficient).toBeLessThanOrEqual(1);
      expect(result.pairs).toBe(3);
    });
  });
  
  describe('interpretCorrelation', () => {
    test('should correctly interpret correlation strength', () => {
      expect(correlationService.interpretCorrelation(0.8)).toBe('strong');
      expect(correlationService.interpretCorrelation(-0.75)).toBe('strong');
      expect(correlationService.interpretCorrelation(0.6)).toBe('moderate');
      expect(correlationService.interpretCorrelation(-0.55)).toBe('moderate');
      expect(correlationService.interpretCorrelation(0.4)).toBe('weak');
      expect(correlationService.interpretCorrelation(-0.35)).toBe('weak');
      expect(correlationService.interpretCorrelation(0.2)).toBe('very weak');
      expect(correlationService.interpretCorrelation(-0.1)).toBe('very weak');
    });
  });
  
  describe('calculateSignificance', () => {
    test('should return insufficient data for small samples', () => {
      const significance = correlationService.calculateSignificance(0.5, 2);
      expect(significance).toBe('insufficient data');
    });
    
    test('should calculate significance for larger samples', () => {
      const significance = correlationService.calculateSignificance(0.8, 20);
      expect(['highly significant', 'significant', 'marginally significant', 'not significant'])
        .toContain(significance);
    });
  });
  
  describe('generateInsights', () => {
    test('should generate insights from correlations', () => {
      const mockCorrelations = {
        temperature: { coefficient: 0.6, strength: 'moderate' },
        rainfall: { coefficient: 0.8, strength: 'strong' },
        humidity: { coefficient: 0.2, strength: 'very weak' },
        orderValue: {
          temperature: { coefficient: 0.4, strength: 'weak' }
        }
      };
      
      const insights = correlationService.generateInsights(
        mockCorrelations, 
        mockWeatherData, 
        correlationService.groupDeliveriesByHour(mockDeliveryData)
      );
      
      expect(Array.isArray(insights)).toBe(true);
      
      insights.forEach(insight => {
        expect(insight).toHaveProperty('type');
        expect(insight).toHaveProperty('factor');
        expect(insight).toHaveProperty('message');
        expect(insight).toHaveProperty('strength');
        
        expect(typeof insight.message).toBe('string');
        expect(insight.message.length).toBeGreaterThan(0);
      });
    });
    
    test('should generate temporal insights', () => {
      const mockCorrelations = {
        temperature: { coefficient: 0.2, strength: 'very weak' },
        rainfall: { coefficient: 0.2, strength: 'very weak' },
        humidity: { coefficient: 0.2, strength: 'very weak' },
        orderValue: {
          temperature: { coefficient: 0.2, strength: 'very weak' }
        }
      };
      
      const deliveryData = correlationService.groupDeliveriesByHour(mockDeliveryData);
      
      const insights = correlationService.generateInsights(
        mockCorrelations, 
        mockWeatherData, 
        deliveryData
      );
      
      // Should include temporal insight about peak hours
      const temporalInsights = insights.filter(insight => insight.type === 'temporal');
      expect(temporalInsights.length).toBeGreaterThan(0);
    });
  });
});