import React from 'react';

const DeliveryMetrics = ({ currentDeliveries, summary }) => {
  if (!currentDeliveries || !summary) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentHourDeliveries = currentDeliveries.length;
  const totalDeliveries = summary.totalDeliveries || 0;
  
  // Calculate delivery types distribution
  const deliveryTypes = currentDeliveries.reduce((acc, delivery) => {
    acc[delivery.type] = (acc[delivery.type] || 0) + 1;
    return acc;
  }, {});

  const topDeliveryType = Object.entries(deliveryTypes)
    .sort(([,a], [,b]) => b - a)[0];

  // Calculate average order value
  const avgOrderValue = currentDeliveries.length > 0
    ? currentDeliveries.reduce((sum, d) => sum + d.orderValue, 0) / currentDeliveries.length
    : 0;

  const getDeliveryTypeIcon = (type) => {
    const icons = {
      food: '🍕',
      grocery: '🛒',
      pharmacy: '💊',
      retail: '🛍️',
      electronics: '📱'
    };
    return icons[type] || '📦';
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Delivery Metrics</h3>
        <div className="text-2xl">📦</div>
      </div>
      
      <div className="space-y-4">
        <div className="metric-card">
          <div className="metric-value">{currentHourDeliveries}</div>
          <div className="metric-label">Current Hour Orders</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              ${avgOrderValue.toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">Avg Order Value</div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-xl font-bold text-purple-600">
              {totalDeliveries}
            </div>
            <div className="text-xs text-gray-600">Total Orders</div>
          </div>
        </div>
        
        {topDeliveryType && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Top Category</span>
              <div className="flex items-center space-x-2">
                <span>{getDeliveryTypeIcon(topDeliveryType[0])}</span>
                <span className="font-medium capitalize">{topDeliveryType[0]}</span>
                <span className="text-sm text-gray-500">({topDeliveryType[1]})</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Delivery Types</div>
          {Object.entries(deliveryTypes).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span>{getDeliveryTypeIcon(type)}</span>
                <span className="capitalize">{type}</span>
              </div>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryMetrics;