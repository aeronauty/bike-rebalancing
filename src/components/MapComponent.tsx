'use client';

import { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';

// MapLibre style URL (free tiles)
const MAP_STYLE = 'https://demotiles.maplibre.org/style.json';

// Initial view state
const INITIAL_VIEW_STATE = {
  longitude: -87.6298, // Chicago coordinates
  latitude: 41.8781,
  zoom: 11,
  pitch: 0,
  bearing: 0
};

// Sample bike station data (in a real app, this would come from GBFS API)
const SAMPLE_STATIONS = [
  { id: 1, name: 'Station 1', longitude: -87.6298, latitude: 41.8781, bikes: 5, docks: 10 },
  { id: 2, name: 'Station 2', longitude: -87.6200, latitude: 41.8800, bikes: 8, docks: 12 },
  { id: 3, name: 'Station 3', longitude: -87.6400, latitude: 41.8700, bikes: 2, docks: 15 },
  { id: 4, name: 'Station 4', longitude: -87.6100, latitude: 41.8900, bikes: 12, docks: 8 },
  { id: 5, name: 'Station 5', longitude: -87.6500, latitude: 41.8600, bikes: 0, docks: 20 },
];

export default function MapComponent() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [stations, setStations] = useState(SAMPLE_STATIONS);

  // Create scatterplot layer for bike stations
  const scatterplotLayer = new ScatterplotLayer({
    id: 'bike-stations',
    data: stations,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getPosition: (d: any) => [d.longitude, d.latitude],
    getRadius: (d: any) => Math.max(d.bikes * 2, 5),
    getFillColor: (d: any) => {
      // Color based on bike availability
      const ratio = d.bikes / (d.bikes + d.docks);
      if (ratio === 0) return [255, 0, 0, 200]; // Red for empty
      if (ratio < 0.2) return [255, 165, 0, 200]; // Orange for low
      if (ratio < 0.5) return [255, 255, 0, 200]; // Yellow for medium
      return [0, 255, 0, 200]; // Green for good availability
    },
    getLineColor: [0, 0, 0, 100],
    onHover: ({ object, x, y }) => {
      if (object) {
        // You could show a tooltip here
        console.log('Hovered station:', object);
      }
    },
    onClick: ({ object }) => {
      if (object) {
        console.log('Clicked station:', object);
      }
    }
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prevStations => 
        prevStations.map(station => ({
          ...station,
          bikes: Math.max(0, Math.min(station.bikes + Math.floor(Math.random() * 3) - 1, station.bikes + station.docks)),
        }))
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full">
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={[scatterplotLayer]}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
      >
        <Map
          mapStyle={MAP_STYLE}
          attributionControl={false}
        />
      </DeckGL>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h3 className="text-sm font-semibold mb-2">Bike Availability</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Good (50%+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium (20-50%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Low (0-20%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Empty (0%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
