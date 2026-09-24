import { Router, Request, Response } from 'express';

const router = Router();
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8008';

/**
 * Proxy helper: Forwards request to FastAPI backend service.
 * If FastAPI is unreachable, returns high-fidelity fallback response.
 */
async function proxyToFastApi(endpoint: string, method = 'GET', body?: any) {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/climate${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // FastAPI service not reachable -> use fallback generator
  }
  return null;
}

// ── In-Memory Climate State Fallback (Matches FastAPI Model) ───────────────

let currentProfile = 'NORMAL';

const PROFILES: Record<string, any> = {
  NORMAL: {
    temperature: 32.4, feels_like: 36.1, temp_min: 26.5, temp_max: 34.8,
    humidity: 68, rainfall_1h: 0.0, rainfall_24h: 2.5,
    wind_speed: 16.5, wind_direction: 80, wind_direction_compass: 'ENE',
    pressure: 1012.0, aqi: 72, aqi_status: 'Moderate', uv_index: 7.5,
    cloud_cover: 35, visibility_km: 9.5, condition: 'Partly Cloudy · Sea Breeze', icon: 'cloud-sun',
  },
  CYCLONE: {
    temperature: 26.2, feels_like: 28.0, temp_min: 24.0, temp_max: 27.5,
    humidity: 96, rainfall_1h: 42.5, rainfall_24h: 185.0,
    wind_speed: 88.5, wind_direction: 35, wind_direction_compass: 'NE',
    pressure: 968.4, aqi: 28, aqi_status: 'Good', uv_index: 1.2,
    cloud_cover: 100, visibility_km: 2.1, condition: 'Severe Cyclonic Storm (Cat-3) · Torrential Winds', icon: 'tornado',
  },
  FLOOD: {
    temperature: 27.0, feels_like: 31.0, temp_min: 24.5, temp_max: 28.2,
    humidity: 98, rainfall_1h: 78.4, rainfall_24h: 260.0,
    wind_speed: 45.0, wind_direction: 65, wind_direction_compass: 'ENE',
    pressure: 994.0, aqi: 32, aqi_status: 'Good', uv_index: 2.0,
    cloud_cover: 95, visibility_km: 3.0, condition: 'Extreme Torrential Rainfall · Flash Flood Risk', icon: 'cloud-rain',
  },
  HEAT_WAVE: {
    temperature: 42.8, feels_like: 49.5, temp_min: 31.0, temp_max: 43.6,
    humidity: 38, rainfall_1h: 0.0, rainfall_24h: 0.0,
    wind_speed: 12.0, wind_direction: 280, wind_direction_compass: 'WNW',
    pressure: 1006.0, aqi: 186, aqi_status: 'Unhealthy', uv_index: 11.2,
    cloud_cover: 5, visibility_km: 6.5, condition: 'Severe Heatwave · High Thermal Index', icon: 'sun',
  },
  LANDSLIDE: {
    temperature: 24.8, feels_like: 26.5, temp_min: 22.0, temp_max: 26.0,
    humidity: 94, rainfall_1h: 58.0, rainfall_24h: 210.0,
    wind_speed: 38.0, wind_direction: 120, wind_direction_compass: 'ESE',
    pressure: 998.0, aqi: 35, aqi_status: 'Good', uv_index: 2.5,
    cloud_cover: 90, visibility_km: 4.0, condition: 'Continuous Heavy Downpour · Soil Saturation 94%', icon: 'mountain',
  },
  DROUGHT: {
    temperature: 39.5, feels_like: 43.0, temp_min: 29.0, temp_max: 40.5,
    humidity: 22, rainfall_1h: 0.0, rainfall_24h: 0.0,
    wind_speed: 18.0, wind_direction: 310, wind_direction_compass: 'NW',
    pressure: 1014.0, aqi: 145, aqi_status: 'Unhealthy for Sensitive', uv_index: 9.8,
    cloud_cover: 8, visibility_km: 7.0, condition: 'Prolonged Dry Spell · Soil Moisture Depleted', icon: 'sun-dim',
  },
};

