const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const weatherService = require('./services/weatherService');
const deliveryService = require('./services/deliveryService');
const correlationService = require('./services/correlationService');

const app = express();
const PORT = process.env.PORT || 5011;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store (in production, use a proper database)
let weatherData = [];
let deliveryData = [];
let correlationData = {};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/weather/current', async (req, res) => {
  try {
    const currentWeather = await weatherService.getCurrentWeather();
    res.json(currentWeather);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.get('/api/weather/history', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const recentWeather = weatherData.slice(-hours);
  res.json(recentWeather);
});

app.get('/api/deliveries/current', (req, res) => {
  const currentHour = new Date().getHours();
  const currentDeliveries = deliveryData.filter(d => 
    new Date(d.timestamp).getHours() === currentHour
  );
  res.json(currentDeliveries);
});

app.get('/api/deliveries/history', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recentDeliveries = deliveryData.filter(d => 
    new Date(d.timestamp) > cutoffTime
  );
  res.json(recentDeliveries);
});

app.get('/api/correlations', (req, res) => {
  res.json(correlationData);
});

app.get('/api/dashboard/summary', (req, res) => {
  const summary = {
    totalDeliveries: deliveryData.length,
    averageTemperature: weatherData.length > 0 
      ? weatherData.reduce((sum, w) => sum + w.temperature, 0) / weatherData.length 
      : 0,
    correlations: correlationData,
    lastUpdated: new Date().toISOString()
  };
  res.json(summary);
});

// Data collection and correlation calculation
async function collectAndAnalyzeData() {
  try {
    // Collect current weather
    const weather = await weatherService.getCurrentWeather();
    weatherData.push({
      ...weather,
      timestamp: new Date().toISOString()
    });

    // Generate delivery data based on weather
    const deliveries = deliveryService.generateDeliveries(weather);
    deliveryData.push(...deliveries);

    // Keep only last 7 days of data
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    weatherData = weatherData.filter(w => new Date(w.timestamp) > weekAgo);
    deliveryData = deliveryData.filter(d => new Date(d.timestamp) > weekAgo);

    // Calculate correlations
    correlationData = correlationService.calculateCorrelations(weatherData, deliveryData);

    console.log(`Data collected: ${weatherData.length} weather points, ${deliveryData.length} deliveries`);
  } catch (error) {
    console.error('Error collecting data:', error);
  }
}

// Schedule data collection every hour
cron.schedule('0 * * * *', collectAndAnalyzeData);

// Initial data collection
collectAndAnalyzeData();

app.listen(PORT, () => {
  console.log(`Weather-Delivery API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});