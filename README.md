# Weather-Delivery Correlation Dashboard

An interactive dashboard that analyzes the relationship between weather patterns and online delivery demand, revealing how temperature, rainfall, and humidity influence ordering behavior.

## 🎯 Project Overview

This project combines weather data with delivery demand patterns to uncover insights about consumer behavior during different weather conditions. The dashboard provides real-time visualizations, geographic mapping, and correlation analysis.

## 🏗️ Architecture

- **Backend**: Node.js/Express API with data simulation and weather integration
- **Frontend**: React dashboard with interactive charts and maps
- **Data**: Weather API integration + simulated delivery events
- **Visualization**: Chart.js, Leaflet maps, correlation matrices

## 🚀 Features

- Real-time weather data integration
- Simulated delivery demand patterns
- Interactive correlation analysis
- Geographic heat maps
- Trend visualization and insights
- Responsive dashboard design

## 📊 Key Insights Explored

- Temperature vs. order volume correlation
- Rainfall impact on delivery patterns
- Humidity effects on food/grocery orders
- Geographic distribution of weather-influenced demand
- Seasonal and hourly trends

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express
- Weather API integration
- Data simulation engine
- CORS & middleware

**Frontend:**
- React 18
- Chart.js for visualizations
- Leaflet for mapping
- Tailwind CSS for styling

## 📁 Project Structure

```
weather-delivery-dashboard/
├── backend/                 # API server and data processing
├── frontend/               # React dashboard
├── .kiro/                  # AI development documentation
├── docs/                   # Blog post and documentation
└── README.md
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# One-command setup and start
chmod +x setup.sh
./setup.sh
./start.sh
```

### Option 2: Manual Setup
1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Start Both Services**
   ```bash
   npm run dev
   ```

### Option 3: Individual Setup
1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Access Dashboard
- Frontend: http://localhost:3000
- API: http://localhost:5011
- Health Check: http://localhost:5011/api/health

## 📈 Development Process

This project showcases AI-accelerated development using Kiro. See `.kiro/` folder for detailed development documentation and learnings.

## 🔧 Additional Scripts

- `setup.sh` - Automated project setup with dependency installation
- `start.sh` - Production-ready startup with health checks
- `run-tests.sh` - Comprehensive test suite runner
- `test-system.sh` - System integration tests

## 🌟 Results & Insights

The dashboard reveals fascinating patterns between weather and delivery behavior, documented in our comprehensive blog post in the `docs/` folder.