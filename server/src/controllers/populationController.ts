import { Request, Response } from 'express';

// ─────────────────────────────────────────────
//  Types (structured for easy real-API swap-in)
// ─────────────────────────────────────────────

export interface SimRecord {
  simId: string;
  latitude: number;
  longitude: number;
  operator: string;      // 'Airtel' | 'Jio' | 'BSNL' | 'Vi'
  signalStrength: number; // dBm  (-120 to -50)
  timestamp: string;
  isRoaming: boolean;
  cellTowerId: string;
}

export interface PopulationCluster {
  clusterId: string;
  centerLat: number;
  centerLon: number;
  radiusMeters: number;
  estimatedPopulation: number;
  activeSims: number;
  density: 'Low' | 'Medium' | 'High' | 'Critical';
  densityScore: number;          // 0-100
  zone: string;
  locality: string;
  classification: 'High-Risk Crowded' | 'Safe Zone' | 'Evacuation Priority' | 'Normal';
  evacuationPriority: 1 | 2 | 3 | 4;
  operators: { name: string; count: number }[];
  lastUpdated: string;
}

export interface PopulationDetectionResponse {
  totalActiveSims: number;
  estimatedTotalPopulation: number;
  coverageRadiusKm: number;
  clusters: PopulationCluster[];
  rawSims?: SimRecord[];
  aiInsights: {
    highRiskZones: string[];
    safeZones: string[];
    evacuationPriorityZones: string[];
    overallDensityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    recommendedActions: string[];
  };
  lastUpdated: string;
  dataSource: 'SIMULATED' | 'LIVE_TELECOM';
}

// ─────────────────────────────────────────────
//  Deterministic-seeded random helpers
// ─────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─────────────────────────────────────────────
//  Chennai sector definitions (match existing zones)
// ─────────────────────────────────────────────

const CHENNAI_SECTORS = [
  {
    name: 'Saidapet Zone',
    locality: 'Saidapet',
    lat: 13.0206,
    lon: 80.2206,
    baseDensity: 85,   // High-flood zone
    populationMultiplier: 1.4,
  },
  {
    name: 'Velachery Zone',
    locality: 'Velachery',
    lat: 12.9815,
    lon: 80.2183,
    baseDensity: 92,   // Critically flooded
    populationMultiplier: 1.7,
  },
  {
    name: 'T. Nagar Zone',
    locality: 'T. Nagar',
    lat: 13.0418,
    lon: 80.2341,
    baseDensity: 70,
    populationMultiplier: 1.2,
  },
  {
    name: 'Tambaram Zone',
    locality: 'Tambaram',
    lat: 12.9249,
    lon: 80.1000,
    baseDensity: 55,
    populationMultiplier: 1.0,
  },
  {
    name: 'Adyar Zone',
    locality: 'Adyar',
    lat: 13.0012,
    lon: 80.2565,
    baseDensity: 78,
    populationMultiplier: 1.3,
  },
];

const OPERATORS = ['Jio', 'Airtel', 'BSNL', 'Vi'];

// ─────────────────────────────────────────────
//  Core simulation engine
// ─────────────────────────────────────────────

function generateSimData(
  radiusKm: number,
  timeRangeHours: number,
  seed: number = Date.now()
): { sims: SimRecord[]; clusters: PopulationCluster[] } {
  const rand = seededRandom(seed);

  // Scale SIM counts by radius
  const radiusScale = radiusKm === 0.5 ? 0.35 : radiusKm === 1 ? 0.65 : 1.0;

  const sims: SimRecord[] = [];
  const clusters: PopulationCluster[] = [];

  CHENNAI_SECTORS.forEach((sector, idx) => {
    const baseSims = Math.floor(
      sector.baseDensity * sector.populationMultiplier * radiusScale * (8 + rand() * 12)
    );

    // Simulate time-of-day variation
    const timeMultiplier = 0.7 + timeRangeHours * 0.03;
    const sectorSimCount = Math.floor(baseSims * timeMultiplier);

    const sectorSims: SimRecord[] = [];
    const operatorCounts: Record<string, number> = { Jio: 0, Airtel: 0, BSNL: 0, Vi: 0 };

    for (let i = 0; i < sectorSimCount; i++) {
      const angle = rand() * 2 * Math.PI;
      const r = rand() * (radiusKm * 0.009); // degree offset ≈ radius
      const lat = sector.lat + r * Math.cos(angle);
      const lon = sector.lon + r * Math.sin(angle);
      const operator = OPERATORS[Math.floor(rand() * OPERATORS.length)];
      operatorCounts[operator]++;

      sims.push({
        simId: `SIM-${idx}-${i}-${Math.floor(rand() * 90000 + 10000)}`,
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lon.toFixed(6)),
        operator,
        signalStrength: Math.floor(-120 + rand() * 70),
        timestamp: new Date(Date.now() - rand() * timeRangeHours * 3600000).toISOString(),
        isRoaming: rand() < 0.08,
        cellTowerId: `CT-CHN-${idx}${Math.floor(rand() * 9 + 1)}`,
      });
    }

    // Classify the cluster
    const densityScore = sector.baseDensity;
    let density: PopulationCluster['density'];
    let classification: PopulationCluster['classification'];
    let evacuationPriority: 1 | 2 | 3 | 4;

    if (densityScore >= 85) {
      density = 'Critical';
      classification = 'Evacuation Priority';
      evacuationPriority = 1;
    } else if (densityScore >= 70) {
      density = 'High';
      classification = 'High-Risk Crowded';
      evacuationPriority = 2;
    } else if (densityScore >= 50) {
      density = 'Medium';
      classification = 'Normal';
      evacuationPriority = 3;
    } else {
      density = 'Low';
      classification = 'Safe Zone';
      evacuationPriority = 4;
    }

    sectorSims.push(...sims.slice(-sectorSimCount));

    clusters.push({
      clusterId: `CLU-${idx + 1}`,
      centerLat: sector.lat,
      centerLon: sector.lon,
      radiusMeters: radiusKm * 1000,
      estimatedPopulation: Math.floor(sectorSimCount * (2.8 + rand() * 1.2)), // SIM-to-person factor
      activeSims: sectorSimCount,
      density,
      densityScore,
      zone: sector.name,
      locality: sector.locality,
      classification,
      evacuationPriority,
      operators: OPERATORS.map((op) => ({ name: op, count: operatorCounts[op] })),
      lastUpdated: new Date().toISOString(),
    });
  });

  return { sims, clusters };
}

