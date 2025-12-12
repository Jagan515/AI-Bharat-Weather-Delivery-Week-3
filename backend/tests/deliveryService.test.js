const deliveryService = require('../services/deliveryService');

describe('Delivery Service', () => {
  const mockWeather = {
    temperature: 20,
    humidity: 60,
    rainfall: 0,
    windSpeed: 5
  };
  
  describe('generateDeliveries', () => {
    test('should generate array of deliveries', () => {
      const deliveries = deliveryService.generateDeliveries(mockWeather);
      
      expect(Array.isArray(deliveries)).toBe(true);
      expect(deliveries.length).toBeGreaterThanOrEqual(0);
    });
    
    test('should generate deliveries with proper structure', () => {
      const deliveries = deliveryService.generateDeliveries(mockWeather);
      
      if (deliveries.length > 0) {
        const delivery = deliveries[0];
        
        expect(delivery).toHaveProperty('id');
        expect(delivery).toHaveProperty('timestamp');
        expect(delivery).toHaveProperty('type');
        expect(delivery).toHaveProperty('location');
        expect(delivery).toHaveProperty('orderValue');
        expect(delivery).toHaveProperty('deliveryTime');
        expect(delivery).toHaveProperty('weatherConditions');
        
        expect(typeof delivery.id).toBe('string');
        expect(new Date(delivery.timestamp)).toBeInstanceOf(Date);
        expect(['food', 'grocery', 'pharmacy', 'retail', 'electronics']).toContain(delivery.type);
        expect(typeof delivery.orderValue).toBe('number');
        expect(typeof delivery.deliveryTime).toBe('number');
      }
    });
    
    test('should generate more deliveries in bad weather', () => {
      const goodWeather = { temperature: 22, humidity: 50, rainfall: 0, windSpeed: 3 };
      const badWeather = { temperature: 22, humidity: 50, rainfall: 5, windSpeed: 3 };
      
      const goodWeatherDeliveries = deliveryService.generateDeliveries(goodWeather);
      const badWeatherDeliveries = deliveryService.generateDeliveries(badWeather);
      
      // Rain should generally increase delivery count
      // Note: This is probabilistic, so we'll run multiple times
      let rainIncreaseCount = 0;
      for (let i = 0; i < 10; i++) {
        const good = deliveryService.generateDeliveries(goodWeather).length;
        const bad = deliveryService.generateDeliveries(badWeather).length;
        if (bad >= good) rainIncreaseCount++;
      }
      
      // At least 60% of the time, rain should increase or maintain delivery count
      expect(rainIncreaseCount).toBeGreaterThanOrEqual(6);
    });
  });
  
  describe('getBaseDeliveryRate', () => {
    test('should return higher rates during meal times', () => {
      const lunchRate = deliveryService.getBaseDeliveryRate(12); // Noon
      const dinnerRate = deliveryService.getBaseDeliveryRate(19); // 7 PM
      const lateNightRate = deliveryService.getBaseDeliveryRate(2); // 2 AM
      
      expect(lunchRate).toBeGreaterThan(lateNightRate);
      expect(dinnerRate).toBeGreaterThan(lateNightRate);
    });
    
    test('should return valid rates for all hours', () => {
      for (let hour = 0; hour < 24; hour++) {
        const rate = deliveryService.getBaseDeliveryRate(hour);
        expect(typeof rate).toBe('number');
        expect(rate).toBeGreaterThan(0);
        expect(rate).toBeLessThan(100);
      }
    });
  });
  
  describe('calculateWeatherMultiplier', () => {
    test('should increase multiplier for extreme temperatures', () => {
      const normalWeather = { temperature: 20, humidity: 50, rainfall: 0, windSpeed: 5 };
      const coldWeather = { temperature: 0, humidity: 50, rainfall: 0, windSpeed: 5 };
      const hotWeather = { temperature: 35, humidity: 50, rainfall: 0, windSpeed: 5 };
      
      const normalMultiplier = deliveryService.calculateWeatherMultiplier(normalWeather);
      const coldMultiplier = deliveryService.calculateWeatherMultiplier(coldWeather);
      const hotMultiplier = deliveryService.calculateWeatherMultiplier(hotWeather);
      
      expect(coldMultiplier).toBeGreaterThan(normalMultiplier);
      expect(hotMultiplier).toBeGreaterThan(normalMultiplier);
    });
    
    test('should increase multiplier for rainfall', () => {
      const dryWeather = { temperature: 20, humidity: 50, rainfall: 0, windSpeed: 5 };
      const rainyWeather = { temperature: 20, humidity: 50, rainfall: 3, windSpeed: 5 };
      
      const dryMultiplier = deliveryService.calculateWeatherMultiplier(dryWeather);
      const rainyMultiplier = deliveryService.calculateWeatherMultiplier(rainyWeather);
      
      expect(rainyMultiplier).toBeGreaterThan(dryMultiplier);
    });
    
    test('should cap multiplier at maximum value', () => {
      const extremeWeather = { 
        temperature: -10, 
        humidity: 90, 
        rainfall: 10, 
        windSpeed: 25 
      };
      
      const multiplier = deliveryService.calculateWeatherMultiplier(extremeWeather);
      expect(multiplier).toBeLessThanOrEqual(3.0);
    });
  });
  
  describe('selectDeliveryType', () => {
    test('should return valid delivery type', () => {
      const validTypes = ['food', 'grocery', 'pharmacy', 'retail', 'electronics'];
      const type = deliveryService.selectDeliveryType(mockWeather, 12);
      
      expect(validTypes).toContain(type);
    });
    
    test('should favor food during meal times', () => {
      const lunchTypes = [];
      const lateNightTypes = [];
      
      // Generate multiple samples to test probability
      for (let i = 0; i < 100; i++) {
        lunchTypes.push(deliveryService.selectDeliveryType(mockWeather, 12));
        lateNightTypes.push(deliveryService.selectDeliveryType(mockWeather, 3));
      }
      
      const lunchFoodCount = lunchTypes.filter(type => type === 'food').length;
      const lateNightFoodCount = lateNightTypes.filter(type => type === 'food').length;
      
      expect(lunchFoodCount).toBeGreaterThan(lateNightFoodCount);
    });
  });
  
  describe('generateOrderValue', () => {
    test('should generate reasonable order values', () => {
      const types = ['food', 'grocery', 'pharmacy', 'retail', 'electronics'];
      
      types.forEach(type => {
        const value = deliveryService.generateOrderValue(type, mockWeather);
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1000); // Reasonable upper bound
      });
    });
    
    test('should generate higher values for electronics', () => {
      const foodValue = deliveryService.generateOrderValue('food', mockWeather);
      const electronicsValue = deliveryService.generateOrderValue('electronics', mockWeather);
      
      // Electronics should generally be more expensive (run multiple times due to randomness)
      let electronicsHigherCount = 0;
      for (let i = 0; i < 20; i++) {
        const food = deliveryService.generateOrderValue('food', mockWeather);
        const electronics = deliveryService.generateOrderValue('electronics', mockWeather);
        if (electronics > food) electronicsHigherCount++;
      }
      
      expect(electronicsHigherCount).toBeGreaterThan(15); // 75% of the time
    });
  });
  
  describe('estimateDeliveryTime', () => {
    test('should return reasonable delivery times', () => {
      const time = deliveryService.estimateDeliveryTime(mockWeather);
      
      expect(typeof time).toBe('number');
      expect(time).toBeGreaterThan(10); // At least 10 minutes
      expect(time).toBeLessThan(120); // Less than 2 hours
    });
    
    test('should increase delivery time in bad weather', () => {
      const goodWeather = { temperature: 20, humidity: 50, rainfall: 0, windSpeed: 5 };
      const badWeather = { temperature: 20, humidity: 50, rainfall: 5, windSpeed: 20 };
      
      const goodTime = deliveryService.estimateDeliveryTime(goodWeather);
      const badTime = deliveryService.estimateDeliveryTime(badWeather);
      
      expect(badTime).toBeGreaterThan(goodTime);
    });
  });
  
  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = deliveryService.generateId();
      const id2 = deliveryService.generateId();
      
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^DEL_/);
      expect(id2).toMatch(/^DEL_/);
    });
  });
});