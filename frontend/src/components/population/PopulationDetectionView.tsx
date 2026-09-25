import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import {
  Users,
  Radio,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Navigation,
  TrendingUp,
  Shield,
  Zap,
  Filter,
  Wifi,
  MapPin,
  Brain,
  ArrowUp,
  Info,
} from 'lucide-react';
import { populationApi } from '../../services/api';
import {
  IPopulationDetectionData,
  IPopulationCluster,
  DensityLevel,
  RadiusFilter,
  TimeRangeFilter,
} from '../../types/population';

// ─── Animated Counter Hook ────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 1200): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = Date.now();
    const from = 0;
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(from + (target - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

// ─── Density Color / Style Helpers ───────────────────────────────────────────

const densityConfig: Record<
  DensityLevel,
  { bg: string; border: string; text: string; badge: string; glow: string; hex: string }
> = {
  Low: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    glow: 'shadow-emerald-200',
    hex: '#10b981',
  },
  Medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    glow: 'shadow-amber-200',
    hex: '#f59e0b',
  },
  High: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    glow: 'shadow-orange-200',
    hex: '#f97316',
  },
  Critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800 border-red-300',
    glow: 'shadow-red-200',
    hex: '#dc2626',
  },
};

const classificationConfig: Record<
  IPopulationCluster['classification'],
  { icon: string; color: string }
> = {
  'Evacuation Priority': { icon: '🚨', color: 'text-red-700' },
  'High-Risk Crowded': { icon: '⚠️', color: 'text-orange-700' },
  Normal: { icon: '📍', color: 'text-blue-700' },
  'Safe Zone': { icon: '✅', color: 'text-emerald-700' },
};

// ─── Animated Metric Card ─────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  accentClass: string;
  iconBg: string;
  subtext?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label, value, unit, icon, accentClass, iconBg, subtext,
}) => {
  const animated = useAnimatedCounter(value);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[130px] hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      <div>
        <div className={`text-3xl font-extrabold ${accentClass} tabular-nums`}>
          {animated.toLocaleString()}
          {unit && <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>}
        </div>
        {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
      </div>
    </div>
  );
};

// ─── Population Density Map ───────────────────────────────────────────────────

interface PopulationMapProps {
  clusters: IPopulationCluster[];
  heatmapPoints: { lat: number; lon: number; intensity: number }[];
  selectedCluster: IPopulationCluster | null;
  onSelectCluster: (c: IPopulationCluster | null) => void;
  radiusKm: number;
}

