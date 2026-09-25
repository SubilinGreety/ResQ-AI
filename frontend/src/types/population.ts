export type DensityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ClusterClassification = 'High-Risk Crowded' | 'Safe Zone' | 'Evacuation Priority' | 'Normal';

export interface IOperatorCount {
  name: string;
  count: number;
}

export interface IPopulationCluster {
  clusterId: string;
  centerLat: number;
  centerLon: number;
  radiusMeters: number;
  estimatedPopulation: number;
  activeSims: number;
  density: DensityLevel;
  densityScore: number;
  zone: string;
  locality: string;
  classification: ClusterClassification;
  evacuationPriority: 1 | 2 | 3 | 4;
  operators: IOperatorCount[];
  lastUpdated: string;
}

export interface IHeatmapPoint {
  lat: number;
  lon: number;
  intensity: number;
}

export interface IAiInsights {
  highRiskZones: string[];
  safeZones: string[];
  evacuationPriorityZones: string[];
  overallDensityLevel: DensityLevel;
  recommendedActions: string[];
}

export interface IPopulationDetectionData {
  totalActiveSims: number;
  estimatedTotalPopulation: number;
  coverageRadiusKm: number;
  clusters: IPopulationCluster[];
  aiInsights: IAiInsights;
  lastUpdated: string;
  dataSource: 'SIMULATED' | 'LIVE_TELECOM';
}

export type RadiusFilter = 0.5 | 1 | 5;
export type TimeRangeFilter = 1 | 3 | 6 | 12 | 24;
