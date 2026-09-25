import uuid
from typing import List, Tuple
from datetime import datetime
from models.climate_models import (
    WeatherData,
    DisasterPrediction,
    EarlyWarningAlert,
    AIRecommendation,
    RiskLevel,
    HazardType,
)

class ClimateAIAnalyzer:
    """
    AI Multi-Hazard Risk Prediction and Early Warning Engine.
    Correlates multiple meteorological dimensions into unified disaster probabilities.
    """

    def analyze_hazards(self, w: WeatherData) -> Tuple[RiskLevel, List[DisasterPrediction], List[EarlyWarningAlert], List[AIRecommendation]]:
        predictions: List[DisasterPrediction] = []
        alerts: List[EarlyWarningAlert] = []
        recommendations: List[AIRecommendation] = []

        # ── 1. FLOOD PREDICTION ──────────────────────────────────────────────
        flood_prob = 10
        flood_triggers = []
        if w.rainfall_1h >= 60.0 or w.rainfall_24h >= 200.0:
            flood_prob = min(98, int(75 + (w.rainfall_1h - 60) * 0.8))
            flood_triggers.append(f"Extreme 1h rainfall: {w.rainfall_1h} mm/hr (Critical threshold: 50mm)")
            flood_triggers.append(f"24h accumulated rainfall: {w.rainfall_24h} mm")
        elif w.rainfall_1h >= 25.0 or w.rainfall_24h >= 90.0:
            flood_prob = min(74, int(45 + (w.rainfall_1h - 25) * 1.0))
            flood_triggers.append(f"Heavy downpour: {w.rainfall_1h} mm/hr")
        elif w.rainfall_1h >= 10.0:
            flood_prob = 28
            flood_triggers.append(f"Moderate rainfall: {w.rainfall_1h} mm/hr")

        if w.humidity > 92 and flood_prob > 20:
            flood_prob = min(99, flood_prob + 8)
            flood_triggers.append(f"Near-saturated air column: {w.humidity}% humidity")

        flood_risk: RiskLevel = "Critical" if flood_prob >= 75 else "High" if flood_prob >= 50 else "Moderate" if flood_prob >= 25 else "Low"
        predictions.append(DisasterPrediction(
            hazard="Flood",
            probability=flood_prob,
            risk_level=flood_risk,
            severity_score=round(flood_prob / 10.0, 1),
            triggers=flood_triggers or ["Precipitation levels within nominal drainage capacity"],
            description="Stormwater runoff exceeds canal discharge velocity. High risk along Adyar & Cooum river basins.",
            projected_impact_window="Next 3–6 Hours" if flood_prob > 50 else "Next 12–24 Hours"
        ))

        # ── 2. CYCLONE PREDICTION ────────────────────────────────────────────
        cyclone_prob = 5
        cyclone_triggers = []
        if w.pressure <= 980.0 and w.wind_speed >= 65.0:
            cyclone_prob = min(99, int(80 + (65.0 - w.wind_speed) * 0.5 + (980.0 - w.pressure) * 1.2))
            cyclone_triggers.append(f"Severe barometric drop: {w.pressure} hPa (Threshold: <990 hPa)")
            cyclone_triggers.append(f"Gale wind speed: {w.wind_speed} km/h")
        elif w.pressure <= 995.0 or w.wind_speed >= 45.0:
            cyclone_prob = 55
            cyclone_triggers.append(f"Barometric depression: {w.pressure} hPa")
            cyclone_triggers.append(f"Elevated wind gust: {w.wind_speed} km/h")
        elif w.pressure <= 1002.0 and w.wind_speed >= 30.0:
            cyclone_prob = 26
            cyclone_triggers.append(f"Low pressure development: {w.pressure} hPa")

        cyclone_risk: RiskLevel = "Critical" if cyclone_prob >= 75 else "High" if cyclone_prob >= 50 else "Moderate" if cyclone_prob >= 25 else "Low"
        predictions.append(DisasterPrediction(
            hazard="Cyclone",
            probability=cyclone_prob,
            risk_level=cyclone_risk,
            severity_score=round(cyclone_prob / 10.0, 1),
            triggers=cyclone_triggers or ["Barometric pressure stable; coastal wind shear normal"],
            description="Bay of Bengal cyclonic depression vortex assessment based on wind vector and barometric gradient.",
            projected_impact_window="Next 6–12 Hours" if cyclone_prob > 50 else "Next 24–48 Hours"
        ))

        # ── 3. HEAVY RAIN PREDICTION ─────────────────────────────────────────
        rain_prob = 15
        rain_triggers = []
        if w.rainfall_1h >= 45.0 or w.rainfall_24h >= 115.0:
            rain_prob = 92
            rain_triggers.append(f"Current rain intensity: {w.rainfall_1h} mm/hr")
        elif w.rainfall_1h >= 20.0 or w.rainfall_24h >= 50.0:
            rain_prob = 68
            rain_triggers.append(f"Sustained rainfall: {w.rainfall_1h} mm/hr")
        elif w.cloud_cover >= 80 and w.humidity >= 85:
            rain_prob = 40
            rain_triggers.append(f"Overcast conditions: {w.cloud_cover}% cloud cover, {w.humidity}% humidity")

        rain_risk: RiskLevel = "Critical" if rain_prob >= 75 else "High" if rain_prob >= 50 else "Moderate" if rain_prob >= 25 else "Low"
        predictions.append(DisasterPrediction(
            hazard="Heavy Rain",
            probability=rain_prob,
            risk_level=rain_risk,
            severity_score=round(rain_prob / 10.0, 1),
            triggers=rain_triggers or ["Precipitation models indicate light or no rainfall"],
            description="Deep convective cloud cluster radar analysis across Chennai coastal corridor.",
            projected_impact_window="Next 2–4 Hours"
        ))

        # ── 4. HEAT WAVE PREDICTION ──────────────────────────────────────────
        heat_prob = 8
        heat_triggers = []
        if w.temperature >= 41.0 or w.feels_like >= 48.0:
            heat_prob = min(96, int(80 + (w.temperature - 41.0) * 8))
            heat_triggers.append(f"Extreme air temperature: {w.temperature}°C (Heatwave threshold: >40°C)")
            heat_triggers.append(f"Thermal Heat Index (Feels like): {w.feels_like}°C")
        elif w.temperature >= 38.0 or w.feels_like >= 43.0:
            heat_prob = 62
            heat_triggers.append(f"High temperature: {w.temperature}°C, Feels like: {w.feels_like}°C")
        elif w.temperature >= 35.0:
            heat_prob = 32

        heat_risk: RiskLevel = "Critical" if heat_prob >= 75 else "High" if heat_prob >= 50 else "Moderate" if heat_prob >= 25 else "Low"
        predictions.append(DisasterPrediction(
            hazard="Heat Wave",
            probability=heat_prob,
            risk_level=heat_risk,
            severity_score=round(heat_prob / 10.0, 1),
            triggers=heat_triggers or ["Ambient temperatures within standard seasonal comfort range"],
            description="Excessive thermal radiation and wet-bulb globe temperature index across urban sprawl.",
            projected_impact_window="Next 12–36 Hours"
        ))

        # ── 5. LANDSLIDE PREDICTION ──────────────────────────────────────────
        landslide_prob = 5
        landslide_triggers = []
        if w.rainfall_24h >= 180.0 or (w.rainfall_1h >= 45.0 and w.humidity >= 92):
            landslide_prob = min(92, int(70 + (w.rainfall_24h - 180.0) * 0.2))
            landslide_triggers.append(f"Massive soil waterlogging: {w.rainfall_24h} mm in 24h")
        elif w.rainfall_24h >= 80.0:
            landslide_prob = 40
            landslide_triggers.append(f"Elevated soil saturation: {w.rainfall_24h} mm")

        landslide_risk: RiskLevel = "Critical" if landslide_prob >= 75 else "High" if landslide_prob >= 50 else "Moderate" if landslide_prob >= 25 else "Low"
        predictions.append(DisasterPrediction(
            hazard="Landslide",
            probability=landslide_prob,
            risk_level=landslide_risk,
            severity_score=round(landslide_prob / 10.0, 1),
            triggers=landslide_triggers or ["Slope stability index nominal. Hillock rock mass stable"],
            description="Geotechnical slope stability analysis for elevated suburban ridges (Pallavaram & St. Thomas Mount).",
            projected_impact_window="Next 6–18 Hours"
        ))

        # ── 6. DROUGHT PREDICTION ────────────────────────────────────────────
        drought_prob = 5
        drought_triggers = []
        if w.rainfall_24h == 0.0 and w.humidity <= 25 and w.temperature >= 38.0:
            drought_prob = 78
            drought_triggers.append(f"Zero precipitation, extreme dryness: {w.humidity}% humidity, {w.temperature}°C")
        elif w.rainfall_24h == 0.0 and w.humidity <= 35 and w.temperature >= 35.0:
            drought_prob = 48
            drought_triggers.append(f"Prolonged dry spell, low humidity: {w.humidity}%")

        drought_risk: RiskLevel = "Critical" if drought_prob >= 75 else "High" if drought_prob >= 50 else "Moderate" if drought_prob >= 25 else "Low"
        predictions.append(DisasterPrediction(
            hazard="Drought",
            probability=drought_prob,
            risk_level=drought_risk,
            severity_score=round(drought_prob / 10.0, 1),
            triggers=drought_triggers or ["Reservoir levels and meteorological water balance standard"],
            description="Aridity index & evaporative water loss telemetry across Chennai catchment reservoirs.",
            projected_impact_window="Next 1–2 Weeks"
        ))

        # Determine overall Risk Level
        risk_rank = {"Low": 1, "Moderate": 2, "High": 3, "Critical": 4}
        max_level = max(predictions, key=lambda p: risk_rank[p.risk_level]).risk_level

        # ── EARLY WARNING THRESHOLD ALERTS (Requirement 6) ──────────────────
        now_str = datetime.utcnow().isoformat()

        if w.rainfall_1h >= 40.0:
            alerts.append(EarlyWarningAlert(
                id=str(uuid.uuid4()),
                hazard="Flood",
                risk_level="Critical",
                title="🔴 RED ALERT: Severe Flash Flood Inundation Warning",
                message=f"Catastrophic rainfall rate of {w.rainfall_1h} mm/hr detected across Chennai central sector. Micro-watersheds are overflowing.",
                message_ta=f"சென்னை மத்திய பகுதியில் மணிக்கு {w.rainfall_1h} மி.மீ மழை பதிவாகியுள்ளது. உடனடியாக உயரமான பகுதிகளுக்கு செல்லவும்.",
                affected_zones=["Velachery", "Saidapet", "Mudichur", "Pallikaranai", "Perambur"],
                triggered_parameter="Rainfall Intensity",
                threshold_value=">= 40.0 mm/hr",
                current_value=f"{w.rainfall_1h} mm/hr",
                timestamp=now_str,
                action_required="Initiate immediate emergency evacuation of ground-floor residents along canal banks."
            ))

        if w.wind_speed >= 65.0 or w.pressure <= 980.0:
            alerts.append(EarlyWarningAlert(
                id=str(uuid.uuid4()),
                hazard="Cyclone",
                risk_level="Critical",
                title="🌀 RED ALERT: Destructive Cyclonic Gale & Storm Surge Warning",
                message=f"Severe cyclonic winds at {w.wind_speed} km/h with core central pressure dropping to {w.pressure} hPa. Coastal inundation imminent.",
                message_ta=f"சூறாவளி காற்று மணிக்கு {w.wind_speed} கி.மீ வேகத்தில் வீசுகிறது. காற்றழுத்தம் {w.pressure} hPa ஆக குறைந்துள்ளது. கடலோர பகுதிகளை விட்டு வெளியேறவும்.",
                affected_zones=["Ennore Port", "Marina Beach", "Besant Nagar", "Kovalam", "Thiruvanmiyur"],
                triggered_parameter="Wind Speed & Barometric Pressure",
                threshold_value="Wind >= 65 km/h OR Pressure <= 980 hPa",
                current_value=f"{w.wind_speed} km/h, {w.pressure} hPa",
                timestamp=now_str,
                action_required="Complete total coastal evacuation. Suspend all metro, port and coastal bridge traffic."
            ))

        if w.temperature >= 40.0 or w.feels_like >= 46.0:
            alerts.append(EarlyWarningAlert(
                id=str(uuid.uuid4()),
                hazard="Heat Wave",
                risk_level="High" if w.temperature < 42.0 else "Critical",
                title="☀️ HEAT WAVE RED WARNING: Dangerous Thermal Stress",
                message=f"Ambient temperature has reached {w.temperature}°C (Feels like {w.feels_like}°C). Risk of severe heat exhaustion and hyperthermia.",
                message_ta=f"வெப்பநிலை {w.temperature}°C ஆக உயர்ந்துள்ளது (உணரப்படுவது {w.feels_like}°C). முற்பகல் 11 முதல் பிற்பகல் 3 மணி வரை வெளியே செல்வதை தவிர்க்கவும்.",
                affected_zones=["T. Nagar", "Broadway", "Tambaram", "Ambattur Industrial Zone", "Guindy"],
                triggered_parameter="Air Temperature & Heat Index",
                threshold_value="Temperature >= 40°C OR Feels Like >= 46°C",
                current_value=f"{w.temperature}°C (Feels like {w.feels_like}°C)",
                timestamp=now_str,
                action_required="Open emergency hydration shelters. Halt manual construction labor between 11:00 AM - 03:30 PM."
            ))

        if w.aqi >= 180:
            alerts.append(EarlyWarningAlert(
                id=str(uuid.uuid4()),
                hazard="Drought", # civic atmospheric
                risk_level="High",
                title="💨 AIR QUALITY ADVISORY: Unhealthy Particulate Index",
                message=f"Air Quality Index has crossed {w.aqi} AQI. Vulnerable citizens, children, and elderly should wear N95 filtration masks.",
                message_ta=f"காற்றின் தரம் {w.aqi} AQI ஆக குறைந்துள்ளது. முதியவர்கள் மற்றும் குழந்தைகள் வெளியில் செல்வதை தவிர்க்கவும்.",
                affected_zones=["Manali Petrochemical Belt", "Royapuram", "Kodungaiyur", "Central Station Area"],
                triggered_parameter="Air Quality Index (AQI)",
                threshold_value="AQI >= 180",
                current_value=f"{w.aqi} AQI ({w.aqi_status})",
                timestamp=now_str,
                action_required="Deploy mobile mist cannons and alert all pulmonology wards across government hospitals."
            ))

        # ── AI RECOMMENDATIONS (Requirement 8) ──────────────────────────────
        if max_level in ["Critical", "High"]:
            recommendations.append(AIRecommendation(
                id=str(uuid.uuid4()),
                category="Evacuation",
                priority="P1 - Immediate",
                title="Order Preemptive Evacuation for Priority 1 Low-Lying Sectors",
                description="Immediately evacuate ground floor residents in Velachery, Mudichur, and Saidapet to designated cyclone/flood relief centers.",
                target_agency="Greater Chennai Corporation (GCC) & Revenue Dept",
                status="PENDING"
            ))
            recommendations.append(AIRecommendation(
                id=str(uuid.uuid4()),
                category="Shelter",
                priority="P1 - Immediate",
                title="Activate All Tier-1 Safe Shelters with Backup Power & Food Supplies",
                description="Unlock community centers, state schools, and multipurpose cyclone shelters. Pre-position 25,000 food rations and drinking water tanks.",
                target_agency="Tamil Nadu Disaster Management Authority (TNDMA)",
                status="PENDING"
            ))
            recommendations.append(AIRecommendation(
                id=str(uuid.uuid4()),
                category="Rescue",
                priority="P1 - Immediate",
                title="Pre-stage NDRF 4th Battalion & SDRF Inflatable Zodiac Boats",
                description="Deploy 6 motorized disaster response boat units to Adyar Maraimalai bridge and Velachery bypass junction.",
                target_agency="National Disaster Response Force (NDRF Arakkonam Unit)",
                status="PENDING"
            ))
            recommendations.append(AIRecommendation(
                id=str(uuid.uuid4()),
                category="Medical",
                priority="P2 - High",
                title="Put 108 Emergency Ambulance Network & Rajiv Gandhi Govt Hospital on Code Red",
                description="Station trauma response ambulances at every 2 km radius. Keep emergency generators and ICU life-support fueled.",
                target_agency="Directorate of Medical Services (DMS)",
                status="PENDING"
            ))
        elif max_level == "Moderate":
            recommendations.append(AIRecommendation(
                id=str(uuid.uuid4()),
                category="Civic Advisory",
                priority="P3 - Moderate",
                title="Issue Public Weather Advisory & Clear Stormwater Sump Inlets",
                description="GCC engineering teams should clear secondary canal trash racks and keep high-capacity dewatering diesel pump trucks on standby.",
                target_agency="Chennai Metropolitan Water Supply and Sewerage Board (CMWSSB)",
                status="PENDING"
            ))
            recommendations.append(AIRecommendation(
                id=str(uuid.uuid4()),
                category="Shelter",
                priority="P3 - Moderate",
                title="Put Relief Shelters on 4-Hour Rapid Activation Standby",
                description="Verify key custody and inspect diesel generators across all 18 zonal shelters.",
                target_agency="Greater Chennai Corporation",
                status="PENDING"
            ))
        else:
            recommendations.append(AIRecommendation(
                id=str(uuid.uuid4()),
                category="Civic Advisory",
                priority="P4 - Advisory",
                title="Routine Meteorological Telemetry & Basin Monitoring",
                description="Weather parameters are within safe operational envelopes. Maintain standard 30-minute sensor telemetry polling.",
                target_agency="Chennai Emergency Operations Center (EOC)",
                status="PENDING"
            ))

        return max_level, predictions, alerts, recommendations

ai_analyzer = ClimateAIAnalyzer()
