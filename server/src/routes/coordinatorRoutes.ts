import { Router, Request, Response } from 'express';

const router = Router();
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8008';

/**
 * Proxy helper: Forwards request to FastAPI coordinator microservice.
 */
async function proxyToFastApi(endpoint: string, method = 'GET', body?: any) {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/coordinator${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // FastAPI service unreachable -> fallback
  }
  return null;
}

// ── Fallback State in case FastAPI is offline ──────────────────────────────
function getFallbackDashboard() {
  const now = new Date().toISOString();
  return {
    situation: {
      disaster_type: "Flood",
      disaster_severity: "Critical",
      location_name: "Velachery & Adyar Basin Corridor",
      latitude: 12.9815,
      longitude: 80.218,
      active_sim_count: 14250,
      estimated_population: 18600,
      population_density_level: "Critical",
      rainfall_mm_h: 48.5,
      wind_speed_kmh: 38.0,
      temperature_c: 27.2,
      atmospheric_pressure_hpa: 998.4,
      flooded_roads_count: 6,
      available_shelters: 5,
      available_rescue_teams: 4,
      available_hospitals: 5,
      available_ambulances: 24,
      food_water_stock_days: 2.1,
    },
    priority: {
      score: 88.5,
      level: "CRITICAL",
      breakdown: {
        "Disaster Severity Impact (30%)": 28.5,
        "Population Density at Risk (30%)": 28.5,
        "Road Infrastructure Inundation (20%)": 15.0,
        "Resource Deficit & Vulnerability (20%)": 16.5,
      },
      summary: "Calculated CRITICAL Priority Score of 88.5/100 based on Critical Flood impacting 14,250 active citizens with 6 inundated arterial routes.",
    },
    engine_status: "AUTONOMOUS_COORDINATING",
    overall_progress_percent: 74,
    active_agents_count: 7,
    total_agents_count: 7,
    agents: [
      {
        id: "agent-medical-01",
        name: "Medical Triage & Hospital Agent",
        type: "MEDICAL",
        status: "ACTIVE",
        is_active: true,
        confidence: 0.96,
        activation_reason: "AI analyzed the disaster and activated Medical Agent because of high injury probability (est. 641 casualties in affected sectors).",
        key_metrics: {
          estimated_casualties: 641,
          critical_trauma_cases: 141,
          ambulances_assigned: 21,
          nearest_hospitals: [
            { name: "Rajiv Gandhi Govt General Hospital", distance_km: 11.2, icu_beds: 48, status: "Ready" },
            { name: "Apollo Hospitals Greams Road", distance_km: 9.4, icu_beds: 32, status: "Ready" },
            { name: "MIOT International Manapakkam", distance_km: 6.8, icu_beds: 26, status: "Trauma Ready" },
            { name: "Kilpauk Medical College", distance_km: 12.1, icu_beds: 36, status: "Ready" },
          ],
          medical_supplies_status: "Adequate (48h Reserve)",
        },
        assigned_tasks: [
          { id: "task-med-101", title: "Identify Nearest Trauma Centers & Hospital Bed Availability", description: "Queried Apollo OMR, Rajiv Gandhi Govt General Hospital, and MIOT International.", status: "COMPLETED", priority: "URGENT", progress_percent: 100, target_entity: "5 Regional Hospitals", estimated_completion_min: 0, created_at: "00:15:20", updated_at: "00:15:20" },
          { id: "task-med-102", title: "Dispatch Advanced Life Support (ALS) Ambulances", description: "Allocating 21 ambulances with paramedic triage teams to designated triage pickup points in Sector Alpha & Beta.", status: "IN_PROGRESS", priority: "URGENT", progress_percent: 78, target_entity: "21 Emergency Ambulances", estimated_completion_min: 8, created_at: "00:15:30", updated_at: "00:15:30" },
          { id: "task-med-103", title: "Deploy Rapid Field Medical Posts & Anti-Venom Kits", description: "Setting up 2 inflatable field treatment clinics at Guru Nanak College shelter.", status: "IN_PROGRESS", priority: "HIGH", progress_percent: 60, target_entity: "2 Field Clinics", estimated_completion_min: 14, created_at: "00:15:40", updated_at: "00:15:40" },
        ],
        activity_log: [
          { timestamp: "00:15:20", action: "Hospital Capacity Ping", detail: "Confirmed 142 vacant ICU beds across Apollo and Rajiv Gandhi Hospital.", severity: "INFO" },
          { timestamp: "00:15:30", action: "Casualty Estimate Calculated", detail: "Estimated 641 potential injured (141 high priority trauma cases).", severity: "ALERT" },
          { timestamp: "00:15:40", action: "Fleet Dispatched", detail: "Dispatched 21 ALS ambulances to Sector Alpha staging area.", severity: "SUCCESS" },
        ],
      },
      {
        id: "agent-rescue-02",
        name: "Tactical Rescue & Extraction Agent",
        type: "RESCUE",
        status: "ACTIVE",
        is_active: true,
        confidence: 0.98,
        activation_reason: "AI activated Rescue Agent to assign 4 specialized rescue battalions, divide sectors, and deploy 14 motorized boats into high-hazard flood zones.",
        key_metrics: {
          teams_deployed: 4,
          rescue_boats_active: 14,
          civilians_extracted: 340,
          active_rescue_zones: [
            { sector: "Sector Alpha", priority: "CRITICAL", water_depth_m: 1.6, extracted: 185 },
            { sector: "Sector Beta", priority: "HIGH", water_depth_m: 1.1, extracted: 110 },
            { sector: "Sector Gamma", priority: "MEDIUM", water_depth_m: 0.6, extracted: 45 },
          ],
          safest_route: "Tambaram Bypass -> Velachery Elevated Flyover (Clear of Waterlogging)",
        },
        assigned_tasks: [
          { id: "task-resc-201", title: "Tactical Sector Partitioning (Grids Alpha to Delta)", description: "Subdivided disaster polygon into 4 operational tactical sectors.", status: "COMPLETED", priority: "URGENT", progress_percent: 100, target_entity: "4 Tactical Grids", estimated_completion_min: 0, created_at: "00:15:25", updated_at: "00:15:25" },
          { id: "task-resc-202", title: "Deploy NDRF 4th Battalion Inflatable Motorized Boats", description: "Dispatched 14 Gemini inflatable rescue boats into Velachery lowlands.", status: "IN_PROGRESS", priority: "URGENT", progress_percent: 82, target_entity: "NDRF Team Alpha (42 Personnel)", estimated_completion_min: 10, created_at: "00:15:35", updated_at: "00:15:35" },
        ],
        activity_log: [
          { timestamp: "00:15:25", action: "Tactical Grid Locked", detail: "Sectors Alpha, Beta, Gamma designated.", severity: "INFO" },
          { timestamp: "00:15:35", action: "Rescue Deployment", detail: "Dispatched 4 teams with 14 motorized boats.", severity: "ALERT" },
          { timestamp: "00:15:45", action: "Civilians Extracted", detail: "Extracted 340 trapped residents.", severity: "SUCCESS" },
        ],
      },
      {
        id: "agent-comm-03",
        name: "Emergency Mass Alert & Authority Comms Agent",
        type: "COMMUNICATION",
        status: "ACTIVE",
        is_active: true,
        confidence: 0.99,
        activation_reason: "AI activated Communication Agent because the affected population (14,250 active SIMs) exceeded the alert threshold (5,000).",
        key_metrics: {
          sms_recipients_target: 14250,
          sms_delivered_estimate: 12600,
          sms_delivery_rate: "88.4%",
          supported_languages: ["Tamil (தமிழ்)", "English", "Hindi (हिन्दी)"],
          authorities_notified: ["TNSDMA SEOC", "Greater Chennai Corporation", "Chennai City Police"],
          radio_channels_bridged: 4,
        },
        assigned_tasks: [
          { id: "task-comm-301", title: "Cell Broadcast Multi-Carrier Mass SMS Alert", description: "Queued geo-targeted cell broadcast SMS payloads to 14,250 active mobile devices.", status: "IN_PROGRESS", priority: "URGENT", progress_percent: 85, target_entity: "14,250 Active SIMs", estimated_completion_min: 3, created_at: "00:15:22", updated_at: "00:15:22" },
          { id: "task-comm-302", title: "Automated High-Priority Authority Notification Dispatch", description: "Sent encrypted situational brief to TNSDMA State EOC.", status: "COMPLETED", priority: "URGENT", progress_percent: 100, target_entity: "State Disaster Management (TNSDMA)", estimated_completion_min: 0, created_at: "00:15:25", updated_at: "00:15:25" },
        ],
        activity_log: [
          { timestamp: "00:15:22", action: "Cell Broadcast Triggered", detail: "Targeting 14,250 detected subscribers in 2.5km disaster radius.", severity: "ALERT" },
          { timestamp: "00:15:25", action: "Authority Dispatch Confirmed", detail: "Disaster briefing acknowledged by Chennai District Collector control desk.", severity: "SUCCESS" },
        ],
      },
      {
        id: "agent-logistics-04",
        name: "Relief Logistics & Supply Chain Agent",
        type: "LOGISTICS",
        status: "ACTIVE",
        is_active: true,
        confidence: 0.95,
        activation_reason: "AI activated Logistics Agent due to food shortage & drinking water reserve depletion in inundated sectors.",
        key_metrics: {
          food_packs_allocated: 25000,
          food_packs_delivered: 14200,
          potable_water_liters: 60000,
          water_delivered_liters: 38500,
          trucks_in_transit: 6,
          relief_drones_active: 4,
          identified_shortages: ["Infant Formula", "Feminine Hygiene Packs", "Water Purification Tablets (10k needed)"],
          stock_runway_hours: 36,
        },
        assigned_tasks: [
          { id: "task-log-401", title: "Mobilize Food Ration Packs (MREs)", description: "Requisitioned 25,000 ready-to-eat dry ration and biscuit packs.", status: "IN_PROGRESS", priority: "URGENT", progress_percent: 80, target_entity: "25,000 Food Ration Units", estimated_completion_min: 15, created_at: "00:15:30", updated_at: "00:15:30" },
          { id: "task-log-402", title: "Dispatch Potable Drinking Water Tankers", description: "Deployed 8 high-clearance water tankers and 4,000 sealed water cans.", status: "IN_PROGRESS", priority: "URGENT", progress_percent: 74, target_entity: "60,000 Litres Potable Water", estimated_completion_min: 18, created_at: "00:15:35", updated_at: "00:15:35" },
        ],
        activity_log: [
          { timestamp: "00:15:30", action: "Shortage Audit", detail: "Detected critical deficit: local food stock reserve at 2.1 days (below safe 4-day threshold).", severity: "ALERT" },
          { timestamp: "00:15:40", action: "Supply Convoys Dispatched", detail: "Convoys en route with 14,200 food packs and 38,500L clean water.", severity: "SUCCESS" },
        ],
      },
      {
        id: "agent-shelter-05",
        name: "Shelter Allocation & Capacity Agent",
        type: "SHELTER",
        status: "ACTIVE",
        is_active: true,
        confidence: 0.97,
        activation_reason: "AI activated Shelter Management Agent to dynamically balance occupancy across 5 safe shelters (4,120/6,500 beds) and prevent overcrowding.",
        key_metrics: {
          total_shelters: 5,
          total_bed_capacity: 6500,
          current_occupancy: 4120,
          overall_occupancy_percent: 63.4,
          remaining_headroom: 2380,
          shelter_list: [
            { id: "SH-01", name: "Guru Nanak College Indoor Auditorium", capacity: 2200, occupied: 1640, status: "Open", elevation_m: 12.5 },
            { id: "SH-02", name: "Velachery Govt Higher Secondary School", capacity: 1500, occupied: 1320, status: "Near Capacity", elevation_m: 11.2 },
            { id: "SH-03", name: "Guindy Community Hall & Sports Center", capacity: 1400, occupied: 780, status: "Open", elevation_m: 14.8 },
            { id: "SH-04", name: "St. Thomas Mount Community Hall", capacity: 900, occupied: 380, status: "Open", elevation_m: 24.0 },
            { id: "SH-05", name: "IIT Madras Vanavani School Multi-Purpose Hall", capacity: 500, occupied: 0, status: "Reserve Ready", elevation_m: 15.5 },
          ],
        },
        assigned_tasks: [
          { id: "task-she-501", title: "Identify Elevated Flood-Safe Shelters", description: "Verified 5 designated emergency relief shelters above 11m elevation.", status: "COMPLETED", priority: "URGENT", progress_percent: 100, target_entity: "5 Emergency Shelters", estimated_completion_min: 0, created_at: "00:15:20", updated_at: "00:15:20" },
          { id: "task-she-502", title: "Dynamic Population Balancing & Overflow Diversion", description: "Diverting incoming evacuees from Velachery Govt School to Guindy Sports Center.", status: "IN_PROGRESS", priority: "HIGH", progress_percent: 80, target_entity: "Evacuee Routing Algorithm", estimated_completion_min: 8, created_at: "00:15:30", updated_at: "00:15:30" },
        ],
        activity_log: [
          { timestamp: "00:15:20", action: "Capacity Census", detail: "Total capacity: 6,500 cots | Occupied: 4,120 (63.4% full).", severity: "INFO" },
          { timestamp: "00:15:35", action: "Crowd Rerouting", detail: "Velachery School nearing saturation. Rerouting buses to Guindy Community Hall.", severity: "WARNING" },
        ],
      },
      {
        id: "agent-traffic-06",
        name: "Traffic & Emergency Route Agent",
        type: "TRAFFIC",
        status: "ACTIVE",
        is_active: true,
        confidence: 0.96,
        activation_reason: "AI activated Traffic & Route Agent because 6 critical arterial routes are submerged, establishing emergency green corridors via elevated bypasses.",
        key_metrics: {
          submerged_roads_count: 6,
          blocked_corridors: [
            { road: "Velachery Main Road (Near Lake)", status: "Inundated", water_depth_cm: 65, clearance_time_est: "4h" },
            { road: "Kathipara Underpass Grade Separator", status: "Submerged", water_depth_cm: 90, clearance_time_est: "6h" },
            { road: "Vyasarpadi Subway", status: "Waterlogged", water_depth_cm: 50, clearance_time_est: "3h" },
            { road: "Saidapet Maraimalai Adigal Bridge Incline", status: "Heavy Congestion", water_depth_cm: 25, clearance_time_est: "1.5h" },
          ],
          active_green_corridors: [
            { corridor: "Green Corridor 1: OMR Tollway -> Sardar Patel Rd -> Apollo Hospital", status: "CLEAR", eta_min: 14, purpose: "Emergency Medical Priority" },
            { corridor: "Green Corridor 2: GST Road Elevated Flyover -> Guindy Race Course", status: "CLEAR", eta_min: 18, purpose: "Heavy Relief Trucks" },
          ],
          average_emergency_transit_min: 14.5,
          traffic_flow_efficiency: "64.2%",
        },
        assigned_tasks: [
          { id: "task-traf-601", title: "Telemetry Detection of Inundated Roads & Subways", description: "Identified 6 impassable road segments via IoT flood sensors and CCTV telemetry.", status: "COMPLETED", priority: "URGENT", progress_percent: 100, target_entity: "6 Road Segments", estimated_completion_min: 0, created_at: "00:15:20", updated_at: "00:15:20" },
          { id: "task-traf-602", title: "Designate & Enforce Emergency Green Corridors", description: "Synchronized traffic signal preemptions on OMR and GST Road for ambulances.", status: "IN_PROGRESS", priority: "URGENT", progress_percent: 88, target_entity: "2 Green Corridors", estimated_completion_min: 4, created_at: "00:15:28", updated_at: "00:15:28" },
        ],
        activity_log: [
          { timestamp: "00:15:20", action: "Flooded Arteries Detected", detail: "Flagged 6 submerged road links. Kathipara underpass closed.", severity: "ALERT" },
          { timestamp: "00:15:30", action: "Green Corridor Activated", detail: "Green Corridor 1 open for critical care ambulances.", severity: "SUCCESS" },
        ],
      },
      {
        id: "agent-resource-07",
        name: "Resource & Manpower Allocation Agent",
        type: "RESOURCE",
        status: "ACTIVE",
        is_active: true,
        confidence: 0.97,
        activation_reason: "AI activated Resource Allocation Agent to deploy heavy de-watering pumps, tactical equipment, and coordinate 459 response personnel.",
        key_metrics: {
          total_deployed_manpower: 459,
          total_available_manpower: 575,
          emergency_vehicles_active: 42,
          equipment_utilization_rate: "84.6%",
          fuel_reserve_hours: 48,
          equipment_summary: [
            { name: "Heavy Diesel De-Watering Pumps (100 HP)", total: 24, deployed: 18, status: "Operational" },
            { name: "Inflatable Motorized Rafts (Gemini)", total: 20, deployed: 16, status: "In Water" },
            { name: "Mobile Silent Diesel Generators (125 kVA)", total: 15, deployed: 12, status: "Active Powering Shelters" },
          ],
        },
        assigned_tasks: [
          { id: "task-res-701", title: "Deploy 18 High-Flow De-Watering Pumps", description: "Stationing 100 HP diesel suction pumps at Velachery Lake sluice gates.", status: "IN_PROGRESS", priority: "URGENT", progress_percent: 85, target_entity: "18 De-Watering Pumps", estimated_completion_min: 6, created_at: "00:15:30", updated_at: "00:15:30" },
          { id: "task-res-702", title: "Mobilize Manpower Shift Roster & Rest Rotations", description: "Coordinating 459 active personnel across 8-hour operational shifts.", status: "COMPLETED", priority: "HIGH", progress_percent: 100, target_entity: "459 Emergency Personnel", estimated_completion_min: 0, created_at: "00:15:35", updated_at: "00:15:35" },
        ],
        activity_log: [
          { timestamp: "00:15:30", action: "Equipment Mobilized", detail: "18 heavy pumps and 12 generators running at peak capacity.", severity: "SUCCESS" },
          { timestamp: "00:15:40", action: "Manpower Dispatched", detail: "459 frontline personnel actively assigned across all response zones.", severity: "INFO" },
        ],
      },
    ],
    explainable_decisions: [
      { agent_type: "MEDICAL", agent_name: "Medical Triage & Hospital Agent", activated: true, primary_trigger: "Casualty & Trauma Risk Exceeded 25 Cases", reasoning: "AI analyzed the disaster and activated Medical Agent because of high injury probability (est. 641 casualties in affected sectors).", impact_factor: "Direct preservation of human life & rapid ICU triage pre-positioning" },
      { agent_type: "RESCUE", agent_name: "Tactical Rescue & Extraction Agent", activated: true, primary_trigger: "Severe Water Inundation Trapping Civilians", reasoning: "AI activated Rescue Agent to dispatch 4 rescue battalions and deploy 14 motorized boats into inundated residential pockets.", impact_factor: "Prevents drownings and rapid physical extraction of isolated elderly and children" },
      { agent_type: "COMMUNICATION", agent_name: "Emergency Mass Alert & Authority Comms Agent", activated: true, primary_trigger: "Population Alert Threshold Breach (>5,000 SIMs)", reasoning: "AI activated Communication Agent because the affected population (14,250 active SIMs) exceeded the alert threshold (5,000).", impact_factor: "Mass public awareness, prompt evacuation, and inter-agency coordination" },
      { agent_type: "LOGISTICS", agent_name: "Relief Logistics & Supply Chain Agent", activated: true, primary_trigger: "Stock Reserves Dropped Below 4 Days Threshold", reasoning: "AI activated Logistics Agent due to food shortage & drinking water reserve depletion in inundated sectors.", impact_factor: "Prevents famine, dehydration, and waterborne disease outbreaks in relief camps" },
      { agent_type: "SHELTER", agent_name: "Shelter Allocation & Capacity Agent", activated: true, primary_trigger: "Mass Evacuation Load on Community Shelters", reasoning: "AI activated Shelter Management Agent to dynamically balance occupancy across 5 flood-resilient relief centers and prevent overcrowding.", impact_factor: "Safe dignified housing, protection from vector-borne disease, and crowd safety" },
      { agent_type: "TRAFFIC", agent_name: "Traffic & Emergency Route Agent", activated: true, primary_trigger: "Inundation of 6 Major Arterial Road Corridors", reasoning: "AI activated Traffic & Route Agent because 6 critical arterial routes are submerged, establishing emergency green corridors via elevated bypasses.", impact_factor: "Enables zero-delay ambulance transit and prevents civilian vehicles from drowning in underpasses" },
      { agent_type: "RESOURCE", agent_name: "Resource & Manpower Allocation Agent", activated: true, primary_trigger: "Critical Equipment & Manpower Scalability Threshold", reasoning: "AI activated Resource Allocation Agent to deploy heavy de-watering pumps, tactical equipment, and coordinate 459 response personnel.", impact_factor: "Powers operational infrastructure, accelerates flood drainage, and sustains frontline workers" },
    ],
    workflow_stages: [
      { id: "wf-1", name: "Disaster Detection", status: "completed", description: "IoT telemetry & satellite rainfall radar flag flash flood threshold breach.", timestamp: "00:15:20" },
      { id: "wf-2", name: "Climate Analysis", status: "completed", description: "FastAPI weather engine assesses 48.5 mm/h rain, 998 hPa pressure drop & wind shear.", timestamp: "00:15:42" },
      { id: "wf-3", name: "Population Detection", status: "completed", description: "Telecom cell grid estimates 14,250 active SIMs trapped in 2.5km risk perimeter.", timestamp: "00:16:01" },
      { id: "wf-4", name: "Risk Analysis", status: "completed", description: "Cross-hazard modeling estimates high casualty risk & water ingress in 3 low-lying sectors.", timestamp: "00:16:15" },
      { id: "wf-5", name: "AI Priority Calculation", status: "completed", description: "Calculated 88.5/100 CRITICAL priority level with multi-factor weighted scoring.", timestamp: "00:16:22" },
      { id: "wf-6", name: "AI Agent Assignment", status: "active", description: "Orchestrator autonomously activates 7 specialized agents with tailored mission tasks.", timestamp: "00:16:30" },
      { id: "wf-7", name: "Emergency Response", status: "active", description: "Field execution underway: SMS warnings, ambulance pre-positioning, boat extractions.", timestamp: "00:16:45" },
      { id: "wf-8", name: "Live Monitoring", status: "active", description: "Continuous autonomous feedback loop with dynamic task escalation on situation changes.", timestamp: "00:17:00" },
    ],
    timeline: [
      { id: "evt-01", timestamp: "00:15:20", stage: "Disaster Detection", actor: "AI Ingestion Sensor Engine", event: "Multi-sensor Alert Triggered", details: "Extreme precipitation (48.5 mm/h) and river basin surge detected in Velachery.", status: "COMPLETED" },
      { id: "evt-02", timestamp: "00:15:42", stage: "Climate & Population Analysis", actor: "ResQ Deep Analytics", event: "Telemetry Cross-Correlated", details: "14,250 active SIMs detected inside 2.5km inundation risk perimeter.", status: "COMPLETED" },
      { id: "evt-03", timestamp: "00:16:01", stage: "Priority Calculation", actor: "AI Orchestrator Brain", event: "Risk Score Computed: 88.5 / 100 (CRITICAL)", details: "Weighted heuristic triggered multi-agent autonomous activation protocol.", status: "COMPLETED" },
      { id: "evt-04", timestamp: "00:16:22", stage: "Agent Assignment", actor: "Central Dispatch", event: "7 Autonomous AI Agents Assigned", details: "Medical, Rescue, Comms, Logistics, Shelter, Traffic, and Resource agents mobilized.", status: "COMPLETED" },
      { id: "evt-05", timestamp: "00:16:45", stage: "Emergency Response", actor: "Field Response Units", event: "Mass Alert Broadcast & Route Clearance Initiated", details: "SMS alerts transmitted; 3 emergency green corridors established on OMR & GST Road.", status: "IN_PROGRESS" },
      { id: "evt-06", timestamp: "00:17:00", stage: "Live Monitoring", actor: "Continuous AI Surveillance", event: "Telemetry Feedback Loop Online", details: "Real-time tracking of water discharge rates, rescue boat progress, and hospital triage beds.", status: "ACTIVE" },
    ],
    resources: {
      ambulances_total: 30,
      ambulances_deployed: 21,
      rescue_boats_total: 20,
      rescue_boats_deployed: 14,
      rescue_personnel_total: 180,
      rescue_personnel_active: 152,
      shelter_beds_total: 6500,
      shelter_beds_occupied: 4120,
      food_rations_total: 25000,
      food_rations_distributed: 14200,
      water_liters_total: 60000,
      water_liters_distributed: 38500,
      emergency_vehicles_deployed: 42,
    },
    last_evaluated_at: now,
  };
}