const CHENNAI_SHELTERS = [
  { id: 'shelter-1', name: 'Greater Chennai Community Hall & Cyclone Relief Center', locality: 'Saidapet', latitude: 13.0210, longitude: 80.2235, capacity: 1200, current_occupancy: 140, status: 'READY', contact_person: 'M. Soundararajan (Zonal Officer)', contact_phone: '+91 94441 23451', facilities: ['Diesel Generator 120kVA', 'Purified RO Water 10,000L', 'First Aid Center', 'Food Storage 5,000 Rations'] },
  { id: 'shelter-2', name: 'Velachery Multipurpose Disaster Center', locality: 'Velachery Bypass', latitude: 12.9835, longitude: 80.2201, capacity: 2500, current_occupancy: 420, status: 'READY', contact_person: 'R. Jayakumar (GCC Ward Inspector)', contact_phone: '+91 94441 23452', facilities: ['Elevated Plinth 4m', 'Helipad Access', '200 Bed Medical Ward', 'Mobile Charging Station'] },
  { id: 'shelter-3', name: 'St. Thomas Higher Secondary Relief Complex', locality: 'Mylapore', latitude: 13.0345, longitude: 80.2690, capacity: 950, current_occupancy: 65, status: 'READY', contact_person: 'Sister Mary Angela', contact_phone: '+91 94441 23453', facilities: ['Community Kitchen', 'Baby Care Unit', 'Solar Battery Backup', 'Emergency Satellite Phone'] },
  { id: 'shelter-4', name: 'Tambaram Sanatorium Emergency Shelter', locality: 'Tambaram East', latitude: 12.9280, longitude: 80.1150, capacity: 1800, current_occupancy: 0, status: 'STANDBY', contact_person: 'K. Vignesh (Tahsildar)', contact_phone: '+91 94441 23454', facilities: ['Adjacent Railway Access', 'Heavy Vehicle Staging Area', 'Water Tanker Sump'] },
  { id: 'shelter-5', name: 'Perambur North Chennai Municipal Relief Pavilion', locality: 'Perambur', latitude: 13.1180, longitude: 80.2370, capacity: 1400, current_occupancy: 110, status: 'READY', contact_person: 'Dr. S. Meenakshi (Health Inspector)', contact_phone: '+91 94441 23455', facilities: ['Isolation Ward', 'Ambulance Bay', 'Community Mess'] },
];

const CHENNAI_RESCUE_TEAMS = [
  { id: 'team-ndrf-01', unit_name: 'NDRF 4th Battalion - Alfa QRF', agency: 'NDRF', team_type: 'Flood Rescue', station_location: 'Adyar River Maraimalai Bridge Staging Post', latitude: 13.0125, longitude: 80.2280, personnel_count: 45, boats_available: 8, ambulances_available: 3, status: 'DEPLOYED', contact_channel: 'VHF Channel 16 / TAC-1' },
  { id: 'team-sdrf-02', unit_name: 'Tamil Nadu SDRF Coastal Tactical Unit', agency: 'SDRF', team_type: 'Search & Extrication', station_location: 'Marina Beach Lighthouse Command Post', latitude: 13.0400, longitude: 80.2810, personnel_count: 32, boats_available: 5, ambulances_available: 2, status: 'ACTIVE', contact_channel: 'Tamil Nadu Police Wireless (TAC-3)' },
  { id: 'team-tnfrs-03', unit_name: 'TNFRS Fire & Heavy Rescue - Sector 4', agency: 'TNFRS Fire & Rescue', team_type: 'Medical Evacuation', station_location: 'Saidapet Central Fire Station', latitude: 13.0185, longitude: 80.2195, personnel_count: 28, boats_available: 4, ambulances_available: 4, status: 'STANDBY', contact_channel: 'Emergency Dispatch 101' },
  { id: 'team-coastguard-04', unit_name: 'Indian Coast Guard Air & Marine Enclave', agency: 'Coast Guard', team_type: 'Flood Rescue', station_location: 'Chennai Port Basin Base', latitude: 13.0900, longitude: 80.2980, personnel_count: 50, boats_available: 6, ambulances_available: 2, status: 'STANDBY', contact_channel: 'Marine VHF Ch-16' },
];

