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

class ShelterManagementAgent(BaseDisasterAgent):
    def __init__(self):
        super().__init__(
            agent_id="agent-shelter-05",
            name="Shelter Allocation & Capacity Agent",
            agent_type=AgentType.SHELTER
        )

    def evaluate(self, situation: SituationInput, priority: PriorityCalculation) -> AIAgentState:
        now_str = datetime.now().strftime("%H:%M:%S")

        shelters = [
            {"id": "SH-01", "name": "Guru Nanak College Indoor Auditorium", "capacity": 2200, "occupied": 1640, "status": "Open", "elevation_m": 12.5},
            {"id": "SH-02", "name": "Velachery Govt Higher Secondary School", "capacity": 1500, "occupied": 1320, "status": "Near Capacity", "elevation_m": 11.2},
            {"id": "SH-03", "name": "Guindy Community Hall & Sports Center", "capacity": 1400, "occupied": 780, "status": "Open", "elevation_m": 14.8},
            {"id": "SH-04", "name": "St. Thomas Mount Community Hall", "capacity": 900, "occupied": 380, "status": "Open", "elevation_m": 24.0},
            {"id": "SH-05", "name": "IIT Madras Vanavani School Multi-Purpose Hall", "capacity": 500, "occupied": 0, "status": "Reserve Ready", "elevation_m": 15.5},
        ]

        total_cap = sum(s["capacity"] for s in shelters)
        total_occ = sum(s["occupied"] for s in shelters)
        occupancy_pct = round((total_occ / total_cap) * 100, 1)

        tasks = [
            AgentTask(
                id="task-she-501",
                title="Identify Elevated Flood-Safe Shelters & Structural Verification",
                description="Verified 5 designated emergency relief shelters above 11m elevation with generator backups and clean sanitation plumbing.",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.URGENT,
                progress_percent=100,
                target_entity="5 Emergency Shelters",
                estimated_completion_min=0,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-she-502",
                title="Dynamic Population Balancing & Overflow Diversion",
                description="Diverting incoming evacuees from Velachery Govt School (88% full) to Guindy Sports Center (55% full) and St. Thomas Hall (42% full).",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                progress_percent=80,
                target_entity="Evacuee Routing Algorithm",
                estimated_completion_min=8,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-she-503",
                title="Install Temporary Hygiene & Sanitation Blocks",
                description="Deploying 24 mobile bio-toilets and mobile solar water heaters at Guru Nanak College shelter.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.NORMAL,
                progress_percent=65,
                target_entity="Sanitation Task Force",
                estimated_completion_min=25,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-she-504",
                title="Activate Reserve Shelter (IIT Madras Hall)",
                description="Pre-registering bedding and emergency power backup at reserve shelter if occupancy crosses 75%.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.NORMAL,
                progress_percent=40,
                target_entity="Reserve Capacity Pool",
                estimated_completion_min=30,
                created_at=now_str,
                updated_at=now_str,
            ),
        ]

        activity_logs = [
            AgentActivityLog(timestamp=now_str, action="Capacity Census Updated", detail=f"Total capacity: {total_cap:,} cots | Occupied: {total_occ:,} ({occupancy_pct}% full).", severity="INFO"),
            AgentActivityLog(timestamp=now_str, action="Crowd Rerouting Active", detail="Velachery Govt School nearing saturation. Rerouting buses to Guindy Community Hall.", severity="WARNING"),
            AgentActivityLog(timestamp=now_str, action="Sanitation Blocks Deployed", detail="24 mobile bio-toilets operational at Guru Nanak College.", severity="SUCCESS"),
        ]

        metrics = {
            "total_shelters": len(shelters),
            "total_bed_capacity": total_cap,
            "current_occupancy": total_occ,
            "overall_occupancy_percent": occupancy_pct,
            "shelter_list": shelters,
            "remaining_headroom": total_cap - total_occ,
        }

        reason = f"AI activated Shelter Management Agent to dynamically balance occupancy across {len(shelters)} safe shelters ({total_occ:,}/{total_cap:,} beds) and prevent overcrowding."

        return AIAgentState(
            id=self.agent_id,
            name=self.name,
            type=self.agent_type,
            status=AgentStatus.ACTIVE,
            is_active=True,
            confidence=0.97,
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
            primary_trigger="Mass Evacuation Load on Community Shelters",
            reasoning="AI activated Shelter Management Agent to dynamically balance occupancy across 5 flood-resilient relief centers and prevent overcrowding.",
            impact_factor="Safe dignified housing, protection from vector-borne disease, and crowd safety"
        )

    def dynamic_reassign(self, situation: SituationInput, new_threat_level: str) -> List[AgentTask]:
        now_str = datetime.now().strftime("%H:%M:%S")
        return [
            AgentTask(
                id="task-she-505-reassigned",
                title="Open Secondary Stadium Relief Annex",
                description="Rapid commissioning of Jawaharlal Nehru Indoor Stadium as mega-evacuation center for 5,000 additional residents.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=15,
                target_entity="Corporation Sports Authority",
                estimated_completion_min=20,
                created_at=now_str,
                updated_at=now_str,
            )
        ]
