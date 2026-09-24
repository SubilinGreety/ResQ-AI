import { Router } from 'express';
import {
  getScenarios,
  getScenarioById,
  createScenario,
  updateScenario,
  deleteScenario,
  addZone,
  updateZone,
  deleteZone,
  updateResources,
  seedDemoScenario,
} from '../controllers/scenarioController';

const router = Router();

// Demo seeding endpoint
router.post('/seed-demo', seedDemoScenario);

// Scenarios CRUD
router.get('/', getScenarios);
router.post('/', createScenario);
router.get('/:id', getScenarioById);
router.put('/:id', updateScenario);
router.delete('/:id', deleteScenario);

// Zones Management
router.post('/:id/zones', addZone);
router.put('/:id/zones/:zoneId', updateZone);
router.delete('/:id/zones/:zoneId', deleteZone);

// Resources Management
router.post('/:id/resources', updateResources);
router.put('/:id/resources', updateResources);

export default router;
