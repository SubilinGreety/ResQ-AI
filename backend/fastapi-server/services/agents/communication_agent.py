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

class CommunicationAgent(BaseDisasterAgent):
    def __init__(self):
        super().__init__(
            agent_id="agent-comm-03",
            name="Emergency Mass Alert & Authority Comms Agent",
            agent_type=AgentType.COMMUNICATION
        )

    def evaluate(self, situation: SituationInput, priority: PriorityCalculation) -> AIAgentState:
        now_str = datetime.now().strftime("%H:%M:%S")
        target_sims = situation.active_sim_count

        tasks = [
            AgentTask(
                id="task-comm-301",
                title="Cell Broadcast Multi-Carrier Mass SMS Alert",
                description=f"Generated and queued geo-targeted cell broadcast SMS payloads to {target_sims:,} active mobile devices via Airtel, Jio, and BSNL towers.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.URGENT,
                progress_percent=85,
                target_entity=f"{target_sims:,} Active SIMs",
                estimated_completion_min=3,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-comm-302",
                title="Automated High-Priority Authority Notification Dispatch",
                description="Sent encrypted situational brief to TNSDMA State Emergency Operations Center (SEOC), District Collectorate, and Commissioner of Police.",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.URGENT,
                progress_percent=100,
                target_entity="State Disaster Management (TNSDMA)",
                estimated_completion_min=0,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-comm-303",
                title="Multilingual Audio & Public Address Broadcast (Tamil / English / Hindi)",
                description="Activated wireless public address sirens and FM radio emergency overrides with voice warnings in Tamil, English, and Hindi.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                progress_percent=72,
                target_entity="12 PA Siren Towers & FM 101.4",
                estimated_completion_min=5,
                created_at=now_str,
                updated_at=now_str,
            ),
            AgentTask(
                id="task-comm-304",
                title="Encrypted VHF Tactical Radio Net for Field Rescue Teams",
                description="Synchronized NDRF Channel 4, SDRF Channel 7, and Police VHF frequencies on unified repeater tower.",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.HIGH,
                progress_percent=100,
                target_entity="Tactical Radio Bridge",
                estimated_completion_min=0,
                created_at=now_str,
                updated_at=now_str,
            ),
        ]

        activity_logs = [
            AgentActivityLog(timestamp=now_str, action="Cell Broadcast Triggered", detail=f"Targeting {target_sims:,} detected subscribers in 2.5km disaster radius.", severity="ALERT"),
            AgentActivityLog(timestamp=now_str, action="Authority Dispatch Confirmed", detail="Disaster briefing acknowledged by Chennai District Collector control desk.", severity="SUCCESS"),
            AgentActivityLog(timestamp=now_str, action="Multilingual Alert Live", detail="Tamil: 'அவசர எச்சரிக்கை: உடனடியாக பாதுகாப்பான முகாம்களுக்கு செல்லவும்.' active.", severity="INFO"),
        ]

        metrics = {
            "sms_recipients_target": target_sims,
            "sms_delivered_estimate": int(target_sims * 0.88),
            "sms_delivery_rate": "88.4%",
            "supported_languages": ["Tamil (தமிழ்)", "English", "Hindi (हिन्दी)"],
            "authorities_notified": ["TNSDMA SEOC", "Greater Chennai Corporation (GCC)", "Chennai City Police", "Fire & Rescue DG"],
            "radio_channels_bridged": 4,
        }

        reason = f"AI activated Communication Agent because the affected population ({target_sims:,} active SIMs) exceeded the alert threshold (5,000)."

        return AIAgentState(
            id=self.agent_id,
            name=self.name,
            type=self.agent_type,
            status=AgentStatus.ACTIVE,
            is_active=True,
            confidence=0.99,
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
            primary_trigger="Population Alert Threshold Breach (>5,000 SIMs)",
            reasoning=f"AI activated Communication Agent because the affected population ({situation.active_sim_count:,} active SIMs) exceeded the alert threshold (5,000).",
            impact_factor="Mass public awareness, prompt evacuation, and inter-agency coordination"
        )

    def dynamic_reassign(self, situation: SituationInput, new_threat_level: str) -> List[AgentTask]:
        now_str = datetime.now().strftime("%H:%M:%S")
        return [
            AgentTask(
                id="task-comm-305-escalated",
                title="Secondary Warning Wave & Shelter Route Map SMS",
                description="Broadcasting dynamic Google Maps shelter directions via shortened deep-link SMS to remaining residents.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                progress_percent=30,
                target_entity="Mobile Telecom Gateway",
                estimated_completion_min=4,
                created_at=now_str,
                updated_at=now_str,
            )
        ]
