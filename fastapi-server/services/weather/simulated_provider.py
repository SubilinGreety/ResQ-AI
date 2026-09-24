import random
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from services.weather.base_provider import BaseWeatherProvider
from models.climate_models import WeatherData

# Predefined climate hazard profiles for simulation
SIMULATION_PROFILES: Dict[str, Dict[str, Any]] = {
    "NORMAL": {
        "temperature": 32.4,
        "feels_like": 36.1,
        "temp_min": 26.5,
        "temp_max": 34.8,
        "humidity": 68,
        "rainfall_1h": 0.0,
        "rainfall_24h": 2.5,
        "wind_speed": 16.5,
        "wind_direction": 80,
        "wind_direction_compass": "ENE",
        "pressure": 1012.0,
        "aqi": 72,
        "aqi_status": "Moderate",
        "uv_index": 7.5,
        "cloud_cover": 35,
        "visibility_km": 9.5,
        "condition": "Partly Cloudy · Sea Breeze",
        "icon": "cloud-sun",
    },
    "CYCLONE": {
        "temperature": 26.2,
        "feels_like": 28.0,
        "temp_min": 24.0,
        "temp_max": 27.5,
        "humidity": 96,
        "rainfall_1h": 42.5,
        "rainfall_24h": 185.0,
        "wind_speed": 88.5,
        "wind_direction": 35,
        "wind_direction_compass": "NE",
        "pressure": 968.4,
        "aqi": 28,
        "aqi_status": "Good",
        "uv_index": 1.2,
        "cloud_cover": 100,
        "visibility_km": 2.1,
        "condition": "Severe Cyclonic Storm (Cat-3) · Torrential Winds",
        "icon": "tornado",
    },
    "FLOOD": {
        "temperature": 27.0,
        "feels_like": 31.0,
        "temp_min": 24.5,
        "temp_max": 28.2,
        "humidity": 98,
        "rainfall_1h": 78.4,
        "rainfall_24h": 260.0,
        "wind_speed": 45.0,
        "wind_direction": 65,
        "wind_direction_compass": "ENE",
        "pressure": 994.0,
        "aqi": 32,
        "aqi_status": "Good",
        "uv_index": 2.0,
        "cloud_cover": 95,
        "visibility_km": 3.0,
        "condition": "Extreme Torrential Rainfall · Flash Flood Risk",
        "icon": "cloud-rain",
    },
    "HEAT_WAVE": {
        "temperature": 42.8,
        "feels_like": 49.5,
        "temp_min": 31.0,
        "temp_max": 43.6,
        "humidity": 38,
        "rainfall_1h": 0.0,
        "rainfall_24h": 0.0,
        "wind_speed": 12.0,
        "wind_direction": 280,
        "wind_direction_compass": "WNW",
        "pressure": 1006.0,
        "aqi": 186,
        "aqi_status": "Unhealthy",
        "uv_index": 11.2,
        "cloud_cover": 5,
        "visibility_km": 6.5,
        "condition": "Severe Heatwave · High Thermal Index",
        "icon": "sun",
    },
    "LANDSLIDE": {
        "temperature": 24.8,
        "feels_like": 26.5,
        "temp_min": 22.0,
        "temp_max": 26.0,
        "humidity": 94,
        "rainfall_1h": 58.0,
        "rainfall_24h": 210.0,
        "wind_speed": 38.0,
        "wind_direction": 120,
        "wind_direction_compass": "ESE",
        "pressure": 998.0,
        "aqi": 35,
        "aqi_status": "Good",
        "uv_index": 2.5,
        "cloud_cover": 90,
        "visibility_km": 4.0,
        "condition": "Continuous Heavy Downpour · Soil Saturation 94%",
        "icon": "mountain",
    },
    "DROUGHT": {
        "temperature": 39.5,
        "feels_like": 43.0,
        "temp_min": 29.0,
        "temp_max": 40.5,
        "humidity": 22,
        "rainfall_1h": 0.0,
        "rainfall_24h": 0.0,
        "wind_speed": 18.0,
        "wind_direction": 310,
        "wind_direction_compass": "NW",
        "pressure": 1014.0,
        "aqi": 145,
        "aqi_status": "Unhealthy for Sensitive",
        "uv_index": 9.8,
        "cloud_cover": 8,
        "visibility_km": 7.0,
        "condition": "Prolonged Dry Spell · Soil Moisture Depleted",
        "icon": "sun-dim",
    },
}

