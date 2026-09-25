import { prisma } from '../config/db';
import { calculateZoneRisk, ICalculatedRisk } from '../utils/riskCalculator';
import { DEFAULT_RISK_WEIGHTS } from './riskConfig';

export class RiskAssessmentService {
  /**
   * Run or recalculate risk analysis for all zones in a scenario and persist to MySQL
   */
  public static async assessScenario(scenarioId: string) {
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
      include: { zones: true },
    });

    if (!scenario) {
      throw new Error(`Scenario not found with ID: ${scenarioId}`);
    }

    const zones = scenario.zones || [];
    if (zones.length === 0) {
      return {
        scenarioId,
        scenarioName: scenario.name,
        generatedAt: new Date().toISOString(),
        overview: {
          totalZones: 0,
          criticalZones: 0,
          highZones: 0,
          moderateZones: 0,
          lowZones: 0,
          highestRiskZone: null,
          averageScore: 0,
        },
        zones: [],
      };
    }

    const evaluatedZones: Array<{
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
      risk: ICalculatedRisk;
    }> = [];

    // Calculate and upsert each zone's risk assessment
    for (const zone of zones) {
      const risk = calculateZoneRisk(zone, DEFAULT_RISK_WEIGHTS);

      // Upsert into database
      await prisma.riskAssessment.upsert({
        where: {
          scenarioId_zoneId: {
            scenarioId,
            zoneId: zone.id,
          },
        },
        create: {
          scenarioId,
          zoneId: zone.id,
          riskScore: risk.riskScore,
          riskLevel: risk.riskLevel,
          priority: risk.priority,
          riskFactors: risk.riskFactors as any,
          recommendedAction: risk.recommendedAction,
          calculatedAt: new Date(),
        },
        update: {
          riskScore: risk.riskScore,
          riskLevel: risk.riskLevel,
          priority: risk.priority,
          riskFactors: risk.riskFactors as any,
          recommendedAction: risk.recommendedAction,
          calculatedAt: new Date(),
        },
      });

      evaluatedZones.push({
        zoneId: zone.id,
        zoneName: zone.name,
        locality: zone.locality,
        population: zone.population,
        waterLevel: zone.waterLevel,
        rainfall: zone.rainfall,
        injured: zone.injured,
        vulnerablePopulation: zone.vulnerablePopulation,
        roadStatus: zone.roadStatus,
        status: zone.status,
        latitude: zone.latitude,
        longitude: zone.longitude,
        risk,
      });
    }

    // Sort: Priority 1 first (asc), then exact risk score descending
    evaluatedZones.sort((a, b) => {
      if (a.risk.priority !== b.risk.priority) {
        return a.risk.priority - b.risk.priority;
      }
      return b.risk.riskScore - a.risk.riskScore;
    });

    // Compute overview metrics
    const totalZones = evaluatedZones.length;
    const criticalZones = evaluatedZones.filter((z) => z.risk.riskLevel === 'CRITICAL').length;
    const highZones = evaluatedZones.filter((z) => z.risk.riskLevel === 'HIGH').length;
    const moderateZones = evaluatedZones.filter((z) => z.risk.riskLevel === 'MODERATE').length;
    const lowZones = evaluatedZones.filter((z) => z.risk.riskLevel === 'LOW').length;

    const totalScore = evaluatedZones.reduce((sum, z) => sum + z.risk.riskScore, 0);
    const averageScore = totalZones > 0 ? Math.round(totalScore / totalZones) : 0;

    const highest = evaluatedZones[0];
    const highestRiskZone = highest
      ? {
          zoneId: highest.zoneId,
          name: highest.locality || highest.zoneName,
          score: highest.risk.riskScore,
          level: highest.risk.riskLevel,
        }
      : null;

    return {
      scenarioId,
      scenarioName: scenario.name,
      disasterType: scenario.disasterType,
      city: scenario.city,
      generatedAt: new Date().toISOString(),
      overview: {
        totalZones,
        criticalZones,
        highZones,
        moderateZones,
        lowZones,
        highestRiskZone,
        averageScore,
      },
      zones: evaluatedZones.map((z) => ({
        zoneId: z.zoneId,
        zoneName: z.zoneName,
        locality: z.locality,
        population: z.population,
        waterLevel: z.waterLevel,
        rainfall: z.rainfall,
        injured: z.injured,
        vulnerablePopulation: z.vulnerablePopulation,
        roadStatus: z.roadStatus,
        status: z.status,
        latitude: z.latitude,
        longitude: z.longitude,
        riskScore: z.risk.riskScore,
        riskLevel: z.risk.riskLevel,
        priority: z.risk.priority,
        normalizedScores: z.risk.normalizedScores,
        riskFactors: z.risk.riskFactors,
        recommendedAction: z.risk.recommendedAction,
      })),
    };
  }

  /**
   * Get existing scenario risk analysis, or run freshly if not yet calculated
   */
  public static async getScenarioRiskAnalysis(scenarioId: string) {
    const existing = await prisma.riskAssessment.findMany({
      where: { scenarioId },
      include: { zone: true },
    });

    const zoneCount = await prisma.zone.count({ where: { scenarioId } });

    // If never run or zone count mismatch, run assessment
    if (existing.length === 0 || existing.length !== zoneCount) {
      return await this.assessScenario(scenarioId);
    }

    const scenario = await prisma.scenario.findUnique({ where: { id: scenarioId } });

    const formatted = existing.map((ra) => ({
      zoneId: ra.zoneId,
      zoneName: ra.zone.name,
      locality: ra.zone.locality,
      population: ra.zone.population,
      waterLevel: ra.zone.waterLevel,
      rainfall: ra.zone.rainfall,
      injured: ra.zone.injured,
      vulnerablePopulation: ra.zone.vulnerablePopulation,
      roadStatus: ra.zone.roadStatus,
      status: ra.zone.status,
      latitude: ra.zone.latitude,
      longitude: ra.zone.longitude,
      riskScore: ra.riskScore,
      riskLevel: ra.riskLevel,
      priority: ra.priority,
      riskFactors: ra.riskFactors as any,
      recommendedAction: ra.recommendedAction,
      calculatedAt: ra.calculatedAt,
    }));

    // Sort priority 1 -> 4, then riskScore desc
    formatted.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return b.riskScore - a.riskScore;
    });

    const totalZones = formatted.length;
    const criticalZones = formatted.filter((z) => z.riskLevel === 'CRITICAL').length;
    const highZones = formatted.filter((z) => z.riskLevel === 'HIGH').length;
    const moderateZones = formatted.filter((z) => z.riskLevel === 'MODERATE').length;
    const lowZones = formatted.filter((z) => z.riskLevel === 'LOW').length;

    const totalScore = formatted.reduce((sum, z) => sum + z.riskScore, 0);
    const averageScore = totalZones > 0 ? Math.round(totalScore / totalZones) : 0;

    const highest = formatted[0];

    return {
      scenarioId,
      scenarioName: scenario?.name || 'Scenario',
      disasterType: scenario?.disasterType || 'Flood',
      city: scenario?.city || 'Chennai',
      generatedAt: existing[0]?.calculatedAt?.toISOString() || new Date().toISOString(),
      overview: {
        totalZones,
        criticalZones,
        highZones,
        moderateZones,
        lowZones,
        highestRiskZone: highest
          ? {
              zoneId: highest.zoneId,
              name: highest.locality || highest.zoneName,
              score: highest.riskScore,
              level: highest.riskLevel,
            }
          : null,
        averageScore,
      },
      zones: formatted,
    };
  }

  /**
   * Detailed risk analysis for a specific zone
   */
  public static async getZoneRisk(scenarioId: string, zoneId: string) {
    const assessment = await prisma.riskAssessment.findUnique({
      where: {
        scenarioId_zoneId: {
          scenarioId,
          zoneId,
        },
      },
      include: {
        zone: true,
        scenario: true,
      },
    });

    if (assessment) {
      return {
        zoneId: assessment.zoneId,
        zoneName: assessment.zone.name,
        locality: assessment.zone.locality,
        population: assessment.zone.population,
        waterLevel: assessment.zone.waterLevel,
        rainfall: assessment.zone.rainfall,
        injured: assessment.zone.injured,
        vulnerablePopulation: assessment.zone.vulnerablePopulation,
        roadStatus: assessment.zone.roadStatus,
        status: assessment.zone.status,
        latitude: assessment.zone.latitude,
        longitude: assessment.zone.longitude,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        priority: assessment.priority,
        riskFactors: assessment.riskFactors,
        recommendedAction: assessment.recommendedAction,
        calculatedAt: assessment.calculatedAt,
      };
    }

    // If not found, compute on the fly
    const zone = await prisma.zone.findFirst({
      where: { id: zoneId, scenarioId },
    });

    if (!zone) {
      throw new Error(`Zone ${zoneId} not found in scenario ${scenarioId}`);
    }

    const risk = calculateZoneRisk(zone, DEFAULT_RISK_WEIGHTS);
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      locality: zone.locality,
      population: zone.population,
      waterLevel: zone.waterLevel,
      rainfall: zone.rainfall,
      injured: zone.injured,
      vulnerablePopulation: zone.vulnerablePopulation,
      roadStatus: zone.roadStatus,
      status: zone.status,
      latitude: zone.latitude,
      longitude: zone.longitude,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      priority: risk.priority,
      normalizedScores: risk.normalizedScores,
      riskFactors: risk.riskFactors,
      recommendedAction: risk.recommendedAction,
      calculatedAt: new Date().toISOString(),
    };
  }
}
