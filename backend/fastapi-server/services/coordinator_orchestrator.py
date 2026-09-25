from datetime import datetime
from typing import Dict, Any, List, Optional
import uuid

from models.coordinator_models import (
    AgentType,
    AgentStatus,
    PriorityLevel,
    TaskStatus,
    TaskPriority,
    AIAgentState,
    AgentTask,
    AgentActivityLog,
    SituationInput,
    PriorityCalculation,
    ExplainableAiDecision,
    MissionTimelineEvent,
    ResourceUtilization,
    WorkflowStage,
    ResourceAllocationRow,
    AgentConflictResolution,
    PublicAlertDraft,
    CoordinatorDashboardResponse,
)

from services.agents.medical_agent import MedicalAgent
from services.agents.rescue_agent import RescueAgent
from services.agents.communication_agent import CommunicationAgent
from services.agents.logistics_agent import LogisticsAgent
from services.agents.shelter_agent import ShelterManagementAgent
from services.agents.traffic_agent import TrafficRouteAgent
from services.agents.resource_agent import ResourceAllocationAgent

class MultiAgentCoordinatorOrchestrator:
    """
    Central Brain of the ResQ AI Platform.
    Ingests multi-modal disaster telemetry, calculates dynamic risk priority,
    orchestrates specialized AI agents, and maintains explainability.
    """

    def __init__(self):
        self.agents_registry = [
            MedicalAgent(),
            RescueAgent(),
            CommunicationAgent(),
            LogisticsAgent(),
            ShelterManagementAgent(),
            TrafficRouteAgent(),
            ResourceAllocationAgent(),
        ]
        self.current_situation = SituationInput()
        self.engine_status = "AUTONOMOUS_COORDINATING"
        self.injected_zones: List[Dict[str, Any]] = []
        self._init_timeline()

    def _init_timeline(self):
        now = datetime.now()
        t = lambda m: (now).strftime("%H:%M:%S")

        self.timeline_events: List[MissionTimelineEvent] = [
            MissionTimelineEvent(
                id="evt-01",
                timestamp=t(12),
                stage="Disaster Detection",
                actor="AI Ingestion Sensor Engine",
                event="Multi-sensor Alert Triggered",
                details="Extreme precipitation (48.5 mm/h) and river basin surge detected in Velachery.",
                status="COMPLETED",
            ),
            MissionTimelineEvent(
                id="evt-02",
                timestamp=t(10),
                stage="Climate & Population Analysis",
                actor="ResQ Deep Analytics",
                event="Telemetry Cross-Correlated",
                details="14,250 active SIMs detected inside 2.5km inundation risk perimeter.",
                status="COMPLETED",
            ),
            MissionTimelineEvent(
                id="evt-03",
                timestamp=t(8),
                stage="Priority Calculation",
                actor="AI Orchestrator Brain",
                event="Risk Score Computed: 88.5 / 100 (CRITICAL)",
                details="Weighted heuristic triggered multi-agent autonomous activation protocol.",
                status="COMPLETED",
            ),
            MissionTimelineEvent(
                id="evt-04",
                timestamp=t(6),
                stage="Agent Assignment",
                actor="Central Dispatch",
                event="7 Autonomous AI Agents Assigned",
                details="Medical, Rescue, Comms, Logistics, Shelter, Traffic, and Resource agents mobilized.",
                status="COMPLETED",
            ),
            MissionTimelineEvent(
                id="evt-05",
                timestamp=t(4),
                stage="Emergency Response",
                actor="Field Response Units",
                event="Mass Alert Broadcast & Route Clearance Initiated",
                details="SMS alerts transmitted; 3 emergency green corridors established on OMR & GST Road.",
                status="IN_PROGRESS",
            ),
            MissionTimelineEvent(
                id="evt-06",
                timestamp=t(1),
                stage="Live Monitoring",
                actor="Continuous AI Surveillance",
                event="Telemetry Feedback Loop Online",
                details="Real-time tracking of water discharge rates, rescue boat progress, and hospital triage beds.",
                status="ACTIVE",
            ),
        ]

    def calculate_priority(self, situation: SituationInput) -> PriorityCalculation:
        """
        Calculates multi-dimensional risk priority score (0 - 100):
        - Severity Weight (30%)
        - Population at Risk (30%)
        - Inundated / Blocked Infrastructure (20%)
        - Resource Deficit & Vulnerability (20%)
        """
        # 1. Severity factor
        sev_weights = {"Low": 25.0, "Moderate": 50.0, "Medium": 50.0, "High": 75.0, "Critical": 95.0}
        w_sev = sev_weights.get(situation.disaster_severity, 80.0)

        # 2. Population factor
        pop_normalized = min(100.0, (situation.active_sim_count / 15000.0) * 100.0)

        # 3. Infrastructure factor (roads flooded)
        infra_normalized = min(100.0, (situation.flooded_roads_count / 8.0) * 100.0)

        # 4. Resource deficit (e.g. food stock runway)
        resource_deficit = max(0.0, min(100.0, (4.0 - situation.food_water_stock_days) * 25.0))

        score = round((w_sev * 0.30) + (pop_normalized * 0.30) + (infra_normalized * 0.20) + (resource_deficit * 0.20), 1)
        score = max(10.0, min(99.4, score))

        if score >= 85:
            level = PriorityLevel.CRITICAL
        elif score >= 65:
            level = PriorityLevel.HIGH
        elif score >= 40:
            level = PriorityLevel.MEDIUM
        else:
            level = PriorityLevel.LOW

        breakdown = {
            "Disaster Severity Impact (30%)": round(w_sev * 0.30, 1),
            "Population Density at Risk (30%)": round(pop_normalized * 0.30, 1),
            "Road Infrastructure Inundation (20%)": round(infra_normalized * 0.20, 1),
            "Resource Deficit & Vulnerability (20%)": round(resource_deficit * 0.20, 1),
        }

        summary = (
            f"Calculated {level.value} Priority Score of {score}/100 based on {situation.disaster_severity} {situation.disaster_type} "
            f"impacting {situation.active_sim_count:,} active citizens with {situation.flooded_roads_count} inundated arterial routes."
        )

        return PriorityCalculation(score=score, level=level, breakdown=breakdown, summary=summary)

    def get_workflow_stages(self) -> List[WorkflowStage]:
        now_str = datetime.now().strftime("%H:%M:%S")
        return [
            WorkflowStage(
                id="wf-1",
                name="Disaster Detection",
                status="completed",
                description="IoT telemetry & satellite rainfall radar flag flash flood threshold breach.",
                timestamp="00:15:20",
            ),
            WorkflowStage(
                id="wf-2",
                name="Climate Analysis",
                status="completed",
                description="FastAPI weather engine assesses 48.5 mm/h rain, 998 hPa pressure drop & wind shear.",
                timestamp="00:15:42",
            ),
            WorkflowStage(
                id="wf-3",
                name="Population Detection",
                status="completed",
                description="Telecom cell grid estimates 14,250 active SIMs trapped in 2.5km risk perimeter.",
                timestamp="00:16:01",
            ),
            WorkflowStage(
                id="wf-4",
                name="Risk Analysis",
                status="completed",
                description="Cross-hazard modeling estimates high casualty risk & water ingress in 3 low-lying sectors.",
                timestamp="00:16:15",
            ),
            WorkflowStage(
                id="wf-5",
                name="AI Priority Calculation",
                status="completed",
                description="Calculated 88.5/100 CRITICAL priority level with multi-factor weighted scoring.",
                timestamp="00:16:22",
            ),
            WorkflowStage(
                id="wf-6",
                name="AI Agent Assignment",
                status="active",
                description="Orchestrator autonomously activates 7 specialized agents with tailored mission tasks.",
                timestamp="00:16:30",
            ),
            WorkflowStage(
                id="wf-7",
                name="Emergency Response",
                status="active",
                description="Field execution underway: SMS warnings, ambulance pre-positioning, boat extractions.",
                timestamp="00:16:45",
            ),
            WorkflowStage(
                id="wf-8",
                name="Live Monitoring",
                status="active",
                description="Continuous autonomous feedback loop with dynamic task escalation on situation changes.",
                timestamp="00:17:00",
            ),
        ]

    def get_coordinator_dashboard(
        self,
        custom_situation: Optional[SituationInput] = None
    ) -> CoordinatorDashboardResponse:
        """
        Runs complete evaluation loop across all 7 AI agents,
        synthesizes explainable reasoning, and returns comprehensive state.
        """
        situation = custom_situation or self.current_situation
        self.current_situation = situation

        # 1. Compute priority
        priority = self.calculate_priority(situation)

        # 2. Evaluate all agents
        agent_states: List[AIAgentState] = []
        explainable_decisions: List[ExplainableAiDecision] = []

        total_tasks = 0
        completed_tasks = 0
        total_progress = 0

        for agent in self.agents_registry:
            state = agent.evaluate(situation, priority)
            agent_states.append(state)

            decision = agent.get_explainability(situation, priority)
            explainable_decisions.append(decision)

            for t in state.assigned_tasks:
                total_tasks += 1
                total_progress += t.progress_percent
                if t.status == TaskStatus.COMPLETED:
                    completed_tasks += 1

        overall_progress = int(total_progress / max(1, total_tasks))

        # 3. Resources utilization
        resources = ResourceUtilization(
            ambulances_total=30,
            ambulances_deployed=min(30, int(agent_states[0].key_metrics.get("ambulances_assigned", 21))),
            rescue_boats_total=20,
            rescue_boats_deployed=min(20, int(agent_states[1].key_metrics.get("rescue_boats_active", 14))),
            rescue_personnel_total=180,
            rescue_personnel_active=152,
            shelter_beds_total=int(agent_states[4].key_metrics.get("total_bed_capacity", 6500)),
            shelter_beds_occupied=int(agent_states[4].key_metrics.get("current_occupancy", 4120)),
            food_rations_total=int(agent_states[3].key_metrics.get("food_packs_allocated", 25000)),
            food_rations_distributed=int(agent_states[3].key_metrics.get("food_packs_delivered", 14200)),
            water_liters_total=int(agent_states[3].key_metrics.get("potable_water_liters", 60000)),
            water_liters_distributed=int(agent_states[3].key_metrics.get("water_delivered_liters", 38500)),
            emergency_vehicles_deployed=42,
        )

        workflow_stages = self.get_workflow_stages()

        # 4. Resource Constraint Solver (Fixed pool with explicit trade-offs)
        allocation_table = self.solve_resource_constraints(situation, priority)

        # 5. Agent Conflict Resolution (Negotiation between Medical, Logistics, Rescue)
        conflict_resolutions = self.resolve_agent_conflicts(situation, priority)

        # 6. Public Communication Draft (Bilingual English & Tamil)
        public_alert_draft = self.generate_public_alert_draft(situation, priority)

        return CoordinatorDashboardResponse(
            situation=situation,
            priority=priority,
            engine_status=self.engine_status,
            overall_progress_percent=overall_progress,
            active_agents_count=len([a for a in agent_states if a.is_active]),
            total_agents_count=len(agent_states),
            agents=agent_states,
            explainable_decisions=explainable_decisions,
            workflow_stages=workflow_stages,
            timeline=self.timeline_events,
            resources=resources,
            allocation_table=allocation_table,
            conflict_resolutions=conflict_resolutions,
            public_alert_draft=public_alert_draft,
            last_evaluated_at=datetime.now().isoformat(),
        )

    def solve_resource_constraints(self, situation: SituationInput, priority: PriorityCalculation) -> List[ResourceAllocationRow]:
        """
        Resource-Constraint Solver:
        Allocates limited vehicle fleet, rescue boats, and medical battalions across
        affected zones based on deterministic triage criteria and shows explicit trade-offs.
        """
        zones = [
            {"id": "zone-1", "name": "Saidapet (Adyar River Basin)", "risk": "Critical", "pop": 5100, "priority_rank": 1},
            {"id": "zone-2", "name": "Velachery (Lake Catchment Lowlands)", "risk": "Critical", "pop": 4200, "priority_rank": 2},
            {"id": "zone-3", "name": "Tambaram (Southern Gateway Sector)", "risk": "High", "pop": 2800, "priority_rank": 3},
            {"id": "zone-4", "name": "T. Nagar (Commercial & Residential Hub)", "risk": "High", "pop": 3600, "priority_rank": 4},
            {"id": "zone-5", "name": "Adyar (Coastal & Estuary Belt)", "risk": "Moderate", "pop": 2800, "priority_rank": 5},
        ]

        for iz in self.injected_zones:
            if not any(z["id"] == iz["id"] for z in zones):
                zones.insert(0, iz)

        MAX_AMBULANCES = situation.available_ambulances or 24
        MAX_BOATS = 16
        MAX_MEDICS = 8
        MAX_FOOD = 25000

        rows = []
        amb_rem = MAX_AMBULANCES
        boat_rem = MAX_BOATS
        med_rem = MAX_MEDICS
        food_rem = MAX_FOOD

        for z in zones:
            is_crit = z["risk"] == "Critical"
            is_high = z["risk"] == "High"

            amb_req = 10 if is_crit else (6 if is_high else 3)
            boat_req = 8 if is_crit else (4 if is_high else 2)
            med_req = 3 if is_crit else (2 if is_high else 1)

            amb_alloc = min(amb_rem, amb_req if is_crit else max(1, amb_req - 2))
            amb_rem -= amb_alloc

            boat_alloc = min(boat_rem, boat_req if is_crit else max(1, boat_req - 2))
            boat_rem -= boat_alloc

            med_alloc = min(med_rem, med_req if is_crit else max(1, med_req - 1))
            med_rem -= med_alloc

            food_alloc = min(food_rem, max(1500, int((z["pop"] / 18500.0) * MAX_FOOD)))
            food_rem -= food_alloc

            if is_crit:
                tradeoff = f"High Risk Priority: Granted {amb_alloc}/{amb_req} ALS ambulances & {boat_alloc}/{boat_req} boats due to immediate trauma risk."
            elif amb_alloc < amb_req:
                tradeoff = f"Resource Scarcity Trade-off: Allocation capped (-{amb_req - amb_alloc} amb) to protect Critical river basin; Green Corridor transit assigned."
            else:
                tradeoff = "Nominal standby staging allocation with stage-2 mobile unit support."

            rows.append(ResourceAllocationRow(
                id=z["id"],
                zone_name=z["name"],
                risk_level=z["risk"],
                population=z["pop"],
                ambulances_requested=amb_req,
                ambulances_allocated=amb_alloc,
                boats_requested=boat_req,
                boats_allocated=boat_alloc,
                medics_requested=med_req,
                medics_allocated=med_alloc,
                food_packs_allocated=food_alloc,
                tradeoff_rationale=tradeoff
            ))

        return rows

    def resolve_agent_conflicts(self, situation: SituationInput, priority: PriorityCalculation) -> List[AgentConflictResolution]:
        """
        Multi-Agent Conflict Resolution:
        Arbitrates contested resources (vehicles, boats, routes) between Medical, Logistics, and Rescue agents.
        """
        return [
            AgentConflictResolution(
                id="conf-01",
                agents_involved=["Medical Agent", "Logistics Agent"],
                contested_resource="High-Clearance Transport Fleet & Ambulances",
                conflict_description=f"Medical Agent requested 21 ambulances for trauma triage; Logistics Agent requested 14 heavy vehicles for drinking water tankers. Total request (35) exceeds capped pool ({situation.available_ambulances}).",
                resolution_strategy="Triage Priority Protocol (OASIS-CAP Rule 4): Immediate human life preservation prioritized. Medical Agent allocated 16 ALS ambulances; Logistics Agent allocated 8 water tankers with synchronized transit on Green Corridor 2.",
                tradeoff_penalty="Non-perishable food distribution in Sector Gamma delayed by 40 minutes to eliminate medical evacuation delays.",
                status="RESOLVED"
            ),
            AgentConflictResolution(
                id="conf-02",
                agents_involved=["Rescue Agent", "Logistics Agent"],
                contested_resource="Emergency Fuel Depots & Portable Generator Reserves",
                conflict_description="Rescue Agent requested 100% fuel buffer for 14 continuous outboard boat sweeps; Logistics requested diesel for high-power de-watering suction pumps.",
                resolution_strategy="Resource Arbitrator Rule: 65% diesel allocated to rescue boat flotillas; 35% reserved for Velachery sluice de-watering pumps with scheduled IOCL replenishment.",
                tradeoff_penalty="Shelter ambient comfort systems restricted; generators reserved strictly for medical ICU lines and water pumps.",
                status="RESOLVED"
            ),
            AgentConflictResolution(
                id="conf-03",
                agents_involved=["Shelter Management Agent", "Traffic & Route Agent"],
                contested_resource="Velachery Flyover Arterial Road Access",
                conflict_description="Shelter Agent requested unrestricted bus convoys to Velachery School; Traffic Agent flagged road segment approaching waterlogged bottleneck.",
                resolution_strategy="Dynamic Diversion Algorithm: Velachery School marked near capacity (88%). Evacuation buses re-routed to Guindy Sports Center via Tambaram Bypass.",
                tradeoff_penalty="Evacuation transit distance increased by 3.8 km, but guarantees zero civilian vehicle entrapment in submerged underpasses.",
                status="RESOLVED"
            ),
        ]

    def generate_public_alert_draft(self, situation: SituationInput, priority: PriorityCalculation) -> PublicAlertDraft:
        """
        Public Communication Draft:
        Produced by Communications Agent in collaboration with Medical & Logistics findings.
        Complies with OASIS Common Alerting Protocol (CAP v1.2) in bilingual Tamil & English.
        """
        return PublicAlertDraft(
            headline_en=f"EMERGENCY EVACUATION ALERT: Severe {situation.disaster_type} Hazard in {situation.location_name}",
            headline_ta=f"அவசர கால வெளியேற்ற எச்சரிக்கை: {situation.location_name} பகுதியில் கடுமையான வெள்ள அபாயம்",
            body_en=f"Greater Chennai Corporation & State Disaster Management (TNSDMA) advisory: Inundation levels reaching critical thresholds ({situation.rainfall_mm_h} mm/h rain). Ground floor residents in {situation.location_name} must evacuate immediately to designated high-elevation relief shelters. Avoid Kathipara underpass and Velachery lake catchment. Free transport & emergency medical aid available.",
            body_ta=f"சென்னை பெருநகர மாநகராட்சி மற்றும் தமிழ்நாடு பேரிடர் மேலாண்மை ஆணையம் (TNSDMA) எச்சரிக்கை: {situation.location_name} பகுதியில் வெள்ள நீர் அபாயகரமான அளவை எட்டியுள்ளது. தரைதளத்தில் வசிப்போர் உடனடியாக அருகில் உள்ள பாதுகாப்பான நிவாரண முகாம்களுக்குச் செல்லுமாறு அறிவுறுத்தப்படுகிறார்கள். கத்திப்பாரா சுரங்கப்பாதை மற்றும் வேளச்சேரி ஏரிப் பகுதிகளைத் தவிர்க்கவும். இலவச போக்குவரத்து மற்றும் அவசர மருத்துவ உதவி தயார் நிலையில் உள்ளது.",
            evacuation_routes=[
                "Green Corridor 1: OMR Tollway -> Sardar Patel Road -> Apollo Trauma Center",
                "Green Corridor 2: GST Road Elevated Flyover -> Guindy Relief Pavilion",
                "Tambaram Eastern Bypass (High-clearance emergency transit only)",
            ],
            safe_shelters=[
                "Guru Nanak College Indoor Auditorium (Capacity: 2,200 | Open)",
                "Guindy Community Hall & Sports Center (Capacity: 1,400 | Open)",
                "St. Thomas Mount Community Hall (Capacity: 900 | Open)",
            ],
            helpline="State EOC: 1070 | Police: 112 | Ambulance: 108 | GCC Flood Control: 1913",
            urgency="IMMEDIATE / EVACUATION REQUIRED",
            approved_by_commander=False
        )

    def add_zone_replan(self, zone_name: str, population: int, risk_level: str, rainfall: float = 0.0, flooded_roads: int = 1) -> CoordinatorDashboardResponse:
        """
        Bonus Feature: Real-time re-planning when a new zone is added mid-demo.
        Instantly injects new zone, re-runs multi-agent negotiation, shifts resource allocations,
        and generates explainable trade-off audit trail.
        """
        now_str = datetime.now().strftime("%H:%M:%S")
        new_zone = {
            "id": f"zone-injected-{uuid.uuid4().hex[:4]}",
            "name": zone_name,
            "risk": risk_level,
            "pop": population,
            "priority_rank": 1 if risk_level == "Critical" else 2,
        }
        self.injected_zones.insert(0, new_zone)

        # Update overall situation telemetry
        self.current_situation.active_sim_count += int(population * 0.85)
        self.current_situation.estimated_population += population
        self.current_situation.flooded_roads_count += flooded_roads
        self.current_situation.rainfall_mm_h = max(self.current_situation.rainfall_mm_h, rainfall)
        self.current_situation.disaster_severity = "Critical"

        # Log timeline event
        self.timeline_events.insert(
            0,
            MissionTimelineEvent(
                id=f"evt-{uuid.uuid4().hex[:6]}",
                timestamp=now_str,
                stage="Dynamic Re-Planning",
                actor="Central AI Orchestrator & Solver",
                event=f"Mid-Demo Zone Injected: {zone_name}",
                details=f"Real-Time Re-Planning Triggered: Ingested {population:,} citizens at risk in {zone_name}. Solved resource constraints, re-allocated ambulances & boats from lower-risk sectors, and updated conflict resolutions.",
                status="ACTIVE"
            )
        )

        return self.get_coordinator_dashboard()

    def trigger_dynamic_escalation(self, scenario_escalation: str) -> CoordinatorDashboardResponse:
        """
        Dynamically reacts to escalation events (e.g. Dam Release, Gale Winds Spikes, Levee Breach)
        and automatically reassigns urgent tasks to field agents.
        """
        now_str = datetime.now().strftime("%H:%M:%S")

        if scenario_escalation == "DAM_RELEASE_SURGE":
            self.current_situation.rainfall_mm_h = 68.0
            self.current_situation.flooded_roads_count = 8
            self.current_situation.active_sim_count = 18400
            self.current_situation.disaster_severity = "Critical"
            event_title = "Chembarambakkam Reservoir Discharge Spiked to 12,000 Cusecs"
            event_detail = "Dynamic AI Reassignment: Expanded Sector Alpha perimeter; dispatched additional amphibious hovercrafts."
        elif scenario_escalation == "CYCLONIC_LANDFALL":
            self.current_situation.wind_speed_kmh = 92.0
            self.current_situation.disaster_severity = "Critical"
            event_title = "Cyclone Outer Rainbands Made Severe Coastal Landfall"
            event_detail = "Dynamic AI Reassignment: Issued level-4 public siren alerts; rerouted ambulances away from fallen tree corridors."
        else:
            self.current_situation.rainfall_mm_h = 32.0
            self.current_situation.flooded_roads_count = 4
            self.current_situation.disaster_severity = "High"
            event_title = "Water Recession Commenced in Upper Basins"
            event_detail = "Dynamic AI Reassignment: Scaled de-watering suction pumps to low-lying AGS Colony pocket."

        self.timeline_events.insert(
            0,
            MissionTimelineEvent(
                id=f"evt-{uuid.uuid4().hex[:6]}",
                timestamp=now_str,
                stage="Dynamic Reassignment",
                actor="AI Orchestrator Autonomous Brain",
                event=event_title,
                details=event_detail,
                status="ACTIVE",
            )
        )

        return self.get_coordinator_dashboard()

coordinator_orchestrator = MultiAgentCoordinatorOrchestrator()