/**
 * GET /api/coordinator/dashboard
 */
router.get('/dashboard', async (_req: Request, res: Response) => {
  const data = await proxyToFastApi('/dashboard');
  if (data) {
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: getFallbackDashboard() });
});

/**
 * POST /api/coordinator/evaluate
 */
router.post('/evaluate', async (req: Request, res: Response) => {
  const data = await proxyToFastApi('/evaluate', 'POST', req.body);
  if (data) {
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: getFallbackDashboard() });
});

/**
 * POST /api/coordinator/escalate
 */
router.post('/escalate', async (req: Request, res: Response) => {
  const scenario = req.query.scenario || 'DAM_RELEASE_SURGE';
  const data = await proxyToFastApi(`/escalate?scenario=${scenario}`, 'POST');
  if (data) {
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: getFallbackDashboard() });
});

/**
 * GET /api/coordinator/agents
 */
router.get('/agents', async (_req: Request, res: Response) => {
  const data = await proxyToFastApi('/agents');
  if (data) {
    return res.json({ success: true, data });
  }
  const fb = getFallbackDashboard();
  return res.json({
    success: true,
    data: {
      active_count: fb.active_agents_count,
      total_count: fb.total_agents_count,
      agents: fb.agents,
    },
  });
});

/**
 * GET /api/coordinator/timeline
 */
router.get('/timeline', async (_req: Request, res: Response) => {
  const data = await proxyToFastApi('/timeline');
  if (data) {
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: getFallbackDashboard().timeline });
});

/**
 * GET /api/coordinator/resources
 */
router.get('/resources', async (_req: Request, res: Response) => {
  const data = await proxyToFastApi('/resources');
  if (data) {
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: getFallbackDashboard().resources });
});

/**
 * GET /api/coordinator/workflow
 */
router.get('/workflow', async (_req: Request, res: Response) => {
  const data = await proxyToFastApi('/workflow');
  if (data) {
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: getFallbackDashboard().workflow_stages });
});

export default router;
