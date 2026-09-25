import os
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime
from services.weather.base_provider import BaseWeatherProvider
from models.climate_models import WeatherData

class WeatherApiProvider(BaseWeatherProvider):
    def __init__(self):
        self.api_key = os.getenv("WEATHERAPI_KEY", "")

    @property
    def name(self) -> str:
        return "WeatherAPI"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    async def get_current_weather(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> Optional[WeatherData]:
        if not self.is_configured():
            return None
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                url = f"https://api.weatherapi.com/v1/forecast.json?key={self.api_key}&q={lat},{lon}&days=1&aqi=yes"
                res = await client.get(url)
                if res.status_code != 200:
                    return None
                data = res.json()
                curr = data.get("current", {})
                air = curr.get("air_quality", {})
                us_epa = air.get("us-epa-index", 2)
                epa_map = {1: (35, "Good"), 2: (75, "Moderate"), 3: (125, "Unhealthy for Sensitive"), 4: (175, "Unhealthy"), 5: (250, "Very Unhealthy"), 6: (350, "Hazardous")}
                aqi, aqi_status = epa_map.get(us_epa, (75, "Moderate"))

                return WeatherData(
                    city=city,
                    state="Tamil Nadu",
                    country="IN",
                    latitude=lat,
                    longitude=lon,
                    temperature=round(float(curr.get("temp_c", 32.0)), 1),
                    feels_like=round(float(curr.get("feelslike_c", 35.0)), 1),
                    temp_min=27.0,
                    temp_max=36.0,
                    humidity=int(curr.get("humidity", 65)),
                    rainfall_1h=round(float(curr.get("precip_mm", 0.0)), 1),
                    rainfall_24h=round(float(curr.get("precip_mm", 0.0)) * 2.5, 1),
                    wind_speed=round(float(curr.get("wind_kph", 15.0)), 1),
                    wind_direction=int(curr.get("wind_degree", 60)),
                    wind_direction_compass=curr.get("wind_dir", "ENE"),
                    pressure=round(float(curr.get("pressure_mb", 1012.0)), 1),
                    aqi=aqi,
                    aqi_status=aqi_status,
                    uv_index=float(curr.get("uv", 6.0)),
                    cloud_cover=int(curr.get("cloud", 30)),
                    visibility_km=round(float(curr.get("vis_km", 10.0)), 1),
                    condition=curr.get("condition", {}).get("text", "Partly Cloudy"),
                    icon=curr.get("condition", {}).get("icon", ""),
                    timestamp=datetime.utcnow().isoformat(),
                    source="WEATHERAPI"
                )
        except Exception as e:
            print(f"[WeatherApiProvider Error] {e}")
            return None

    async def get_forecast(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> List[Dict[str, Any]]:
        return []
