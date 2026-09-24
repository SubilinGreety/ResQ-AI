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

class MedicalAgent(BaseDisasterAgent):
    def __init__(self):
        super().__init__(
            agent_id="agent-medical-01",
            name="Medical Triage & Hospital Agent",
            agent_type=AgentType.MEDICAL
        )

    def evaluate(self, situation: SituationInput, priority: PriorityCalculation) -> AIAgentState:
        now_str = datetime.now().strftime("%H:%M:%S")
        is_critical = priority.score >= 70 or situation.disaster_severity in ["High", "Critical"]

        # Casualty estimation model
        severity_multiplier = {"Low": 0.005, "Moderate": 0.012, "Medium": 0.012, "High": 0.028, "Critical": 0.045}.get(
            situation.disaster_severity, 0.03
        )
        est_injured = int(situation.active_sim_count * severity_multiplier)
        est_critical_trauma = max(12, int(est_injured * 0.22))
        ambulances_needed = min(situation.available_ambulances, max(6, int(est_injured / 8)))

        tasks = [
            AgentTask(
                id="task-med-101",
                title="Identify Nearest Trauma Centers & Hospital Bed Availability",
                description="Queried Apollo OMR, Rajiv Gandhi Govt General Hospital, and MIOT International for critical care ICU & trauma beds.",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.URGENT,
                progress_percent=100,
                target_entity="5 Regional Hospitals",
                estimated_completion_min=0,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-med-102",
                title="Dispatch Advanced Life Support (ALS) Ambulances",
                description=f"Allocating {ambulances_needed} ambulances with paramedic triage teams to designated triage pickup points in Sector Alpha & Beta.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=78,
                target_entity=f"{ambulances_needed} Emergency Ambulances",
                estimated_completion_min=8,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-med-103",
                title="Deploy Rapid Field Medical Posts & Anti-Venom Kits",
                description="Setting up 2 inflatable field treatment clinics at Guru Nanak College shelter with IV fluids and hypothermia kits.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                progress_percent=60,
                target_entity="2 Field Clinics",
                estimated_completion_min=14,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-med-104",
                title="Establish Live Telemedicine Emergency Link",
                description="Linking local community doctors with Stanley Medical College trauma board for triage classification.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.NORMAL,
                progress_percent=45,
                target_entity="Telemedicine Hub",
                estimated_completion_min=18,
                created_at=now_str,
                updated_at=now_str,
            ),
        ]

        activity_logs = [
            AgentActivityLog(timestamp=now_str, action="Hospital Capacity Ping", detail=f"Confirmed 142 vacant ICU beds across Apollo and Rajiv Gandhi Hospital.", severity="INFO"),
            AgentActivityLog(timestamp=now_str, action="Casualty Estimate Calculated", detail=f"Estimated {est_injured} potential injured ({est_critical_trauma} high priority trauma cases).", severity="ALERT"),
            AgentActivityLog(timestamp=now_str, action="Fleet Dispatched", detail=f"Dispatched {ambulances_needed} ALS ambulances to Sector Alpha staging area.", severity="SUCCESS"),
        ]

        metrics = {
            "estimated_casualties": est_injured,
            "critical_trauma_cases": est_critical_trauma,
            "ambulances_assigned": ambulances_needed,
            "nearest_hospitals": [
                {"name": "Rajiv Gandhi Govt General Hospital", "distance_km": 11.2, "icu_beds": 48, "status": "Ready"},
                {"name": "Apollo Hospitals Greams Road", "distance_km": 9.4, "icu_beds": 32, "status": "Ready"},
                {"name": "MIOT International Manapakkam", "distance_km": 6.8, "icu_beds": 26, "status": "Trauma Ready"},
                {"name": "Kilpauk Medical College", "distance_km": 12.1, "icu_beds": 36, "status": "Ready"},
            ],
            "medical_supplies_status": "Adequate (48h Reserve)",
        }

        reason = f"AI analyzed the disaster and activated Medical Agent because of high injury probability (est. {est_injured} casualties in affected sectors)."

        return AIAgentState(
            id=self.agent_id,
            name=self.name,
            type=self.agent_type,
            status=AgentStatus.ACTIVE if is_critical else AgentStatus.ANALYZING,
            is_active=True,
            confidence=0.96,
            activation_reason=reason,
            key_metrics=metrics,
            assigned_tasks=tasks,
            activity_log=activity_logs,
        )

    def get_explainability(self, situation: SituationInput, priority: PriorityCalculation) -> ExplainableAiDecision:
        est_injured = int(situation.active_sim_count * 0.03)
        return ExplainableAiDecision(
            agent_type=self.agent_type,
            agent_name=self.name,
            activated=True,
            primary_trigger="Casualty & Trauma Risk Exceeded 25 Cases",
            reasoning=f"AI analyzed the disaster and activated Medical Agent because of high injury probability (est. {est_injured} casualties in affected sectors).",
            impact_factor="Direct preservation of human life & rapid ICU triage pre-positioning"
        )

    def dynamic_reassign(self, situation: SituationInput, new_threat_level: str) -> List[AgentTask]:
        now_str = datetime.now().strftime("%H:%M:%S")
        return [
            AgentTask(
                id="task-med-105-escalated",
                title="Mass Casualty Protocol (MCP) Activation",
                description="Emergency expansion: requisitioning additional 15 private cardiac ambulances and converting community halls into triage annexes.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=25,
                target_entity="State Emergency Fleet",
                estimated_completion_min=5,
                created_at=now_str,
                updated_at=now_str,
            )
        ]
