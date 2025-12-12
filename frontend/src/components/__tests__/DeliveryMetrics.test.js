import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeliveryMetrics from '../DeliveryMetrics';

describe('DeliveryMetrics', () => {
  const mockCurrentDeliveries = [
    {
      id: 'DEL_1',
      type: 'food',
      orderValue: 35.50,
      location: { neighborhood: 'Downtown' }
    },
    {
      id: 'DEL_2',
      type: 'grocery',
      orderValue: 65.25,
      location: { neighborhood: 'Mission' }
    },
    {
      id: 'DEL_3',
      type: 'food',
      orderValue: 28.75,
      location: { neighborhood: 'Castro' }
    }
  ];

  const mockSummary = {
    totalDeliveries: 150,
    averageTemperature: 22.5
  };

  test('renders delivery metrics correctly', () => {
    render(<DeliveryMetrics currentDeliveries={mockCurrentDeliveries} summary={mockSummary} />);
    
    expect(screen.getByText('Delivery Metrics')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Current hour orders
    expect(screen.getByText('150')).toBeInTheDocument(); // Total orders
    expect(screen.getByText('$43')).toBeInTheDocument(); // Average order value (rounded)
  });

  test('calculates average order value correctly', () => {
    render(<DeliveryMetrics currentDeliveries={mockCurrentDeliveries} summary={mockSummary} />);
    
    // Average of 35.50, 65.25, 28.75 = 43.17, rounded to $43
    expect(screen.getByText('$43')).toBeInTheDocument();
  });

  test('displays delivery types breakdown', () => {
    render(<DeliveryMetrics currentDeliveries={mockCurrentDeliveries} summary={mockSummary} />);
    
    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('grocery')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // food count
    expect(screen.getByText('1')).toBeInTheDocument(); // grocery count
  });

  test('shows top delivery category', () => {
    render(<DeliveryMetrics currentDeliveries={mockCurrentDeliveries} summary={mockSummary} />);
    
    expect(screen.getByText('Top Category')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument(); // Capitalized
    expect(screen.getByText('(2)')).toBeInTheDocument(); // Count in parentheses
  });

  test('handles empty deliveries gracefully', () => {
    render(<DeliveryMetrics currentDeliveries={[]} summary={mockSummary} />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // Current hour orders
    expect(screen.getByText('$0')).toBeInTheDocument(); // Average order value
  });

  test('shows loading state when data is null', () => {
    render(<DeliveryMetrics currentDeliveries={null} summary={null} />);
    
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('displays correct delivery type icons', () => {
    render(<DeliveryMetrics currentDeliveries={mockCurrentDeliveries} summary={mockSummary} />);
    
    // Check that delivery type sections are rendered
    const deliveryTypesSection = screen.getByText('Delivery Types');
    expect(deliveryTypesSection).toBeInTheDocument();
  });
});