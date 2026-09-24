import {
  DEFAULT_RISK_WEIGHTS,
  ROAD_STATUS_SCORES,
  SEVERITY_SCORES,
  IRiskWeights,
  RiskLevel,
  PriorityLevel,
  getRiskLevelFromScore,
  getPriorityFromRiskLevel,
} from '../services/riskConfig';

export interface IRiskFactorDetail {
  factor: string;
  value: string;
  impact: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
}

export interface ICalculatedRisk {
  riskScore: number;
  riskLevel: RiskLevel;
  priority: PriorityLevel;
  normalizedScores: {
    waterScore: number;
    rainfallScore: number;
    injuryScore: number;
    vulnerableScore: number;
    populationScore: number;
    roadScore: number;
    severityScore: number;
  };
  riskFactors: IRiskFactorDetail[];
  recommendedAction: string;
}

// Normalization functions (Maps raw metrics to 0 - 100)
export function normalizeWaterLevel(meters: number): number {
  if (meters <= 0) return 0;
  if (meters >= 2.5) return 100;
  return Math.min(100, Math.round((meters / 2.5) * 100));
}

export function normalizeRainfall(mm: number): number {
  if (mm <= 0) return 0;
  if (mm >= 250) return 100;
  return Math.min(100, Math.round((mm / 250) * 100));
}

export function normalizeInjured(injured: number, population: number): number {
  if (injured <= 0) return 0;
  // Combination of absolute scale and per-capita proportion
  const absScore = Math.min(100, (injured / 100) * 100);
  const ratioScore = population > 0 ? Math.min(100, (injured / (population * 0.05)) * 100) : 0;
  return Math.round(absScore * 0.7 + ratioScore * 0.3);
}

export function normalizeVulnerable(vulnerable: number, population: number): number {
  if (vulnerable <= 0) return 0;
  const absScore = Math.min(100, (vulnerable / 800) * 100);
  const ratioScore = population > 0 ? Math.min(100, (vulnerable / (population * 0.25)) * 100) : 0;
  return Math.round(absScore * 0.6 + ratioScore * 0.4);
}

export function normalizePopulation(population: number): number {
  if (population <= 0) return 0;
  if (population >= 8000) return 100;
  return Math.min(100, Math.round((population / 8000) * 100));
}

export function normalizeRoadStatus(status: string): number {
  return ROAD_STATUS_SCORES[status] ?? 30;
}

export function normalizeSeverity(severity: string): number {
  return SEVERITY_SCORES[severity] ?? 30;
}

/**
 * Calculates transparent, explainable risk score & factors for any zone
 */
