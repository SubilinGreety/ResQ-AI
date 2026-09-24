export type DisasterType = 'Flood' | 'Cyclone' | 'Tsunami' | 'Earthquake';
export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type ZoneStatus = 'Safe' | 'Monitoring' | 'Warning' | 'Critical' | 'Evacuation Required';
export type RoadStatus = 'Clear' | 'Partially Blocked' | 'Waterlogged' | 'Inundated' | 'Impassable';

export interface IZone {
  id?: string;
  scenarioId?: string;
  name: string;
  locality: string;
  population: number;
  severity: SeverityLevel;
  latitude: number;
  longitude: number;
  rainfall: number;
  waterLevel: number;
  roadStatus: string;
  injured: number;
  vulnerablePopulation: number;
  status: ZoneStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface IResources {
  id?: string;
  scenarioId?: string;
  rescueVehicles: number;
  ambulances: number;
  doctors: number;
  medicalTeams: number;
  shelters: number;
  foodKits: number;
  waterSupplies: number;
  rescuePersonnel: number;
}

export interface IScenarioSummary {
  zoneCount: number;
  totalPopulation: number;
  totalInjured: number;
  totalVulnerable: number;
  criticalZones: number;
  evacuationZones: number;
  totalVehicles: number;
  totalPersonnel: number;
  totalShelters: number;
  totalSupplies: number;
}

export interface IScenario {
  id: string;
  name: string;
  disasterType: DisasterType;
  city: string;
  description?: string;
  severity: SeverityLevel;
  dateTime: string;
  zones: IZone[];
  resources?: IResources;
  summary?: IScenarioSummary;
  createdAt: string;
  updatedAt: string;
}

export interface IScenarioFormData {
  name: string;
  disasterType: DisasterType;
  city: string;
  description: string;
  severity: SeverityLevel;
  dateTime: string;
  zones: IZone[];
  resources: IResources;
}
