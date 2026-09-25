from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List
from models.climate_models import (
    WeatherData,
    ClimateDashboardResponse,
    EarlyWarningAlert,
    AIRecommendation,
    DisasterPrediction,
    ClimateHistoryRecord,
)
from services.weather.weather_service import weather_service
from services.ai_analyzer import ai_analyzer
from services.history_service import history_service
from services.map_assets import (
    CHENNAI_SAFE_SHELTERS,
    CHENNAI_RESCUE_TEAMS,
    CHENNAI_DISASTER_PRONE_ZONES,
)

router = APIRouter(prefix="/api/climate", tags=["Climate Intelligence"])

@router.get("/dashboard", response_model=ClimateDashboardResponse)
async def get_climate_dashboard(
    city: str = Query("Chennai", description="Target city"),
    lat: float = Query(13.0827, description="Latitude"),
    lon: float = Query(80.2707, description="Longitude")
):
    weather_data, source_type = await weather_service.get_weather(city, lat, lon)
    forecast = await weather_service.get_forecast(city, lat, lon)

    risk_level, predictions, alerts, recommendations = ai_analyzer.analyze_hazards(weather_data)

    # Log to history
    top_hazard = predictions[0].hazard if predictions else "Heavy Rain"
    top_rec = recommendations[0].title if recommendations else "Maintain nominal telemetry monitoring"
    history_service.log_snapshot(weather_data, top_hazard, risk_level, top_rec)

    provider_info = weather_service.get_active_provider_info()

    return ClimateDashboardResponse(
        current_weather=weather_data,
        overall_risk_level=risk_level,
        disaster_predictions=predictions,
        active_alerts=alerts,
        recommendations=recommendations,
        shelters=CHENNAI_SAFE_SHELTERS,
        rescue_teams=CHENNAI_RESCUE_TEAMS,
        disaster_zones=CHENNAI_DISASTER_PRONE_ZONES,
        forecast_24h=forecast,
        data_source_mode="REAL_API" if source_type != "SIMULATED" else "SIMULATED",
        provider_name=provider_info["active_provider"]
    )

@router.get("/current", response_model=WeatherData)
async def get_current_weather(
    city: str = Query("Chennai"),
    lat: float = Query(13.0827),
    lon: float = Query(80.2707)
):
    data, _ = await weather_service.get_weather(city, lat, lon)
    return data

@router.get("/forecast")
async def get_forecast(
    city: str = Query("Chennai"),
    lat: float = Query(13.0827),
    lon: float = Query(80.2707)
):
    return await weather_service.get_forecast(city, lat, lon)

@router.get("/predictions", response_model=List[DisasterPrediction])
async def get_predictions(
    city: str = Query("Chennai"),
    lat: float = Query(13.0827),
    lon: float = Query(80.2707)
):
    weather_data, _ = await weather_service.get_weather(city, lat, lon)
    _, predictions, _, _ = ai_analyzer.analyze_hazards(weather_data)
    return predictions

@router.get("/alerts", response_model=List[EarlyWarningAlert])
async def get_alerts(
    city: str = Query("Chennai"),
    lat: float = Query(13.0827),
    lon: float = Query(80.2707)
):
    weather_data, _ = await weather_service.get_weather(city, lat, lon)
    _, _, alerts, _ = ai_analyzer.analyze_hazards(weather_data)
    return alerts

@router.get("/recommendations", response_model=List[AIRecommendation])
async def get_recommendations(
    city: str = Query("Chennai"),
    lat: float = Query(13.0827),
    lon: float = Query(80.2707)
):
    weather_data, _ = await weather_service.get_weather(city, lat, lon)
    _, _, _, recs = ai_analyzer.analyze_hazards(weather_data)
    return recs

@router.get("/map-layers")
async def get_map_layers():
    return {
        "shelters": CHENNAI_SAFE_SHELTERS,
        "rescue_teams": CHENNAI_RESCUE_TEAMS,
        "disaster_zones": CHENNAI_DISASTER_PRONE_ZONES,
    }

@router.get("/history", response_model=List[ClimateHistoryRecord])
async def get_climate_history():
    return history_service.get_history()

@router.get("/provider-status")
async def get_provider_status():
    return weather_service.get_active_provider_info()

@router.post("/simulate-hazard")
async def simulate_hazard(payload: Dict[str, str]):
    hazard = payload.get("hazard", "NORMAL").upper()
    valid_profiles = ["NORMAL", "CYCLONE", "FLOOD", "HEAT_WAVE", "LANDSLIDE", "DROUGHT"]
    if hazard not in valid_profiles:
        raise HTTPException(status_code=400, detail=f"Invalid hazard profile. Allowed: {valid_profiles}")

    weather_service.set_simulation_profile(hazard)
    return {
        "success": True,
        "hazard_profile_activated": hazard,
        "message": f"Simulation profile switched to '{hazard}'. Re-analyzing multi-hazard telemetry..."
    }
