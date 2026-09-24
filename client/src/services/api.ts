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