const CHENNAI_DISASTER_ZONES = [
  { id: 'zone-dpz-1', name: 'Velachery Lake & Residential Basin', zone_type: 'Flood Basin', risk_level: 'Critical', description: 'Low elevation saucer-shaped depression with high stormwater ingress and slow tidal canal discharge.', latitude: 12.9815, longitude: 80.2183, radius_meters: 1800, vulnerable_population: 68000 },
  { id: 'zone-dpz-2', name: 'Adyar River Estuary & Saidapet Causeway', zone_type: 'Flood Basin', risk_level: 'Critical', description: 'Surplus discharge bottleneck from Chembarambakkam reservoir; prone to rapid flash-flooding of causeway.', latitude: 13.0206, longitude: 80.2206, radius_meters: 1400, vulnerable_population: 45000 },
  { id: 'zone-dpz-3', name: 'Marina & Foreshore Coastal Storm Surge Belt', zone_type: 'Coastal Surge', risk_level: 'High', description: 'Vulnerable to high astronomical tides, cyclonic waves, and direct seawater inundation of fisherman settlements.', latitude: 13.0450, longitude: 80.2820, radius_meters: 2200, vulnerable_population: 38000 },
  { id: 'zone-dpz-4', name: 'Mudichur & Tambaram Low-Lying Swamps', zone_type: 'Low-Lying Waterlogging', risk_level: 'High', description: 'Natural marshland urbanized without peripheral gravity channels; waterlogging exceeds 1.5m in high rainfall.', latitude: 12.9150, longitude: 80.0850, radius_meters: 2500, vulnerable_population: 52000 },
  { id: 'zone-dpz-5', name: 'St. Thomas Mount Ridge Quarry Slope', zone_type: 'Landslide Risk', risk_level: 'Moderate', description: 'Exposed weathered charnockite rock face and loose topsoil saturated after prolonged heavy precipitation.', latitude: 13.0030, longitude: 80.1940, radius_meters: 800, vulnerable_population: 12000 },
];

