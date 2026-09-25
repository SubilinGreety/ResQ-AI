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

class LogisticsAgent(BaseDisasterAgent):
    def __init__(self):
        super().__init__(
            agent_id="agent-logistics-04",
            name="Relief Logistics & Supply Chain Agent",
            agent_type=AgentType.LOGISTICS
        )

    def evaluate(self, situation: SituationInput, priority: PriorityCalculation) -> AIAgentState:
        now_str = datetime.now().strftime("%H:%M:%S")
        pop = situation.estimated_population
        food_packs_needed = int(pop * 1.5)
        water_litres_needed = int(pop * 3.5)

        tasks = [
            AgentTask(
                id="task-log-401",
                title="Mobilize Food Ration Packs (MREs) from Central Civil Supplies Godown",
                description=f"Requisitioned {food_packs_needed:,} ready-to-eat dry ration and biscuit packs from Koyambedu and Madhavaram warehouses.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=80,
                target_entity=f"{food_packs_needed:,} Food Ration Units",
                estimated_completion_min=15,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-log-402",
                title="Dispatch Potable Drinking Water Tankers & Reverse Osmosis Cans",
                description="Deployed 8 high-clearance water tankers (each 9,000L) and 4,000 twenty-liter sealed water cans to designated relief camps.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=74,
                target_entity=f"{water_litres_needed:,} Litres Potable Water",
                estimated_completion_min=18,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-log-403",
                title="Heavy Cargo Transportation & Drone Aerial Delivery Corridor",
                description="Routing 6 multi-axle all-terrain trucks via Bypass Green Corridor; priming 4 heavy-lift UAVs for medicine drops.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                progress_percent=65,
                target_entity="Transport Fleet (6 Trucks + 4 UAVs)",
                estimated_completion_min=22,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-log-404",
                title="Continuous Shortage Identification & Replenishment Buffer",
                description="Identified 18% deficit in baby food and feminine hygiene packets; initiated emergency requisition with Tamil Nadu Civil Supplies Corp.",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.NORMAL,
                progress_percent=100,
                target_entity="Shortage Audit Engine",
                estimated_completion_min=0,
                created_at=now_str,
                updated_at=now_str,
            ),
        ]

        activity_logs = [
            AgentActivityLog(timestamp=now_str, action="Shortage Audit", detail=f"Detected critical deficit: local food stock reserve at {situation.food_water_stock_days} days (below safe 4-day threshold).", severity="ALERT"),
            AgentActivityLog(timestamp=now_str, action="Supply Convoys Dispatched", detail="Convoys Alpha-1 and Alpha-2 en route with 14,200 food packs and 38,500L clean water.", severity="SUCCESS"),
            AgentActivityLog(timestamp=now_str, action="Drone Aerial Drops Prepped", detail="4 hexacopter UAVs on standby at Guindy Race Course for isolated pocket supply.", severity="INFO"),
        ]

        metrics = {
            "food_packs_allocated": 25000,
            "food_packs_delivered": 14200,
            "potable_water_liters": 60000,
            "water_delivered_liters": 38500,
            "trucks_in_transit": 6,
            "relief_drones_active": 4,
            "identified_shortages": ["Infant Formula", "Feminine Hygiene Packs", "Water Purification Tablets (10k needed)"],
            "stock_runway_hours": 36,
        }

        reason = "AI activated Logistics Agent due to food shortage & drinking water reserve depletion in inundated sectors."

        return AIAgentState(
            id=self.agent_id,
            name=self.name,
            type=self.agent_type,
            status=AgentStatus.ACTIVE,
            is_active=True,
            confidence=0.95,
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
            primary_trigger="Stock Reserves Dropped Below 4 Days Threshold",
            reasoning="AI activated Logistics Agent due to food shortage & drinking water reserve depletion in inundated sectors.",
            impact_factor="Prevents famine, dehydration, and waterborne disease outbreaks in relief camps"
        )

    def dynamic_reassign(self, situation: SituationInput, new_threat_level: str) -> List[AgentTask]:
        now_str = datetime.now().strftime("%H:%M:%S")
        return [
            AgentTask(
                id="task-log-405-reassigned",
                title="Emergency Air-Drop of Water Purification Tablets & Electrolytes",
                description="Fast-tracking helicopter drop of 20,000 chlorine tablets into marooned pockets of Ram Nagar.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=20,
                target_entity="Air Force Logistics Wing",
                estimated_completion_min=12,
                created_at=now_str,
                updated_at=now_str,
            )
        ]