const PopulationMap: React.FC<PopulationMapProps> = ({
  clusters, heatmapPoints, selectedCluster, onSelectCluster,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [13.0, 80.22],
      zoom: 11,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (clusters.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Draw heatmap-style circles for each SIM point
    heatmapPoints.forEach((pt) => {
      L.circleMarker([pt.lat, pt.lon], {
        radius: 3,
        color: 'transparent',
        fillColor: `rgba(239,68,68,${0.15 + pt.intensity * 0.5})`,
        fillOpacity: 0.6,
        weight: 0,
      }).addTo(layer);
    });

    // Draw cluster overlays
    clusters.forEach((cluster) => {
      const cfg = densityConfig[cluster.density];
      const isSelected = selectedCluster?.clusterId === cluster.clusterId;

      // Heatmap circle
      L.circle([cluster.centerLat, cluster.centerLon], {
        color: cfg.hex,
        fillColor: cfg.hex,
        fillOpacity: isSelected ? 0.32 : 0.18,
        radius: cluster.radiusMeters,
        weight: isSelected ? 3 : 1.5,
        dashArray: cluster.density === 'Critical' ? '6,4' : undefined,
      }).addTo(layer);

      // Pulse ring for Critical/High
      if (cluster.density === 'Critical' || cluster.density === 'High') {
        L.circle([cluster.centerLat, cluster.centerLon], {
          color: cfg.hex,
          fillColor: 'transparent',
          fillOpacity: 0,
          radius: cluster.radiusMeters * 1.25,
          weight: 1,
          opacity: 0.4,
          dashArray: '4,8',
        }).addTo(layer);
      }

      // Custom marker icon
      const markerHtml = `
        <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
          ${cluster.density === 'Critical' ? `
            <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:${cfg.hex};opacity:0.25;animation:ping 1.5s ease-in-out infinite;"></div>
          ` : ''}
          <div style="
            position:relative;
            width:${isSelected ? '34px' : '28px'};
            height:${isSelected ? '34px' : '28px'};
            border-radius:50%;
            background:${cfg.hex};
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.35);
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;
            transition:all 0.2s;
          ">
            <span style="font-size:11px;font-weight:900;color:white;line-height:1;">${cluster.activeSims > 999 ? Math.round(cluster.activeSims/1000)+'k' : cluster.activeSims}</span>
          </div>
          <div style="
            position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);
            background:white;color:#1e293b;font-size:10px;font-weight:700;
            padding:1px 7px;border-radius:4px;border:1px solid ${cfg.hex};
            white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.15);
            pointer-events:none;
          ">${cluster.locality}</div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'population-marker',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([cluster.centerLat, cluster.centerLon], { icon });

      const popupHtml = `
        <div style="min-width:230px;font-family:Inter,sans-serif;font-size:12px;color:#1e293b;padding:4px;">
          <div style="font-weight:800;font-size:13px;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
            <span>${classificationConfig[cluster.classification].icon}</span>
            <span>${cluster.locality}</span>
          </div>
          <div style="display:inline-block;padding:2px 8px;border-radius:6px;background:${cfg.hex}18;color:${cfg.hex};border:1px solid ${cfg.hex}40;font-weight:700;font-size:11px;margin-bottom:8px;">
            ${cluster.density} Density · P${cluster.evacuationPriority}
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px;">
            <tr><td style="color:#64748b;padding:2px 0;">Active SIMs</td><td style="text-align:right;font-weight:700;color:${cfg.hex};">${cluster.activeSims.toLocaleString()}</td></tr>
            <tr><td style="color:#64748b;padding:2px 0;">Est. Population</td><td style="text-align:right;font-weight:700;">${cluster.estimatedPopulation.toLocaleString()}</td></tr>
            <tr><td style="color:#64748b;padding:2px 0;">Density Score</td><td style="text-align:right;font-weight:700;">${cluster.densityScore}/100</td></tr>
            <tr><td style="color:#64748b;padding:2px 0;">Classification</td><td style="text-align:right;font-weight:700;">${cluster.classification}</td></tr>
          </table>
          <div style="font-size:10px;color:#94a3b8;">📶 Operators: ${cluster.operators.map(o=>`${o.name}(${o.count})`).join(' · ')}</div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });
      marker.on('click', () => onSelectCluster(cluster));
      marker.addTo(layer);

      bounds.extend([cluster.centerLat, cluster.centerLon]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [clusters, heatmapPoints, selectedCluster]);

  const recenter = () => {
    mapInstanceRef.current?.setView([13.0, 80.22], 11);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[520px] relative">
      {/* Map Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-violet-100">
            <MapPin className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-800">Live Population Density Map</span>
            <span className="ml-2 text-xs text-slate-400">· Chennai EOC · SIM Activity Heatmap</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:block">
            {clusters.length} clusters · {clusters.reduce((a, c) => a + c.activeSims, 0).toLocaleString()} active SIMs
          </span>
          <button
            onClick={recenter}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
          >
            <Navigation className="w-3 h-3 text-violet-600" />
            <span>Recenter</span>
          </button>
        </div>
      </div>

      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

      {/* Density Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3 z-10 shadow-md text-xs">
        <div className="text-slate-700 font-bold mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-violet-600" />
          Population Density
        </div>
        {(['Low', 'Medium', 'High', 'Critical'] as DensityLevel[]).map((d) => (
          <div key={d} className="flex items-center space-x-2 mb-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: densityConfig[d].hex }}
            />
            <span className="text-slate-600">{d}</span>
          </div>
        ))}
      </div>

      {/* Data Source Badge */}
      <div className="absolute top-16 right-3 z-10">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-600/90 text-white text-[10px] font-bold rounded-full shadow">
          <Wifi className="w-2.5 h-2.5" /> SIMULATED DATA
        </span>
      </div>
    </div>
  );
};

// ─── Cluster Detail Card ──────────────────────────────────────────────────────

const ClusterCard: React.FC<{
  cluster: IPopulationCluster;
  isSelected: boolean;
  onClick: () => void;
}> = ({ cluster, isSelected, onClick }) => {
  const cfg = densityConfig[cluster.density];
  const cls = classificationConfig[cluster.classification];

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
        isSelected ? `${cfg.border} ${cfg.bg} shadow-lg` : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{cls.icon}</span>
            <span className="font-bold text-sm text-slate-900">{cluster.locality}</span>
          </div>
          <span
            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}
          >
            {cluster.density} · P{cluster.evacuationPriority}
          </span>
        </div>
        <div className="text-right">
          <div
            className="text-xl font-extrabold tabular-nums"
            style={{ color: cfg.hex }}
          >
            {cluster.activeSims.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">active SIMs</div>
        </div>
      </div>

      {/* Density Score Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
          <span>Density Score</span>
          <span className="font-bold" style={{ color: cfg.hex }}>
            {cluster.densityScore}/100
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${cluster.densityScore}%`, background: cfg.hex }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-slate-50 rounded-lg px-2.5 py-2">
          <div className="text-slate-400 text-[10px] mb-0.5">Est. Population</div>
          <div className="font-bold text-slate-800">{cluster.estimatedPopulation.toLocaleString()}</div>
        </div>
        <div className="bg-slate-50 rounded-lg px-2.5 py-2">
          <div className="text-slate-400 text-[10px] mb-0.5">Classification</div>
          <div className={`font-bold text-[11px] ${cls.color}`}>{cluster.classification}</div>
        </div>
      </div>

      {/* Operator breakdown */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {cluster.operators.map((op) => (
          <span
            key={op.name}
            className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium"
          >
            {op.name}: {op.count}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── AI Insights Panel ────────────────────────────────────────────────────────

const AiInsightsPanel: React.FC<{ insights: IPopulationDetectionData['aiInsights'] }> = ({
  insights,
}) => {
  const overallCfg = densityConfig[insights.overallDensityLevel];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-violet-100">
          <Brain className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm">AI Population Intelligence</div>
          <div className="text-xs text-slate-400">Automated threat classification & zone recommendations</div>
        </div>
        <span
          className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${overallCfg.badge}`}
        >
          Overall: {insights.overallDensityLevel}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* High-risk zones */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-red-700">High-Risk Zones</span>
          </div>
          {insights.highRiskZones.length > 0 ? (
            <div className="space-y-1">
              {insights.highRiskZones.map((z) => (
                <div key={z} className="text-xs text-red-800 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {z}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-red-400">None detected</span>
          )}
        </div>

        {/* Safe zones */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">Safe Zones</span>
          </div>
          {insights.safeZones.length > 0 ? (
            <div className="space-y-1">
              {insights.safeZones.map((z) => (
                <div key={z} className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {z}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-emerald-400">No safe zones identified</span>
          )}
        </div>

        {/* Evacuation priority */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowUp className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold text-orange-700">Evacuation Priority</span>
          </div>
          {insights.evacuationPriorityZones.length > 0 ? (
            <div className="space-y-1">
              {insights.evacuationPriorityZones.map((z) => (
                <div key={z} className="text-xs text-orange-800 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  {z}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-orange-400">No priority zones</span>
          )}
        </div>
      </div>

      {/* Recommended actions */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Zap className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-bold text-violet-800">AI Recommended Actions</span>
        </div>
        <div className="space-y-2">
          {insights.recommendedActions.map((action, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-violet-900">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-200 text-violet-700 font-bold flex items-center justify-center text-[10px]">
                {i + 1}
              </span>
              <span className="leading-relaxed">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main PopulationDetectionView ─────────────────────────────────────────────

export const PopulationDetectionView: React.FC = () => {
  const [data, setData] = useState<IPopulationDetectionData | null>(null);
  const [heatmapPoints, setHeatmapPoints] = useState<
    { lat: number; lon: number; intensity: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<IPopulationCluster | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [radius, setRadius] = useState<RadiusFilter>(1);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>(1);

  const autoRefreshRef = useRef<ReturnType<typeof setInterval>>();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchData = useCallback(
    async (showSpinner = false) => {
      try {
        if (showSpinner) setIsLoading(true);
        else setIsRefreshing(true);
        setError(null);

        const [detectionData, heatmap] = await Promise.all([
          populationApi.getDetectionData(radius, timeRange),
          populationApi.getHeatmapPoints(radius),
        ]);

        setData(detectionData);
        setHeatmapPoints(heatmap);
        setLastRefreshed(new Date());
      } catch (err: any) {
        setError(err.message || 'Failed to fetch population data');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [radius, timeRange]
  );

  // Fetch when filters change
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(autoRefreshRef.current);
  }, [fetchData]);

  const sortedClusters = data
    ? [...data.clusters].sort((a, b) => a.evacuationPriority - b.evacuationPriority)
    : [];

  const totalSims = data?.totalActiveSims ?? 0;
  const totalPop = data?.estimatedTotalPopulation ?? 0;
  const criticalCount = data?.clusters.filter((c) => c.density === 'Critical').length ?? 0;
  const safeCount = data?.clusters.filter((c) => c.density === 'Low').length ?? 0;

  // ─── Loading Skeleton ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div>
              <div className="h-4 bg-slate-200 rounded w-56 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-40" />
            </div>
          </div>
          <div className="h-8 bg-slate-200 rounded-lg w-28" />
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-32">
              <div className="h-3 bg-slate-200 rounded w-2/3 mb-4" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 h-[520px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <div className="font-bold text-red-800 mb-1">Population Detection Error</div>
        <div className="text-sm text-red-600 mb-4">{error}</div>
        <button
          onClick={() => fetchData(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Module Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-violet-600 text-white shadow-md shadow-violet-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Live Population Density Detection
                </h2>
                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 border border-violet-200 rounded-full text-[10px] font-bold tracking-wide">
                  MODULE 3
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                AI-powered crowd estimation via anonymized active SIM/network telemetry · Chennai EOC
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Data source badge */}
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold">
              <Wifi className="w-3.5 h-3.5" /> Simulated Telecom Data
            </span>

            {/* Last refresh */}
            {lastRefreshed && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                {lastRefreshed.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}

            {/* Refresh button */}
            <button
              onClick={() => fetchData(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-violet-500" />
          Filters
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Radius:</span>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {([0.5, 1, 5] as RadiusFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  radius === r
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {r < 1 ? `${r * 1000}m` : `${r}km`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Time Range:</span>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {([1, 3, 6, 12, 24] as TimeRangeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  timeRange === t
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t}h
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto text-xs text-slate-400">
          Auto-refreshes every 30 seconds
        </div>
      </div>

      {/* ─── Metric Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Estimated Population"
          value={totalPop}
          icon={<Users className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-100"
          accentClass="text-violet-700"
          subtext={`across ${data?.clusters.length ?? 0} detected clusters`}
        />
        <MetricCard
          label="Active SIM Count"
          value={totalSims}
          icon={<Radio className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
          accentClass="text-blue-700"
          subtext="anonymized network devices"
        />
        <MetricCard
          label="Critical Density Zones"
          value={criticalCount}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          iconBg="bg-red-100"
          accentClass="text-red-600"
          subtext="require immediate action"
        />
        <MetricCard
          label="Safe Assembly Zones"
          value={safeCount}
          icon={<Shield className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
          accentClass="text-emerald-700"
          subtext="low density, usable for evacuation"
        />
      </div>

      {/* ─── Overall density indicator ─────────────────────────────────────── */}
      {data && (
        <div
          className={`rounded-2xl border px-5 py-3.5 flex items-center justify-between ${
            densityConfig[data.aiInsights.overallDensityLevel].bg
          } ${densityConfig[data.aiInsights.overallDensityLevel].border}`}
        >
          <div className="flex items-center gap-3">
            <TrendingUp className={`w-5 h-5 ${densityConfig[data.aiInsights.overallDensityLevel].text}`} />
            <span className={`text-sm font-bold ${densityConfig[data.aiInsights.overallDensityLevel].text}`}>
              Overall Population Density Level:{' '}
              <span className="uppercase">{data.aiInsights.overallDensityLevel}</span>
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Coverage: {radius < 1 ? `${radius * 1000}m` : `${radius}km`} radius · Last {timeRange}h · {data.dataSource}
          </span>
        </div>
      )}

      {/* ─── Map + Clusters ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map: 2/3 width */}
        <div className="xl:col-span-2">
          <PopulationMap
            clusters={sortedClusters}
            heatmapPoints={heatmapPoints}
            selectedCluster={selectedCluster}
            onSelectCluster={(c) => setSelectedCluster(c === selectedCluster ? null : c)}
            radiusKm={radius}
          />
        </div>

        {/* Cluster List: 1/3 width */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[520px]">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-600" />
                <span className="font-bold text-sm text-slate-800">Density Clusters</span>
              </div>
              <span className="text-xs text-slate-400">{sortedClusters.length} sectors</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {sortedClusters.map((cluster) => (
                <ClusterCard
                  key={cluster.clusterId}
                  cluster={cluster}
                  isSelected={selectedCluster?.clusterId === cluster.clusterId}
                  onClick={() =>
                    setSelectedCluster(
                      selectedCluster?.clusterId === cluster.clusterId ? null : cluster
                    )
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── AI Insights ───────────────────────────────────────────────────── */}
      {data && <AiInsightsPanel insights={data.aiInsights} />}

      {/* ─── Telecom Operator Breakdown ────────────────────────────────────── */}
      {data && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-blue-100">
              <Radio className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Telecom Operator Distribution</div>
              <div className="text-xs text-slate-400">Active SIMs per carrier · all zones</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['Jio', 'Airtel', 'BSNL', 'Vi'] as const).map((op) => {
              const total = data.clusters.reduce((acc, c) => {
                const found = c.operators.find((o) => o.name === op);
                return acc + (found?.count ?? 0);
              }, 0);
              const pct = totalSims > 0 ? Math.round((total / totalSims) * 100) : 0;
              const colors: Record<string, { bg: string; text: string; bar: string }> = {
                Jio: { bg: 'bg-blue-50', text: 'text-blue-700', bar: '#3b82f6' },
                Airtel: { bg: 'bg-red-50', text: 'text-red-700', bar: '#ef4444' },
                BSNL: { bg: 'bg-green-50', text: 'text-green-700', bar: '#22c55e' },
                Vi: { bg: 'bg-purple-50', text: 'text-purple-700', bar: '#a855f7' },
              };
              const c = colors[op];
              return (
                <div key={op} className={`${c.bg} rounded-xl p-3 border border-slate-100`}>
                  <div className={`font-bold text-sm ${c.text} mb-1`}>{op}</div>
                  <div className="text-xl font-extrabold text-slate-800 tabular-nums">
                    {total.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">{pct}% share</div>
                  <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: c.bar, transition: 'width 1s ease' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Integration Note ──────────────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">Production Integration Note: </span>
          This module uses simulated SIM activity data. For live deployment, replace{' '}
          <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">
            generateSimData()
          </code>{' '}
          in{' '}
          <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">
            server/src/controllers/populationController.ts
          </code>{' '}
          with a real telecom API call (TRAI NDCP / Jio / Airtel aggregated APIs). The response
          shape, clustering logic, and AI insights remain unchanged.
        </div>
      </div>
    </div>
  );
};