function buildFallbackDashboard() {
  const p = PROFILES[currentProfile] || PROFILES.NORMAL;
  const now = new Date().toISOString();

  // Forecast 24h
  const forecast_24h = [
    { time: '00:00', temperature: p.temperature - 1.2, rainfall: p.rainfall_1h * 0.8, humidity: p.humidity, wind_speed: p.wind_speed * 0.9, pressure: p.pressure },
    { time: '03:00', temperature: p.temperature - 1.8, rainfall: p.rainfall_1h * 0.9, humidity: p.humidity, wind_speed: p.wind_speed * 0.95, pressure: p.pressure - 0.5 },
    { time: '06:00', temperature: p.temperature - 0.5, rainfall: p.rainfall_1h * 1.0, humidity: p.humidity, wind_speed: p.wind_speed, pressure: p.pressure - 1.0 },
    { time: '09:00', temperature: p.temperature + 1.2, rainfall: p.rainfall_1h * 1.1, humidity: p.humidity - 4, wind_speed: p.wind_speed * 1.1, pressure: p.pressure - 1.5 },
    { time: '12:00', temperature: p.temperature + 2.0, rainfall: p.rainfall_1h * 1.2, humidity: p.humidity - 8, wind_speed: p.wind_speed * 1.15, pressure: p.pressure - 2.0 },
    { time: '15:00', temperature: p.temperature + 1.5, rainfall: p.rainfall_1h * 1.1, humidity: p.humidity - 5, wind_speed: p.wind_speed * 1.1, pressure: p.pressure - 1.5 },
    { time: '18:00', temperature: p.temperature + 0.2, rainfall: p.rainfall_1h * 0.9, humidity: p.humidity, wind_speed: p.wind_speed * 1.0, pressure: p.pressure - 1.0 },
    { time: '21:00', temperature: p.temperature - 0.8, rainfall: p.rainfall_1h * 0.8, humidity: p.humidity, wind_speed: p.wind_speed * 0.9, pressure: p.pressure },
  ];

  // Predictions
  const floodProb = p.rainfall_1h >= 40 ? 94 : p.rainfall_1h >= 20 ? 68 : 12;
  const cycloneProb = p.wind_speed >= 65 || p.pressure <= 980 ? 96 : p.wind_speed >= 40 ? 55 : 8;
  const rainProb = p.rainfall_1h >= 30 ? 95 : p.rainfall_1h >= 10 ? 70 : 18;
  const heatProb = p.temperature >= 41 ? 92 : p.temperature >= 37 ? 65 : 10;
  const landslideProb = p.rainfall_24h >= 180 ? 88 : p.rainfall_24h >= 80 ? 45 : 5;
  const droughtProb = p.humidity <= 25 && p.temperature >= 38 ? 85 : 6;

  const predictions = [
    { hazard: 'Flood', probability: floodProb, risk_level: floodProb > 75 ? 'Critical' : floodProb > 50 ? 'High' : floodProb > 25 ? 'Moderate' : 'Low', severity_score: round(floodProb / 10, 1), triggers: [p.rainfall_1h > 0 ? `Rainfall rate: ${p.rainfall_1h} mm/hr` : 'Drainage nominal'], description: 'Adyar & Cooum basin stormwater flood modeling.', projected_impact_window: 'Next 3–6 Hours' },
    { hazard: 'Cyclone', probability: cycloneProb, risk_level: cycloneProb > 75 ? 'Critical' : cycloneProb > 50 ? 'High' : cycloneProb > 25 ? 'Moderate' : 'Low', severity_score: round(cycloneProb / 10, 1), triggers: [p.wind_speed > 30 ? `Sustained wind: ${p.wind_speed} km/h` : 'Pressure stable', `Pressure: ${p.pressure} hPa`], description: 'Bay of Bengal cyclonic depression vortex assessment.', projected_impact_window: 'Next 6–12 Hours' },
    { hazard: 'Heavy Rain', probability: rainProb, risk_level: rainProb > 75 ? 'Critical' : rainProb > 50 ? 'High' : rainProb > 25 ? 'Moderate' : 'Low', severity_score: round(rainProb / 10, 1), triggers: [`Cloud cover: ${p.cloud_cover}%`, `Rain: ${p.rainfall_1h} mm/hr`], description: 'Deep convective convective cloud clusters.', projected_impact_window: 'Next 2–4 Hours' },
    { hazard: 'Heat Wave', probability: heatProb, risk_level: heatProb > 75 ? 'Critical' : heatProb > 50 ? 'High' : heatProb > 25 ? 'Moderate' : 'Low', severity_score: round(heatProb / 10, 1), triggers: [`Ambient temp: ${p.temperature}°C`, `Heat index: ${p.feels_like}°C`], description: 'Excessive thermal radiation index.', projected_impact_window: 'Next 12–24 Hours' },
    { hazard: 'Landslide', probability: landslideProb, risk_level: landslideProb > 75 ? 'Critical' : landslideProb > 50 ? 'High' : landslideProb > 25 ? 'Moderate' : 'Low', severity_score: round(landslideProb / 10, 1), triggers: [`Soil moisture saturation: ${p.humidity}%`], description: 'Suburban ridge slope stability.', projected_impact_window: 'Next 6–18 Hours' },
    { hazard: 'Drought', probability: droughtProb, risk_level: droughtProb > 75 ? 'Critical' : droughtProb > 50 ? 'High' : droughtProb > 25 ? 'Moderate' : 'Low', severity_score: round(droughtProb / 10, 1), triggers: [`Relative humidity: ${p.humidity}%`], description: 'Reservoir aridity index.', projected_impact_window: 'Next 1–2 Weeks' },
  ];

  const maxRisk = predictions.some((x) => x.risk_level === 'Critical')
    ? 'Critical'
    : predictions.some((x) => x.risk_level === 'High')
    ? 'High'
    : predictions.some((x) => x.risk_level === 'Moderate')
    ? 'Moderate'
    : 'Low';

  const alerts = [];
  if (p.rainfall_1h >= 40) {
    alerts.push({
      id: 'alt-flood-01',
      hazard: 'Flood',
      risk_level: 'Critical',
      title: '🔴 RED ALERT: Severe Flash Flood Inundation Warning',
      message: `Extreme rainfall rate of ${p.rainfall_1h} mm/hr detected across Chennai central sector. River canals overflowing.`,
      message_ta: `சென்னை மத்திய பகுதியில் மணிக்கு ${p.rainfall_1h} மி.மீ மழை பதிவாகியுள்ளது. உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.`,
      affected_zones: ['Velachery', 'Saidapet', 'Mudichur', 'Pallikaranai'],
      triggered_parameter: 'Rainfall Intensity',
      threshold_value: '>= 40.0 mm/hr',
      current_value: `${p.rainfall_1h} mm/hr`,
      timestamp: now,
      action_required: 'Evacuate ground-floor residents along canal banks immediately.',
      can_trigger_emergency_broadcast: true,
    });
  }
  if (p.wind_speed >= 65 || p.pressure <= 980) {
    alerts.push({
      id: 'alt-cyclone-01',
      hazard: 'Cyclone',
      risk_level: 'Critical',
      title: '🌀 RED ALERT: Destructive Cyclonic Gale Warning',
      message: `Severe cyclonic winds at ${p.wind_speed} km/h with central pressure dropping to ${p.pressure} hPa. Coastal storm surge expected.`,
      message_ta: `சூறாவளி காற்று மணிக்கு ${p.wind_speed} கி.மீ வேகத்தில் வீசுகிறது. கடலோர பகுதிகளை விட்டு வெளியேறவும்.`,
      affected_zones: ['Ennore Port', 'Marina Beach', 'Besant Nagar', 'Kovalam'],
      triggered_parameter: 'Wind Speed & Pressure',
      threshold_value: 'Wind >= 65 km/h OR Pressure <= 980 hPa',
      current_value: `${p.wind_speed} km/h, ${p.pressure} hPa`,
      timestamp: now,
      action_required: 'Complete coastal evacuation. Suspend all metro and bridge traffic.',
      can_trigger_emergency_broadcast: true,
    });
  }
  if (p.temperature >= 40 || p.feels_like >= 46) {
    alerts.push({
      id: 'alt-heat-01',
      hazard: 'Heat Wave',
      risk_level: 'Critical',
      title: '☀️ HEAT WAVE RED ALERT: Severe Thermal Distress',
      message: `Ambient temperature has reached ${p.temperature}°C (Feels like ${p.feels_like}°C). Risk of heat stroke.`,
      message_ta: `வெப்பநிலை ${p.temperature}°C ஆக உயர்ந்துள்ளது. நண்பகல் 11 முதல் மாலை 3 வரை வெளியே செல்வதை தவிர்க்கவும்.`,
      affected_zones: ['T. Nagar', 'Broadway', 'Tambaram', 'Guindy'],
      triggered_parameter: 'Air Temperature & Heat Index',
      threshold_value: 'Temperature >= 40°C',
      current_value: `${p.temperature}°C`,
      timestamp: now,
      action_required: 'Open hydration shelters. Restrict manual construction work.',
      can_trigger_emergency_broadcast: true,
    });
  }

  const recommendations = [
    { id: 'rec-1', category: 'Evacuation', priority: maxRisk === 'Critical' ? 'P1 - Immediate' : 'P3 - Moderate', title: 'Preemptive Low-Lying Sector Evacuation', description: 'Deploy GCC revenue teams to assist low-lying residential movement to relief shelters.', target_agency: 'Greater Chennai Corporation (GCC)', status: 'PENDING' },
    { id: 'rec-2', category: 'Shelter', priority: maxRisk === 'Critical' ? 'P1 - Immediate' : 'P3 - Moderate', title: 'Unlock All Multipurpose Cyclone Shelters', description: 'Pre-position 20,000 food rations, clean water tanks, and backup diesel generators.', target_agency: 'Tamil Nadu Disaster Management Authority', status: 'PENDING' },
    { id: 'rec-3', category: 'Rescue', priority: maxRisk === 'Critical' ? 'P1 - Immediate' : 'P3 - Moderate', title: 'Pre-stage NDRF 4th Battalion Rescue Boats', description: 'Position motorized boats at Maraimalai Bridge and Velachery Bypass junction.', target_agency: 'NDRF Arakkonam Unit', status: 'PENDING' },
    { id: 'rec-4', category: 'Medical', priority: maxRisk === 'Critical' ? 'P2 - High' : 'P4 - Advisory', title: 'Keep Emergency Medical Teams on Standby', description: 'Alert 108 Emergency Ambulance network and Rajiv Gandhi Govt Hospital ICU wards.', target_agency: 'Directorate of Medical Services', status: 'PENDING' },
  ];

  return {
    current_weather: {
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'IN',
      latitude: 13.0827,
      longitude: 80.2707,
      ...p,
      timestamp: now,
      source: `SIMULATED (${currentProfile})`,
    },
    overall_risk_level: maxRisk,
    disaster_predictions: predictions,
    active_alerts: alerts,
    recommendations,
    shelters: CHENNAI_SHELTERS,
    rescue_teams: CHENNAI_RESCUE_TEAMS,
    disaster_zones: CHENNAI_DISASTER_ZONES,
    forecast_24h,
    data_source_mode: 'SIMULATED',
    provider_name: 'FastAPI / Climate Intelligence Engine (IMD/NASA Architecture Ready)',
  };
}

