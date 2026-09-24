from datetime import datetime
from typing import List, Dict, Any
from models.coordinator_models import (
    AgentType,
    AgentStatus,
    AIAgentState,
    AgentTask,
    AgentActivityLog,
    TaskStatus,
    TaskPriority,
    SituationInput,
    PriorityCalculation,
    ExplainableAiDecision,
)
from services.agents.base_agent import BaseDisasterAgent

class RescueAgent(BaseDisasterAgent):
    def __init__(self):
        super().__init__(
            agent_id="agent-rescue-02",
            name="Tactical Rescue & Extraction Agent",
            agent_type=AgentType.RESCUE
        )

    def evaluate(self, situation: SituationInput, priority: PriorityCalculation) -> AIAgentState:
        now_str = datetime.now().strftime("%H:%M:%S")
        teams_count = situation.available_rescue_teams
        boats_deployed = 14

        tasks = [
            AgentTask(
                id="task-resc-201",
                title="Tactical Sector Partitioning (Grids Alpha to Delta)",
                description="Subdivided disaster polygon into 4 operational tactical sectors prioritizing submerged ground-floor clusters.",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.URGENT,
                progress_percent=100,
                target_entity="4 Tactical Grids",
                estimated_completion_min=0,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-resc-202",
                title="Deploy NDRF 4th Battalion Inflatable Motorized Boats",
                description="Dispatched 14 Gemini inflatable rescue boats into Velachery lowlands and AGS Colony waterlogged lanes.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=82,
                target_entity="NDRF Team Alpha (42 Personnel)",
                estimated_completion_min=10,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-resc-203",
                title="Calculate Dynamic Safe Extraction Ingress/Egress Corridors",
                description="Routed rescue carriers via elevated Tambaram bypass and Outer Ring Road avoiding submerged underpasses.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                progress_percent=70,
                target_entity="Tactical Route Optimizer",
                estimated_completion_min=12,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-resc-204",
                title="Airlift Contingency & Helipad Pre-Designation",
                description="Surveyed Anna University grounds and Guindy Race Course for emergency Indian Air Force Mi-17 winching sites.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.NORMAL,
                progress_percent=55,
                target_entity="Airborne Rescue Grid",
                estimated_completion_min=20,
                created_at=now_str,
                updated_at=now_str,
            ),
        ]

        activity_logs = [
            AgentActivityLog(timestamp=now_str, action="Tactical Grid Locked", detail="Sectors Alpha (Lake Catchment), Beta (AGS Colony), Gamma (Inner Ring) designated.", severity="INFO"),
            AgentActivityLog(timestamp=now_str, action="Rescue Deployment", detail=f"Dispatched {teams_count} specialized teams with {boats_deployed} motorized inflatable boats.", severity="ALERT"),
            AgentActivityLog(timestamp=now_str, action="Civilians Extracted", detail="Extracted 340 trapped residents from ground-floor inundated homes in Sector Alpha.", severity="SUCCESS"),
        ]

        metrics = {
            "teams_deployed": teams_count,
            "rescue_boats_active": boats_deployed,
            "civilians_extracted": 340,
            "active_rescue_zones": [
                {"sector": "Sector Alpha", "priority": "CRITICAL", "water_depth_m": 1.6, "extracted": 185},
                {"sector": "Sector Beta", "priority": "HIGH", "water_depth_m": 1.1, "extracted": 110},
                {"sector": "Sector Gamma", "priority": "MEDIUM", "water_depth_m": 0.6, "extracted": 45},
            ],
            "safest_route": "Tambaram Bypass -> Velachery Elevated Flyover (Clear of Waterlogging)",
        }

        reason = f"AI activated Rescue Agent to assign {teams_count} specialized rescue battalions, divide sectors, and deploy {boats_deployed} motorized boats into high-hazard flood zones."

        return AIAgentState(
            id=self.agent_id,
            name=self.name,
            type=self.agent_type,
            status=AgentStatus.ACTIVE,
            is_active=True,
            confidence=0.98,
            activation_reason=reason,
            key_metrics=metrics,
            assigned_tasks=tasks,
            activity_log=activity_logs,
        )

    def get_explainability(self, situation: SituationInput, priority: PriorityCalculation) -> ExplainableAiDecision:
        return ExplainableAiDecision(
            agent_type=self.agent_type,
            agent_name=self.name,
            activated=True,
            primary_trigger="Severe Water Inundation Trapping Civilians",
            reasoning=f"AI activated Rescue Agent to dispatch {situation.available_rescue_teams} rescue battalions and deploy 14 motorized boats into inundated residential pockets.",
            impact_factor="Prevents drownings and rapid physical extraction of isolated elderly and children"
        )

    def dynamic_reassign(self, situation: SituationInput, new_threat_level: str) -> List[AgentTask]:
        now_str = datetime.now().strftime("%H:%M:%S")
        return [
            AgentTask(
                id="task-resc-205-reassigned",
                title="Deploy Coast Guard Amphibious Hovercraft Units",
                description="Water currents exceeding 12 knots in Adyar rivermouth; mobilizing 2 hovercrafts for fast evacuation.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=15,
                target_entity="Coast Guard Marine Station",
                estimated_completion_min=8,
                created_at=now_str,
                updated_at=now_str,
            )
        ]
