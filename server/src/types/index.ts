export type DisasterType = 'Flood' | 'Cyclone' | 'Tsunami' | 'Earthquake';
export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type ZoneStatus = 'Safe' | 'Monitoring' | 'Warning' | 'Critical' | 'Evacuation Required';
export type RoadStatus = 'Clear' | 'Partially Blocked' | 'Waterlogged' | 'Inundated' | 'Impassable';

export interface IZoneInput {
  name: string;
  locality: string;
  population: number;
  severity: SeverityLevel;
  latitude: number;
  longitude: number;
  rainfall?: number;
  waterLevel?: number;
  roadStatus?: RoadStatus;
  injured?: number;
  vulnerablePopulation?: number;
  status: ZoneStatus;
}

export interface IResourceInput {
  rescueVehicles: number;
  ambulances: number;
  doctors: number;
  medicalTeams: number;
  shelters: number;
  foodKits: number;
  waterSupplies: number;
  rescuePersonnel: number;
}

export interface IScenarioInput {
  name: string;
  disasterType: DisasterType;
  city?: string;
  description?: string;
  severity: SeverityLevel;
  dateTime?: string | Date;
  zones?: IZoneInput[];
  resources?: IResourceInput;
}

export interface IScenarioSummary {
  id: string;
  name: string;
  disasterType: DisasterType;
  city: string;
  severity: SeverityLevel;
  dateTime: Date;
  zoneCount: number;
  totalPopulation: number;
  totalInjured: number;
  totalVulnerable: number;
  criticalZonesCount: number;
  evacuationZonesCount: number;
  resourcesSummary: {
    totalVehicles: number;
    totalPersonnel: number;
    totalShelters: number;
    totalMedicalPersonnel: number;
  };
}
