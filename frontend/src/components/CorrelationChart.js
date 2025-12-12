import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CorrelationChart = ({ correlations }) => {
  if (!correlations || !correlations.correlations) {
    return (
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather-Delivery Correlations</h3>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { correlations: corr } = correlations;

  const getCorrelationColor = (coefficient) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.7) return 'rgba(34, 197, 94, 0.8)'; // Strong - Green
    if (abs >= 0.5) return 'rgba(234, 179, 8, 0.8)'; // Moderate - Yellow
    if (abs >= 0.3) return 'rgba(249, 115, 22, 0.8)'; // Weak - Orange
    return 'rgba(156, 163, 175, 0.8)'; // Very weak - Gray
  };

  const getBorderColor = (coefficient) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.7) return 'rgba(34, 197, 94, 1)';
    if (abs >= 0.5) return 'rgba(234, 179, 8, 1)';
    if (abs >= 0.3) return 'rgba(249, 115, 22, 1)';
    return 'rgba(156, 163, 175, 1)';
  };

  const data = {
    labels: ['Temperature', 'Rainfall', 'Humidity', 'Wind Speed'],
    datasets: [
      {
        label: 'Correlation Coefficient',
        data: [
          corr.temperature?.coefficient || 0,
          corr.rainfall?.coefficient || 0,
          corr.humidity?.coefficient || 0,
          corr.windSpeed?.coefficient || 0,
        ],
        backgroundColor: [
          getCorrelationColor(corr.temperature?.coefficient || 0),
          getCorrelationColor(corr.rainfall?.coefficient || 0),
          getCorrelationColor(corr.humidity?.coefficient || 0),
          getCorrelationColor(corr.windSpeed?.coefficient || 0),
        ],
        borderColor: [
          getBorderColor(corr.temperature?.coefficient || 0),
          getBorderColor(corr.rainfall?.coefficient || 0),
          getBorderColor(corr.humidity?.coefficient || 0),
          getBorderColor(corr.windSpeed?.coefficient || 0),
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const strength = Math.abs(value) >= 0.7 ? 'Strong' :
                           Math.abs(value) >= 0.5 ? 'Moderate' :
                           Math.abs(value) >= 0.3 ? 'Weak' : 'Very Weak';
            return `Correlation: ${value.toFixed(3)} (${strength})`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: -1,
        max: 1,
        ticks: {
          callback: function(value) {
            return value.toFixed(1);
          }
        },
        title: {
          display: true,
          text: 'Correlation Coefficient'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Weather Factors'
        }
      }
    },
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Weather-Delivery Correlations</h3>
        <div className="text-sm text-gray-500">
          {correlations.dataPoints?.hours || 0} hours analyzed
        </div>
      </div>
      
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Strong (≥0.7)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Moderate (≥0.5)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>Weak (≥0.3)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span>Very Weak (&lt;0.3)</span>
        </div>
      </div>
    </div>
  );
};

export default CorrelationChart;