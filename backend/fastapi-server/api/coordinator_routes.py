from fastapi import APIRouter, Query, Body, HTTPException
from typing import Dict, Any, Optional

from models.coordinator_models import (
    CoordinatorDashboardResponse,
    SituationInput,
    PriorityCalculation,
    AIAgentState,
    MissionTimelineEvent,
    ResourceUtilization,
)
from services.coordinator_orchestrator import coordinator_orchestrator

router = APIRouter(prefix="/api/coordinator", tags=["Multi-Agent Coordinator"])

@router.get("/dashboard", response_model=CoordinatorDashboardResponse)
async def get_coordinator_dashboard():
    """
    Returns full state of the Multi-Agent Disaster Response Coordinator:
    AI decision engine status, active agents, assigned tasks, priority,
    mission progress, explainability decisions, workflow stages, and live timeline.
    """
    return coordinator_orchestrator.get_coordinator_dashboard()

@router.post("/evaluate", response_model=CoordinatorDashboardResponse)
async def evaluate_custom_situation(situation: SituationInput = Body(...)):
    """
    Feeds updated disaster situation into the AI Orchestrator brain,
    triggering re-calculation of priority and dynamic reassignment of agent tasks.
    """
    return coordinator_orchestrator.get_coordinator_dashboard(custom_situation=situation)

@router.post("/escalate", response_model=CoordinatorDashboardResponse)
async def trigger_escalation(
    scenario: str = Query("DAM_RELEASE_SURGE", description="Escalation scenario: DAM_RELEASE_SURGE, CYCLONIC_LANDFALL, RECESSION")
):
    """
    Simulates a dynamic situation change (e.g. dam water release or wind intensification)
    and demonstrates real-time autonomous reassignment of agents.
    """
    return coordinator_orchestrator.trigger_dynamic_escalation(scenario)

@router.get("/agents")
async def get_active_agents():
    """Returns list of all 7 specialized AI agents and their assigned tasks."""
    dashboard = coordinator_orchestrator.get_coordinator_dashboard()
    return {
        "active_count": dashboard.active_agents_count,
        "total_count": dashboard.total_agents_count,
        "agents": dashboard.agents,
    }

@router.get("/timeline")
async def get_mission_timeline():
    """Returns the live time-sequenced mission timeline."""
    return coordinator_orchestrator.timeline_events

@router.get("/resources", response_model=ResourceUtilization)
async def get_resource_usage():
    """Returns real-time resource allocation and deployment metrics."""
    dashboard = coordinator_orchestrator.get_coordinator_dashboard()
    return dashboard.resources

@router.get("/workflow")
async def get_workflow_diagram_stages():
    """Returns the 8 animated workflow stages with active statuses."""
    return coordinator_orchestrator.get_workflow_stages()

@router.post("/replan-zone", response_model=CoordinatorDashboardResponse)
async def inject_zone_and_replan(payload: Dict[str, Any] = Body(...)):
    """
    Bonus Feature: Injects a new affected disaster zone mid-demo, triggering
    real-time constraint re-planning, resource reallocation, and conflict resolution.
    """
    zone_name = payload.get("zone_name", "Madipakkam Lake Breach")
    population = int(payload.get("population", 5500))
    risk_level = payload.get("risk_level", "CRITICAL")
    return coordinator_orchestrator.add_zone_replan(zone_name=zone_name, population=population, risk_level=risk_level)

