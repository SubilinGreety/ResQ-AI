import { Router } from 'express';
import {
  getScenarioAlerts,
  generateScenarioAlerts,
  dispatchAlert,
  dispatchAllPriority1Alerts,
  updateAlert,
  revokeAlert,
} from '../controllers/alertController';

const router = Router();

// Module 3: Early Warning & Alert Endpoints
router.get('/:scenarioId/alerts', getScenarioAlerts);
router.post('/:scenarioId/alerts/generate', generateScenarioAlerts);
router.post('/:scenarioId/alerts/dispatch-p1', dispatchAllPriority1Alerts);
router.post('/:scenarioId/alerts/:alertId/dispatch', dispatchAlert);
router.patch('/:scenarioId/alerts/:alertId', updateAlert);
router.post('/:scenarioId/alerts/:alertId/revoke', revokeAlert);

export default router;
