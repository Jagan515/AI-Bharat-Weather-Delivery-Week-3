import React from 'react';
import WeatherCard from './WeatherCard';
import DeliveryMetrics from './DeliveryMetrics';
import CorrelationChart from './CorrelationChart';
import DeliveryMap from './DeliveryMap';
import TrendChart from './TrendChart';
import InsightsPanel from './InsightsPanel';

const Dashboard = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const {
    currentWeather,
    weatherHistory,
    currentDeliveries,
    deliveryHistory,
    correlations,
    summary
  } = data;

  return (
    <div className="space-y-6">
      {/* Top Row - Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WeatherCard weather={currentWeather} />
        <DeliveryMetrics 
          currentDeliveries={currentDeliveries}
          summary={summary}
        />
        <InsightsPanel correlations={correlations} />
      </div>

      {/* Middle Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CorrelationChart correlations={correlations} />
        <TrendChart 
          weatherHistory={weatherHistory}
          deliveryHistory={deliveryHistory}
        />
      </div>

      {/* Bottom Row - Map */}
      <div className="grid grid-cols-1 gap-6">
        <DeliveryMap 
          deliveries={currentDeliveries}
          weather={currentWeather}
        />
      </div>
    </div>
  );
};

export default Dashboard;