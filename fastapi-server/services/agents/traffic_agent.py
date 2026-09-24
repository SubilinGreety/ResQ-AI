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

class TrafficRouteAgent(BaseDisasterAgent):
    def __init__(self):
        super().__init__(
            agent_id="agent-traffic-06",
            name="Traffic & Emergency Route Agent",
            agent_type=AgentType.TRAFFIC
        )

    def evaluate(self, situation: SituationInput, priority: PriorityCalculation) -> AIAgentState:
        now_str = datetime.now().strftime("%H:%M:%S")
        blocked_count = situation.flooded_roads_count

        blocked_corridors = [
            {"road": "Velachery Main Road (Near Lake)", "status": "Inundated", "water_depth_cm": 65, "clearance_time_est": "4h"},
            {"road": "Kathipara Underpass Grade Separator", "status": "Submerged", "water_depth_cm": 90, "clearance_time_est": "6h"},
            {"road": "Vyasarpadi Subway", "status": "Waterlogged", "water_depth_cm": 50, "clearance_time_est": "3h"},
            {"road": "Saidapet Maraimalai Adigal Bridge Incline", "status": "Heavy Congestion", "water_depth_cm": 25, "clearance_time_est": "1.5h"},
            {"road": "Inner Ring Road (St. Thomas Mount Junction)", "status": "Flooded Lane", "water_depth_cm": 45, "clearance_time_est": "2h"},
            {"road": "Medavakkam - Sholinganallur Link", "status": "Partial Waterlogging", "water_depth_cm": 35, "clearance_time_est": "2.5h"},
        ]

        green_corridors = [
            {"corridor": "Green Corridor 1: OMR Tollway -> Sardar Patel Rd -> Apollo Hospital", "status": "CLEAR", "eta_min": 14, "purpose": "Emergency Medical Priority"},
            {"corridor": "Green Corridor 2: GST Road Elevated Flyover -> Guindy Race Course", "status": "CLEAR", "eta_min": 18, "purpose": "Heavy Relief Trucks"},
            {"corridor": "Green Corridor 3: Tambaram Eastern Bypass -> Velachery Elevated", "status": "CLEAR", "eta_min": 12, "purpose": "NDRF Boat Carriers"},
        ]

        tasks = [
            AgentTask(
                id="task-traf-601",
                title="Telemetry Detection of Inundated Roads & Subways",
                description=f"Identified {blocked_count} impassable road segments via IoT flood sensors and Greater Chennai Corporation CCTV telemetry.",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.URGENT,
                progress_percent=100,
                target_entity=f"{blocked_count} Road Segments",
                estimated_completion_min=0,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-traf-602",
                title="Designate & Enforce Emergency Green Corridors",
                description="Synchronized traffic signal preemptions with Greater Chennai Traffic Police (GCTP) on OMR and GST Road for ambulances.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=88,
                target_entity="3 Green Corridors",
                estimated_completion_min=4,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-traf-603",
                title="Broadcast Dynamic Rerouting to Google Maps / Mappls & NavIC",
                description="Pushed GeoJSON road closure polygons and high-water warnings to consumer navigation engines to prevent civilian entrapment.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                progress_percent=92,
                target_entity="Live Navigation API Feed",
                estimated_completion_min=3,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-traf-604",
                title="Deploy Traffic Police Barricades & High-Water Warning Signs",
                description="Stationing 30 traffic wardens with flashing beacon warning signs at inundated underpass approaches.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.NORMAL,
                progress_percent=70,
                target_entity="Traffic Police Battalions",
                estimated_completion_min=12,
                created_at=now_str,
                updated_at=now_str,
            ),
        ]

        activity_logs = [
            AgentActivityLog(timestamp=now_str, action="Flooded Arteries Detected", detail=f"Flagged {blocked_count} submerged road links. Kathipara underpass closed to non-emergency traffic.", severity="ALERT"),
            AgentActivityLog(timestamp=now_str, action="Green Corridor Activated", detail="Green Corridor 1 open for critical care ambulances from Velachery to Apollo.", severity="SUCCESS"),
            AgentActivityLog(timestamp=now_str, action="Nav Feed Updated", detail="GeoJSON closure metadata transmitted to Map APIs. Civilian traffic diverted to bypass.", severity="INFO"),
        ]

        metrics = {
            "submerged_roads_count": blocked_count,
            "blocked_corridors": blocked_corridors[:blocked_count],
            "active_green_corridors": green_corridors,
            "average_emergency_transit_min": 14.5,
            "traffic_flow_efficiency": "64.2%",
        }

        reason = f"AI activated Traffic & Route Agent because {blocked_count} critical arterial routes are submerged, establishing emergency green corridors via elevated bypasses."

        return AIAgentState(
            id=self.agent_id,
            name=self.name,
            type=self.agent_type,
            status=AgentStatus.ACTIVE,
            is_active=True,
            confidence=0.96,
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
            primary_trigger=f"Inundation of {situation.flooded_roads_count} Major Arterial Road Corridors",
            reasoning=f"AI activated Traffic & Route Agent because {situation.flooded_roads_count} critical arterial routes are submerged, establishing emergency green corridors via elevated bypasses.",
            impact_factor="Enables zero-delay ambulance transit and prevents civilian vehicles from drowning in underpasses"
        )

    def dynamic_reassign(self, situation: SituationInput, new_threat_level: str) -> List[AgentTask]:
        now_str = datetime.now().strftime("%H:%M:%S")
        return [
            AgentTask(
                id="task-traf-605-reassigned",
                title="Emergency Reversible Lane Setup on Outer Ring Road",
                description="Converting northbound lanes of ORR into dual-flow emergency-only rapid transit artery.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=25,
                target_entity="Highways Department",
                estimated_completion_min=10,
                created_at=now_str,
                updated_at=now_str,
            )
        ]