export function calculateZoneRisk(zone: any, weights: IRiskWeights = DEFAULT_RISK_WEIGHTS): ICalculatedRisk {
  const water = Number(zone.waterLevel || 0);
  const rain = Number(zone.rainfall || 0);
  const pop = Number(zone.population || 0);
  const injured = Number(zone.injured || 0);
  const vuln = Number(zone.vulnerablePopulation || 0);
  const road = String(zone.roadStatus || 'Clear');
  const sev = String(zone.severity || 'Moderate');

  const waterScore = normalizeWaterLevel(water);
  const rainfallScore = normalizeRainfall(rain);
  const injuryScore = normalizeInjured(injured, pop);
  const vulnerableScore = normalizeVulnerable(vuln, pop);
  const populationScore = normalizePopulation(pop);
  const roadScore = normalizeRoadStatus(road);
  const severityScore = normalizeSeverity(sev);

  // Transparent Weighted Sum
  const rawScore =
    waterScore * weights.waterLevel +
    rainfallScore * weights.rainfall +
    injuryScore * weights.injured +
    vulnerableScore * weights.vulnerablePopulation +
    populationScore * weights.populationExposure +
    roadScore * weights.roadAccessibility +
    severityScore * weights.existingSeverity;

  const riskScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const riskLevel = getRiskLevelFromScore(riskScore);
  const priority = getPriorityFromRiskLevel(riskLevel);

  // Dynamic Explainable Risk Factors
  const riskFactors: IRiskFactorDetail[] = [];

  // Water level factor
  if (waterScore >= 70) {
    riskFactors.push({
      factor: 'Water Level',
      value: `${water.toFixed(1)} m`,
      impact: waterScore >= 85 ? 'CRITICAL' : 'HIGH',
      description: `Severe inundation depth of ${water.toFixed(1)} meters poses acute drowning and structural risks.`,
    });
  } else if (waterScore >= 35) {
    riskFactors.push({
      factor: 'Water Level',
      value: `${water.toFixed(1)} m`,
      impact: 'MODERATE',
      description: `Water accumulation of ${water.toFixed(1)} meters requiring drainage monitoring.`,
    });
  }

  // Rainfall factor
  if (rainfallScore >= 70) {
    riskFactors.push({
      factor: 'Rainfall',
      value: `${rain.toFixed(1)} mm`,
      impact: rainfallScore >= 85 ? 'CRITICAL' : 'HIGH',
      description: `Extreme precipitation intensity (${rain.toFixed(1)} mm) accelerating basin inundation.`,
    });
  } else if (rainfallScore >= 40) {
    riskFactors.push({
      factor: 'Rainfall',
      value: `${rain.toFixed(1)} mm`,
      impact: 'MODERATE',
      description: `Elevated rainfall of ${rain.toFixed(1)} mm sustaining surface runoff.`,
    });
  }

  // Casualties factor
  if (injured > 0) {
    const impact = injuryScore >= 70 ? 'CRITICAL' : injuryScore >= 35 ? 'HIGH' : 'MODERATE';
    riskFactors.push({
      factor: 'Injured People',
      value: `${injured} injured`,
      impact,
      description: `${injured} citizens injured requiring urgent medical triage and extraction.`,
    });
  }

  // Vulnerable population factor
  if (vuln > 0) {
    const impact = vulnerableScore >= 70 ? 'HIGH' : 'MODERATE';
    riskFactors.push({
      factor: 'Vulnerable Population',
      value: `${vuln.toLocaleString()} citizens`,
      impact,
      description: `High concentration of elderly, children, and hospital patients (${vuln.toLocaleString()}) with reduced mobility.`,
    });
  }

  // Road accessibility factor
  if (roadScore >= 60) {
    const impact = roadScore >= 85 ? 'CRITICAL' : 'HIGH';
    riskFactors.push({
      factor: 'Road Accessibility',
      value: road,
      impact,
      description: `Transit routes are ${road.toLowerCase()}, severely restricting standard vehicle emergency ingress.`,
    });
  } else if (roadScore >= 30) {
    riskFactors.push({
      factor: 'Road Accessibility',
      value: road,
      impact: 'MODERATE',
      description: `Routes are ${road.toLowerCase()}, slowing down logistics and rescue convoys.`,
    });
  }

  // Population exposure factor
  if (populationScore >= 60) {
    riskFactors.push({
      factor: 'Population Density',
      value: `${pop.toLocaleString()} residents`,
      impact: populationScore >= 80 ? 'HIGH' : 'MODERATE',
      description: `Dense sector population (${pop.toLocaleString()}) increases total human exposure footprint.`,
    });
  }

  // If no high factors triggered (low risk area)
  if (riskFactors.length === 0) {
    riskFactors.push({
      factor: 'Baseline Stability',
      value: 'Stable',
      impact: 'LOW',
      description: 'Sector parameters indicate manageable conditions with open road access and low water depth.',
    });
  }

  // Dynamic Recommended Initial Action
  let recommendedAction = '';
  if (riskLevel === 'CRITICAL') {
    if (roadScore >= 85 || waterScore >= 80) {
      recommendedAction =
        'Immediate amphibious rescue boats, airboat extraction, and high-clearance medical convoy prioritization required.';
    } else {
      recommendedAction =
        'Immediate evacuation order and high-priority medical triage dispatch recommended.';
    }
  } else if (riskLevel === 'HIGH') {
    if (injuryScore >= 50) {
      recommendedAction =
        'Prioritize emergency paramedic teams and swift casualty extraction to nearest triage centers.';
    } else {
      recommendedAction =
        'Pre-position high-clearance rescue vehicles, activate localized relief shelters, and advise precautionary evacuation.';
    }
  } else if (riskLevel === 'MODERATE') {
    recommendedAction =
      'Maintain active water gauge monitoring, deploy mobile drainage pumps, and stage emergency relief food/water supplies.';
  } else {
    recommendedAction =
      'Routine monitoring and community safety advisory. Keep civil defense volunteer patrols on standby.';
  }

  return {
    riskScore,
    riskLevel,
    priority,
    normalizedScores: {
      waterScore,
      rainfallScore,
      injuryScore,
      vulnerableScore,
      populationScore,
      roadScore,
      severityScore,
    },
    riskFactors,
    recommendedAction,
  };
}