class SimulatedWeatherProvider(BaseWeatherProvider):
    def __init__(self):
        self.current_profile_key = "NORMAL"

    @property
    def name(self) -> str:
        return "ResQ Simulated Climate Engine (Chennai EOC Telemetry)"

    def is_configured(self) -> bool:
        return True

    def set_profile(self, profile_key: str):
        if profile_key.upper() in SIMULATION_PROFILES:
            self.current_profile_key = profile_key.upper()

    async def get_current_weather(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> Optional[WeatherData]:
        base = SIMULATION_PROFILES.get(self.current_profile_key, SIMULATION_PROFILES["NORMAL"])
        # Add subtle natural jitter (+/- 1-2%)
        jitter = random.uniform(-0.4, 0.4)
        temp = round(base["temperature"] + jitter, 1)
        rain = round(max(0.0, base["rainfall_1h"] + (random.uniform(-1.0, 1.0) if base["rainfall_1h"] > 0 else 0)), 1)
        wind = round(max(0.0, base["wind_speed"] + random.uniform(-1.5, 1.5)), 1)
        pressure = round(base["pressure"] + random.uniform(-0.5, 0.5), 1)

        return WeatherData(
            city=city,
            state="Tamil Nadu",
            country="IN",
            latitude=lat,
            longitude=lon,
            temperature=temp,
            feels_like=round(base["feels_like"] + jitter, 1),
            temp_min=base["temp_min"],
            temp_max=base["temp_max"],
            humidity=min(100, max(15, base["humidity"] + int(random.uniform(-2, 2)))),
            rainfall_1h=rain,
            rainfall_24h=round(base["rainfall_24h"] + rain * 0.5, 1),
            wind_speed=wind,
            wind_direction=base["wind_direction"],
            wind_direction_compass=base["wind_direction_compass"],
            pressure=pressure,
            aqi=base["aqi"],
            aqi_status=base["aqi_status"],
            uv_index=base["uv_index"],
            cloud_cover=base["cloud_cover"],
            visibility_km=base["visibility_km"],
            condition=base["condition"],
            icon=base["icon"],
            timestamp=datetime.utcnow().isoformat(),
            source=f"SIMULATED ({self.current_profile_key})"
        )

    async def get_forecast(self, city: str = "Chennai", lat: float = 13.0827, lon: float = 80.2707) -> List[Dict[str, Any]]:
        base = SIMULATION_PROFILES.get(self.current_profile_key, SIMULATION_PROFILES["NORMAL"])
        forecast = []
        now = datetime.now()
        for i in range(8):
            f_time = (now + timedelta(hours=i * 3)).strftime("%H:%M")
            factor = 1.0 - (i * 0.05) if self.current_profile_key != "NORMAL" else 1.0 + (i * 0.02)
            forecast.append({
                "time": f_time,
                "temperature": round(base["temperature"] + random.uniform(-1.5, 1.5), 1),
                "rainfall": round(base["rainfall_1h"] * factor + random.uniform(0, 2), 1) if base["rainfall_1h"] > 0 else 0.0,
                "humidity": min(100, max(20, int(base["humidity"] + random.uniform(-4, 4)))),
                "wind_speed": round(base["wind_speed"] * factor + random.uniform(-2, 2), 1),
                "pressure": round(base["pressure"] + random.uniform(-1.0, 1.0), 1),
            })
        return forecast