// ─────────────────────────────────────────────
//  AI Insights engine
// ─────────────────────────────────────────────

function deriveAiInsights(clusters: PopulationCluster[]): PopulationDetectionResponse['aiInsights'] {
  const highRisk = clusters.filter((c) => c.density === 'Critical' || c.density === 'High');
  const safe = clusters.filter((c) => c.density === 'Low');
  const evacuate = clusters.filter((c) => c.classification === 'Evacuation Priority');

  const overallScore =
    clusters.reduce((acc, c) => acc + c.densityScore, 0) / clusters.length;

  let overallDensityLevel: PopulationDetectionResponse['aiInsights']['overallDensityLevel'];
  if (overallScore >= 80) overallDensityLevel = 'Critical';
  else if (overallScore >= 65) overallDensityLevel = 'High';
  else if (overallScore >= 45) overallDensityLevel = 'Medium';
  else overallDensityLevel = 'Low';

  const recommendedActions: string[] = [];
  if (evacuate.length > 0)
    recommendedActions.push(`Immediate evacuation required in: ${evacuate.map((c) => c.locality).join(', ')}`);
  if (highRisk.length > 0)
    recommendedActions.push(`Deploy rescue teams to ${highRisk[0]?.locality} (${highRisk[0]?.activeSims.toLocaleString()} active SIMs detected)`);
  recommendedActions.push('Activate emergency broadcast on all channels for high-density zones');
  recommendedActions.push('Pre-position medical teams near Critical density clusters');
  if (safe.length > 0)
    recommendedActions.push(`Designate ${safe.map((c) => c.locality).join(', ')} as evacuation assembly points`);

  return {
    highRiskZones: highRisk.map((c) => c.locality),
    safeZones: safe.map((c) => c.locality),
    evacuationPriorityZones: evacuate.map((c) => c.locality),
    overallDensityLevel,
    recommendedActions,
  };
}

// ─────────────────────────────────────────────
//  Controller Handlers
// ─────────────────────────────────────────────

/**
 * GET /api/population/detection
 * Query params: radius (0.5 | 1 | 5), timeRange (1 | 3 | 6 | 12 | 24)
 *
 * SWAP POINT: Replace generateSimData() with a real telecom API call here.
 * The response shape (SimRecord[], PopulationCluster[]) remains identical.
 */
export const getPopulationDetection = async (req: Request, res: Response): Promise<void> => {
  try {
    const radiusKm = parseFloat((req.query.radius as string) || '1');
    const timeRangeHours = parseInt((req.query.timeRange as string) || '1');
    const includeSims = req.query.includeSims === 'true';

    // Use a stable seed based on time bucket (refreshes every 30s for live feel)
    const timeBucket = Math.floor(Date.now() / 30000);
    const { sims, clusters } = generateSimData(radiusKm, timeRangeHours, timeBucket);

    const aiInsights = deriveAiInsights(clusters);

    const totalActiveSims = clusters.reduce((acc, c) => acc + c.activeSims, 0);
    const estimatedTotalPopulation = clusters.reduce((acc, c) => acc + c.estimatedPopulation, 0);

    const response: PopulationDetectionResponse = {
      totalActiveSims,
      estimatedTotalPopulation,
      coverageRadiusKm: radiusKm,
      clusters,
      ...(includeSims ? { rawSims: sims } : {}),
      aiInsights,
      lastUpdated: new Date().toISOString(),
      dataSource: 'SIMULATED',
    };

    res.json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Population detection failed' });
  }
};

/**
 * GET /api/population/clusters
 * Returns just the cluster summary (lighter payload for map overlays)
 */
export const getClusters = async (req: Request, res: Response): Promise<void> => {
  try {
    const radiusKm = parseFloat((req.query.radius as string) || '1');
    const timeBucket = Math.floor(Date.now() / 30000);
    const { clusters } = generateSimData(radiusKm, 1, timeBucket);
    res.json({ success: true, data: clusters });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch clusters' });
  }
};

/**
 * GET /api/population/heatmap
 * Returns raw SIM coordinates for heatmap rendering
 */
export const getHeatmapPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const radiusKm = parseFloat((req.query.radius as string) || '1');
    const timeBucket = Math.floor(Date.now() / 30000);
    const { sims } = generateSimData(radiusKm, 1, timeBucket);

    const points = sims.map((s) => ({
      lat: s.latitude,
      lon: s.longitude,
      intensity: (s.signalStrength + 120) / 70, // normalize 0-1
    }));

    res.json({ success: true, data: points, count: points.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch heatmap data' });
  }
};
