import React from 'react';

const WeatherCard = ({ weather }) => {
  if (!weather) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (description, temperature) => {
    if (description.includes('rain')) return '🌧️';
    if (description.includes('cloud')) return '☁️';
    if (description.includes('clear')) return temperature > 25 ? '☀️' : '🌤️';
    if (description.includes('snow')) return '❄️';
    return '🌤️';
  };

  const getTemperatureColor = (temp) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 10) return 'text-blue-500';
    if (temp < 20) return 'text-green-500';
    if (temp < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Current Weather</h3>
        <div className="weather-icon">
          {getWeatherIcon(weather.description, weather.temperature)}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Temperature</span>
          <span className={`text-2xl font-bold ${getTemperatureColor(weather.temperature)}`}>
            {weather.temperature}°C
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Humidity</span>
          <span className="font-medium">{weather.humidity}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Rainfall</span>
          <span className="font-medium">
            {weather.rainfall > 0 ? `${weather.rainfall}mm` : 'None'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Wind Speed</span>
          <span className="font-medium">{weather.windSpeed?.toFixed(1)} m/s</span>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 capitalize">
            {weather.description}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            📍 {weather.location?.city || 'San Francisco'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;