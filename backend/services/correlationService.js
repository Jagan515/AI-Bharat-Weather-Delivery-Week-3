class CorrelationService {
  calculateCorrelations(weatherData, deliveryData) {
    if (weatherData.length < 2 || deliveryData.length < 2) {
      return { message: 'Insufficient data for correlation analysis' };
    }

    // Group deliveries by hour to match weather data
    const hourlyDeliveries = this.groupDeliveriesByHour(deliveryData);
    const hourlyWeather = this.groupWeatherByHour(weatherData);

    // Calculate correlations
    const correlations = {
      temperature: this.calculateCorrelation(hourlyWeather, hourlyDeliveries, 'temperature', 'count'),
      rainfall: this.calculateCorrelation(hourlyWeather, hourlyDeliveries, 'rainfall', 'count'),
      humidity: this.calculateCorrelation(hourlyWeather, hourlyDeliveries, 'humidity', 'count'),
      windSpeed: this.calculateCorrelation(hourlyWeather, hourlyDeliveries, 'windSpeed', 'count'),
      orderValue: {
        temperature: this.calculateCorrelation(hourlyWeather, hourlyDeliveries, 'temperature', 'avgValue'),
        rainfall: this.calculateCorrelation(hourlyWeather, hourlyDeliveries, 'rainfall', 'avgValue'),
        humidity: this.calculateCorrelation(hourlyWeather, hourlyDeliveries, 'humidity', 'avgValue')
      }
    };

    // Calculate insights
    const insights = this.generateInsights(correlations, hourlyWeather, hourlyDeliveries);

    return {
      correlations,
      insights,
      dataPoints: {
        weather: weatherData.length,
        deliveries: deliveryData.length,
        hours: Object.keys(hourlyWeather).length
      },
      lastCalculated: new Date().toISOString()
    };
  }

  groupDeliveriesByHour(deliveryData) {
    const grouped = {};
    
    deliveryData.forEach(delivery => {
      const hour = new Date(delivery.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH
      
      if (!grouped[hour]) {
        grouped[hour] = {
          count: 0,
          totalValue: 0,
          types: {},
          neighborhoods: {}
        };
      }
      
      grouped[hour].count++;
      grouped[hour].totalValue += delivery.orderValue;
      
      // Track delivery types
      grouped[hour].types[delivery.type] = (grouped[hour].types[delivery.type] || 0) + 1;
      
      // Track neighborhoods
      const neighborhood = delivery.location.neighborhood;
      grouped[hour].neighborhoods[neighborhood] = (grouped[hour].neighborhoods[neighborhood] || 0) + 1;
    });
    
    // Calculate averages
    Object.keys(grouped).forEach(hour => {
      grouped[hour].avgValue = grouped[hour].totalValue / grouped[hour].count;
    });
    
    return grouped;
  }

  groupWeatherByHour(weatherData) {
    const grouped = {};
    
    weatherData.forEach(weather => {
      const hour = new Date(weather.timestamp).toISOString().slice(0, 13);
      grouped[hour] = weather;
    });
    
    return grouped;
  }

  calculateCorrelation(weatherData, deliveryData, weatherField, deliveryField) {
    const pairs = [];
    
    Object.keys(weatherData).forEach(hour => {
      if (deliveryData[hour]) {
        pairs.push({
          x: weatherData[hour][weatherField],
          y: deliveryData[hour][deliveryField]
        });
      }
    });
    
    if (pairs.length < 2) {
      return { coefficient: 0, strength: 'insufficient data', pairs: 0 };
    }
    
    const n = pairs.length;
    const sumX = pairs.reduce((sum, p) => sum + p.x, 0);
    const sumY = pairs.reduce((sum, p) => sum + p.y, 0);
    const sumXY = pairs.reduce((sum, p) => sum + (p.x * p.y), 0);
    const sumX2 = pairs.reduce((sum, p) => sum + (p.x * p.x), 0);
    const sumY2 = pairs.reduce((sum, p) => sum + (p.y * p.y), 0);
    
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
    
    const coefficient = denominator === 0 ? 0 : numerator / denominator;
    
    return {
      coefficient: Math.round(coefficient * 1000) / 1000,
      strength: this.interpretCorrelation(coefficient),
      pairs: n,
      significance: this.calculateSignificance(coefficient, n)
    };
  }

  interpretCorrelation(coefficient) {
    const abs = Math.abs(coefficient);
    if (abs >= 0.7) return 'strong';
    if (abs >= 0.5) return 'moderate';
    if (abs >= 0.3) return 'weak';
    return 'very weak';
  }

  calculateSignificance(coefficient, n) {
    if (n < 3) return 'insufficient data';
    
    // Simple t-test approximation
    const t = coefficient * Math.sqrt((n - 2) / (1 - coefficient * coefficient));
    const absT = Math.abs(t);
    
    if (absT > 2.576) return 'highly significant';
    if (absT > 1.96) return 'significant';
    if (absT > 1.645) return 'marginally significant';
    return 'not significant';
  }

  generateInsights(correlations, weatherData, deliveryData) {
    const insights = [];
    
    // Temperature insights
    if (correlations.temperature.coefficient > 0.3) {
      insights.push({
        type: 'positive',
        factor: 'temperature',
        message: `Higher temperatures are associated with increased delivery orders (r=${correlations.temperature.coefficient})`,
        strength: correlations.temperature.strength
      });
    } else if (correlations.temperature.coefficient < -0.3) {
      insights.push({
        type: 'negative',
        factor: 'temperature',
        message: `Lower temperatures are associated with increased delivery orders (r=${correlations.temperature.coefficient})`,
        strength: correlations.temperature.strength
      });
    }
    
    // Rainfall insights
    if (correlations.rainfall.coefficient > 0.3) {
      insights.push({
        type: 'positive',
        factor: 'rainfall',
        message: `Rainy weather significantly increases delivery demand (r=${correlations.rainfall.coefficient})`,
        strength: correlations.rainfall.strength
      });
    }
    
    // Humidity insights
    if (correlations.humidity.coefficient > 0.3) {
      insights.push({
        type: 'positive',
        factor: 'humidity',
        message: `Higher humidity levels correlate with more delivery orders (r=${correlations.humidity.coefficient})`,
        strength: correlations.humidity.strength
      });
    }
    
    // Order value insights
    if (correlations.orderValue.temperature.coefficient > 0.3) {
      insights.push({
        type: 'economic',
        factor: 'temperature',
        message: `Extreme temperatures lead to higher order values (r=${correlations.orderValue.temperature.coefficient})`,
        strength: correlations.orderValue.temperature.strength
      });
    }
    
    // Peak delivery analysis
    const hours = Object.keys(deliveryData);
    if (hours.length > 0) {
      const peakHour = hours.reduce((peak, hour) => 
        deliveryData[hour].count > deliveryData[peak].count ? hour : peak
      );
      
      const peakTime = new Date(peakHour + ':00:00Z').getHours();
      insights.push({
        type: 'temporal',
        factor: 'time',
        message: `Peak delivery hour is ${peakTime}:00 with ${deliveryData[peakHour].count} orders`,
        strength: 'observational'
      });
    }
    
    return insights;
  }
}

module.exports = new CorrelationService();