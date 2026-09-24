export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = 1 | 2 | 3 | 4;

export interface IRiskFactor {
  factor: string;
  value: string;
  impact: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
}

export interface IZoneRiskAssessment {
  zoneId: string;
  zoneName: string;
  locality: string;
  population: number;
  waterLevel: number;
  rainfall: number;
  injured: number;
  vulnerablePopulation: number;
  roadStatus: string;
  status: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: RiskLevel;
  priority: PriorityLevel;
  normalizedScores?: {
    waterScore: number;
    rainfallScore: number;
    injuryScore: number;
    vulnerableScore: number;
    populationScore: number;
    roadScore: number;
    severityScore: number;
  };
  riskFactors: IRiskFactor[];
  recommendedAction: string;
  calculatedAt?: string;
}

export interface IScenarioRiskAnalysis {
  scenarioId: string;
  scenarioName: string;
  disasterType: string;
  city: string;
  generatedAt: string;
  overview: {
    totalZones: number;
    criticalZones: number;
    highZones: number;
    moderateZones: number;
    lowZones: number;
    highestRiskZone: {
      zoneId: string;
      name: string;
      score: number;
      level: RiskLevel;
    } | null;
    averageScore: number;
  };
  zones: IZoneRiskAssessment[];
}
