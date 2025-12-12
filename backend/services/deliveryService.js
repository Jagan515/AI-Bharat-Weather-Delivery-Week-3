class DeliveryService {
  constructor() {
    this.deliveryTypes = ['food', 'grocery', 'pharmacy', 'retail', 'electronics'];
    this.neighborhoods = [
      { name: 'Downtown', lat: 37.7749, lon: -122.4194, population: 15000 },
      { name: 'Mission', lat: 37.7599, lon: -122.4148, population: 25000 },
      { name: 'Castro', lat: 37.7609, lon: -122.4350, population: 12000 },
      { name: 'Chinatown', lat: 37.7941, lon: -122.4078, population: 18000 },
      { name: 'Marina', lat: 37.8021, lon: -122.4364, population: 20000 },
      { name: 'SOMA', lat: 37.7749, lon: -122.4094, population: 22000 }
    ];
  }

  generateDeliveries(weatherData) {
    const deliveries = [];
    const currentTime = new Date();
    const hour = currentTime.getHours();
    
    // Base delivery rate influenced by time of day
    let baseRate = this.getBaseDeliveryRate(hour);
    
    // Weather influence factors
    const weatherMultiplier = this.calculateWeatherMultiplier(weatherData);
    
    // Generate deliveries for each neighborhood
    this.neighborhoods.forEach(neighborhood => {
      const neighborhoodRate = baseRate * (neighborhood.population / 15000) * weatherMultiplier;
      const deliveryCount = Math.max(0, Math.round(neighborhoodRate + (Math.random() - 0.5) * 5));
      
      for (let i = 0; i < deliveryCount; i++) {
        deliveries.push(this.createDelivery(neighborhood, weatherData, currentTime));
      }
    });
    
    return deliveries;
  }

  getBaseDeliveryRate(hour) {
    // Realistic delivery patterns throughout the day
    const patterns = {
      0: 2, 1: 1, 2: 1, 3: 1, 4: 1, 5: 2,
      6: 4, 7: 8, 8: 12, 9: 10, 10: 8, 11: 15,
      12: 25, 13: 20, 14: 15, 15: 12, 16: 10,
      17: 18, 18: 30, 19: 35, 20: 25, 21: 20,
      22: 15, 23: 8
    };
    return patterns[hour] || 5;
  }

  calculateWeatherMultiplier(weather) {
    let multiplier = 1.0;
    
    // Temperature effects
    if (weather.temperature < 5) {
      multiplier *= 1.4; // Very cold increases orders
    } else if (weather.temperature < 15) {
      multiplier *= 1.2; // Cold increases orders
    } else if (weather.temperature > 30) {
      multiplier *= 1.3; // Very hot increases orders
    }
    
    // Rainfall effects
    if (weather.rainfall > 0) {
      multiplier *= 1.5 + (weather.rainfall * 0.1); // Rain significantly increases orders
    }
    
    // Humidity effects (subtle)
    if (weather.humidity > 80) {
      multiplier *= 1.1; // High humidity slightly increases orders
    }
    
    // Wind effects
    if (weather.windSpeed > 20) {
      multiplier *= 1.2; // Strong wind increases orders
    }
    
    return Math.min(multiplier, 3.0); // Cap at 3x increase
  }

  createDelivery(neighborhood, weather, timestamp) {
    const deliveryType = this.selectDeliveryType(weather, timestamp.getHours());
    
    // Add some geographic spread within neighborhood
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lonOffset = (Math.random() - 0.5) * 0.01;
    
    return {
      id: this.generateId(),
      timestamp: timestamp.toISOString(),
      type: deliveryType,
      location: {
        lat: neighborhood.lat + latOffset,
        lon: neighborhood.lon + lonOffset,
        neighborhood: neighborhood.name
      },
      orderValue: this.generateOrderValue(deliveryType, weather),
      deliveryTime: this.estimateDeliveryTime(weather),
      weatherConditions: {
        temperature: weather.temperature,
        rainfall: weather.rainfall,
        humidity: weather.humidity
      }
    };
  }

  selectDeliveryType(weather, hour) {
    let weights = {
      food: 0.4,
      grocery: 0.25,
      pharmacy: 0.1,
      retail: 0.15,
      electronics: 0.1
    };
    
    // Adjust weights based on weather and time
    if (weather.rainfall > 0) {
      weights.food += 0.2;
      weights.grocery += 0.15;
      weights.retail -= 0.1;
    }
    
    if (weather.temperature < 10) {
      weights.food += 0.15;
      weights.pharmacy += 0.05;
    }
    
    if (hour >= 11 && hour <= 14) {
      weights.food += 0.2; // Lunch time
    }
    
    if (hour >= 17 && hour <= 21) {
      weights.food += 0.25; // Dinner time
    }
    
    // Normalize weights
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    Object.keys(weights).forEach(key => weights[key] /= total);
    
    // Select based on weighted random
    const random = Math.random();
    let cumulative = 0;
    
    for (const [type, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return type;
      }
    }
    
    return 'food'; // fallback
  }

  generateOrderValue(type, weather) {
    const baseValues = {
      food: 35,
      grocery: 65,
      pharmacy: 25,
      retail: 85,
      electronics: 150
    };
    
    let value = baseValues[type] + (Math.random() - 0.5) * baseValues[type] * 0.4;
    
    // Weather adjustments
    if (weather.rainfall > 0) {
      value *= 1.1; // People order more when it's raining
    }
    
    if (weather.temperature < 5 || weather.temperature > 30) {
      value *= 1.05; // Extreme temperatures increase order size
    }
    
    return Math.round(value * 100) / 100;
  }

  estimateDeliveryTime(weather) {
    let baseTime = 30; // minutes
    
    if (weather.rainfall > 0) {
      baseTime += weather.rainfall * 5; // Rain slows delivery
    }
    
    if (weather.windSpeed > 15) {
      baseTime += 5; // Strong wind slows delivery
    }
    
    return Math.round(baseTime + (Math.random() - 0.5) * 10);
  }

  generateId() {
    return 'DEL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new DeliveryService();