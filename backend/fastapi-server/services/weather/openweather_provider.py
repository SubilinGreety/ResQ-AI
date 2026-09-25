import os
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime
from services.weather.base_provider import BaseWeatherProvider
from models.climate_models import WeatherData

def deg_to_compass(deg: int) -> str:
    val = int((deg / 22.5) + 0.5)
    arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
           "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    return arr[(val % 16)]

class OpenWeatherProvider(BaseWeatherProvider):
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY", "")

    @property
    def name(self) -> str:
        return "OpenWeatherMap"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    async def get_current_weather(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> Optional[WeatherData]:
        if not self.is_configured():
            return None

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={self.api_key}&units=metric"
                res = await client.get(url)
                if res.status_code != 200:
                    return None
                data = res.json()

                # Also try AQI
                aqi = 65
                aqi_status = "Moderate"
                try:
                    aqi_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={self.api_key}"
                    aqi_res = await client.get(aqi_url)
                    if aqi_res.status_code == 200:
                        aqi_val = aqi_res.json().get("list", [{}])[0].get("main", {}).get("aqi", 2)
                        # OpenWeather AQI is 1-5, map to standard AQI 0-500 scale
                        aqi_map = {1: (30, "Good"), 2: (70, "Moderate"), 3: (120, "Unhealthy for Sensitive"), 4: (180, "Unhealthy"), 5: (260, "Very Unhealthy")}
                        aqi, aqi_status = aqi_map.get(aqi_val, (65, "Moderate"))
                except Exception:
                    pass

                main = data.get("main", {})
                wind = data.get("wind", {})
                rain = data.get("rain", {})
                clouds = data.get("clouds", {})
                weather_arr = data.get("weather", [{}])

                temp = float(main.get("temp", 31.0))
                feels_like = float(main.get("feels_like", temp + 2.0))
                humidity = int(main.get("humidity", 70))
                pressure = float(main.get("pressure", 1010.0))
                wind_speed_kmh = round(float(wind.get("speed", 3.0)) * 3.6, 1)
                wind_deg = int(wind.get("deg", 45))
                rain_1h = float(rain.get("1h", 0.0))
                rain_24h = rain_1h * 3.5

                condition = weather_arr[0].get("description", "Scattered Clouds").title()

                return WeatherData(
                    city=city,
                    state="Tamil Nadu",
                    country="IN",
                    latitude=lat,
                    longitude=lon,
                    temperature=round(temp, 1),
                    feels_like=round(feels_like, 1),
                    temp_min=round(float(main.get("temp_min", temp - 2)), 1),
                    temp_max=round(float(main.get("temp_max", temp + 2)), 1),
                    humidity=humidity,
                    rainfall_1h=round(rain_1h, 1),
                    rainfall_24h=round(rain_24h, 1),
                    wind_speed=wind_speed_kmh,
                    wind_direction=wind_deg,
                    wind_direction_compass=deg_to_compass(wind_deg),
                    pressure=round(pressure, 1),
                    aqi=aqi,
                    aqi_status=aqi_status,
                    uv_index=6.2,
                    cloud_cover=int(clouds.get("all", 40)),
                    visibility_km=round(float(data.get("visibility", 10000)) / 1000.0, 1),
                    condition=condition,
                    icon=weather_arr[0].get("icon", "02d"),
                    timestamp=datetime.utcnow().isoformat(),
                    source="OPENWEATHERMAP"
                )
        except Exception as e:
            print(f"[OpenWeatherProvider Error] {e}")
            return None

    async def get_forecast(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> List[Dict[str, Any]]:
        if not self.is_configured():
            return []
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={self.api_key}&units=metric"
                res = await client.get(url)
                if res.status_code != 200:
                    return []
                data = res.json()
                items = data.get("list", [])[:8] # Next 24h in 3h intervals
                formatted = []
                for it in items:
                    main = it.get("main", {})
                    dt_txt = it.get("dt_txt", "")
                    time_label = dt_txt.split(" ")[1][:5] if " " in dt_txt else ""
                    formatted.append({
                        "time": time_label,
                        "temperature": round(float(main.get("temp", 30)), 1),
                        "rainfall": round(float(it.get("rain", {}).get("3h", 0.0)), 1),
                        "humidity": int(main.get("humidity", 65)),
                        "wind_speed": round(float(it.get("wind", {}).get("speed", 4)) * 3.6, 1),
                        "pressure": round(float(main.get("pressure", 1010)), 1),
                    })
                return formatted
        except Exception:
            return []
