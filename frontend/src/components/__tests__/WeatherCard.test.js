import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherCard from '../WeatherCard';

describe('WeatherCard', () => {
  const mockWeather = {
    temperature: 22.5,
    humidity: 65,
    rainfall: 2.3,
    windSpeed: 8.5,
    description: 'light rain',
    location: {
      city: 'San Francisco'
    }
  };

  test('renders weather data correctly', () => {
    render(<WeatherCard weather={mockWeather} />);
    
    expect(screen.getByText('Current Weather')).toBeInTheDocument();
    expect(screen.getByText('22.5°C')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('2.3mm')).toBeInTheDocument();
    expect(screen.getByText('8.5 m/s')).toBeInTheDocument();
    expect(screen.getByText('light rain')).toBeInTheDocument();
    expect(screen.getByText('📍 San Francisco')).toBeInTheDocument();
  });

  test('displays "None" for zero rainfall', () => {
    const weatherWithoutRain = { ...mockWeather, rainfall: 0 };
    render(<WeatherCard weather={weatherWithoutRain} />);
    
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  test('shows loading state when weather is null', () => {
    render(<WeatherCard weather={null} />);
    
    // Should show loading animation
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('applies correct temperature color classes', () => {
    // Test cold temperature
    const coldWeather = { ...mockWeather, temperature: 5 };
    const { rerender } = render(<WeatherCard weather={coldWeather} />);
    expect(screen.getByText('5°C')).toHaveClass('text-blue-500');

    // Test hot temperature
    const hotWeather = { ...mockWeather, temperature: 35 };
    rerender(<WeatherCard weather={hotWeather} />);
    expect(screen.getByText('35°C')).toHaveClass('text-red-500');
  });

  test('displays appropriate weather icons', () => {
    // Test rainy weather
    const rainyWeather = { ...mockWeather, description: 'heavy rain' };
    render(<WeatherCard weather={rainyWeather} />);
    expect(document.querySelector('.weather-icon')).toBeInTheDocument();
  });
});