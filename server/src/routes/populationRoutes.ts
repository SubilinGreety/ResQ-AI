import { Router } from 'express';
import {
  getPopulationDetection,
  getClusters,
  getHeatmapPoints,
} from '../controllers/populationController';

const router = Router();

// Full population detection report (clusters + AI insights + optional raw SIMs)
router.get('/detection', getPopulationDetection);

// Cluster summary only (lightweight, for map overlays)
router.get('/clusters', getClusters);

// Raw heatmap coordinate points for Leaflet heatmap rendering
router.get('/heatmap', getHeatmapPoints);

export default router;
