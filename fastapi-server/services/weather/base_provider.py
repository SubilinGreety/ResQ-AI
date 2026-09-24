from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from models.climate_models import WeatherData

class BaseWeatherProvider(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        pass

    @abstractmethod
    async def get_current_weather(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> Optional[WeatherData]:
        pass

    @abstractmethod
    async def get_forecast(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> List[Dict[str, Any]]:
        pass
