
export interface GeoPoint {
  lat: number;
  lng: number;
  timestamp: number;
  altitude?: number | null;
  speed?: number | null;
}

export interface AppState {
  isTracking: boolean;
  path: GeoPoint[];
  currentLocation: GeoPoint | null;
  distance: number;
  offlineMode: boolean;
}

export enum MapLayerType {
  STREETS = 'streets',
  TOPO = 'topo',
  SATELLITE = 'satellite'
}
