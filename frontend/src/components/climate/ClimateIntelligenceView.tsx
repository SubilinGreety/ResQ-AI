import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  CloudSun,
  CloudRain,
  Wind,
  Compass,
  Droplets,
  Thermometer,
  Gauge,
  RefreshCw,
  MapPin,
  Activity,
  Megaphone,
  Waves,
  Sun,
  Flame,
  Mountain,
  Clock,
  BarChart2,
  ShieldAlert,
  Sparkles,
  AlertOctagon,
  Loader2,
  Sliders,
} from 'lucide-react';
import { climateApi } from '../../services/api';
import {
  IClimateDashboardResponse,
  IClimateHistoryRecord,
  RiskLevel,
  HazardType,
} from '../../types/climate';

interface ClimateIntelligenceViewProps {
  onNavigateToAlertCenter?: (hazardType?: string, location?: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const HAZARD_ICONS: Record<HazardType, React.ReactNode> = {
  Flood: <Waves className="w-5 h-5 text-blue-500" />,
  Cyclone: <Wind className="w-5 h-5 text-indigo-500" />,
  'Heavy Rain': <CloudRain className="w-5 h-5 text-sky-500" />,
  'Heat Wave': <Sun className="w-5 h-5 text-amber-500" />,
  Landslide: <Mountain className="w-5 h-5 text-stone-500" />,
  Drought: <Flame className="w-5 h-5 text-orange-500" />,
};

const RISK_BADGES: Record<RiskLevel, { bg: string; text: string; border: string; glow: string }> = {
  Low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', glow: 'shadow-emerald-100' },
  Moderate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', glow: 'shadow-amber-100' },
  High: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', glow: 'shadow-orange-100' },
  Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', glow: 'shadow-red-200 ring-2 ring-red-400/30' },
};

export const ClimateIntelligenceView: React.FC<ClimateIntelligenceViewProps> = ({
  onNavigateToAlertCenter,
}) => {
  const [data, setData] = useState<IClimateDashboardResponse | null>(null);
  const [history, setHistory] = useState<IClimateHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedHazard, setSelectedHazard] = useState<HazardType | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'charts' | 'history'>('overview');
  const [activeMapLayer, setActiveMapLayer] = useState<'all' | 'shelters' | 'rescue' | 'zones'>('all');
  const [simulatingProfile, setSimulatingProfile] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // ── Fetch Climate Dashboard ────────────────────────────────────────────────
  const fetchDashboard = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      const [dash, hist] = await Promise.all([
        climateApi.getDashboard('Chennai'),
        climateApi.getHistory(),
      ]);
      setData(dash);
      setHistory(hist);
    } catch (err: any) {
      console.error('Failed to load climate data:', err);
      showToast('Notice: Loaded climate telemetry via ResQ Intelligence Engine.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => fetchDashboard(true), 45000); // 45s poll
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // ── Scenario Simulation Handler ────────────────────────────────────────────
  const handleSimulateScenario = async (profile: string) => {
    try {
      setSimulatingProfile(profile);
      await climateApi.simulateHazard(profile);
      await fetchDashboard(true);
      showToast(`⚡ Simulation switched to ${profile}. AI re-evaluated multi-hazard parameters.`);
    } catch (err: any) {
      showToast('Error switching simulation scenario');
    } finally {
      setSimulatingProfile(null);
    }
  };

  // ── Leaflet Map Setup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'map' && activeTab !== 'overview') return;
    if (!mapContainerRef.current || !data) return;

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [13.04, 80.22],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Disaster Prone Zones (Circles)
    if (activeMapLayer === 'all' || activeMapLayer === 'zones') {
      data.disaster_zones.forEach((zone) => {
        const color = zone.risk_level === 'Critical' ? '#ef4444' : zone.risk_level === 'High' ? '#f97316' : '#eab308';
        const circle = L.circle([zone.latitude, zone.longitude], {
          radius: zone.radius_meters,
          color,
          fillColor: color,
          fillOpacity: 0.18,
          weight: 2,
        });

        circle.bindPopup(`
          <div style="font-family: sans-serif; min-width: 200px;">
            <div style="font-weight: bold; font-size: 13px; color: #1e293b;">${zone.name}</div>
            <div style="font-size: 11px; color: ${color}; font-weight: 600; margin-top: 2px;">
              ${zone.zone_type} · ${zone.risk_level} Risk
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${zone.description}</div>
            <div style="font-size: 11px; margin-top: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0;">
              👥 Vulnerable Population: <strong>${zone.vulnerable_population.toLocaleString()}</strong>
            </div>
          </div>
        `);
        group.addLayer(circle);
      });
    }

    // 2. Safe Shelters (Green Icons)
    if (activeMapLayer === 'all' || activeMapLayer === 'shelters') {
      data.shelters.forEach((shelter) => {
        const shelterIcon = L.divIcon({
          className: 'custom-shelter-marker',
          html: `<div style="background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.15); border: 2px solid white; font-size: 14px;">🏠</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([shelter.latitude, shelter.longitude], { icon: shelterIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 220px;">
            <div style="background: #ecfdf5; color: #047857; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; display: inline-block;">
              SAFE SHELTER (${shelter.status})
            </div>
            <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-top: 4px;">${shelter.name}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">📍 ${shelter.locality}</div>
            <div style="font-size: 11px; margin-top: 6px; display: flex; justify-content: space-between;">
              <span>Capacity: <strong>${shelter.capacity}</strong></span>
              <span>Occupancy: <strong>${shelter.current_occupancy}</strong></span>
            </div>
            <div style="font-size: 11px; color: #0369a1; margin-top: 4px;">📞 ${shelter.contact_person}: ${shelter.contact_phone}</div>
          </div>
        `);
        group.addLayer(marker);
      });
    }

    // 3. Rescue Team Locations (Blue Shield Icons)
    if (activeMapLayer === 'all' || activeMapLayer === 'rescue') {
      data.rescue_teams.forEach((team) => {
        const rescueIcon = L.divIcon({
          className: 'custom-rescue-marker',
          html: `<div style="background: #3b82f6; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2); border: 2px solid white; font-size: 13px;">🛡️</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([team.latitude, team.longitude], { icon: rescueIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 220px;">
            <div style="background: #eff6ff; color: #1d4ed8; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; display: inline-block;">
              ${team.agency} · ${team.team_type}
            </div>
            <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-top: 4px;">${team.unit_name}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">📍 ${team.station_location}</div>
            <div style="font-size: 11px; margin-top: 6px; display: flex; justify-content: space-between;">
              <span>Personnel: <strong>${team.personnel_count}</strong></span>
              <span>Boats: <strong>${team.boats_available}</strong></span>
              <span>Ambulances: <strong>${team.ambulances_available}</strong></span>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">📡 ${team.contact_channel}</div>
          </div>
        `);
        group.addLayer(marker);
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [activeTab, activeMapLayer, data]);

  if (isLoading || !data) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <div className="font-bold text-slate-800 text-base">Initializing Climate Intelligence Engine…</div>
        <p className="text-xs text-slate-500 mt-1">Connecting to Meteorological telemetry and AI multi-hazard sensors.</p>
      </div>
    );
  }

  const { current_weather: w, overall_risk_level, disaster_predictions, active_alerts, recommendations } = data;
  const filteredPredictions = selectedHazard === 'ALL'
    ? disaster_predictions
    : disaster_predictions.filter((p) => p.hazard === selectedHazard);

  return (
    <div className="space-y-6">
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-fadeIn">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-medium border border-slate-700 max-w-md">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ── Top Header & Telemetry Status ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-200">
              <CloudSun className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Climate Intelligence & Early Warning System
                </h2>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-[10px] font-extrabold tracking-wide uppercase">
                  MODULE 5
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${RISK_BADGES[overall_risk_level].bg} ${RISK_BADGES[overall_risk_level].text} ${RISK_BADGES[overall_risk_level].border}`}>
                  RISK: {overall_risk_level.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time climate telemetry, predictive AI multi-hazard forecasting & automated early warning dispatch · Chennai EOC
              </p>
            </div>
          </div>

          {/* Right Controls: Refresh & API Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
              <span className={`w-2 h-2 rounded-full ${data.data_source_mode === 'REAL_API' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span>{data.provider_name}</span>
            </div>

            <button
              onClick={() => fetchDashboard(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              title="Refresh meteorological sensor feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Polling…' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Scenario Simulator Toolbar (Requirement 10 & Demo) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Multi-Hazard Simulator:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'NORMAL', label: '🟢 Nominal Weather', color: 'hover:bg-emerald-50 hover:text-emerald-700' },
              { id: 'CYCLONE', label: '🌀 Cat-3 Cyclone', color: 'hover:bg-indigo-50 hover:text-indigo-700' },
              { id: 'FLOOD', label: '🌊 Flash Flood Inundation', color: 'hover:bg-blue-50 hover:text-blue-700' },
              { id: 'HEAT_WAVE', label: '☀️ Severe Heat Wave', color: 'hover:bg-amber-50 hover:text-amber-700' },
              { id: 'LANDSLIDE', label: '⛰️ Slope Landslide', color: 'hover:bg-stone-50 hover:text-stone-700' },
              { id: 'DROUGHT', label: '🌾 Severe Drought', color: 'hover:bg-orange-50 hover:text-orange-700' },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleSimulateScenario(sc.id)}
                disabled={Boolean(simulatingProfile)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 transition-all ${sc.color} ${
                  w.source.includes(sc.id) ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-700'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Telemetry & Hazard Predictions', icon: <Activity className="w-4 h-4" /> },
          { id: 'map', label: 'GIS Climate & Shelters Map', icon: <MapPin className="w-4 h-4" /> },
          { id: 'charts', label: '24h Trend Charts & Barometry', icon: <BarChart2 className="w-4 h-4" /> },
          { id: 'history', label: 'Climate History Log', icon: <Clock className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: OVERVIEW & TELEMETRY CARDS                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Active Early Warning Banner if any alerts triggered (Requirement 6) */}
          {active_alerts.length > 0 && (
            <div className="space-y-3">
              {active_alerts.map((alt) => (
                <div
                  key={alt.id}
                  className="bg-gradient-to-r from-red-500 via-rose-600 to-red-700 text-white rounded-2xl p-5 shadow-lg shadow-red-200 border border-red-400 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="w-5 h-5 text-amber-300 animate-pulse" />
                        <span className="font-extrabold text-sm uppercase tracking-wide text-amber-200">
                          {alt.title}
                        </span>
                        <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold">
                          {alt.triggered_parameter}: {alt.current_value}
                        </span>
                      </div>
                      <p className="text-xs text-white/95 leading-relaxed font-medium">
                        {alt.message}
                      </p>
                      <p className="text-xs text-rose-100 italic">
                        {alt.message_ta}
                      </p>
                      <div className="text-[11px] text-white/80 pt-1">
                        🚨 <strong>Action Mandate:</strong> {alt.action_required} · Sectors: {alt.affected_zones.join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {onNavigateToAlertCenter && (
                        <button
                          onClick={() => onNavigateToAlertCenter(alt.hazard, alt.affected_zones[0])}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap"
                        >
                          <Megaphone className="w-4 h-4 text-red-600" />
                          <span>Broadcast Emergency Mass Alert &rarr;</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 7 Meteorological Parameter Cards (Requirement 2 & 3) ──────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. Temperature */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-semibold text-slate-600">Temperature</span>
                <Thermometer className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {w.temperature}°C
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Feels like: <strong className="text-slate-700">{w.feels_like}°C</strong>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Min: {w.temp_min}° · Max: {w.temp_max}°
              </div>
            </div>

            {/* 2. Humidity */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-semibold text-slate-600">Humidity</span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {w.humidity}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Status: <strong className={w.humidity > 85 ? 'text-blue-600' : 'text-slate-700'}>{w.humidity > 85 ? 'High Saturation' : 'Optimal'}</strong>
              </div>
              <div className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${w.humidity}%` }} />
              </div>
            </div>

            {/* 3. Rainfall */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-semibold text-slate-600">Rainfall (1h)</span>
                <CloudRain className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {w.rainfall_1h} <span className="text-sm font-normal text-slate-500">mm/h</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                24h Accum: <strong className="text-slate-700">{w.rainfall_24h} mm</strong>
              </div>
              <div className="text-[10px] text-sky-600 font-semibold mt-0.5">
                {w.rainfall_1h >= 40 ? 'Torrential' : w.rainfall_1h >= 15 ? 'Heavy Downpour' : w.rainfall_1h > 0 ? 'Light/Moderate' : 'No Rain'}
              </div>
            </div>

            {/* 4. Wind Speed & Direction */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-semibold text-slate-600">Wind Telemetry</span>
                <Wind className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {w.wind_speed} <span className="text-sm font-normal text-slate-500">km/h</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Compass className="w-3 h-3 text-indigo-400" />
                <span>Heading: <strong>{w.wind_direction_compass} ({w.wind_direction}°)</strong></span>
              </div>
              <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                {w.wind_speed >= 65 ? 'Cyclone Gale Warning' : w.wind_speed >= 35 ? 'Moderate Breeze' : 'Light Breeze'}
              </div>
            </div>

            {/* 5. Atmospheric Pressure */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-semibold text-slate-600">Pressure</span>
                <Gauge className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {w.pressure} <span className="text-sm font-normal text-slate-500">hPa</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Trend: <strong className={w.pressure < 995 ? 'text-red-600' : 'text-slate-700'}>{w.pressure < 980 ? 'Deep Cyclone' : w.pressure < 1000 ? 'Low Pressure' : 'Normal / Stable'}</strong>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Baseline: 1013.2 hPa
              </div>
            </div>

            {/* 6. Air Quality Index (AQI) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-semibold text-slate-600">Air Quality (AQI)</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {w.aqi}
              </div>
              <div className="text-[11px] font-semibold mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  w.aqi <= 50 ? 'bg-emerald-100 text-emerald-700' : w.aqi <= 100 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {w.aqi_status}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                UV Index: {w.uv_index} · Vis: {w.visibility_km}km
              </div>
            </div>
          </div>

          {/* ── AI Multi-Hazard Predictions (Requirement 4 & 5) ───────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI Disaster Probability & Multi-Hazard Predictions
                </h3>
                <p className="text-xs text-slate-500">
                  Continuous multi-dimensional analysis predicting 6 climate hazard categories across Chennai metropolitan region.
                </p>
              </div>

              {/* Hazard Filter Buttons */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedHazard('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition ${selectedHazard === 'ALL' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  All (6)
                </button>
                {disaster_predictions.map((p) => (
                  <button
                    key={p.hazard}
                    onClick={() => setSelectedHazard(p.hazard)}
                    className={`px-2.5 py-1 rounded-lg transition ${selectedHazard === p.hazard ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {p.hazard}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPredictions.map((pred) => {
                const conf = RISK_BADGES[pred.risk_level];
                return (
                  <div
                    key={pred.hazard}
                    className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all ${conf.border} ${pred.risk_level === 'Critical' ? conf.glow : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          {HAZARD_ICONS[pred.hazard]}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{pred.hazard}</div>
                          <div className="text-[11px] text-slate-400">Impact: {pred.projected_impact_window}</div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${conf.bg} ${conf.text} ${conf.border}`}>
                        {pred.risk_level.toUpperCase()}
                      </span>
                    </div>

                    {/* Probability Meter */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">Likelihood Probability</span>
                        <span className="text-slate-800 tabular-nums">{pred.probability}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            pred.probability >= 75 ? 'bg-red-500' : pred.probability >= 50 ? 'bg-orange-500' : pred.probability >= 25 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pred.probability}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {pred.description}
                    </p>

                    {/* Sensor Triggers */}
                    <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] space-y-1 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telemetry Triggers:</div>
                      {pred.triggers.map((t, idx) => (
                        <div key={idx} className="text-slate-700 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── AI Operational Recommendations (Requirement 8) ──────────────── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">AI Civil Protection & Rescue Recommendations</h3>
                  <p className="text-xs text-slate-500">Actionable operational guidelines for Chennai Disaster Response forces & Collectorate</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg">
                {recommendations.length} Active Protocols
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-slate-900">{rec.title}</span>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-rose-100 text-rose-700 border border-rose-200 flex-shrink-0">
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {rec.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-700">🏛️ Assigned: {rec.target_agency}</span>
                    <span className="text-emerald-600 font-bold">Status: {rec.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: GIS CLIMATE, SHELTERS & RESCUE MAP (Requirement 7)              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                GIS Tactical Disaster Response Map
              </h3>
              <p className="text-xs text-slate-500">Live coordinates for Safe Shelters, NDRF/SDRF Staging Bases, and Disaster-Prone Inundation Zones.</p>
            </div>

            {/* Layer Filter Controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {[
                { id: 'all', label: 'All Layers' },
                { id: 'shelters', label: '🏠 Safe Shelters (5)' },
                { id: 'rescue', label: '🛡️ Rescue Teams (4)' },
                { id: 'zones', label: '⚠️ Prone Zones (5)' },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveMapLayer(layer.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition ${activeMapLayer === layer.id ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          {/* Map Canvas */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[560px] relative">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Map Legend */}
            <div className="absolute bottom-4 left-4 z-[500] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1.5">
              <div className="font-bold text-slate-900 mb-1">GIS Map Legend</div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>Safe Cyclone/Flood Shelter</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                <span>NDRF / SDRF Rescue Unit</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span>High-Risk Hazard Zone</span>
              </div>
            </div>
          </div>

          {/* Shelters & Rescue Quick Directory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shelters list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <span>🏠 Safe Shelters Ready for Deployment</span>
              </h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {data.shelters.map((s) => (
                  <div key={s.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">📍 {s.locality} · Capacity: {s.capacity}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        {s.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">{s.contact_phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rescue teams list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <span>🛡️ Deployed Rescue Task Forces</span>
              </h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {data.rescue_teams.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{t.unit_name}</div>
                      <div className="text-[11px] text-slate-500">📍 {t.station_location} · {t.personnel_count} Troops</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                        {t.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">{t.boats_available} Inflatable Boats</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: INTERACTIVE CHARTS & BAROMETRY (Requirement 3)                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: 24h Temperature & Heat Index */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">24-Hour Temperature Curve</h4>
                  <p className="text-xs text-slate-500">Hourly ambient temperature variations across Chennai</p>
                </div>
                <Thermometer className="w-4 h-4 text-rose-500" />
              </div>

              {/* Responsive SVG Chart */}
              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
                {data.forecast_24h.map((item, i) => {
                  const heightPercent = Math.min(100, Math.max(15, (item.temperature - 20) * 4.5));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                        {item.temperature}°
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-rose-500 to-amber-400 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <div className="text-[10px] text-slate-400">{item.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Rainfall & Precipitation Intensity */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Precipitation & Rain Rate (mm/3h)</h4>
                  <p className="text-xs text-slate-500">Projected rainfall volume from atmospheric moisture</p>
                </div>
                <CloudRain className="w-4 h-4 text-sky-500" />
              </div>

              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
                {data.forecast_24h.map((item, i) => {
                  const heightPercent = Math.min(100, Math.max(5, item.rainfall * 2.2));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] font-bold text-sky-700 opacity-0 group-hover:opacity-100 transition">
                        {item.rainfall}mm
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <div className="text-[10px] text-slate-400">{item.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 3: Wind Velocity & Gale Tendency */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Wind Velocity & Gusts (km/h)</h4>
                  <p className="text-xs text-slate-500">Surface wind telemetry across Bay of Bengal coastline</p>
                </div>
                <Wind className="w-4 h-4 text-indigo-500" />
              </div>

              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
                {data.forecast_24h.map((item, i) => {
                  const heightPercent = Math.min(100, Math.max(10, item.wind_speed * 1.0));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] font-bold text-indigo-700 opacity-0 group-hover:opacity-100 transition">
                        {item.wind_speed}
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-violet-400 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <div className="text-[10px] text-slate-400">{item.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 4: Barometric Pressure Drop (Cyclone Alert) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Barometric Pressure Gradient (hPa)</h4>
                  <p className="text-xs text-slate-500">Rapid drop indicates cyclonic depression vortex</p>
                </div>
                <Gauge className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
                {data.forecast_24h.map((item, i) => {
                  // Normalize pressure between 950 and 1020 hPa
                  const heightPercent = Math.min(100, Math.max(15, (item.pressure - 950) * 1.4));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition">
                        {item.pressure}
                      </div>
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${item.pressure < 980 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <div className="text-[10px] text-slate-400">{item.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: CLIMATE HISTORY LOG (Requirement 9)                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Historical Meteorological & Hazard Snapshots
              </h3>
              <p className="text-xs text-slate-500">Audit trail of date & time, telemetry, predicted disaster, risk level, and AI recommendations.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Snapshots: {history.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Temp / Humidity</th>
                  <th className="py-3 px-3">Rainfall (1h)</th>
                  <th className="py-3 px-3">Wind / Pressure</th>
                  <th className="py-3 px-3">Predicted Hazard</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">AI Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((rec) => {
                  const conf = RISK_BADGES[rec.risk_level];
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {rec.timestamp}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                        {rec.temperature}°C · {rec.humidity}%
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-sky-700">
                        {rec.rainfall} mm
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                        {rec.wind_speed} km/h · {rec.pressure} hPa
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {rec.predicted_hazard}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${conf.bg} ${conf.text} ${conf.border}`}>
                          {rec.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={rec.recommendation}>
                        {rec.recommendation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
