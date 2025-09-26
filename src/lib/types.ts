export type StationInfo = {
  station_id: string; name: string;
  lat: number; lon: number; capacity: number | null;
};
export type StationStatus = {
  station_id: string;
  num_bikes_available: number;
  num_docks_available: number;
  is_installed: number; is_renting: number; is_returning: number;
  last_reported: number;
};
export type Station = StationInfo & StationStatus & {
  targetFill?: number; // 0..1
  pain?: number;       // scalar imbalance score
};
export type TruckParams = { count: number; capacity: number; speedKph: number; horizonMin: number };
export type SolveInput = { stations: Station[]; trucks: TruckParams; depot?: {lat:number;lon:number} };
export type Leg = { fromId: string; toId: string; pickup?: number; drop?: number; km: number; min: number };
export type Route = { truck: number; legs: Leg[]; totalKm: number; totalMin: number; effect: { painBefore: number; painAfter: number } };
export type SolveResult = { routes: Route[]; metrics: { totalKm: number; totalMin: number; painBefore: number; painAfter: number; nAtRiskBefore: number; nAtRiskAfter: number } };

