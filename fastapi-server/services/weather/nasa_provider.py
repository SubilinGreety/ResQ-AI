from typing import Optional, List, Dict, Any
from services.weather.base_provider import BaseWeatherProvider
from models.climate_models import WeatherData

class NASAWeatherProvider(BaseWeatherProvider):
    """
    NASA POWER (Prediction of Worldwide Energy Resources) / EarthData Provider.
    Ready for NASA agroclimatology & satellite precipitation integration.
    """
    def __init__(self):
        self.endpoint = "https://power.larc.nasa.gov/api/temporal/hourly/point"

    @property
    def name(self) -> str:
        return "NASA EarthData / POWER"

    def is_configured(self) -> bool:
        return False

    async def get_current_weather(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> Optional[WeatherData]:
        return None

    async def get_forecast(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> List[Dict[str, Any]]:
        return []
