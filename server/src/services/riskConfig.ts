export interface IRiskWeights {
  waterLevel: number;
  rainfall: number;
  injured: number;
  vulnerablePopulation: number;
  populationExposure: number;
  roadAccessibility: number;
  existingSeverity: number;
}

// Configurable scoring weights (Sum = 1.0)
export const DEFAULT_RISK_WEIGHTS: IRiskWeights = {
  waterLevel: 0.25, // 25%
  rainfall: 0.15, // 15%
  injured: 0.2, // 20%
  vulnerablePopulation: 0.15, // 15%
  populationExposure: 0.1, // 10%
  roadAccessibility: 0.1, // 10%
  existingSeverity: 0.05, // 5%
};

// Road status impact values (0 - 100)
export const ROAD_STATUS_SCORES: Record<string, number> = {
  Clear: 0,
  'Partially Blocked': 35,
  Waterlogged: 65,
  Inundated: 85,
  Impassable: 100,
};

// Existing zone severity baseline scores (0 - 100)
export const SEVERITY_SCORES: Record<string, number> = {
  Low: 15,
  Moderate: 40,
  High: 75,
  Critical: 100,
};

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = 1 | 2 | 3 | 4;

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

export function getPriorityFromRiskLevel(level: RiskLevel): PriorityLevel {
  switch (level) {
    case 'CRITICAL':
      return 1;
    case 'HIGH':
      return 2;
    case 'MODERATE':
      return 3;
    case 'LOW':
      return 4;
  }
}
