#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}Waiting for $service_name to start...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        printf "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start within 60 seconds${NC}"
    return 1
}

# Function to run health checks
run_health_checks() {
    echo -e "\n${BLUE}🔍 Running health checks...${NC}"
    
    # Check backend health
    echo -e "${YELLOW}Checking backend health...${NC}"
    backend_health=$(curl -s http://localhost:5000/api/health 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
        echo "   Response: $backend_health"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        return 1
    fi
    
    # Check weather API
    echo -e "${YELLOW}Checking weather API...${NC}"
    weather_response=$(curl -s http://localhost:5000/api/weather/current 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Weather API working${NC}"
    else
        echo -e "${RED}❌ Weather API failed${NC}"
        return 1
    fi
    
    # Check deliveries API
    echo -e "${YELLOW}Checking deliveries API...${NC}"
    deliveries_response=$(curl -s http://localhost:5000/api/deliveries/current 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Deliveries API working${NC}"
    else
        echo -e "${RED}❌ Deliveries API failed${NC}"
        return 1
    fi
    
    # Check correlations API
    echo -e "${YELLOW}Checking correlations API...${NC}"
    correlations_response=$(curl -s http://localhost:5000/api/correlations 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Correlations API working${NC}"
    else
        echo -e "${RED}❌ Correlations API failed${NC}"
        return 1
    fi
    
    # Check frontend
    echo -e "${YELLOW}Checking frontend...${NC}"
    frontend_response=$(curl -s http://localhost:3000 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
    else
        echo -e "${RED}❌ Frontend is not accessible${NC}"
        return 1
    fi
    
    echo -e "\n${GREEN}🎉 All health checks passed!${NC}"
    return 0
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    
    # Kill any remaining processes on our ports
    lsof -ti:5011 | xargs kill -9 2>/dev/null
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    
    echo -e "${GREEN}🏁 Cleanup complete${NC}"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}🌦️📦 Weather-Delivery Dashboard Startup${NC}"
echo "=================================="

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v) found${NC}"

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo -e "${RED}❌ Backend dependencies not installed. Run './setup.sh' first${NC}"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${RED}❌ Frontend dependencies not installed. Run './setup.sh' first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies verified${NC}"

# Check ports
echo -e "${YELLOW}Checking port availability...${NC}"

if ! check_port 5011; then
    echo -e "${RED}❌ Port 5011 is already in use${NC}"
    echo "Please stop the service using port 5011 or change the backend port"
    exit 1
fi

if ! check_port 3000; then
    echo -e "${RED}❌ Port 3000 is already in use${NC}"
    echo "Please stop the service using port 3000 or change the frontend port"
    exit 1
fi

echo -e "${GREEN}✅ Ports 3000 and 5011 are available${NC}"

# Start backend
echo -e "\n${BLUE}🔧 Starting backend server...${NC}"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
if ! wait_for_service "http://localhost:5011/api/health" "Backend"; then
    echo -e "${RED}❌ Backend failed to start. Check backend.log for details${NC}"
    cleanup
    exit 1
fi

# Start frontend
echo -e "\n${BLUE}🎨 Starting frontend server...${NC}"
cd frontend
BROWSER=none npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
if ! wait_for_service "http://localhost:3000" "Frontend"; then
    echo -e "${RED}❌ Frontend failed to start. Check frontend.log for details${NC}"
    cleanup
    exit 1
fi

# Run comprehensive health checks
if ! run_health_checks; then
    echo -e "${RED}❌ Health checks failed${NC}"
    cleanup
    exit 1
fi

# Success message
echo -e "\n${GREEN}🎉 Weather-Delivery Dashboard is running successfully!${NC}"
echo "=============================================="
echo -e "${BLUE}📊 Backend API:${NC} http://localhost:5011"
echo -e "${BLUE}🌐 Frontend Dashboard:${NC} http://localhost:3000"
echo -e "${BLUE}📋 API Health Check:${NC} http://localhost:5011/api/health"
echo ""
echo -e "${YELLOW}📊 Available API Endpoints:${NC}"
echo "  GET /api/health              - Health check"
echo "  GET /api/weather/current     - Current weather"
echo "  GET /api/weather/history     - Weather history"
echo "  GET /api/deliveries/current  - Current deliveries"
echo "  GET /api/deliveries/history  - Delivery history"
echo "  GET /api/correlations        - Weather-delivery correlations"
echo "  GET /api/dashboard/summary   - Dashboard summary"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Keep script running and show live status
while true; do
    sleep 30
    
    # Quick health check every 30 seconds
    if ! curl -s http://localhost:5011/api/health > /dev/null 2>&1; then
        echo -e "${RED}⚠️  Backend health check failed - service may be down${NC}"
    fi
    
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${RED}⚠️  Frontend health check failed - service may be down${NC}"
    fi
done
