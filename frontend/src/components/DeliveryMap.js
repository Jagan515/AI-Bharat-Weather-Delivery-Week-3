import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DeliveryMap = ({ deliveries, weather }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([37.7749, -122.4194], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !deliveries) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Group deliveries by neighborhood for heat map effect
    const neighborhoodCounts = deliveries.reduce((acc, delivery) => {
      const neighborhood = delivery.location.neighborhood;
      if (!acc[neighborhood]) {
        acc[neighborhood] = {
          count: 0,
          lat: delivery.location.lat,
          lon: delivery.location.lon,
          deliveries: []
        };
      }
      acc[neighborhood].count++;
      acc[neighborhood].deliveries.push(delivery);
      return acc;
    }, {});

    // Add markers for each neighborhood
    Object.entries(neighborhoodCounts).forEach(([neighborhood, data]) => {
      const { count, lat, lon, deliveries: neighborhoodDeliveries } = data;
      
      // Create custom icon based on delivery count
      const getMarkerColor = (count) => {
        if (count >= 20) return '#dc2626'; // Red for high activity
        if (count >= 10) return '#ea580c'; // Orange for medium activity
        if (count >= 5) return '#ca8a04';  // Yellow for low-medium activity
        return '#16a34a'; // Green for low activity
      };

      const markerHtml = `
        <div style="
          background-color: ${getMarkerColor(count)};
          width: ${Math.min(20 + count * 2, 50)}px;
          height: ${Math.min(20 + count * 2, 50)}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${Math.min(12 + count * 0.5, 16)}px;
        ">
          ${count}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-marker',
        iconSize: [Math.min(20 + count * 2, 50), Math.min(20 + count * 2, 50)],
        iconAnchor: [Math.min(10 + count, 25), Math.min(10 + count, 25)]
      });

      // Create popup content
      const deliveryTypes = neighborhoodDeliveries.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      }, {});

      const avgOrderValue = neighborhoodDeliveries.reduce((sum, d) => sum + d.orderValue, 0) / neighborhoodDeliveries.length;

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; font-weight: bold; color: #374151;">${neighborhood}</h3>
          <div style="margin-bottom: 8px;">
            <strong>Deliveries:</strong> ${count}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Avg Order Value:</strong> $${avgOrderValue.toFixed(2)}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Delivery Types:</strong>
            <ul style="margin: 4px 0 0 0; padding-left: 16px;">
              ${Object.entries(deliveryTypes).map(([type, typeCount]) => 
                `<li style="margin: 2px 0;">${type}: ${typeCount}</li>`
              ).join('')}
            </ul>
          </div>
          ${weather ? `
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <div style="font-size: 12px; color: #6b7280;">
                Current Weather: ${weather.temperature}°C, ${weather.description}
              </div>
            </div>
          ` : ''}
        </div>
      `;

      const marker = L.marker([lat, lon], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(map);
    });

    // Add weather overlay if available
    if (weather && weather.location) {
      const weatherIcon = L.divIcon({
        html: `
          <div style="
            background: rgba(59, 130, 246, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
          ">
            🌡️ ${weather.temperature}°C
            ${weather.rainfall > 0 ? `🌧️ ${weather.rainfall}mm` : ''}
          </div>
        `,
        className: 'weather-overlay',
        iconSize: [120, 40],
        iconAnchor: [60, 20]
      });

      L.marker([weather.location.lat, weather.location.lon], { icon: weatherIcon })
        .addTo(map);
    }

  }, [deliveries, weather]);

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Heat Map</h3>
        <div className="map-container bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📍</div>
            <p>No delivery data available</p>
            <p className="text-sm">Deliveries will appear here as they are generated</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Delivery Heat Map</h3>
        <div className="text-sm text-gray-600">
          {deliveries.length} active deliveries
        </div>
      </div>
      
      <div className="map-container">
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High Activity (20+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Medium (10-19)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Low-Med (5-9)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low (1-4)</span>
          </div>
        </div>
        <div>
          Click markers for details
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;