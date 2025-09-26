'use client';

import { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { COORDINATE_SYSTEM } from '@deck.gl/core';

// Use a simple dark map style
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Initial view state with 3D perspective
const INITIAL_VIEW_STATE = {
  longitude: -87.6298, // Chicago coordinates
  latitude: 41.8781,
  zoom: 12,
  pitch: 45, // 3D tilt
  bearing: 0
};

// Sample bike station data (in a real app, this would come from GBFS API)
const SAMPLE_STATIONS = [
  { id: 1, name: 'Station 1', longitude: -87.6298, latitude: 41.8781, bikes: 5, docks: 10, pain: 0.3 },
  { id: 2, name: 'Station 2', longitude: -87.6200, latitude: 41.8800, bikes: 8, docks: 12, pain: 0.8 },
  { id: 3, name: 'Station 3', longitude: -87.6400, latitude: 41.8700, bikes: 2, docks: 15, pain: 1.2 },
  { id: 4, name: 'Station 4', longitude: -87.6100, latitude: 41.8900, bikes: 12, docks: 8, pain: 2.5 },
  { id: 5, name: 'Station 5', longitude: -87.6500, latitude: 41.8600, bikes: 0, docks: 20, pain: 3.0 },
];

export default function MapComponent() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [stations, setStations] = useState(SAMPLE_STATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hoveredStation, setHoveredStation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch real GBFS data
  const fetchGBFSData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gbfs');
      if (response.ok) {
        const data = await response.json();
        if (data.stations && data.stations.length > 0) {
          setStations(data.stations);
          setLastUpdate(new Date());
        } else {
          setError('No station data available');
        }
      } else {
        setError(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch GBFS data:', error);
      setError('Failed to fetch data - using sample data');
      // Keep using sample data on error
    } finally {
      setIsLoading(false);
    }
  };

  // Get station color based on pain score or availability
  const getStationColor = (station: any) => {
    const pain = station.pain || 0;
    const bikes = station.num_bikes_available || station.bikes || 0;
    const docks = station.num_docks_available || station.docks || 0;
    const total = bikes + docks;
    
    if (total === 0) return '#808080'; // Gray for no data
    
    const ratio = bikes / total;
    
    // Use pain score for coloring if available
    if (pain > 0) {
      if (pain > 2) return '#ef4444'; // Red for high pain
      if (pain > 1) return '#f97316'; // Orange for medium pain
      if (pain > 0.5) return '#eab308'; // Yellow for low pain
      return '#22c55e'; // Green for good balance
    }
    
    // Fallback to availability ratio
    if (ratio === 0) return '#ef4444'; // Red for empty
    if (ratio < 0.2) return '#f97316'; // Orange for low
    if (ratio < 0.5) return '#eab308'; // Yellow for medium
    return '#22c55e'; // Green for good availability
  };

  // Get station size based on pain score or bike count
  const getStationSize = (station: any) => {
    const bikes = station.num_bikes_available || station.bikes || 0;
    const pain = station.pain || 0;
    return Math.max(pain * 4, bikes * 1.2, 8);
  };

  // Fetch real data on component mount
  useEffect(() => {
    fetchGBFSData();
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchGBFSData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Create 3D scatterplot layer for bike stations - more reliable than ColumnLayer
  const layers = [
    new ScatterplotLayer({
      id: 'bike-stations-scatter',
      data: stations,
      pickable: true,
      extruded: true,
      wireframe: false,
      filled: true,
      radiusMinPixels: 8,
      radiusMaxPixels: 60,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
      getPosition: (d: any) => {
        const lng = d.lon || d.longitude || 0;
        const lat = d.lat || d.latitude || 0;
        return [lng, lat, 0];
      },
      getRadius: (d: any) => {
        const bikes = d.num_bikes_available || d.bikes || 0;
        const pain = d.pain || 0;
        return Math.max(pain * 12, bikes * 0.8, 10);
      },
      getElevation: (d: any) => {
        const pain = d.pain || 0;
        return Math.max(pain * 100, 10); // 3D height based on pain score
      },
      getFillColor: (d: any) => {
        const pain = d.pain || 0;
        const bikes = d.num_bikes_available || d.bikes || 0;
        const docks = d.num_docks_available || d.docks || 0;
        const total = bikes + docks;
        
        if (total === 0) return [128, 128, 128, 200]; // Gray for no data
        
        // Use pain score for coloring if available
        if (pain > 0) {
          if (pain > 2) return [239, 68, 68, 200]; // Red for high pain
          if (pain > 1) return [249, 115, 22, 200]; // Orange for medium pain
          if (pain > 0.5) return [234, 179, 8, 200]; // Yellow for low pain
          return [34, 197, 94, 200]; // Green for good balance
        }
        
        // Fallback to availability ratio
        const ratio = bikes / total;
        if (ratio === 0) return [239, 68, 68, 200]; // Red for empty
        if (ratio < 0.2) return [249, 115, 22, 200]; // Orange for low
        if (ratio < 0.5) return [234, 179, 8, 200]; // Yellow for medium
        return [34, 197, 94, 200]; // Green for good availability
      },
      onHover: ({ object, x, y }) => {
        setHoveredStation(object);
      },
      onClick: ({ object }) => {
        if (object) {
          console.log('Clicked station:', object);
        }
      },
      updateTriggers: {
        getFillColor: [stations],
        getPosition: [stations],
        getRadius: [stations],
        getElevation: [stations]
      }
    })
  ];

  return (
    <div className="w-full h-full relative">
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        getTooltip={({ object }) => {
          if (object) {
            const bikes = object.num_bikes_available || object.bikes || 0;
            const docks = object.num_docks_available || object.docks || 0;
            const total = bikes + docks;
            const availability = total > 0 ? Math.round((bikes / total) * 100) : 0;
            const pain = object.pain || 0;
            
            return {
              html: `
                <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 250px;">
                  <div style="font-weight: bold; margin-bottom: 8px; color: #333;">
                    ${object.name || object.station_id}
                  </div>
                  <div style="font-size: 12px; color: #666; line-height: 1.4;">
                    <div>🚲 Bikes: ${bikes}</div>
                    <div>🅿️ Docks: ${docks}</div>
                    <div>📊 Availability: ${availability}%</div>
                    ${pain > 0 ? `<div>⚡ Pain Score: ${pain.toFixed(2)}</div>` : ''}
                    <div style="margin-top: 8px; font-size: 11px; color: #999;">
                      Sphere Height = Pain Score × 100m
                    </div>
                  </div>
                </div>
              `,
              style: {
                fontSize: '12px',
                pointerEvents: 'none'
              }
            };
          }
          return null;
        }}
      >
        <Map
          mapStyle={MAP_STYLE}
          attributionControl={false}
        />
      </DeckGL>
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-20">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-lg shadow-lg z-20 max-w-xs">
          <div className="text-xs">{error}</div>
        </div>
      )}

      {/* Last Update Time */}
      {lastUpdate && !isLoading && !error && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-20">
          <div className="text-xs text-gray-600">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredStation && (
        <div className="absolute bg-white p-3 rounded-lg shadow-lg border z-30 pointer-events-none"
             style={{
               left: '20px',
               top: '20px',
               maxWidth: '250px'
             }}>
          <div className="font-semibold text-sm mb-1">
            {hoveredStation.name || hoveredStation.station_id}
          </div>
          <div className="text-xs space-y-1">
            <div>Bikes: {hoveredStation.num_bikes_available || hoveredStation.bikes || 0}</div>
            <div>Docks: {hoveredStation.num_docks_available || hoveredStation.docks || 0}</div>
            <div>
              Availability: {
                Math.round(((hoveredStation.num_bikes_available || hoveredStation.bikes || 0) / 
                ((hoveredStation.num_bikes_available || hoveredStation.bikes || 0) + 
                 (hoveredStation.num_docks_available || hoveredStation.docks || 0))) * 100) || 0
              }%
            </div>
            {hoveredStation.pain > 0 && (
              <div>Pain Score: {hoveredStation.pain.toFixed(2)}</div>
            )}
          </div>
        </div>
      )}

      {/* 3D View Controls */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-lg z-20">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewState(prev => ({ ...prev, pitch: 0, bearing: 0 }))}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            2D View
          </button>
          <button
            onClick={() => setViewState(prev => ({ ...prev, pitch: 45, bearing: 0 }))}
            className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            3D View
          </button>
          <button
            onClick={() => setViewState(prev => ({ ...prev, pitch: 60, bearing: 45 }))}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Angled
          </button>
        </div>
      </div>

      {/* 3D Scatterplot Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-20">
        <h3 className="text-sm font-semibold mb-2">🔵 3D Scatterplot Visualization</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500"></div>
            <span>Good Balance (pain &lt; 0.5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500"></div>
            <span>Low Imbalance (pain 0.5-1)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500"></div>
            <span>Medium Imbalance (pain 1-2)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500"></div>
            <span>High Imbalance (pain &gt; 2)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500"></div>
            <span>No Data</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-gray-500 space-y-1">
          <div>🏢 Height = Pain Score × 100m</div>
          <div>⭕ Size = Pain Score × 12</div>
          <div>🎯 Stations: {stations.length}</div>
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-blue-600">
          <div>🖱️ Drag to rotate • Scroll to zoom</div>
        </div>
      </div>
    </div>
  );
}
