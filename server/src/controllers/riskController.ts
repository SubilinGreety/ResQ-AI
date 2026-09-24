import { Request, Response } from 'express';
import { RiskAssessmentService } from '../services/RiskAssessmentService';

export async function getScenarioRiskAnalysis(req: Request, res: Response) {
  try {
    const { scenarioId } = req.params;
    const result = await RiskAssessmentService.getScenarioRiskAnalysis(scenarioId);
    return res.json({
      success: true,
      message: 'Risk analysis retrieved successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error fetching scenario risk analysis:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch risk analysis',
    });
  }
}

export async function runScenarioRiskAnalysis(req: Request, res: Response) {
  try {
    const { scenarioId } = req.params;
    const result = await RiskAssessmentService.assessScenario(scenarioId);
    return res.json({
      success: true,
      message: 'Risk analysis computed and stored successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error executing risk analysis:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to execute risk analysis',
    });
  }
}

export async function getZoneRiskAnalysis(req: Request, res: Response) {
  try {
    const { scenarioId, zoneId } = req.params;
    const result = await RiskAssessmentService.getZoneRisk(scenarioId, zoneId);
    return res.json({
      success: true,
      message: 'Zone risk details retrieved successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error fetching zone risk analysis:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch zone risk analysis',
    });
  }
}
