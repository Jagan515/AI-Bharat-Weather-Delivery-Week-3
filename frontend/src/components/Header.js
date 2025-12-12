import React from 'react';

const Header = ({ lastUpdated, onRefresh, loading }) => {
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🌦️📦</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Weather-Delivery Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Analyzing the correlation between weather patterns and delivery demand
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Last updated</div>
              <div className="text-sm font-medium text-gray-700">
                {formatLastUpdated(lastUpdated)}
              </div>
            </div>
            
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                }
              `}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>🔄</span>
                  <span>Refresh</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;