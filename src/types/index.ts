export interface BikeStation {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  bikes: number;
  docks: number;
  capacity?: number;
  lastUpdated?: string;
}

export interface GBFSData {
  stations: BikeStation[];
  lastUpdated: string;
  systemId: string;
}

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}
