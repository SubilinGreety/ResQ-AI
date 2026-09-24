from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AgentType(str, Enum):
    MEDICAL = "MEDICAL"
    RESCUE = "RESCUE"
    COMMUNICATION = "COMMUNICATION"
    LOGISTICS = "LOGISTICS"
    SHELTER = "SHELTER"
    TRAFFIC = "TRAFFIC"
    RESOURCE = "RESOURCE"

class AgentStatus(str, Enum):
    STANDBY = "STANDBY"
    ANALYZING = "ANALYZING"
    ACTIVE = "ACTIVE"
    DEPLOYING = "DEPLOYING"
    COMPLETED = "COMPLETED"
    ESCALATED = "ESCALATED"

class PriorityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    REASSIGNED = "REASSIGNED"

class TaskPriority(str, Enum):
    URGENT = "URGENT"
    HIGH = "HIGH"
    NORMAL = "NORMAL"
    ROUTINE = "ROUTINE"

class AgentTask(BaseModel):
    id: str
    title: str
    description: str
    status: TaskStatus = TaskStatus.IN_PROGRESS
    priority: TaskPriority = TaskPriority.HIGH
    progress_percent: int = Field(ge=0, le=100, default=0)
    target_entity: str
    estimated_completion_min: int
    created_at: str
    updated_at: str

class AgentActivityLog(BaseModel):
    timestamp: str
    action: str
    detail: str
    severity: str = "INFO"  # INFO, WARNING, SUCCESS, ALERT

class AIAgentState(BaseModel):
    id: str
    name: str
    type: AgentType
    status: AgentStatus
    is_active: bool
    confidence: float = Field(ge=0.0, le=1.0, default=0.92)
    activation_reason: str
    key_metrics: Dict[str, Any] = Field(default_factory=dict)
    assigned_tasks: List[AgentTask] = Field(default_factory=list)
    activity_log: List[AgentActivityLog] = Field(default_factory=list)

class SituationInput(BaseModel):
    disaster_type: str = "Flood"
    disaster_severity: str = "Critical"
    location_name: str = "Velachery & Adyar Basin Corridor"
    latitude: float = 12.9815
    longitude: float = 80.2180
    active_sim_count: int = 14250
    estimated_population: int = 18600
    population_density_level: str = "Critical"
    rainfall_mm_h: float = 48.5
    wind_speed_kmh: float = 38.0
    temperature_c: float = 27.2
    atmospheric_pressure_hpa: float = 998.4
    flooded_roads_count: int = 6
    available_shelters: int = 5
    available_rescue_teams: int = 4
    available_hospitals: int = 5
    available_ambulances: int = 24
    food_water_stock_days: float = 2.1

class PriorityCalculation(BaseModel):
    score: float = Field(ge=0.0, le=100.0)
    level: PriorityLevel
    breakdown: Dict[str, float]
    summary: str

class ExplainableAiDecision(BaseModel):
    agent_type: AgentType
    agent_name: str
    activated: bool
    primary_trigger: str
    reasoning: str
    impact_factor: str

class MissionTimelineEvent(BaseModel):
    id: str
    timestamp: str
    stage: str
    actor: str
    event: str
    details: str
    status: str = "COMPLETED"

class ResourceUtilization(BaseModel):
    ambulances_total: int = 30
    ambulances_deployed: int = 21
    rescue_boats_total: int = 18
    rescue_boats_deployed: int = 14
    rescue_personnel_total: int = 160
    rescue_personnel_active: int = 135
    shelter_beds_total: int = 6500
    shelter_beds_occupied: int = 4120
    food_rations_total: int = 25000
    food_rations_distributed: int = 14200
    water_liters_total: int = 60000
    water_liters_distributed: int = 38500
    emergency_vehicles_deployed: int = 42

class WorkflowStage(BaseModel):
    id: str
    name: str
    status: str  # pending, active, completed
    description: str
    timestamp: str

class CoordinatorDashboardResponse(BaseModel):
    situation: SituationInput
    priority: PriorityCalculation
    engine_status: str
    overall_progress_percent: int
    active_agents_count: int
    total_agents_count: int
    agents: List[AIAgentState]
    explainable_decisions: List[ExplainableAiDecision]
    workflow_stages: List[WorkflowStage]
    timeline: List[MissionTimelineEvent]
    resources: ResourceUtilization
    last_evaluated_at: str
