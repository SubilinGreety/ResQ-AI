import axios from 'axios';
import { IScenario, IZone, IResources, IScenarioFormData } from '../types/scenario';
import { IAlert, IAlertsData } from '../types/alert';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const scenarioApi = {
  // Scenarios
  getAll: async (): Promise<IScenario[]> => {
    const res = await api.get('/scenarios');
    return res.data.data;
  },

  getById: async (id: string): Promise<IScenario> => {
    const res = await api.get(`/scenarios/${id}`);
    return res.data.data;
  },

  create: async (payload: IScenarioFormData): Promise<IScenario> => {
    const res = await api.post('/scenarios', payload);
    return res.data.data;
  },

  update: async (id: string, payload: Partial<IScenarioFormData>): Promise<IScenario> => {
    const res = await api.put(`/scenarios/${id}`, payload);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/scenarios/${id}`);
  },

  // Zones
  addZone: async (scenarioId: string, zone: Omit<IZone, 'id' | 'scenarioId'>): Promise<IZone> => {
    const res = await api.post(`/scenarios/${scenarioId}/zones`, zone);
    return res.data.data;
  },

  updateZone: async (scenarioId: string, zoneId: string, zone: Partial<IZone>): Promise<IZone> => {
    const res = await api.put(`/scenarios/${scenarioId}/zones/${zoneId}`, zone);
    return res.data.data;
  },

  deleteZone: async (scenarioId: string, zoneId: string): Promise<void> => {
    await api.delete(`/scenarios/${scenarioId}/zones/${zoneId}`);
  },

  // Resources
  updateResources: async (scenarioId: string, resources: IResources): Promise<IResources> => {
    const res = await api.post(`/scenarios/${scenarioId}/resources`, resources);
    return res.data.data;
  },

  // Seed / Reset Demo Scenario
  seedDemo: async (force = false): Promise<IScenario> => {
    const res = await api.post(`/scenarios/seed-demo${force ? '?force=true' : ''}`);
    return res.data.data;
  },

  // Health check
  checkHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },
};

export const riskApi = {
  // Get risk analysis for a scenario
  getScenarioRisk: async (scenarioId: string) => {
    const res = await api.get(`/scenarios/${scenarioId}/risk-analysis`);
    return res.data.data;
  },

  // Run or recalculate risk analysis
  runRiskAnalysis: async (scenarioId: string) => {
    const res = await api.post(`/scenarios/${scenarioId}/risk-analysis/run`);
    return res.data.data;
  },

  // Detailed risk analysis for a single zone
  getZoneRisk: async (scenarioId: string, zoneId: string) => {
    const res = await api.get(`/scenarios/${scenarioId}/zones/${zoneId}/risk`);
    return res.data.data;
  },
};

export const alertApi = {
  // Get all alerts and metrics for scenario
  getAlerts: async (scenarioId: string): Promise<IAlertsData> => {
    const res = await api.get(`/scenarios/${scenarioId}/alerts`);
    return res.data.data;
  },

  // Generate / refresh alerts from risk analysis
  generateAlerts: async (scenarioId: string): Promise<IAlertsData> => {
    const res = await api.post(`/scenarios/${scenarioId}/alerts/generate`);
    return res.data.data;
  },

  // Dispatch a single alert
  dispatchAlert: async (scenarioId: string, alertId: string, updates?: Partial<IAlert>): Promise<IAlert> => {
    const res = await api.post(`/scenarios/${scenarioId}/alerts/${alertId}/dispatch`, updates);
    return res.data.data;
  },

  // Broadcast all Priority 1 Critical alerts
  dispatchAllP1: async (scenarioId: string): Promise<IAlertsData> => {
    const res = await api.post(`/scenarios/${scenarioId}/alerts/dispatch-p1`);
    return res.data.data;
  },

  // Update alert draft / parameters
  updateAlert: async (scenarioId: string, alertId: string, data: Partial<IAlert>): Promise<IAlert> => {
    const res = await api.patch(`/scenarios/${scenarioId}/alerts/${alertId}`, data);
    return res.data.data;
  },

  // Revoke an alert
  revokeAlert: async (scenarioId: string, alertId: string): Promise<void> => {
    await api.post(`/scenarios/${scenarioId}/alerts/${alertId}/revoke`);
  },
};
import { IPopulationDetectionData, RadiusFilter, TimeRangeFilter } from '../types/population';

export const populationApi = {
  /**
   * Fetch full population detection report.
   * SWAP POINT: When real telecom APIs are available, update the backend controller.
   * This service call signature stays the same.
   */
  getDetectionData: async (
    radius: RadiusFilter = 1,
    timeRange: TimeRangeFilter = 1,
    includeSims = false
  ): Promise<IPopulationDetectionData> => {
    const res = await api.get('/population/detection', {
      params: { radius, timeRange, includeSims },
    });
    return res.data.data;
  },

  getHeatmapPoints: async (radius: RadiusFilter = 1) => {
    const res = await api.get('/population/heatmap', { params: { radius } });
    return res.data.data as { lat: number; lon: number; intensity: number }[];
  },
};
import {
  IMassAlertRecord,
  IRecipientEstimate,
  IDeliveryAnalytics,
  IMassAlertRequest,
} from '../types/massAlert';

export const massAlertApi = {
  /**
   * Estimate recipients for a given radius before sending.
   */
  estimateRecipients: async (radiusKm: number): Promise<IRecipientEstimate> => {
    const res = await api.post('/mass-alerts/estimate', { radiusKm });
    return res.data.data;
  },

  /**
   * Send mass alert immediately.
   * SWAP POINT: Backend controller routes this through simulated SMS → swap for Twilio/TRAI.
   */
  sendAlert: async (payload: IMassAlertRequest): Promise<IMassAlertRecord> => {
    const res = await api.post('/mass-alerts/send', payload);
    return res.data.data;
  },

  /**
   * Schedule an alert for a future time.
   */
  scheduleAlert: async (payload: IMassAlertRequest): Promise<IMassAlertRecord> => {
    const res = await api.post('/mass-alerts/schedule', payload);
    return res.data.data;
  },

  /**
   * Cancel a scheduled or pending alert.
   */
  cancelAlert: async (id: string): Promise<IMassAlertRecord> => {
    const res = await api.patch(`/mass-alerts/${id}/cancel`);
    return res.data.data;
  },

  /**
   * Poll a single alert for delivery status updates.
   */
  getAlertById: async (id: string): Promise<IMassAlertRecord> => {
    const res = await api.get(`/mass-alerts/${id}`);
    return res.data.data;
  },

  /**
   * Full alert history.
   */
  getHistory: async (): Promise<IMassAlertRecord[]> => {
    const res = await api.get('/mass-alerts/history');
    return res.data.data;
  },

  /**
   * Delivery analytics summary.
   */
  getAnalytics: async (): Promise<IDeliveryAnalytics> => {
    const res = await api.get('/mass-alerts/analytics');
    return res.data.data;
  },
};

import {
  IClimateDashboardResponse,
  IWeatherData,
  IClimateForecastItem,
  IDisasterPrediction,
  IEarlyWarningAlert,
  IClimateHistoryRecord,
} from '../types/climate';

export const climateApi = {
  /**
   * Fetch full Climate Intelligence dashboard payload.
   */
  getDashboard: async (city = 'Chennai'): Promise<IClimateDashboardResponse> => {
    const res = await api.get('/climate/dashboard', { params: { city } });
    return res.data.data;
  },

  getCurrentWeather: async (city = 'Chennai'): Promise<IWeatherData> => {
    const res = await api.get('/climate/current', { params: { city } });
    return res.data.data;
  },

  getForecast: async (city = 'Chennai'): Promise<IClimateForecastItem[]> => {
    const res = await api.get('/climate/forecast', { params: { city } });
    return res.data.data;
  },

  getPredictions: async (city = 'Chennai'): Promise<IDisasterPrediction[]> => {
    const res = await api.get('/climate/predictions', { params: { city } });
    return res.data.data;
  },

  getAlerts: async (city = 'Chennai'): Promise<IEarlyWarningAlert[]> => {
    const res = await api.get('/climate/alerts', { params: { city } });
    return res.data.data;
  },

  getMapLayers: async () => {
    const res = await api.get('/climate/map-layers');
    return res.data.data;
  },

  getHistory: async (): Promise<IClimateHistoryRecord[]> => {
    const res = await api.get('/climate/history');
    return res.data.data;
  },

  simulateHazard: async (hazard: string) => {
    const res = await api.post('/climate/simulate-hazard', { hazard });
    return res.data;
  },
};

import {
  ICoordinatorDashboardResponse,
  ISituationInput,
  IResourceUtilization,
  IMissionTimelineEvent,
  IWorkflowStage,
} from '../types/coordinator';

export const coordinatorApi = {
  getDashboard: async (): Promise<ICoordinatorDashboardResponse> => {
    const res = await api.get('/coordinator/dashboard');
    return res.data.data;
  },

  evaluateSituation: async (situation: ISituationInput): Promise<ICoordinatorDashboardResponse> => {
    const res = await api.post('/coordinator/evaluate', situation);
    return res.data.data;
  },

  triggerEscalation: async (scenario: string): Promise<ICoordinatorDashboardResponse> => {
    const res = await api.post('/coordinator/escalate', null, { params: { scenario } });
    return res.data.data;
  },

  getAgents: async () => {
    const res = await api.get('/coordinator/agents');
    return res.data.data;
  },

  getTimeline: async (): Promise<IMissionTimelineEvent[]> => {
    const res = await api.get('/coordinator/timeline');
    return res.data.data;
  },

  getResources: async (): Promise<IResourceUtilization> => {
    const res = await api.get('/coordinator/resources');
    return res.data.data;
  },

  getWorkflow: async (): Promise<IWorkflowStage[]> => {
    const res = await api.get('/coordinator/workflow');
    return res.data.data;
  },

  injectZoneAndReplan: async (payload: {
    zone_name: string;
    population: number;
    risk_level: string;
  }): Promise<ICoordinatorDashboardResponse> => {
    const res = await api.post('/coordinator/replan-zone', payload);
    return res.data.data;
  },
};

