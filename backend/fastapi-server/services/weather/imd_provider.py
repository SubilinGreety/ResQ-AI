from typing import Optional, List, Dict, Any
from services.weather.base_provider import BaseWeatherProvider
from models.climate_models import WeatherData

class IMDWeatherProvider(BaseWeatherProvider):
    """
    India Meteorological Department (IMD) Integration Adapter.
    Ready for IMD AWS/RSMC API tokens & radar gridded telemetry.
    """
    def __init__(self):
        self.api_endpoint = "https://mausam.imd.gov.in/api/v1/city"

    @property
    def name(self) -> str:
        return "India Meteorological Department (IMD)"

    def is_configured(self) -> bool:
        # Future: Check IMD government API token in env
        return False

    async def get_current_weather(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> Optional[WeatherData]:
        return None

    async def get_forecast(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> List[Dict[str, Any]]:
        return []
