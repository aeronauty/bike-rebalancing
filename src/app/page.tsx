'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MapComponent from '@/components/MapComponent';

export default function Home() {
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState([30]);
  const [selectedSystem, setSelectedSystem] = useState('divvy');

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Bike Rebalancing (Live GBFS)
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Panel */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* System Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Bike Share System
                  </label>
                  <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="divvy">Divvy (Chicago)</SelectItem>
                      <SelectItem value="citibike">Citi Bike (NYC)</SelectItem>
                      <SelectItem value="bluebikes">Blue Bikes (Boston)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Live Mode
                  </label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isLiveMode}
                      onCheckedChange={setIsLiveMode}
                    />
                    <span className="text-sm text-gray-600">
                      {isLiveMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Refresh Interval: {refreshInterval[0]}s
                  </label>
                  <Slider
                    value={refreshInterval}
                    onValueChange={setRefreshInterval}
                    max={300}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="default">
                  Refresh Data
                </Button>
                <Button className="w-full" variant="outline">
                  Export Report
                </Button>
                <Button className="w-full" variant="outline">
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connection:</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Update:</span>
                  <span className="text-gray-900">2 seconds ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stations:</span>
                  <span className="text-gray-900">587</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bikes:</span>
                  <span className="text-gray-900">4,231</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Map Pane */}
        <div className="flex-1 relative">
          <MapComponent />
        </div>
      </div>
    </div>
  );
}
