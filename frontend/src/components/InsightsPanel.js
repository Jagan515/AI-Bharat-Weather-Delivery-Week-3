import React from 'react';

const InsightsPanel = ({ correlations }) => {
  if (!correlations || !correlations.insights) {
    return (
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const { insights } = correlations;

  const getInsightIcon = (type) => {
    const icons = {
      positive: '📈',
      negative: '📉',
      economic: '💰',
      temporal: '⏰',
      weather: '🌦️'
    };
    return icons[type] || '💡';
  };

  const getInsightColor = (strength) => {
    switch (strength) {
      case 'strong':
        return 'border-l-green-500 bg-green-50';
      case 'moderate':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'weak':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getStrengthBadge = (strength) => {
    const colors = {
      strong: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      weak: 'bg-orange-100 text-orange-800',
      'very weak': 'bg-gray-100 text-gray-800',
      observational: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[strength] || colors.observational}`}>
        {strength}
      </span>
    );
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Key Insights</h3>
        <div className="text-2xl">💡</div>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>Collecting data to generate insights...</p>
            <p className="text-sm mt-1">Check back in a few hours for correlations.</p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className={`border-l-4 p-3 rounded-r-lg ${getInsightColor(insight.strength)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-lg flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {insight.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-600 capitalize">
                      {insight.factor} factor
                    </div>
                    {getStrengthBadge(insight.strength)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {correlations.dataPoints && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Weather data points:</span>
              <span className="font-medium">{correlations.dataPoints.weather}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery data points:</span>
              <span className="font-medium">{correlations.dataPoints.deliveries}</span>
            </div>
            <div className="flex justify-between">
              <span>Analysis period:</span>
              <span className="font-medium">{correlations.dataPoints.hours} hours</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;