import uuid
from typing import List
from datetime import datetime, timedelta
from models.climate_models import ClimateHistoryRecord, WeatherData, HazardType, RiskLevel

class ClimateHistoryService:
    def __init__(self):
        self._history: List[ClimateHistoryRecord] = []
        self._seed_initial_history()

    def _seed_initial_history(self):
        """Seed realistic past 24 hours of climate history snapshots."""
        now = datetime.utcnow()
        sample_snapshots = [
            (now - timedelta(hours=20), 33.5, 62, 0.0, 14.0, 1013.2, 68, "Heat Wave", "Low", "Normal sea-breeze telemetry. Hydration advisories issued."),
            (now - timedelta(hours=16), 34.2, 59, 0.0, 12.5, 1012.8, 75, "Heat Wave", "Moderate", "High solar insolation. Advised shaded work in midday."),
            (now - timedelta(hours=12), 31.8, 74, 4.5, 18.2, 1011.0, 55, "Heavy Rain", "Low", "Localized cloudburst over South Chennai. Surface drains flowing."),
            (now - timedelta(hours=8),  29.5, 85, 18.0, 26.0, 1008.4, 42, "Heavy Rain", "Moderate", "Adyar river basin monitors on active surveillance."),
            (now - timedelta(hours=4),  28.0, 92, 38.5, 34.0, 1005.1, 38, "Flood", "High", "Sump discharge pumps deployed at Velachery & Madipakkam."),
            (now - timedelta(hours=1),  27.2, 95, 48.0, 42.0, 1001.0, 32, "Flood", "Critical", "Pre-evacuation staged for Saidapet and Mudichur river banks.")
        ]
        for dt, temp, hum, rain, wind, press, aqi, haz, rlevel, rec in sample_snapshots:
            self._history.append(ClimateHistoryRecord(
                id=str(uuid.uuid4()),
                timestamp=dt.strftime("%Y-%m-%d %H:%M:%S UTC"),
                city="Chennai",
                temperature=temp,
                humidity=hum,
                rainfall=rain,
                wind_speed=wind,
                pressure=press,
                aqi=aqi,
                predicted_hazard=haz, # type: ignore
                risk_level=rlevel, # type: ignore
                recommendation=rec
            ))

    def log_snapshot(self, w: WeatherData, top_hazard: HazardType, risk_level: RiskLevel, recommendation: str):
        record = ClimateHistoryRecord(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            city=w.city,
            temperature=w.temperature,
            humidity=w.humidity,
            rainfall=w.rainfall_1h,
            wind_speed=w.wind_speed,
            pressure=w.pressure,
            aqi=w.aqi,
            predicted_hazard=top_hazard,
            risk_level=risk_level,
            recommendation=recommendation
        )
        self._history.insert(0, record)
        # Keep maximum 100 records
        if len(self._history) > 100:
            self._history.pop()

    def get_history(self) -> List[ClimateHistoryRecord]:
        return self._history

history_service = ClimateHistoryService()
