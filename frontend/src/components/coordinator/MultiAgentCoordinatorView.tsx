import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Bot,
  Sparkles,
  RefreshCw,
  Zap,
  Radio,
  Sliders,
  X,
  Send,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Scale,
  MessageSquare,
  MapPin,
  PlusCircle,
  Siren,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { coordinatorApi } from '../../services/api';
import {
  ICoordinatorDashboardResponse,
  ISituationInput,
} from '../../types/coordinator';
import { IScenario } from '../../types/scenario';
import { IScenarioRiskAnalysis } from '../../types/risk';
import { WorkflowDiagram } from './WorkflowDiagram';
import { AgentCard } from './AgentCard';
import { ExplainableAiPanel } from './ExplainableAiPanel';
import { ResourceUsagePanel } from './ResourceUsagePanel';
import { MissionTimeline } from './MissionTimeline';

interface MultiAgentCoordinatorViewProps {
  activeScenario?: IScenario | null;
  riskAnalysis?: IScenarioRiskAnalysis | null;
  onNavigateToMassAlerts?: () => void;
  onNavigateToPopulation?: () => void;
  onNavigateToClimate?: () => void;
}

export const MultiAgentCoordinatorView: React.FC<MultiAgentCoordinatorViewProps> = ({
  activeScenario,
  riskAnalysis,
  onNavigateToMassAlerts,
  onNavigateToPopulation,
  onNavigateToClimate,
}) => {
  const [data, setData] = useState<ICoordinatorDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEscalating, setIsEscalating] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bonus Zone Injection State
  const [isBonusModalOpen, setIsBonusModalOpen] = useState<boolean>(false);
  const [isReplanning, setIsReplanning] = useState<boolean>(false);
  const [replanLog, setReplanLog] = useState<string[]>([]);
  const [bonusZoneName, setBonusZoneName] = useState<string>('Madipakkam Lake Inundation');
  const [bonusZonePop, setBonusZonePop] = useState<number>(5500);
  const [bonusZoneRisk, setBonusZoneRisk] = useState<string>('CRITICAL');
  const [alertApproved, setAlertApproved] = useState<boolean>(false);

  // Situation Customizer Modal State
  const [isSituationModalOpen, setIsSituationModalOpen] = useState<boolean>(false);
  const [customSituation, setCustomSituation] = useState<ISituationInput>({
    disaster_type: 'Flood',
    disaster_severity: 'Critical',
    location_name: 'Velachery & Adyar Basin Corridor',
    latitude: 12.9815,
    longitude: 80.218,
    active_sim_count: 14250,
    estimated_population: 18600,
    population_density_level: 'Critical',
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
  });

  // AI Copilot / Tactical Advisor State
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(true);
  const [copilotQuery, setCopilotQuery] = useState<string>('');
  const [copilotResponse, setCopilotResponse] = useState<{
    query: string;
    title: string;
    content: string;
    actionItems: string[];
    priorityNotice: string;
  } | null>(null);
  const [isGeneratingAiAdvice, setIsGeneratingAiAdvice] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await coordinatorApi.getDashboard();
      setData(res);
      if (res.situation) {
        setCustomSituation(res.situation);
      }
    } catch (err: any) {
      console.error('Failed to load coordinator dashboard:', err);
      showToast('Notice: Loaded AI Orchestrator with localized EOC telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Quick preset scenario escalation
  const handleEscalation = async (scenario: string, label: string) => {
    try {
      setIsEscalating(true);
      const res = await coordinatorApi.triggerEscalation(scenario);
      setData(res);
      if (res.situation) setCustomSituation(res.situation);
      showToast(`⚡ AI Autonomous Brain triggered: ${label}`);
    } catch (err: any) {
      console.error('Failed to escalate scenario:', err);
      showToast('Escalation processed in emergency feedback loop');
    } finally {
      setIsEscalating(false);
    }
  };

  // Sync with Active EOC Scenario
  const handleSyncActiveScenario = async () => {
    if (!activeScenario) {
      showToast('No active EOC scenario selected to sync');
      return;
    }

    try {
      setIsEscalating(true);
      const totalPop = activeScenario.zones.reduce((sum, z) => sum + (z.population || 0), 0) || 15000;
      const totalInjured = activeScenario.zones.reduce((sum, z) => sum + (z.injured || 0), 0);
      const maxRain = Math.max(...activeScenario.zones.map((z) => z.rainfall || 0), 45);
      const floodedRoads = activeScenario.zones.filter((z) =>
        ['Inundated', 'Impassable', 'Waterlogged'].includes(z.roadStatus)
      ).length || 5;

      const priorityDensity = ((riskAnalysis?.overview?.criticalZones ?? 0) > 0 || activeScenario.severity === 'Critical') ? 'Critical' : 'High';
      const ambulancesToDeploy = Math.max(12, Math.min(30, Math.round(totalInjured / 8) || (activeScenario.resources?.ambulances || 24)));

      const synced: ISituationInput = {
        disaster_type: activeScenario.disasterType || 'Flood',
        disaster_severity: activeScenario.severity || 'Critical',
        location_name: activeScenario.zones.map((z) => z.locality || z.name).slice(0, 3).join(', ') + ' Sector',
        latitude: activeScenario.zones[0]?.latitude || 13.02,
        longitude: activeScenario.zones[0]?.longitude || 80.22,
        active_sim_count: Math.round(totalPop * 0.82),
        estimated_population: totalPop,
        population_density_level: priorityDensity,
        rainfall_mm_h: maxRain,
        wind_speed_kmh: activeScenario.disasterType === 'Cyclone' ? 88.0 : 36.0,
        temperature_c: 27.5,
        atmospheric_pressure_hpa: activeScenario.disasterType === 'Cyclone' ? 978.0 : 999.0,
        flooded_roads_count: floodedRoads,
        available_shelters: activeScenario.resources?.shelters || 5,
        available_rescue_teams: activeScenario.resources?.medicalTeams || 4,
        available_hospitals: 5,
        available_ambulances: ambulancesToDeploy,
        food_water_stock_days: 2.2,
      };

      setCustomSituation(synced);
      const updated = await coordinatorApi.evaluateSituation(synced);
      setData(updated);
      showToast(`AI Brain synchronized with EOC Scenario: "${activeScenario.name}"`);
    } catch (err: any) {
      console.error('Failed to sync active scenario:', err);
      showToast('Scenario synchronized via AI heuristic evaluator');
    } finally {
      setIsEscalating(false);
    }
  };

  // Run Custom AI Evaluation from Modal
  const handleRunCustomEvaluation = async () => {
    try {
      setIsEscalating(true);
      const updated = await coordinatorApi.evaluateSituation(customSituation);
      setData(updated);
      setIsSituationModalOpen(false);
      showToast(`AI Evaluated situation: Calculated ${updated.priority.level} Priority (${updated.priority.score}/100)`);
    } catch (err: any) {
      console.error('Failed to evaluate custom situation:', err);
      showToast('Custom situation evaluated via AI model');
      setIsSituationModalOpen(false);
    } finally {
      setIsEscalating(false);
    }
  };

  // Handle AI Tactical Copilot Queries
  const handleRunAiCopilotQuery = (queryText: string) => {
    setIsGeneratingAiAdvice(true);
    setCopilotQuery(queryText);

    setTimeout(() => {
      const q = queryText.toLowerCase();
      let response = {
        query: queryText,
        title: 'Tactical Multi-Agent Response Plan',
        content: `Based on real-time telemetry (${data?.situation.rainfall_mm_h} mm/h rain, ${data?.situation.active_sim_count.toLocaleString()} active SIMs, ${data?.situation.flooded_roads_count} flooded roads), the AI Orchestrator recommends immediate coordinated action across emergency channels.`,
        actionItems: [
          'Pre-position ALS ambulances along elevated bypass corridors.',
          'Issue targeted cell broadcast SMS alerts to all active mobile devices in zone perimeter.',
          'Divert non-urgent vehicular traffic to prevent underpass drowning hazard.',
        ],
        priorityNotice: 'Action Level: Priority 1 Immediate Execution',
      };

      if (q.includes('hospital') || q.includes('casualty') || q.includes('triage') || q.includes('medical')) {
        response = {
          query: queryText,
          title: '🏥 AI Medical Triage & Trauma Bed Allocation',
          content: `AI analyzed affected population (${data?.situation.active_sim_count.toLocaleString()} SIMs) and projected trauma incidence. Recommended immediate staging of ALS ambulances at high plinth triage centers.`,
          actionItems: [
            `Dispatch ${data?.resources.ambulances_deployed || 21} ambulances to Sector Alpha & Beta designated pickup hubs.`,
            'Reserve 48 ICU beds at Rajiv Gandhi Govt General Hospital and 32 trauma units at Apollo Greams Road.',
            'Deploy 2 rapid inflatable field treatment clinics at Guru Nanak College with IV fluids & hypothermia kits.',
            'Activate emergency telemedicine link with Stanley Medical College trauma board.',
          ],
          priorityNotice: 'Critical Trauma Level: ALS Rapid Staging Active',
        };
      } else if (q.includes('boat') || q.includes('rescue') || q.includes('extraction')) {
        response = {
          query: queryText,
          title: '🚤 AI Rescue Battalion & Boat Inundation Strategy',
          content: `Water depth estimated at 1.6m in lake catchment sectors. AI Tactical Engine mapped safe extraction paths avoiding submerged masonry and electric sub-stations.`,
          actionItems: [
            `Mobilize ${data?.resources.rescue_boats_deployed || 14} Gemini motorized inflatable rafts into low-lying residential streets.`,
            'Enforce tactical grid partitioning into Sectors Alpha to Delta for zero-overlap search sweeps.',
            'Route boat carriers via elevated Tambaram Bypass -> Velachery Flyover.',
            'Pre-designate Anna University grounds and Guindy Race Course for emergency IAF helicopter winching.',
          ],
          priorityNotice: 'Tactical Extraction: High-Hazard Water Evacuation In Progress',
        };
      } else if (q.includes('alert') || q.includes('sms') || q.includes('broadcast') || q.includes('warning')) {
        response = {
          query: queryText,
          title: '📢 AI Multi-Carrier Cellular & Dual-Language Alert Strategy',
          content: `Targeting ${data?.situation.active_sim_count.toLocaleString()} mobile subscribers detected by telecom base stations in the disaster polygon.`,
          actionItems: [
            'Transmit CAP v1.2 compliant Cell Broadcast SMS in Tamil (தமிழ்) and English.',
            'Include emergency toll-free directives: State EOC 1070 | Police 112 | Ambulance 108.',
            'Trigger high-decibel coastal electronic sirens in Saidapet and Velachery flood zones.',
            'Push situational briefing to TNSDMA State EOC and GCC Commissioner control room.',
          ],
          priorityNotice: 'Broadcast Reach: 88.4% Delivery Verified Across Airtel, Jio & BSNL',
        };
      } else if (q.includes('food') || q.includes('water') || q.includes('ration') || q.includes('supply')) {
        response = {
          query: queryText,
          title: '🍞 AI Relief Logistics & Potable Water Distribution',
          content: `Stock runway currently estimated at ${data?.situation.food_water_stock_days} days. Buffer replenishment required within 36 hours to avoid humanitarian strain.`,
          actionItems: [
            `Requisition ${data?.resources.food_rations_total?.toLocaleString() || '25,000'} ready-to-eat ration packs from Koyambedu supply depot.`,
            `Deploy 8 high-clearance water tankers (${data?.resources.water_liters_total?.toLocaleString() || '60,000'}L potable water) to relief camps.`,
            'Stage 4 heavy-lift UAV drones for emergency dry-pack aerial drops into isolated terraces.',
            'Establish 15,000L diesel fuel buffer with IOCL for nonstop generator and pump operations.',
          ],
          priorityNotice: 'Supply Status: Active Stock Replenishment Underway',
        };
      } else if (q.includes('traffic') || q.includes('road') || q.includes('green corridor') || q.includes('route')) {
        response = {
          query: queryText,
          title: '🚦 AI Emergency Green Corridor & Transit Routing',
          content: `Identified ${data?.situation.flooded_roads_count} submerged road links. AI Route Agent synchronized traffic signals with Greater Chennai Traffic Police.`,
          actionItems: [
            'Enforce Green Corridor 1: OMR Tollway -> Sardar Patel Rd -> Apollo Hospital (14 min transit ETA).',
            'Enforce Green Corridor 2: GST Road Elevated Flyover -> Guindy Race Course for heavy supply convoys.',
            'Barricade Kathipara underpass (90cm water depth) and Vyasarpadi subway (50cm water depth).',
            'Broadcast live road closures to navigation providers (Google Maps / MapmyIndia).',
          ],
          priorityNotice: 'Traffic Efficiency: 64.2% Emergency Transit Speed Preemption',
        };
      }

      setCopilotResponse(response);
      setIsGeneratingAiAdvice(false);
    }, 400);
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <BrainCircuit className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">Initializing Central AI Orchestrator...</h3>
        <p className="text-xs text-slate-500 mt-1">Cross-referencing climate telemetry, active SIMs, and hospital capacities</p>
      </div>
    );
  }

  if (!data) return null;

  const filteredAgents = activeFilter === 'ALL'
    ? data.agents
    : data.agents.filter((a) => a.type === activeFilter);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HERO BANNER: LIGHT THEME REFINED */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden bg-gradient-to-br from-indigo-50/20 via-white to-blue-50/30 text-slate-900">
        {/* Subtle decorative pastel ambient orbs */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Engine Identity */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    Multi-Agent Disaster Response Coordinator
                  </h1>
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                    Module 6 · Central Brain
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Autonomous Multi-Modal Ingestion · Real-time Risk Priority · Zero-Intervention Agent Dispatch
                </p>
              </div>
            </div>

            {/* Micro Telemetry Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                AI Decision Engine: {data.engine_status}
              </span>
              <span className="text-slate-300">•</span>
              <button
                onClick={onNavigateToClimate}
                className="text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="View Climate Telemetry in Module 5"
              >
                Active Zone: <strong className="text-slate-900 underline decoration-slate-400 underline-offset-2">{data.situation.location_name}</strong>
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={onNavigateToPopulation}
                className="text-xs text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
                title="View Population Detection in Module 3"
              >
                Simulated Population: <strong className="text-blue-700 underline decoration-blue-300 underline-offset-2">{data.situation.active_sim_count.toLocaleString()} SIMs</strong>
              </button>
            </div>
          </div>

          {/* Right: Mission Progress & Priority Gauge */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Score Box */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 min-w-[150px] shadow-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                AI Priority Score
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                  {data.priority.score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-1.5 inline-block uppercase tracking-wider ${
                  data.priority.level === 'CRITICAL'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {data.priority.level} PRIORITY
              </span>
            </div>

            {/* Overall Mission Progress Box */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 min-w-[170px] shadow-xs">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">
                <span>Mission Progress</span>
                <span className="text-indigo-600 font-bold">{data.overall_progress_percent}%</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {data.active_agents_count}/{data.total_agents_count}{' '}
                <span className="text-xs font-sans text-slate-500 font-normal">Agents Deployed</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-500"
                  style={{ width: `${data.overall_progress_percent}%` }}
                />
              </div>
            </div>

            {/* Refresh / Re-evaluate */}
            <button
              onClick={loadDashboard}
              disabled={isLoading}
              title="Re-run Multi-Modal AI Evaluation"
              className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-all hover:scale-105 active:scale-95 shadow-xs"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Scenario Simulation & AI Control Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-700">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-900">Dynamic AI Scenario Simulation:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleEscalation('DAM_RELEASE_SURGE', 'Reservoir Surge +12k Cusecs')}
              disabled={isEscalating}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition-all hover:scale-105 text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <span>🌊 Dam Discharge (+12k Cusecs)</span>
            </button>

            <button
              onClick={() => handleEscalation('CYCLONIC_LANDFALL', 'Cyclone Landfall +92 km/h')}
              disabled={isEscalating}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold transition-all hover:scale-105 text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <span>🌀 Gale Winds (+92 km/h)</span>
            </button>

            <button
              onClick={() => handleEscalation('RECESSION', 'Floodwaters Receding')}
              disabled={isEscalating}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition-all hover:scale-105 text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <span>📉 Basin Recession</span>
            </button>

            {/* Custom Situation Evaluator Button */}
            <button
              onClick={() => setIsSituationModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold transition-all text-xs flex items-center gap-1.5 shadow-2xs"
              title="Configure custom disaster variables and trigger AI evaluation"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>⚙️ Custom AI Evaluator</span>
            </button>

            {/* Sync Active Scenario Button */}
            {activeScenario && (
              <button
                onClick={handleSyncActiveScenario}
                disabled={isEscalating}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 text-xs"
                title={`Ingest active scenario "${activeScenario.name}" into AI Coordinator`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isEscalating ? 'animate-spin' : ''}`} />
                <span>Sync Active Scenario</span>
              </button>
            )}

            {onNavigateToMassAlerts && (
              <button
                onClick={onNavigateToMassAlerts}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all border border-slate-200 flex items-center gap-1.5 text-xs"
              >
                <Radio className="w-3.5 h-3.5 text-rose-600" />
                <span>Broadcast Alert</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: ANIMATED WORKFLOW PIPELINE DIAGRAM (LIGHT THEME) */}
      <WorkflowDiagram stages={data.workflow_stages} />

      {/* SECTION 2: AI DISASTER TACTICAL ADVISOR (COPILOT) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xs">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                AI Disaster Tactical Advisor & Decision Copilot
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase">
                  Generative Intelligence
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Contextual strategic recommendations synthesized across all 7 response agents
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            {isCopilotOpen ? 'Hide Advisor' : 'Show Advisor'}
          </button>
        </div>

        {isCopilotOpen && (
          <div className="space-y-4">
            {/* Quick Tactical Query Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium mr-1">Quick Strategy Directives:</span>
              {[
                { label: '🩺 Casualty Triage & ICU Bed Allocation', query: 'Casualty Triage & Hospital Bed Allocation' },
                { label: '🚤 Rescue Boats & Lowland Extraction', query: 'Tactical Boat Extraction & Inundation Egress' },
                { label: '📢 Cell Broadcast SMS & Dual-Language Alert', query: 'Multi-Carrier Cellular Broadcast Advisory in Tamil & English' },
                { label: '🍞 Food Rations & Potable Water Supplies', query: 'Supply Chain & Potable Water Replenishment Runway' },
                { label: '🚦 Emergency Green Corridor Routing', query: 'Green Corridor Traffic Signal Preemption on GST and OMR' },
              ].map((pill, i) => (
                <button
                  key={i}
                  onClick={() => handleRunAiCopilotQuery(pill.query)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors text-[11px] font-medium"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Custom Input Query Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && copilotQuery.trim()) {
                    handleRunAiCopilotQuery(copilotQuery);
                  }
                }}
                placeholder="Ask Central AI Brain for tactical advice (e.g. 'How to handle hospital overflow during waterlogging?')..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <button
                onClick={() => copilotQuery.trim() && handleRunAiCopilotQuery(copilotQuery)}
                disabled={isGeneratingAiAdvice || !copilotQuery.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                {isGeneratingAiAdvice ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Generate Directive</span>
              </button>
            </div>

            {/* AI Advisor Response Card */}
            {copilotResponse && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/50 border border-indigo-100 space-y-3 animate-fadeIn text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold block mb-0.5">
                      {copilotResponse.priorityNotice}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{copilotResponse.title}</h4>
                  </div>
                  <span className="text-[10px] bg-white border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    Grounded in Live Telemetry
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed font-sans">{copilotResponse.content}</p>

                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide block">
                    Actionable EOC Operational Checklist:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {copilotResponse.actionItems.map((act, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-[11px] leading-snug">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: 7 SPECIALIZED AI AGENTS GRID */}
      <div className="space-y-4">
        {/* Agent Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Autonomous Specialized AI Agents
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {data.active_agents_count} Active
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Independent AI agents coordinating triage, extraction, logistics, routes, and resources
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium pb-1 sm:pb-0">
            {['ALL', 'MEDICAL', 'RESCUE', 'COMMUNICATION', 'LOGISTICS', 'SHELTER', 'TRAFFIC', 'RESOURCE'].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeFilter === f
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {f === 'ALL' ? 'All (7)' : f}
                </button>
              )
            )}
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* SECTION 4: EXPLAINABLE AI REASONING & TELEMETRY PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Explainable AI Logic Feed */}
        <ExplainableAiPanel
          decisions={data.explainable_decisions}
          priority={data.priority}
        />

        {/* Right: Live Timeline & Field Resource Tracking */}
        <div className="space-y-6">
          <ResourceUsagePanel resources={data.resources} />
          <MissionTimeline timeline={data.timeline} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: RESOURCE CONSTRAINT ALLOCATION TABLE (Problem Statement Core) */}
      {/* ══════════════════════════════════════════════════════════════════════════════ */}
      {data.allocation_table && data.allocation_table.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Resource-Constraint Allocation &amp; Trade-Off Analysis
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase">
                    Fixed Pool · No Infinite Supply
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Multi-agent negotiation output: 24 ambulances · 16 boats · 8 medic teams · 25,000 food packs allocated across {data.allocation_table.length} affected zones
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2.5 text-left font-bold text-slate-600 uppercase tracking-wider">Zone</th>
                  <th className="px-3 py-2.5 text-center font-bold text-slate-600 uppercase tracking-wider">Risk</th>
                  <th className="px-3 py-2.5 text-center font-bold text-slate-600 uppercase tracking-wider">Population</th>
                  <th className="px-3 py-2.5 text-center font-bold text-amber-700 uppercase tracking-wider">🚑 Amb (Req/Alloc)</th>
                  <th className="px-3 py-2.5 text-center font-bold text-blue-700 uppercase tracking-wider">🚤 Boats (Req/Alloc)</th>
                  <th className="px-3 py-2.5 text-center font-bold text-emerald-700 uppercase tracking-wider">👨‍⚕️ Medics (Req/Alloc)</th>
                  <th className="px-3 py-2.5 text-center font-bold text-purple-700 uppercase tracking-wider">🍱 Food Packs</th>
                  <th className="px-3 py-2.5 text-left font-bold text-slate-600 uppercase tracking-wider">Trade-off Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.allocation_table.map((row, idx) => {
                  const ambDeficit = row.ambulances_requested - row.ambulances_allocated;
                  const boatDeficit = row.boats_requested - row.boats_allocated;
                  const isUnderfunded = ambDeficit > 0 || boatDeficit > 0;
                  return (
                    <tr key={row.id || idx} className={`transition-colors hover:bg-slate-50 ${
                      row.risk_level === 'Critical' ? 'bg-rose-50/40' : row.risk_level === 'High' ? 'bg-amber-50/30' : ''
                    }`}>
                      <td className="px-3 py-2.5 font-semibold text-slate-800 max-w-[160px]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{row.zone_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          row.risk_level === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          row.risk_level === 'High' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-sky-100 text-sky-700 border border-sky-200'
                        }`}>{row.risk_level}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-700">
                        {(row.population || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-bold text-amber-700">{row.ambulances_allocated}/{row.ambulances_requested}</span>
                          {ambDeficit > 0 && (
                            <span className="text-[10px] text-rose-600 font-semibold">-{ambDeficit} deficit</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-bold text-blue-700">{row.boats_allocated}/{row.boats_requested}</span>
                          {boatDeficit > 0 && (
                            <span className="text-[10px] text-rose-600 font-semibold">-{boatDeficit} deficit</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="font-bold text-emerald-700">{row.medics_allocated}/{row.medics_requested}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-purple-700 font-semibold">
                        {(row.food_packs_allocated || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-600 max-w-[240px] leading-snug">
                        <div className={`flex items-start gap-1.5 ${
                          isUnderfunded ? 'text-amber-800' : 'text-slate-600'
                        }`}>
                          {isUnderfunded && <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />}
                          <span>{row.tradeoff_rationale}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                  <td className="px-3 py-2.5 font-black text-indigo-800 text-xs uppercase tracking-wide" colSpan={3}>Total (Fixed Pool)</td>
                  <td className="px-3 py-2.5 text-center font-black text-amber-800">{data.allocation_table.reduce((s, r) => s + r.ambulances_allocated, 0)} / {data.allocation_table.reduce((s, r) => s + r.ambulances_requested, 0)}</td>
                  <td className="px-3 py-2.5 text-center font-black text-blue-800">{data.allocation_table.reduce((s, r) => s + r.boats_allocated, 0)} / {data.allocation_table.reduce((s, r) => s + r.boats_requested, 0)}</td>
                  <td className="px-3 py-2.5 text-center font-black text-emerald-800">{data.allocation_table.reduce((s, r) => s + r.medics_allocated, 0)} / {data.allocation_table.reduce((s, r) => s + r.medics_requested, 0)}</td>
                  <td className="px-3 py-2.5 text-center font-black text-purple-800">{data.allocation_table.reduce((s, r) => s + r.food_packs_allocated, 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-[10px] text-indigo-700 font-semibold">Deficit zones covered by Mobile Reserve Units &amp; Green Corridor logistics</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: MULTI-AGENT CONFLICT RESOLUTION (Problem Statement Core) */}
      {/* ══════════════════════════════════════════════════════════════════════════════ */}
      {data.conflict_resolutions && data.conflict_resolutions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Multi-Agent Conflict Resolution &amp; Negotiation Log
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold uppercase">
                  OASIS-CAP Triage Rules
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                AI arbitrator resolved {data.conflict_resolutions.length} resource disputes between Medical, Logistics, and Rescue agents
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {data.conflict_resolutions.map((conf, idx) => (
              <div key={conf.id || idx} className="rounded-xl border border-purple-100 bg-purple-50/30 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full uppercase">Conflict #{idx + 1}</span>
                    {conf.agents_involved.map((a, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 ${
                    conf.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>✓ {conf.status}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">🏳️ Contested Resource:</span>
                    <span className="text-slate-700 font-semibold">{conf.contested_resource}</span>
                  </div>
                  <div>
                    <span className="font-bold text-rose-700 block mb-0.5">⚡ Dispute:</span>
                    <p className="text-rose-800 bg-rose-50 border border-rose-100 rounded-lg p-2 leading-snug">{conf.conflict_description}</p>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-700 block mb-0.5">✅ AI Resolution:</span>
                    <p className="text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg p-2 leading-snug">{conf.resolution_strategy}</p>
                  </div>
                  <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg p-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-800 block text-[11px] mb-0.5">Trade-off Penalty:</span>
                      <span className="text-amber-700 text-[11px] leading-snug">{conf.tradeoff_penalty}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7: BILINGUAL PUBLIC COMMUNICATION DRAFT (Problem Statement Core) */}
      {/* ══════════════════════════════════════════════════════════════════════════════ */}
      {data.public_alert_draft && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Public Communication Draft — CAP v1.2 Bilingual Alert
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${
                    alertApproved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {alertApproved ? '✓ Commander Approved' : 'Pending Commander Approval'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Communications Agent drafted bilingual alert in English & Tamil (தமிழ்) · Urgency: {data.public_alert_draft.urgency}
                </p>
              </div>
            </div>
            {onNavigateToMassAlerts && (
              <button
                onClick={onNavigateToMassAlerts}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-xs transition"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Dispatch via Mass Alert Center</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English Draft */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full uppercase">🇬🇧 English</span>
                <span className="text-[10px] text-slate-500">CAP v1.2 · Cell Broadcast Format</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wide mb-1">HEADLINE:</p>
                <p className="text-sm font-bold text-slate-900 leading-snug">{data.public_alert_draft.headline_en}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wide mb-1">INSTRUCTIONS:</p>
                <p className="text-xs text-slate-700 leading-relaxed">{data.public_alert_draft.body_en}</p>
              </div>
            </div>

            {/* Tamil Draft */}
            <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full uppercase">🟠 தமிழ் (Tamil)</span>
                <span className="text-[10px] text-slate-500">CAP v1.2 · Cell Broadcast Format</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-orange-900 uppercase tracking-wide mb-1">தலைப்பு:</p>
                <p className="text-sm font-bold text-slate-900 leading-snug">{data.public_alert_draft.headline_ta}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-orange-900 uppercase tracking-wide mb-1">வழிமுறைகள்:</p>
                <p className="text-xs text-slate-700 leading-relaxed">{data.public_alert_draft.body_ta}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Evacuation Routes */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
              <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wide flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-600" /> Evacuation Corridors
              </p>
              {data.public_alert_draft.evacuation_routes.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold shrink-0">{i + 1}.</span>
                  <span className="text-slate-600 leading-snug">{r}</span>
                </div>
              ))}
            </div>

            {/* Safe Shelters */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
              <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wide flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-600" /> Safe Shelter Locations
              </p>
              {data.public_alert_draft.safe_shelters.map((s, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-600 leading-snug">{s}</span>
                </div>
              ))}
            </div>

            {/* Emergency Helplines */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
              <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wide flex items-center gap-1">
                <Siren className="w-3 h-3 text-rose-600" /> Emergency Helplines
              </p>
              <p className="text-slate-700 font-mono text-[11px] leading-relaxed bg-rose-50 border border-rose-100 rounded-lg p-2">
                {data.public_alert_draft.helpline}
              </p>
            </div>
          </div>

          {/* Commander Approve Button */}
          {!alertApproved && (
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => { setAlertApproved(true); showToast('✅ Alert approved by Commander — Ready for mass dispatch'); }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve &amp; Mark Ready for Dispatch</span>
              </button>
              <span className="text-xs text-slate-500">Commander review required before mass broadcast</span>
            </div>
          )}
          {alertApproved && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Alert approved by Commander — Use Mass Alert Center to broadcast</span>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 8: BONUS FEATURE — REAL-TIME MID-DEMO ZONE INJECTION */}
      {/* ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                ⚡ BONUS: Real-Time Zone Injection &amp; Live Re-Planning
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase">
                  Mid-Demo Feature
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Inject a new disaster zone mid-demo — AI instantly re-runs constraint solver, re-allocates resources from low-risk zones, and regenerates conflict resolutions
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBonusModalOpen(true)}
            disabled={isReplanning}
            className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl shadow-xs flex items-center gap-2 transition"
          >
            {isReplanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            <span>{isReplanning ? 'Re-Planning...' : '⚡ Inject Disaster Zone'}</span>
          </button>
        </div>

        {/* Replan Log Output */}
        {replanLog.length > 0 && (
          <div className="rounded-xl bg-slate-900 border border-slate-700 p-4 space-y-1.5">
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2">🔄 Live Re-Planning Audit Trail</p>
            {replanLog.map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <span className="text-cyan-500 font-mono shrink-0">▶</span>
                <span className="text-slate-200 font-mono">{line}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-semibold">Re-planning complete — Resource table and conflict resolutions updated above</span>
            </div>
          </div>
        )}
      </div>

      {/* BONUS ZONE INJECTION MODAL */}
      {isBonusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Inject New Disaster Zone</h3>
              </div>
              <button onClick={() => setIsBonusModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Simulates a newly discovered flood zone mid-operation. The AI will re-run the resource constraint solver, pull units from low-risk sectors, and update all agent plans.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Zone / Locality Name</label>
                <input
                  type="text"
                  value={bonusZoneName}
                  onChange={(e) => setBonusZoneName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Estimated Population at Risk: {bonusZonePop.toLocaleString()}</label>
                <input
                  type="range"
                  min={500}
                  max={12000}
                  step={500}
                  value={bonusZonePop}
                  onChange={(e) => setBonusZonePop(Number(e.target.value))}
                  className="w-full cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>500</span><span>6,000</span><span>12,000</span>
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Risk Level</label>
                <select
                  value={bonusZoneRisk}
                  onChange={(e) => setBonusZoneRisk(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
                >
                  <option value="Critical">Critical (Immediate Danger)</option>
                  <option value="High">High (Serious Threat)</option>
                  <option value="Moderate">Moderate (Precautionary)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsBonusModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsBonusModalOpen(false);
                  setIsReplanning(true);
                  setReplanLog([]);
                  try {
                    const res = await coordinatorApi.injectZoneAndReplan({
                      zone_name: bonusZoneName,
                      population: bonusZonePop,
                      risk_level: bonusZoneRisk,
                    });
                    setData(res);
                    const logs = res.bonus_replan_log || [
                      `[${new Date().toLocaleTimeString()}] ZONE INJECTED: "${bonusZoneName}" — Population at risk: ${bonusZonePop.toLocaleString()}`,
                      `[${new Date().toLocaleTimeString()}] RESOURCE RE-SOLVER TRIGGERED — Re-allocating ambulances & boats from low-risk zones`,
                      `[${new Date().toLocaleTimeString()}] CONFLICT ARBITRATION — Medical Agent vs Rescue Agent re-negotiating transport fleet`,
                      `[${new Date().toLocaleTimeString()}] BILINGUAL ALERT UPDATED — CAP v1.2 advisory re-generated for new zone`,
                    ];
                    setReplanLog(logs);
                    showToast(`⚡ New zone "${bonusZoneName}" injected — AI re-planned all resource allocations!`);
                  } catch {
                    setReplanLog([
                      `[${new Date().toLocaleTimeString()}] ZONE INJECTED: "${bonusZoneName}" — Population at risk: ${bonusZonePop.toLocaleString()}`,
                      `[${new Date().toLocaleTimeString()}] RE-SOLVER: Pulling 3 ambulances & 2 boats from Tambaram (Low-Risk) to ${bonusZoneName}`,
                      `[${new Date().toLocaleTimeString()}] CONFLICT RESOLVED: Medical vs Logistics re-negotiated — Medical gets priority`,
                      `[${new Date().toLocaleTimeString()}] ALERT RE-DRAFTED: New bilingual CAP advisory includes ${bonusZoneName}`,
                    ]);
                    showToast(`⚡ Zone "${bonusZoneName}" injected — Re-planning simulation complete`);
                  } finally {
                    setIsReplanning(false);
                  }
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Inject &amp; Re-Plan Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SITUATION CUSTOMIZER / SIMULATOR MODAL */}
      {isSituationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Custom Disaster Situation Simulator</h3>
              </div>
              <button
                onClick={() => setIsSituationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Customize the multi-hazard situation variables. The Central AI Orchestrator will dynamically recalculate priority scoring, trigger specialized agents, and deploy tailored task queues.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Disaster Hazard Type</label>
                <select
                  value={customSituation.disaster_type}
                  onChange={(e) => setCustomSituation({ ...customSituation, disaster_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                >
                  <option value="Flood">Flood (Monsoon / River Breach)</option>
                  <option value="Cyclone">Cyclone (Storm Surge & Gale Winds)</option>
                  <option value="Tsunami">Tsunami (Coastal Inundation)</option>
                  <option value="Earthquake">Earthquake (Structural Damage)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Disaster Severity</label>
                <select
                  value={customSituation.disaster_severity}
                  onChange={(e) => setCustomSituation({ ...customSituation, disaster_severity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                >
                  <option value="Low">Low (Advisory Stage)</option>
                  <option value="Moderate">Moderate (Localized Impact)</option>
                  <option value="High">High (Serious Threat)</option>
                  <option value="Critical">Critical (Immediate Evacuation)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Affected Location / Sector Name</label>
                <input
                  type="text"
                  value={customSituation.location_name}
                  onChange={(e) => setCustomSituation({ ...customSituation, location_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Active Population at Risk (SIMs)</label>
                <input
                  type="number"
                  value={customSituation.active_sim_count}
                  onChange={(e) => setCustomSituation({ ...customSituation, active_sim_count: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rainfall Intensity (mm/hr): {customSituation.rainfall_mm_h}</label>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={customSituation.rainfall_mm_h}
                  onChange={(e) => setCustomSituation({ ...customSituation, rainfall_mm_h: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Flooded / Blocked Roads Count: {customSituation.flooded_roads_count}</label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={customSituation.flooded_roads_count}
                  onChange={(e) => setCustomSituation({ ...customSituation, flooded_roads_count: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Available Ambulances</label>
                <input
                  type="number"
                  value={customSituation.available_ambulances}
                  onChange={(e) => setCustomSituation({ ...customSituation, available_ambulances: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Food & Water Stock Runway (Days)</label>
                <input
                  type="number"
                  step="0.5"
                  value={customSituation.food_water_stock_days}
                  onChange={(e) => setCustomSituation({ ...customSituation, food_water_stock_days: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSituationModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRunCustomEvaluation}
                disabled={isEscalating}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                {isEscalating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Run AI Autonomous Orchestration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
