import { NextRequest, NextResponse } from 'next/server';
import { Station } from '@/lib/types';
import { bboxOf } from '@/lib/geo';

interface GBFSFeed {
  name: string;
  url: string;
}

interface GBFSData {
  data: {
    en: {
      feeds: GBFSFeed[];
    };
  };
  last_updated: number;
  ttl: number;
}

interface StationInfo {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number | null;
}

interface StationStatus {
  station_id: string;
  num_bikes_available: number;
  num_docks_available: number;
  is_installed: number;
  is_renting: number;
  is_returning: number;
  last_reported: number;
}

interface GBFSResponse<T> {
  data: T;
  last_updated: number;
  ttl: number;
}

function calculateTargetFill(hour: number): number {
  // Peak at 8:30 AM (8.5) and 5:30 PM (17.5)
  // Use a sinusoid with period 24 hours
  const normalizedHour = (hour - 8.5) * (2 * Math.PI) / 24;
  return 0.5 + 0.15 * Math.cos(normalizedHour);
}

function calculatePain(station: StationInfo & StationStatus): number {
  const { num_bikes_available, num_docks_available, capacity } = station;
  const total = num_bikes_available + num_docks_available;
  
  // If no capacity info and total is 0, set pain to 0
  if (total === 0) return 0;
  
  // Use provided capacity or derive from total
  const effectiveCapacity = capacity || total;
  
  // If capacity is null and we can't derive it plausibly, set pain to 0
  if (!capacity && total < 5) return 0;
  
  const currentFill = num_bikes_available / effectiveCapacity;
  const targetFill = calculateTargetFill(new Date().getHours() + new Date().getMinutes() / 60);
  
  const imbalance = Math.abs(currentFill - targetFill);
  return imbalance * effectiveCapacity;
}

async function fetchGBFSData(url: string): Promise<GBFSData> {
  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache for 1 minute
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch GBFS data: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

async function fetchStationData(baseUrl: string): Promise<{ info: StationInfo[]; status: StationStatus[] }> {
  try {
    // Fetch GBFS discovery file
    const gbfsData = await fetchGBFSData(`${baseUrl}/gbfs.json`);
    
    // Find English feeds
    const enFeeds = gbfsData.data.en?.feeds || [];
    if (enFeeds.length === 0) {
      throw new Error('No English feeds found in GBFS data');
    }
    
    // Find station_information and station_status feeds
    const infoFeed = enFeeds.find(feed => feed.name === 'station_information');
    const statusFeed = enFeeds.find(feed => feed.name === 'station_status');
    
    if (!infoFeed || !statusFeed) {
      throw new Error('Required feeds (station_information, station_status) not found');
    }
    
    // Fetch both feeds in parallel
    const [infoResponse, statusResponse] = await Promise.all([
      fetch(infoFeed.url, { next: { revalidate: 60 } }),
      fetch(statusFeed.url, { next: { revalidate: 60 } })
    ]);
    
    if (!infoResponse.ok || !statusResponse.ok) {
      throw new Error('Failed to fetch station data feeds');
    }
    
    const [infoData, statusData] = await Promise.all([
      infoResponse.json() as Promise<GBFSResponse<{ stations: StationInfo[] }>>,
      statusResponse.json() as Promise<GBFSResponse<{ stations: StationStatus[] }>>
    ]);
    
    return {
      info: infoData.data.stations || [],
      status: statusData.data.stations || []
    };
  } catch (error) {
    console.error('Error fetching station data:', error);
    throw error;
  }
}

function mergeStationData(info: StationInfo[], status: StationStatus[]): Station[] {
  const statusMap = new Map(status.map(s => [s.station_id, s]));
  
  return info
    .map(stationInfo => {
      const stationStatus = statusMap.get(stationInfo.station_id);
      if (!stationStatus) return null;
      
      const merged: Station = {
        ...stationInfo,
        ...stationStatus,
        pain: calculatePain({ ...stationInfo, ...stationStatus })
      };
      
      return merged;
    })
    .filter((station): station is Station => station !== null);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system');
    
    // Determine GBFS root URL
    let gbfsRoot: string;
    if (system) {
      // Support for different systems
      const systemUrls: Record<string, string> = {
        'divvy': 'https://gbfs.divvybikes.com/gbfs',
        'citibike': 'https://gbfs.citibikenyc.com/gbfs',
        'bluebikes': 'https://gbfs.bluebikes.com/gbfs',
      };
      gbfsRoot = systemUrls[system] || process.env.NEXT_PUBLIC_GBFS_ROOT || 'https://gbfs.divvybikes.com/gbfs';
    } else {
      gbfsRoot = process.env.NEXT_PUBLIC_GBFS_ROOT || 'https://gbfs.divvybikes.com/gbfs';
    }
    
    // Fetch and merge station data
    const { info, status } = await fetchStationData(gbfsRoot);
    
    if (info.length === 0 || status.length === 0) {
      return NextResponse.json(
        { error: 'No station data available' },
        { status: 404 }
      );
    }
    
    const stations = mergeStationData(info, status);
    
    if (stations.length === 0) {
      return NextResponse.json(
        { error: 'No valid stations found after merging' },
        { status: 404 }
      );
    }
    
    // Calculate bounds
    const bounds = bboxOf(stations.map(s => ({ lat: s.lat, lon: s.lon })));
    
    return NextResponse.json({
      stations,
      fetchedAt: new Date().toISOString(),
      bounds,
      system: system || 'divvy',
      gbfsRoot
    });
    
  } catch (error) {
    console.error('GBFS API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch GBFS data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

