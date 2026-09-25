import { Request, Response } from 'express';
import { AlertGenerationService } from '../services/AlertGenerationService';

export async function getScenarioAlerts(req: Request, res: Response) {
  try {
    const { scenarioId } = req.params;
    const data = await AlertGenerationService.getScenarioAlerts(scenarioId);
    return res.json({
      success: true,
      message: 'Alerts retrieved successfully',
      data,
    });
  } catch (error: any) {
    console.error('Error fetching scenario alerts:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch alerts',
    });
  }
}

export async function generateScenarioAlerts(req: Request, res: Response) {
  try {
    const { scenarioId } = req.params;
    const data = await AlertGenerationService.generateAlertsForScenario(scenarioId);
    return res.json({
      success: true,
      message: 'Scenario alerts generated successfully from risk analysis',
      data,
    });
  } catch (error: any) {
    console.error('Error generating alerts:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate alerts',
    });
  }
}

export async function dispatchAlert(req: Request, res: Response) {
  try {
    const { alertId } = req.params;
    const updates = req.body;
    const updated = await AlertGenerationService.dispatchAlert(alertId, updates);
    return res.json({
      success: true,
      message: 'Alert broadcasted successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error dispatching alert:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch alert',
    });
  }
}

export async function dispatchAllPriority1Alerts(req: Request, res: Response) {
  try {
    const { scenarioId } = req.params;
    const data = await AlertGenerationService.dispatchAllPriority1(scenarioId);
    return res.json({
      success: true,
      message: 'All Priority 1 Critical Warnings broadcasted successfully',
      data,
    });
  } catch (error: any) {
    console.error('Error broadcasting Priority 1 alerts:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to broadcast Priority 1 alerts',
    });
  }
}

export async function updateAlert(req: Request, res: Response) {
  try {
    const { alertId } = req.params;
    const updated = await AlertGenerationService.updateAlert(alertId, req.body);
    return res.json({
      success: true,
      message: 'Alert updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating alert:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update alert',
    });
  }
}

export async function revokeAlert(req: Request, res: Response) {
  try {
    const { alertId } = req.params;
    await AlertGenerationService.revokeAlert(alertId);
    return res.json({
      success: true,
      message: 'Alert revoked successfully',
    });
  } catch (error: any) {
    console.error('Error revoking alert:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to revoke alert',
    });
  }
}
