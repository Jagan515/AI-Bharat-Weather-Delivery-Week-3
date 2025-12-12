# Testing Guide

## Overview

The Weather-Delivery Dashboard includes comprehensive testing at multiple levels:

- **Unit Tests**: Test individual components and services
- **Integration Tests**: Test API endpoints and data flow
- **System Tests**: Test the entire application end-to-end

## Quick Start

### Run All Tests
```bash
./run-tests.sh
```

### Run Specific Test Types
```bash
# Unit tests only
./run-tests.sh --no-system

# Backend tests only
./run-tests.sh --backend-only

# Frontend tests only
./run-tests.sh --frontend-only

# System tests only (requires running services)
./test-system.sh
```

## Test Structure

### Backend Unit Tests (`backend/tests/`)
- **weatherService.test.js**: Weather data generation and API integration
- **deliveryService.test.js**: Delivery simulation and weather correlation logic
- **correlationService.test.js**: Statistical analysis and correlation calculations

### Frontend Unit Tests (`frontend/src/components/__tests__/`)
- **WeatherCard.test.js**: Weather display component
- **DeliveryMetrics.test.js**: Delivery statistics component
- **api.test.js**: API service layer

### System Integration Tests (`test-system.sh`)
- API endpoint functionality
- Data consistency and validation
- Performance benchmarks
- Error handling
- CORS configuration
- End-to-end data flow

## Test Coverage

### Backend Coverage
- Weather service: Data generation, API integration, error handling
- Delivery service: Weather-influenced patterns, realistic simulation
- Correlation service: Statistical calculations, significance testing
- API endpoints: All 7 REST endpoints tested

### Frontend Coverage
- Component rendering and props handling
- User interaction and state management
- API integration and error states
- Loading states and data validation

### System Coverage
- Complete application workflow
- Real-time data updates
- Performance under load
- Cross-component integration

## Running Tests

### Prerequisites
```bash
# Ensure setup is complete
./setup.sh

# For system tests, services must be running
./start.sh
```

### Individual Test Commands

#### Backend Tests
```bash
cd backend
npm test                    # Run all backend tests
npm test -- --coverage     # Run with coverage report
npm test weatherService    # Run specific test file
```

#### Frontend Tests
```bash
cd frontend
npm test                           # Interactive test runner
CI=true npm test -- --coverage    # Single run with coverage
npm test -- --testNamePattern="WeatherCard"  # Specific component
```

#### System Tests
```bash
# Requires running services
./test-system.sh

# Or with services auto-start
./run-tests.sh --system-only
```

## Test Results Interpretation

### Success Indicators
- ✅ All unit tests pass
- ✅ API endpoints respond correctly
- ✅ Data correlations calculate properly
- ✅ Frontend components render without errors
- ✅ System integration works end-to-end

### Common Issues and Solutions

#### Backend Test Failures
```bash
# Missing dependencies
cd backend && npm install

# Port conflicts
lsof -ti:5000 | xargs kill -9

# Environment issues
cp .env.example .env
```

#### Frontend Test Failures
```bash
# Missing dependencies
cd frontend && npm install

# Test environment setup
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

#### System Test Failures
```bash
# Services not running
./start.sh

# Network connectivity
curl http://localhost:5000/api/health
curl http://localhost:3000

# Permissions
chmod +x *.sh
```

## Test Data

### Mock Data Structure
The tests use realistic mock data that mirrors production patterns:

```javascript
// Weather data
{
  temperature: 22.5,
  humidity: 65,
  rainfall: 2.3,
  windSpeed: 8.5,
  description: 'light rain',
  location: { city: 'San Francisco' }
}

// Delivery data
{
  id: 'DEL_123',
  type: 'food',
  orderValue: 35.50,
  location: { neighborhood: 'Downtown' },
  timestamp: '2023-12-01T12:00:00Z'
}
```

### Statistical Test Validation
- Correlation coefficients tested for mathematical accuracy
- Significance testing validated against known statistical methods
- Edge cases handled (insufficient data, extreme values)

## Continuous Integration

### Automated Testing
The test suite is designed for CI/CD integration:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    ./setup.sh
    ./run-tests.sh --no-system
    
- name: System Tests
  run: |
    ./start.sh &
    sleep 30
    ./test-system.sh
```

### Performance Benchmarks
- API response times < 2 seconds
- Memory usage < 200MB per service
- Frontend load time < 3 seconds
- Correlation calculations < 1 second

## Test Maintenance

### Adding New Tests
1. **Backend**: Add to `backend/tests/` following existing patterns
2. **Frontend**: Add to `frontend/src/components/__tests__/`
3. **System**: Extend `test-system.sh` with new endpoints

### Test Data Updates
- Update mock data when adding new features
- Maintain realistic data patterns
- Ensure statistical validity of test correlations

### Coverage Goals
- Backend: >90% line coverage
- Frontend: >85% component coverage
- System: 100% endpoint coverage

## Debugging Tests

### Verbose Output
```bash
# Backend debugging
cd backend && npm test -- --verbose

# Frontend debugging
cd frontend && npm test -- --verbose

# System test debugging
DEBUG=1 ./test-system.sh
```

### Log Analysis
```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log

# Test logs
cat test-startup.log
```

## Best Practices

### Writing Tests
- Test behavior, not implementation
- Use realistic mock data
- Test error conditions
- Maintain test independence

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic
- Mock external dependencies

### Performance Testing
- Test with realistic data volumes
- Validate response times
- Check memory usage patterns
- Test concurrent user scenarios

## Conclusion

The comprehensive test suite ensures the Weather-Delivery Dashboard is reliable, performant, and maintainable. Regular test execution catches issues early and validates that weather-delivery correlations are calculated accurately.