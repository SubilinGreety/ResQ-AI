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

class ResourceAllocationAgent(BaseDisasterAgent):
    def __init__(self):
        super().__init__(
            agent_id="agent-resource-07",
            name="Resource & Manpower Allocation Agent",
            agent_type=AgentType.RESOURCE
        )

    def evaluate(self, situation: SituationInput, priority: PriorityCalculation) -> AIAgentState:
        now_str = datetime.now().strftime("%H:%M:%S")

        equipment = [
            {"name": "Heavy Diesel De-Watering Pumps (100 HP)", "total": 24, "deployed": 18, "status": "Operational"},
            {"name": "Inflatable Motorized Rafts (Gemini)", "total": 20, "deployed": 16, "status": "In Water"},
            {"name": "Mobile Silent Diesel Generators (125 kVA)", "total": 15, "deployed": 12, "status": "Active Powering Shelters"},
            {"name": "Tactical Tree Cutting Chainsaws & Winches", "total": 45, "deployed": 38, "status": "Clearing Roads"},
            {"name": "High-Output Mast Night Floodlights", "total": 30, "deployed": 24, "status": "Illuminating Rescue Zones"},
        ]

        manpower = [
            {"role": "NDRF & SDRF Tactical Rescue Specialists", "available": 180, "deployed": 152},
            {"role": "Paramedics & Emergency Medical Technicians", "available": 65, "deployed": 48},
            {"role": "Disaster Relief Volunteers & Civil Defense", "available": 240, "deployed": 185},
            {"role": "Greater Chennai Corporation Engineering Staff", "available": 90, "deployed": 74},
        ]

        tasks = [
            AgentTask(
                id="task-res-701",
                title="Deploy 18 High-Flow De-Watering Pumps to Critical Basins",
                description="Stationing 100 HP diesel suction pumps at Velachery Lake sluice gates and AGS Colony culvert to accelerate drainage.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=85,
                target_entity="18 De-Watering Pumps",
                estimated_completion_min=6,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-res-702",
                title="Mobilize Manpower Shift Roster & Rest Rotations",
                description="Coordinating 459 active personnel across 8-hour operational shifts with hot meals and medical rehydration.",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.HIGH,
                progress_percent=100,
                target_entity="459 Emergency Personnel",
                estimated_completion_min=0,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-res-703",
                title="Distribute Silent Diesel Generators to Shelters & Water Works",
                description="Powering water treatment pumps and ICU backup lines at Velachery and Guindy community relief camps.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                progress_percent=80,
                target_entity="12 Heavy Generators",
                estimated_completion_min=10,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-res-704",
                title="Fuel Supply Logistics & Heavy Equipment Readiness",
                description="Securing 15,000 litres of diesel reserves with Indian Oil Corporation for non-stop generator and boat operation.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.NORMAL,
                progress_percent=60,
                target_entity="IOCL Emergency Fuel Tanker",
                estimated_completion_min=16,
                created_at=now_str,
                updated_at=now_str,
            ),
        ]

        activity_logs = [
            AgentActivityLog(timestamp=now_str, action="Equipment Mobilized", detail="18 heavy pumps and 12 generators running at peak capacity.", severity="SUCCESS"),
            AgentActivityLog(timestamp=now_str, action="Manpower Dispatched", detail="459 frontline personnel actively assigned across all response zones.", severity="INFO"),
            AgentActivityLog(timestamp=now_str, action="Fuel Reserve Secured", detail="15,000L diesel buffer established at Guindy staging depot.", severity="INFO"),
        ]

        metrics = {
            "equipment_summary": equipment,
            "manpower_summary": manpower,
            "total_deployed_manpower": sum(m["deployed"] for m in manpower),
            "total_available_manpower": sum(m["available"] for m in manpower),
            "emergency_vehicles_active": 42,
            "equipment_utilization_rate": "84.6%",
            "fuel_reserve_hours": 48,
        }

        reason = "AI activated Resource Allocation Agent to deploy heavy de-watering pumps, tactical equipment, and coordinate 459 response personnel."

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
            primary_trigger="Critical Equipment & Manpower Scalability Threshold",
            reasoning="AI activated Resource Allocation Agent to deploy heavy de-watering pumps, tactical equipment, and coordinate 459 response personnel.",
            impact_factor="Powers operational infrastructure, accelerates flood drainage, and sustains frontline workers"
        )

    def dynamic_reassign(self, situation: SituationInput, new_threat_level: str) -> List[AgentTask]:
        now_str = datetime.now().strftime("%H:%M:%S")
        return [
            AgentTask(
                id="task-res-705-reassigned",
                title="Requisition Additional 10 Submersible Pumps from Port Trust",
                description="Requesting high-volume marine pumps from Chennai Port Trust for immediate bypass pumping.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=20,
                target_entity="Chennai Port Trust Fleet",
                estimated_completion_min=15,
                created_at=now_str,
                updated_at=now_str,
            )
        ]
