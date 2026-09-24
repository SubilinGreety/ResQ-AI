import { Router } from 'express';
import {
  getScenarioRiskAnalysis,
  runScenarioRiskAnalysis,
  getZoneRiskAnalysis,
} from '../controllers/riskController';

const router = Router();

// Risk Analysis Endpoints
router.get('/:scenarioId/risk-analysis', getScenarioRiskAnalysis);
router.post('/:scenarioId/risk-analysis/run', runScenarioRiskAnalysis);
router.get('/:scenarioId/zones/:zoneId/risk', getZoneRiskAnalysis);

export default router;
