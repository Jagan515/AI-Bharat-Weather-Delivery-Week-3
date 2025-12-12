#!/bin/bash

# Weather-Delivery Dashboard Test Runner
# Runs all tests: unit tests, integration tests, and system tests

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test results
BACKEND_TESTS_PASSED=false
FRONTEND_TESTS_PASSED=false
SYSTEM_TESTS_PASSED=false

echo -e "${PURPLE}🧪 Weather-Delivery Dashboard Test Suite${NC}"
echo "========================================"

# Function to check if services are running
check_services() {
    echo -e "${YELLOW}🔍 Checking if services are running...${NC}"
    
    if curl -s http://localhost:5011/api/health > /dev/null 2>&1 && \
       curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Services are running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Services not running. Starting them for system tests...${NC}"
        return 1
    fi
}

# Function to run backend tests
run_backend_tests() {
    echo -e "\n${BLUE}🔧 Running Backend Unit Tests${NC}"
    echo "============================="
    
    cd backend
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Run tests
    echo -e "${YELLOW}🧪 Running Jest tests...${NC}"
    if npm test; then
        echo -e "${GREEN}✅ Backend tests passed!${NC}"
        BACKEND_TESTS_PASSED=true
    else
        echo -e "${RED}❌ Backend tests failed!${NC}"
        BACKEND_TESTS_PASSED=false
    fi
    
    cd ..
}

# Function to run frontend tests
run_frontend_tests() {
    echo -e "\n${BLUE}🎨 Running Frontend Unit Tests${NC}"
    echo "=============================="
    
    cd frontend
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Run tests
    echo -e "${YELLOW}🧪 Running React tests...${NC}"
    if CI=true npm test -- --coverage --watchAll=false; then
        echo -e "${GREEN}✅ Frontend tests passed!${NC}"
        FRONTEND_TESTS_PASSED=true
    else
        echo -e "${RED}❌ Frontend tests failed!${NC}"
        FRONTEND_TESTS_PASSED=false
    fi
    
    cd ..
}

# Function to run system tests
run_system_tests() {
    echo -e "\n${BLUE}🌐 Running System Integration Tests${NC}"
    echo "=================================="
    
    # Check if services are running
    if ! check_services; then
        echo -e "${YELLOW}🚀 Starting services for system tests...${NC}"
        
        # Start services in background
        ./start.sh > test-startup.log 2>&1 &
        START_PID=$!
        
        # Wait for services to be ready
        echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
        sleep 30
        
        # Check if services are now running
        if ! check_services; then
            echo -e "${RED}❌ Failed to start services for system tests${NC}"
            echo -e "${YELLOW}💡 Please start services manually with './start.sh' and run system tests separately${NC}"
            kill $START_PID 2>/dev/null
            return 1
        fi
        
        STARTED_SERVICES=true
    else
        STARTED_SERVICES=false
    fi
    
    # Run system tests
    echo -e "${YELLOW}🧪 Running system tests...${NC}"
    if ./test-system.sh; then
        echo -e "${GREEN}✅ System tests passed!${NC}"
        SYSTEM_TESTS_PASSED=true
    else
        echo -e "${RED}❌ System tests failed!${NC}"
        SYSTEM_TESTS_PASSED=false
    fi
    
    # Cleanup if we started the services
    if [ "$STARTED_SERVICES" = true ]; then
        echo -e "${YELLOW}🛑 Stopping test services...${NC}"
        kill $START_PID 2>/dev/null
        
        # Kill any remaining processes
        lsof -ti:5011 | xargs kill -9 2>/dev/null
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        
        sleep 2
        echo -e "${GREEN}✅ Test services stopped${NC}"
    fi
}

# Function to generate test report
generate_report() {
    echo -e "\n${PURPLE}📊 Test Results Summary${NC}"
    echo "======================="
    
    local total_passed=0
    local total_tests=3
    
    echo -e "${BLUE}Backend Unit Tests:${NC} $([ "$BACKEND_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
    [ "$BACKEND_TESTS_PASSED" = true ] && total_passed=$((total_passed + 1))
    
    echo -e "${BLUE}Frontend Unit Tests:${NC} $([ "$FRONTEND_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
    [ "$FRONTEND_TESTS_PASSED" = true ] && total_passed=$((total_passed + 1))
    
    echo -e "${BLUE}System Integration Tests:${NC} $([ "$SYSTEM_TESTS_PASSED" = true ] && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}")"
    [ "$SYSTEM_TESTS_PASSED" = true ] && total_passed=$((total_passed + 1))
    
    echo ""
    echo -e "${BLUE}Overall Result: ${total_passed}/${total_tests} test suites passed${NC}"
    
    if [ $total_passed -eq $total_tests ]; then
        echo -e "${GREEN}🎉 All tests passed! Your dashboard is working perfectly.${NC}"
        return 0
    else
        echo -e "${RED}⚠️  Some tests failed. Please review the output above.${NC}"
        return 1
    fi
}

# Main execution
echo -e "${YELLOW}Starting comprehensive test suite...${NC}"

# Parse command line arguments
RUN_BACKEND=true
RUN_FRONTEND=true
RUN_SYSTEM=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            RUN_FRONTEND=false
            RUN_SYSTEM=false
            shift
            ;;
        --frontend-only)
            RUN_BACKEND=false
            RUN_SYSTEM=false
            shift
            ;;
        --system-only)
            RUN_BACKEND=false
            RUN_FRONTEND=false
            shift
            ;;
        --no-system)
            RUN_SYSTEM=false
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --backend-only   Run only backend unit tests"
            echo "  --frontend-only  Run only frontend unit tests"
            echo "  --system-only    Run only system integration tests"
            echo "  --no-system      Skip system tests (run only unit tests)"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Run tests based on options
[ "$RUN_BACKEND" = true ] && run_backend_tests
[ "$RUN_FRONTEND" = true ] && run_frontend_tests
[ "$RUN_SYSTEM" = true ] && run_system_tests

# Generate final report
generate_report
exit_code=$?

# Cleanup
echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
rm -f test-startup.log

echo -e "${GREEN}🏁 Test suite completed!${NC}"
exit $exit_code