import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5011/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API endpoints
export const fetchCurrentWeather = async () => {
  const response = await api.get('/weather/current');
  return response.data;
};

export const fetchWeatherHistory = async (hours = 24) => {
  const response = await api.get(`/weather/history?hours=${hours}`);
  return response.data;
};

export const fetchCurrentDeliveries = async () => {
  const response = await api.get('/deliveries/current');
  return response.data;
};

export const fetchDeliveryHistory = async (hours = 24) => {
  const response = await api.get(`/deliveries/history?hours=${hours}`);
  return response.data;
};

export const fetchCorrelations = async () => {
  const response = await api.get('/correlations');
  return response.data;
};

export const fetchDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

// Combined dashboard data fetch
export const fetchDashboardData = async () => {
  try {
    const [
      currentWeather,
      weatherHistory,
      currentDeliveries,
      deliveryHistory,
      correlations,
      summary
    ] = await Promise.all([
      fetchCurrentWeather(),
      fetchWeatherHistory(48), // 48 hours of history
      fetchCurrentDeliveries(),
      fetchDeliveryHistory(48),
      fetchCorrelations(),
      fetchDashboardSummary()
    ]);

    return {
      currentWeather,
      weatherHistory,
      currentDeliveries,
      deliveryHistory,
      correlations,
      summary,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Health check
export const checkApiHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;