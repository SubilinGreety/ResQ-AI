export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type HazardType = 'Flood' | 'Cyclone' | 'Heavy Rain' | 'Heat Wave' | 'Landslide' | 'Drought';

export interface IWeatherData {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  rainfall_1h: number;
  rainfall_24h: number;
  wind_speed: number;
  wind_direction: number;
  wind_direction_compass: string;
  pressure: number;
  aqi: number;
  aqi_status: string;
  uv_index: number;
  cloud_cover: number;
  visibility_km: number;
  condition: string;
  icon: string;
  timestamp: string;
  source: string;
}

export interface IDisasterPrediction {
  hazard: HazardType;
  probability: number;
  risk_level: RiskLevel;
  severity_score: number;
  triggers: string[];
  description: string;
  projected_impact_window: string;
}

export interface IEarlyWarningAlert {
  id: string;
  hazard: HazardType;
  risk_level: RiskLevel;
  title: string;
  message: string;
  message_ta: string;
  affected_zones: string[];
  triggered_parameter: string;
  threshold_value: string;
  current_value: string;
  timestamp: string;
  status: 'ACTIVE' | 'WATCH' | 'ADVISORY' | 'RESOLVED';
  action_required: string;
  can_trigger_emergency_broadcast?: boolean;
}

export interface ISafeShelter {
  id: string;
  name: string;
  locality: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  status: 'READY' | 'OCCUPIED' | 'STANDBY' | 'FULL';
  contact_person: string;
  contact_phone: string;
  facilities: string[];
}

export interface IRescueTeam {
  id: string;
  unit_name: string;
  agency: 'NDRF' | 'SDRF' | 'TNFRS Fire & Rescue' | 'Coast Guard' | 'Greater Chennai Corp';
  team_type: 'Flood Rescue' | 'Medical Evacuation' | 'Hazmat' | 'Search & Extrication';
  station_location: string;
  latitude: number;
  longitude: number;
  personnel_count: number;
  boats_available: number;
  ambulances_available: number;
  status: 'DEPLOYED' | 'STANDBY' | 'EN_ROUTE' | 'ACTIVE';
  contact_channel: string;
}

export interface IDisasterProneZone {
  id: string;
  name: string;
  zone_type: 'Flood Basin' | 'Coastal Surge' | 'Low-Lying Waterlogging' | 'Landslide Risk' | 'Urban Heat Island';
  risk_level: RiskLevel;
  description: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  vulnerable_population: number;
}

export interface IAIRecommendation {
  id: string;
  category: 'Evacuation' | 'Shelter' | 'Rescue' | 'Medical' | 'Civic Advisory';
  priority: 'P1 - Immediate' | 'P2 - High' | 'P3 - Moderate' | 'P4 - Advisory';
  title: string;
  description: string;
  target_agency: string;
  status: 'PENDING' | 'DISPATCHED' | 'IN_PROGRESS';
}

export interface IClimateHistoryRecord {
  id: string;
  timestamp: string;
  city: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  pressure: number;
  aqi: number;
  predicted_hazard: HazardType;
  risk_level: RiskLevel;
  recommendation: string;
}

export interface IClimateForecastItem {
  time: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
}

export interface IClimateDashboardResponse {
  current_weather: IWeatherData;
  overall_risk_level: RiskLevel;
  disaster_predictions: IDisasterPrediction[];
  active_alerts: IEarlyWarningAlert[];
  recommendations: IAIRecommendation[];
  shelters: ISafeShelter[];
  rescue_teams: IRescueTeam[];
  disaster_zones: IDisasterProneZone[];
  forecast_24h: IClimateForecastItem[];
  data_source_mode: 'REAL_API' | 'SIMULATED' | 'HYBRID';
  provider_name: string;
}
