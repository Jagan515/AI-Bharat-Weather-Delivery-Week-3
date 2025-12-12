import axios from 'axios';
import {
  fetchCurrentWeather,
  fetchWeatherHistory,
  fetchCurrentDeliveries,
  fetchDeliveryHistory,
  fetchCorrelations,
  fetchDashboardSummary,
  fetchDashboardData,
  checkApiHealth
} from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCurrentWeather', () => {
    test('should fetch current weather data', async () => {
      const mockWeatherData = {
        temperature: 22.5,
        humidity: 65,
        rainfall: 0,
        description: 'clear sky'
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockWeatherData })
      });

      const result = await fetchCurrentWeather();
      expect(result).toEqual(mockWeatherData);
    });

    test('should handle API errors', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Network error'))
      });

      await expect(fetchCurrentWeather()).rejects.toThrow('Network error');
    });
  });

  describe('fetchWeatherHistory', () => {
    test('should fetch weather history with default hours', async () => {
      const mockHistoryData = [
        { timestamp: '2023-12-01T10:00:00Z', temperature: 20 },
        { timestamp: '2023-12-01T11:00:00Z', temperature: 22 }
      ];

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockHistoryData })
      });

      const result = await fetchWeatherHistory();
      expect(result).toEqual(mockHistoryData);
    });

    test('should fetch weather history with custom hours', async () => {
      const mockHistoryData = [];
      const mockGet = jest.fn().mockResolvedValue({ data: mockHistoryData });

      mockedAxios.create.mockReturnValue({ get: mockGet });

      await fetchWeatherHistory(48);
      expect(mockGet).toHaveBeenCalledWith('/weather/history?hours=48');
    });
  });

  describe('fetchCurrentDeliveries', () => {
    test('should fetch current deliveries', async () => {
      const mockDeliveries = [
        { id: 'DEL_1', type: 'food', orderValue: 35 },
        { id: 'DEL_2', type: 'grocery', orderValue: 65 }
      ];

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockDeliveries })
      });

      const result = await fetchCurrentDeliveries();
      expect(result).toEqual(mockDeliveries);
    });
  });

  describe('fetchCorrelations', () => {
    test('should fetch correlation data', async () => {
      const mockCorrelations = {
        correlations: {
          temperature: { coefficient: 0.65, strength: 'moderate' },
          rainfall: { coefficient: 0.82, strength: 'strong' }
        },
        insights: []
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockCorrelations })
      });

      const result = await fetchCorrelations();
      expect(result).toEqual(mockCorrelations);
    });
  });

  describe('fetchDashboardData', () => {
    test('should fetch all dashboard data', async () => {
      const mockResponses = [
        { temperature: 22 },
        [{ timestamp: '2023-12-01T10:00:00Z', temperature: 20 }],
        [{ id: 'DEL_1', type: 'food' }],
        [{ id: 'DEL_2', type: 'grocery' }],
        { correlations: {}, insights: [] },
        { totalDeliveries: 100 }
      ];

      const mockGet = jest.fn()
        .mockResolvedValueOnce({ data: mockResponses[0] })
        .mockResolvedValueOnce({ data: mockResponses[1] })
        .mockResolvedValueOnce({ data: mockResponses[2] })
        .mockResolvedValueOnce({ data: mockResponses[3] })
        .mockResolvedValueOnce({ data: mockResponses[4] })
        .mockResolvedValueOnce({ data: mockResponses[5] });

      mockedAxios.create.mockReturnValue({ get: mockGet });

      const result = await fetchDashboardData();

      expect(result).toHaveProperty('currentWeather');
      expect(result).toHaveProperty('weatherHistory');
      expect(result).toHaveProperty('currentDeliveries');
      expect(result).toHaveProperty('deliveryHistory');
      expect(result).toHaveProperty('correlations');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('lastUpdated');

      expect(result.currentWeather).toEqual(mockResponses[0]);
      expect(result.weatherHistory).toEqual(mockResponses[1]);
    });

    test('should handle errors in dashboard data fetch', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('API Error'))
      });

      await expect(fetchDashboardData()).rejects.toThrow('API Error');
    });
  });

  describe('checkApiHealth', () => {
    test('should check API health', async () => {
      const mockHealthData = {
        status: 'OK',
        timestamp: '2023-12-01T12:00:00Z'
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockHealthData })
      });

      const result = await checkApiHealth();
      expect(result).toEqual(mockHealthData);
    });
  });
});