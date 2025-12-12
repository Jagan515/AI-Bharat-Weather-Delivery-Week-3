import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrendChart = ({ weatherHistory, deliveryHistory }) => {
  const [timeRange, setTimeRange] = useState('24h');

  if (!weatherHistory || !deliveryHistory) {
    return (
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Trends Over Time</h3>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Group deliveries by hour
  const deliveriesByHour = deliveryHistory.reduce((acc, delivery) => {
    const hour = new Date(delivery.timestamp).toISOString().slice(0, 13);
    if (!acc[hour]) {
      acc[hour] = { count: 0, totalValue: 0 };
    }
    acc[hour].count++;
    acc[hour].totalValue += delivery.orderValue;
    return acc;
  }, {});

  // Filter data based on time range
  const hoursToShow = timeRange === '24h' ? 24 : 48;
  const cutoffTime = new Date(Date.now() - hoursToShow * 60 * 60 * 1000);

  const filteredWeather = weatherHistory
    .filter(w => new Date(w.timestamp) > cutoffTime)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Create labels and data arrays
  const labels = filteredWeather.map(w => {
    const date = new Date(w.timestamp);
    return timeRange === '24h' 
      ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
  });

  const temperatureData = filteredWeather.map(w => w.temperature);
  const rainfallData = filteredWeather.map(w => w.rainfall || 0);
  
  const deliveryData = filteredWeather.map(w => {
    const hour = new Date(w.timestamp).toISOString().slice(0, 13);
    return deliveriesByHour[hour]?.count || 0;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperatureData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        yAxisID: 'y',
        tension: 0.4,
      },
      {
        label: 'Rainfall (mm)',
        data: rainfallData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y1',
        tension: 0.4,
      },
      {
        label: 'Deliveries',
        data: deliveryData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y2',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return `Time: ${context[0].label}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C)'
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Rainfall (mm)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: 'linear',
        display: false,
        position: 'right',
      },
    },
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Trends Over Time</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('24h')}
            className={`px-3 py-1 text-sm rounded ${
              timeRange === '24h'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            24h
          </button>
          <button
            onClick={() => setTimeRange('48h')}
            className={`px-3 py-1 text-sm rounded ${
              timeRange === '48h'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            48h
          </button>
        </div>
      </div>
      
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        <p>
          This chart shows the relationship between weather conditions and delivery volume over time.
          Look for patterns where delivery spikes correlate with weather changes.
        </p>
      </div>
    </div>
  );
};

export default TrendChart;