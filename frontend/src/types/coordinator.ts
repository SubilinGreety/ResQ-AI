export type AgentType =
  | 'MEDICAL'
  | 'RESCUE'
  | 'COMMUNICATION'
  | 'LOGISTICS'
  | 'SHELTER'
  | 'TRAFFIC'
  | 'RESOURCE';

export type AgentStatus =
  | 'STANDBY'
  | 'ANALYZING'
  | 'ACTIVE'
  | 'DEPLOYING'
  | 'COMPLETED'
  | 'ESCALATED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REASSIGNED';

export type TaskPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'ROUTINE';

export interface IAgentTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress_percent: number;
  target_entity: string;
  estimated_completion_min: number;
  created_at: string;
  updated_at: string;
}

export interface IAgentActivityLog {
  timestamp: string;
  action: string;
  detail: string;
  severity: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
}

export interface IAIAgentState {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  is_active: boolean;
  confidence: number;
  activation_reason: string;
  key_metrics: Record<string, any>;
  assigned_tasks: IAgentTask[];
  activity_log: IAgentActivityLog[];
}

export interface ISituationInput {
  disaster_type: string;
  disaster_severity: string;
  location_name: string;
  latitude: number;
  longitude: number;
  active_sim_count: number;
  estimated_population: number;
  population_density_level: string;
  rainfall_mm_h: number;
  wind_speed_kmh: number;
  temperature_c: number;
  atmospheric_pressure_hpa: number;
  flooded_roads_count: number;
  available_shelters: number;
  available_rescue_teams: number;
  available_hospitals: number;
  available_ambulances: number;
  food_water_stock_days: number;
}

export interface IPriorityCalculation {
  score: number;
  level: PriorityLevel;
  breakdown: Record<string, number>;
  summary: string;
}

export interface IExplainableAiDecision {
  agent_type: AgentType;
  agent_name: string;
  activated: boolean;
  primary_trigger: string;
  reasoning: string;
  impact_factor: string;
}

export interface IMissionTimelineEvent {
  id: string;
  timestamp: string;
  stage: string;
  actor: string;
  event: string;
  details: string;
  status: string;
}

export interface IResourceUtilization {
  ambulances_total: number;
  ambulances_deployed: number;
  rescue_boats_total: number;
  rescue_boats_deployed: number;
  rescue_personnel_total: number;
  rescue_personnel_active: number;
  shelter_beds_total: number;
  shelter_beds_occupied: number;
  food_rations_total: number;
  food_rations_distributed: number;
  water_liters_total: number;
  water_liters_distributed: number;
  emergency_vehicles_deployed: number;
}

export interface IWorkflowStage {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
  description: string;
  timestamp: string;
}

export interface IResourceAllocationRow {
  id: string;
  zone_name: string;
  risk_level: string;
  population: number;
  ambulances_requested: number;
  ambulances_allocated: number;
  boats_requested: number;
  boats_allocated: number;
  medics_requested: number;
  medics_allocated: number;
  food_packs_allocated: number;
  tradeoff_rationale: string;
}

export interface IAgentConflictResolution {
  id: string;
  agents_involved: string[];
  contested_resource: string;
  conflict_description: string;
  resolution_strategy: string;
  tradeoff_penalty: string;
  status: string;
}

export interface IPublicAlertDraft {
  headline_en: string;
  headline_ta: string;
  body_en: string;
  body_ta: string;
  evacuation_routes: string[];
  safe_shelters: string[];
  helpline: string;
  urgency: string;
  approved_by_commander: boolean;
}

export interface ICoordinatorDashboardResponse {
  situation: ISituationInput;
  priority: IPriorityCalculation;
  engine_status: string;
  overall_progress_percent: number;
  active_agents_count: number;
  total_agents_count: number;
  agents: IAIAgentState[];
  explainable_decisions: IExplainableAiDecision[];
  workflow_stages: IWorkflowStage[];
  timeline: IMissionTimelineEvent[];
  resources: IResourceUtilization;
  allocation_table?: IResourceAllocationRow[];
  conflict_resolutions?: IAgentConflictResolution[];
  public_alert_draft?: IPublicAlertDraft;
  bonus_replan_log?: string[];
  last_evaluated_at: string;
}
