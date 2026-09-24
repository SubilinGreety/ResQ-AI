from abc import ABC, abstractmethod
from typing import Dict, Any, List
from models.coordinator_models import (
    AgentType,
    AgentStatus,
    AIAgentState,
    AgentTask,
    AgentActivityLog,
    SituationInput,
    PriorityCalculation,
    ExplainableAiDecision,
)

class BaseDisasterAgent(ABC):
    """
    Abstract base class for all autonomous disaster response AI agents.
    Modular design allows adding new agents with zero breaking changes.
    """

    def __init__(self, agent_id: str, name: str, agent_type: AgentType):
        self.agent_id = agent_id
        self.name = name
        self.agent_type = agent_type

    @abstractmethod
    def evaluate(self, situation: SituationInput, priority: PriorityCalculation) -> AIAgentState:
        """Evaluate incoming disaster telemetry and return autonomous state."""
        pass

    @abstractmethod
    def get_explainability(self, situation: SituationInput, priority: PriorityCalculation) -> ExplainableAiDecision:
        """Provide transparent XAI reasoning explaining why the agent was activated."""
        pass

    @abstractmethod
    def dynamic_reassign(self, situation: SituationInput, new_threat_level: str) -> List[AgentTask]:
        """Dynamically reassign or escalate tasks when the situation evolves."""
        pass
