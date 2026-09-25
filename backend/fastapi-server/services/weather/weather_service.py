from typing import Tuple, List, Dict, Any, Optional
from models.climate_models import WeatherData
from services.weather.openweather_provider import OpenWeatherProvider
from services.weather.weatherapi_provider import WeatherApiProvider
from services.weather.imd_provider import IMDWeatherProvider
from services.weather.nasa_provider import NASAWeatherProvider
from services.weather.simulated_provider import SimulatedWeatherProvider

class WeatherService:
    def __init__(self):
        self.openweather = OpenWeatherProvider()
        self.weatherapi = WeatherApiProvider()
        self.imd = IMDWeatherProvider()
        self.nasa = NASAWeatherProvider()
        self.simulated = SimulatedWeatherProvider()

    def get_active_provider_info(self) -> Dict[str, Any]:
        has_real_key = self.openweather.is_configured() or self.weatherapi.is_configured()
        active_name = (
            self.openweather.name if self.openweather.is_configured()
            else self.weatherapi.name if self.weatherapi.is_configured()
            else self.simulated.name
        )
        return {
            "has_real_api_key": has_real_key,
            "active_provider": active_name,
            "mode": "REAL_API" if has_real_key else "SIMULATED",
            "openweather_configured": self.openweather.is_configured(),
            "weatherapi_configured": self.weatherapi.is_configured(),
            "imd_ready": True,
            "nasa_ready": True,
        }

    async def get_weather(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> Tuple[WeatherData, str]:
        # 1. Try OpenWeatherMap if configured
        if self.openweather.is_configured():
            data = await self.openweather.get_current_weather(city, lat, lon)
            if data:
                return data, "OPENWEATHERMAP"

        # 2. Try WeatherAPI if configured
        if self.weatherapi.is_configured():
            data = await self.weatherapi.get_current_weather(city, lat, lon)
            if data:
                return data, "WEATHERAPI"

        # 3. Automatic fallback to Simulated Provider (Requirement 10)
        data = await self.simulated.get_current_weather(city, lat, lon)
        return data, "SIMULATED"

    async def get_forecast(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> List[Dict[str, Any]]:
        if self.openweather.is_configured():
            fc = await self.openweather.get_forecast(city, lat, lon)
            if fc:
                return fc
        return await self.simulated.get_forecast(city, lat, lon)

    def set_simulation_profile(self, profile: str):
        self.simulated.set_profile(profile)

weather_service = WeatherService()