function round(n: number, d = 1) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

// ── Endpoints ─────────────────────────────────────────────────────────────

router.get('/dashboard', async (req: Request, res: Response) => {
  const fastApiData = await proxyToFastApi('/dashboard');
  if (fastApiData) return res.json({ success: true, data: fastApiData });
  res.json({ success: true, data: buildFallbackDashboard() });
});

router.get('/current', async (req: Request, res: Response) => {
  const fastApiData = await proxyToFastApi('/current');
  if (fastApiData) return res.json({ success: true, data: fastApiData });
  res.json({ success: true, data: buildFallbackDashboard().current_weather });
});

router.get('/forecast', async (req: Request, res: Response) => {
  const fastApiData = await proxyToFastApi('/forecast');
  if (fastApiData) return res.json({ success: true, data: fastApiData });
  res.json({ success: true, data: buildFallbackDashboard().forecast_24h });
});

router.get('/predictions', async (req: Request, res: Response) => {
  const fastApiData = await proxyToFastApi('/predictions');
  if (fastApiData) return res.json({ success: true, data: fastApiData });
  res.json({ success: true, data: buildFallbackDashboard().disaster_predictions });
});

router.get('/alerts', async (req: Request, res: Response) => {
  const fastApiData = await proxyToFastApi('/alerts');
  if (fastApiData) return res.json({ success: true, data: fastApiData });
  res.json({ success: true, data: buildFallbackDashboard().active_alerts });
});

