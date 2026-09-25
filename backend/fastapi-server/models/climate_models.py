from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

RiskLevel = Literal["Low", "Moderate", "High", "Critical"]
HazardType = Literal["Flood", "Cyclone", "Heavy Rain", "Heat Wave", "Landslide", "Drought"]

class WeatherData(BaseModel):
    city: str = "Chennai"
    state: str = "Tamil Nadu"
    country: str = "IN"
    latitude: float = 13.0827
    longitude: float = 80.2707
    temperature: float = Field(..., description="Temperature in Celsius")
    feels_like: float = Field(..., description="Perceived temperature in Celsius")
    temp_min: float = 28.0
    temp_max: float = 35.0
    humidity: int = Field(..., description="Humidity percentage 0-100")
    rainfall_1h: float = Field(0.0, description="Rainfall in last hour (mm)")
    rainfall_24h: float = Field(0.0, description="Accumulated 24h rainfall (mm)")
    wind_speed: float = Field(..., description="Wind speed in km/h")
    wind_direction: int = Field(..., description="Wind direction in degrees 0-360")
    wind_direction_compass: str = Field("NE", description="Compass direction e.g. NE, SSW")
    pressure: float = Field(..., description="Atmospheric pressure in hPa")
    aqi: int = Field(..., description="Air Quality Index (1-500)")
    aqi_status: str = Field("Moderate", description="Good, Moderate, Unhealthy, Hazardous")
    uv_index: float = Field(5.0, description="UV Index")
    cloud_cover: int = Field(45, description="Cloud cover percentage")
    visibility_km: float = Field(10.0, description="Visibility in km")
    condition: str = Field("Scattered Clouds", description="Weather condition summary")
    icon: str = Field("cloud-sun", description="Weather icon identifier")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    source: str = Field("SIMULATED", description="OPENWEATHERMAP | WEATHERAPI | IMD | SIMULATED")

class DisasterPrediction(BaseModel):
    hazard: HazardType
    probability: int = Field(..., description="Likelihood percentage 0-100")
    risk_level: RiskLevel
    severity_score: float = Field(..., description="Severity score 0-10")
    triggers: List[str] = Field(default_factory=list, description="Parameters that triggered this score")
    description: str
    projected_impact_window: str = "Next 6–12 Hours"
    historical_benchmark: Optional[str] = None

class EarlyWarningAlert(BaseModel):
    id: str
    hazard: HazardType
    risk_level: RiskLevel
    title: str
    message: str
    message_ta: str
    affected_zones: List[str]
    triggered_parameter: str
    threshold_value: str
    current_value: str
    timestamp: str
    status: Literal["ACTIVE", "WATCH", "ADVISORY", "RESOLVED"] = "ACTIVE"
    action_required: str
    can_trigger_emergency_broadcast: bool = True

class SafeShelter(BaseModel):
    id: str
    name: str
    locality: str
    latitude: float
    longitude: float
    capacity: int
    current_occupancy: int
    status: Literal["READY", "OCCUPIED", "STANDBY", "FULL"] = "READY"
    contact_person: str
    contact_phone: str
    facilities: List[str]

class RescueTeam(BaseModel):
    id: str
    unit_name: str
    agency: Literal["NDRF", "SDRF", "TNFRS Fire & Rescue", "Coast Guard", "Greater Chennai Corp"]
    team_type: Literal["Flood Rescue", "Medical Evacuation", "Hazmat", "Search & Extrication"]
    station_location: str
    latitude: float
    longitude: float
    personnel_count: int
    boats_available: int
    ambulances_available: int
    status: Literal["DEPLOYED", "STANDBY", "EN_ROUTE", "ACTIVE"] = "STANDBY"
    contact_channel: str

class DisasterProneZone(BaseModel):
    id: str
    name: str
    zone_type: Literal["Flood Basin", "Coastal Surge", "Low-Lying Waterlogging", "Landslide Risk", "Urban Heat Island"]
    risk_level: RiskLevel
    description: str
    latitude: float
    longitude: float
    radius_meters: int
    vulnerable_population: int

class AIRecommendation(BaseModel):
    id: str
    category: Literal["Evacuation", "Shelter", "Rescue", "Medical", "Civic Advisory"]
    priority: Literal["P1 - Immediate", "P2 - High", "P3 - Moderate", "P4 - Advisory"]
    title: str
    description: str
    target_agency: str
    status: Literal["PENDING", "DISPATCHED", "IN_PROGRESS"] = "PENDING"

class ClimateHistoryRecord(BaseModel):
    id: str
    timestamp: str
    city: str
    temperature: float
    humidity: int
    rainfall: float
    wind_speed: float
    pressure: float
    aqi: int
    predicted_hazard: HazardType
    risk_level: RiskLevel
    recommendation: str

class ClimateDashboardResponse(BaseModel):
    current_weather: WeatherData
    overall_risk_level: RiskLevel
    disaster_predictions: List[DisasterPrediction]
    active_alerts: List[EarlyWarningAlert]
    recommendations: List[AIRecommendation]
    shelters: List[SafeShelter]
    rescue_teams: List[RescueTeam]
    disaster_zones: List[DisasterProneZone]
    forecast_24h: List[Dict[str, Any]]
    data_source_mode: Literal["REAL_API", "SIMULATED", "HYBRID"]
    provider_name: str
