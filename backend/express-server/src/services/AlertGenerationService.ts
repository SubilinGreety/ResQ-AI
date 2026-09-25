import { prisma } from '../config/db';
import { RiskAssessmentService } from './RiskAssessmentService';
import { generateBilingualAlertContent } from './alertTemplates';

export class AlertGenerationService {
  /**
   * Auto-generate CAP-compliant draft alerts for all zones in a scenario based on Module 2 risk assessments
   */
  public static async generateAlertsForScenario(scenarioId: string) {
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
      include: { zones: true },
    });

    if (!scenario) {
      throw new Error(`Scenario not found with ID: ${scenarioId}`);
    }

    // Get Module 2 risk assessments
    const riskAnalysis = await RiskAssessmentService.getScenarioRiskAnalysis(scenarioId);
    const zones = scenario.zones || [];

    const createdAlerts = [];

    for (const zone of zones) {
      const risk = riskAnalysis.zones.find((z) => z.zoneId === zone.id);
      const priority = risk?.priority || (zone.status === 'Critical' ? 1 : zone.status === 'Warning' ? 3 : 4);
      const severity = risk?.riskLevel || zone.severity.toUpperCase();

      const content = generateBilingualAlertContent(
        zone.name,
        zone.locality,
        priority,
        severity,
        zone.waterLevel,
        zone.rainfall,
        zone.roadStatus
      );

      // Check if alert already exists for this zone in this scenario
      const existing = await prisma.alert.findFirst({
        where: {
          scenarioId,
          zoneId: zone.id,
        },
      });

      if (existing) {
        // Update content if still draft
        const updated = await prisma.alert.update({
          where: { id: existing.id },
          data: {
            alertType: content.alertType,
            severity,
            priority,
            headline: content.headline,
            messageEn: content.messageEn,
            messageTa: content.messageTa,
            instructions: content.instructions,
            channels: content.channels as any,
            targetPopulation: zone.population,
          },
        });
        createdAlerts.push(updated);
      } else {
        const created = await prisma.alert.create({
          data: {
            scenarioId,
            zoneId: zone.id,
            alertType: content.alertType,
            severity,
            priority,
            headline: content.headline,
            messageEn: content.messageEn,
            messageTa: content.messageTa,
            instructions: content.instructions,
            channels: content.channels as any,
            status: 'DRAFT',
            targetPopulation: zone.population,
            deliveryRate: 0.0,
          },
        });
        createdAlerts.push(created);
      }
    }

    return await this.getScenarioAlerts(scenarioId);
  }

  /**
   * Get all alerts for a scenario with overview metrics
   */
  public static async getScenarioAlerts(scenarioId: string) {
    let alerts = await prisma.alert.findMany({
      where: { scenarioId },
      include: {
        zone: true,
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });

    // If empty, auto-generate initial alerts
    if (alerts.length === 0) {
      const zoneCount = await prisma.zone.count({ where: { scenarioId } });
      if (zoneCount > 0) {
        await this.generateAlertsForScenario(scenarioId);
        alerts = await prisma.alert.findMany({
          where: { scenarioId },
          include: { zone: true },
          orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        });
      }
    }

    const totalAlerts = alerts.length;
    const dispatchedCount = alerts.filter((a) => a.status === 'DISPATCHED').length;
    const draftCount = alerts.filter((a) => a.status === 'DRAFT').length;
    const criticalP1Count = alerts.filter((a) => a.priority === 1).length;
    const totalPopulationTargeted = alerts.reduce((sum, a) => sum + a.targetPopulation, 0);
    const estimatedReached = alerts
      .filter((a) => a.status === 'DISPATCHED')
      .reduce((sum, a) => sum + Math.round(a.targetPopulation * (a.deliveryRate / 100)), 0);

    return {
      scenarioId,
      overview: {
        totalAlerts,
        dispatchedCount,
        draftCount,
        criticalP1Count,
        totalPopulationTargeted,
        estimatedReached,
      },
      alerts: alerts.map((a) => ({
        id: a.id,
        scenarioId: a.scenarioId,
        zoneId: a.zoneId,
        zoneName: a.zone?.name || 'Chennai Sector',
        locality: a.zone?.locality || 'Chennai',
        alertType: a.alertType,
        severity: a.severity,
        priority: a.priority,
        headline: a.headline,
        messageEn: a.messageEn,
        messageTa: a.messageTa,
        instructions: a.instructions,
        channels: a.channels,
        status: a.status,
        targetPopulation: a.targetPopulation,
        deliveryRate: a.deliveryRate,
        dispatchedAt: a.dispatchedAt,
        createdAt: a.createdAt,
      })),
    };
  }

  /**
   * Dispatch a single alert across selected channels
   */
  public static async dispatchAlert(alertId: string, updates?: any) {
    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) {
      throw new Error(`Alert not found with ID: ${alertId}`);
    }

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: {
        ...updates,
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
        deliveryRate: 98.4, // Simulated high-reliability broadcast reach
      },
      include: { zone: true },
    });

    return updated;
  }

  /**
   * Authorize and broadcast all Priority 1 Critical Alerts
   */
  public static async dispatchAllPriority1(scenarioId: string) {
    await prisma.alert.updateMany({
      where: {
        scenarioId,
        priority: 1,
      },
      data: {
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
        deliveryRate: 98.8,
      },
    });

    return await this.getScenarioAlerts(scenarioId);
  }

  /**
   * Update an alert's content or targeted channels
   */
  public static async updateAlert(alertId: string, data: any) {
    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: {
        headline: data.headline,
        messageEn: data.messageEn,
        messageTa: data.messageTa,
        instructions: data.instructions,
        channels: data.channels ? (data.channels as any) : undefined,
        status: data.status,
      },
      include: { zone: true },
    });
    return updated;
  }

  /**
   * Revoke or delete an alert
   */
  public static async revokeAlert(alertId: string) {
    await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: 'REVOKED',
      },
    });
  }
}