router.get('/map-layers', async (req: Request, res: Response) => {
  const fastApiData = await proxyToFastApi('/map-layers');
  if (fastApiData) return res.json({ success: true, data: fastApiData });
  res.json({
    success: true,
    data: {
      shelters: CHENNAI_SHELTERS,
      rescue_teams: CHENNAI_RESCUE_TEAMS,
      disaster_zones: CHENNAI_DISASTER_ZONES,
    },
  });
});

router.get('/history', async (req: Request, res: Response) => {
  const fastApiData = await proxyToFastApi('/history');
  if (fastApiData) return res.json({ success: true, data: fastApiData });
  // Mock history
  const d = new Date();
  const hist = [
    { id: 'h-1', timestamp: d.toISOString(), city: 'Chennai', temperature: 32.4, humidity: 68, rainfall: 0.0, wind_speed: 16.5, pressure: 1012.0, aqi: 72, predicted_hazard: 'Heat Wave', risk_level: 'Low', recommendation: 'Hydration advisories issued.' },
    { id: 'h-2', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), city: 'Chennai', temperature: 29.5, humidity: 85, rainfall: 18.0, wind_speed: 26.0, pressure: 1008.4, aqi: 42, predicted_hazard: 'Heavy Rain', risk_level: 'Moderate', recommendation: 'Adyar river basin monitors on active surveillance.' },
    { id: 'h-3', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), city: 'Chennai', temperature: 28.0, humidity: 92, rainfall: 38.5, wind_speed: 34.0, pressure: 1005.1, aqi: 38, predicted_hazard: 'Flood', risk_level: 'High', recommendation: 'Sump discharge pumps deployed at Velachery.' },
  ];
  res.json({ success: true, data: hist });
});

router.post('/simulate-hazard', async (req: Request, res: Response) => {
  const { hazard = 'NORMAL' } = req.body;
  currentProfile = hazard.toUpperCase();
  await proxyToFastApi('/simulate-hazard', 'POST', { hazard: currentProfile });
  res.json({
    success: true,
    hazard_profile_activated: currentProfile,
    message: `Switched climate hazard scenario to ${currentProfile}`,
    dashboard: buildFallbackDashboard(),
  });
});

export default router;
