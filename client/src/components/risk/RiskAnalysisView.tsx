import React, { useState } from 'react';
import { IScenarioRiskAnalysis, IZoneRiskAssessment, RiskLevel } from '../../types/risk';
import {
  RotateCcw,
  ShieldAlert,
  X,
  MapPin,
  TrendingUp,
  Activity,
  Sparkles,
} from 'lucide-react';

interface RiskAnalysisViewProps {
  riskAnalysis: IScenarioRiskAnalysis | null;
  onRecalculate: () => Promise<void>;
  isCalculating: boolean;
  selectedZoneId?: string | null;
  onClearSelectedZone?: () => void;
}

export const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({
  riskAnalysis,
  onRecalculate,
  isCalculating,
  selectedZoneId,
  onClearSelectedZone,
}) => {
  const [activeZoneModal, setActiveZoneModal] = useState<IZoneRiskAssessment | null>(null);

  // If a zone ID was passed from map popup
  React.useEffect(() => {
    if (selectedZoneId && riskAnalysis) {
      const found = riskAnalysis.zones.find((z) => z.zoneId === selectedZoneId);
      if (found) setActiveZoneModal(found);
    }
  }, [selectedZoneId, riskAnalysis]);

  if (!riskAnalysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
        <ShieldAlert className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">
          Risk Prediction Model Ready
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Click below to run the transparent multi-hazard risk scoring engine across all affected Chennai zones.
        </p>
        <button
          onClick={onRecalculate}
          disabled={isCalculating}
          className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Activity className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? 'Calculating Risk...' : 'Run Risk Analysis'}</span>
        </button>
      </div>
    );
  }

  const { overview, zones } = riskAnalysis;

  // Percentage calculations for distribution bar
  const total = overview.totalZones || 1;
  const critPct = Math.round((overview.criticalZones / total) * 100);
  const highPct = Math.round((overview.highZones / total) * 100);
  const modPct = Math.round((overview.moderateZones / total) * 100);
  const lowPct = Math.round((overview.lowZones / total) * 100);

  const getRiskLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
    }
  };

  const getPriorityBadge = (p: number) => {
    switch (p) {
      case 1:
        return 'bg-red-600 text-white font-bold';
      case 2:
        return 'bg-orange-500 text-white font-semibold';
      case 3:
        return 'bg-amber-500 text-white font-medium';
      case 4:
        return 'bg-emerald-600 text-white font-medium';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header & Recalculate Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Risk Prediction & Priority Analysis
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Module 2 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explainable multi-factor scoring normalized across water levels, rainfall, casualties, and road access.
          </p>
        </div>

        <button
          onClick={onRecalculate}
          disabled={isCalculating}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? 'Recalculating...' : 'Recalculate Risk'}</span>
        </button>
      </div>

      {/* A. Risk Overview Cards (Prompt 9.A) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Zones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase block">
            Total Zones
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {overview.totalZones}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sectors Assessed</div>
        </div>

        {/* Critical Zones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-l-4 border-l-red-600">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-700 font-semibold uppercase">
              Critical (P1)
            </span>
            <span className="w-2 h-2 rounded-full bg-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {overview.criticalZones}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Score 80–100</div>
        </div>

        {/* High Risk Zones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-orange-700 font-semibold uppercase">
              High Risk (P2)
            </span>
            <span className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-1">
            {overview.highZones}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Score 60–79</div>
        </div>

        {/* Moderate Zones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-700 font-semibold uppercase">
              Moderate (P3)
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {overview.moderateZones}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Score 40–59</div>
        </div>

        {/* Low Risk Zones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-700 font-semibold uppercase">
              Low Risk (P4)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {overview.lowZones}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Score 0–39</div>
        </div>
      </div>

      {/* B. Risk Distribution Visualizer Bar (Prompt 9.B) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Risk Level Distribution
          </h3>
          <span className="text-xs text-slate-500">
            Average Scenario Score: <strong className="text-slate-800">{overview.averageScore} / 100</strong>
          </span>
        </div>

        {/* Composite Segmented Progress Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {overview.criticalZones > 0 && (
            <div
              style={{ width: `${critPct}%` }}
              className="bg-red-600 h-full transition-all"
              title={`Critical: ${overview.criticalZones} (${critPct}%)`}
            />
          )}
          {overview.highZones > 0 && (
            <div
              style={{ width: `${highPct}%` }}
              className="bg-orange-500 h-full transition-all"
              title={`High: ${overview.highZones} (${highPct}%)`}
            />
          )}
          {overview.moderateZones > 0 && (
            <div
              style={{ width: `${modPct}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Moderate: ${overview.moderateZones} (${modPct}%)`}
            />
          )}
          {overview.lowZones > 0 && (
            <div
              style={{ width: `${lowPct}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Low: ${overview.lowZones} (${lowPct}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span>Critical: {overview.criticalZones} ({critPct}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span>High: {overview.highZones} ({highPct}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span>Moderate: {overview.moderateZones} ({modPct}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Low: {overview.lowZones} ({lowPct}%)</span>
          </div>
        </div>
      </div>

      {/* C. Priority Zone Table (Prompt 9.C) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Zones Ranked by Response Priority ({zones.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Sorted by Priority 1 → 4, then Risk Score descending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3 text-center">Priority</th>
                <th className="py-3 px-4">Zone & Locality</th>
                <th className="py-3 px-4 w-44">Risk Score</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3 text-right">Population</th>
                <th className="py-3 px-3 text-right">Water Level</th>
                <th className="py-3 px-3 text-right">Injured</th>
                <th className="py-3 px-3 text-right">Vulnerable</th>
                <th className="py-3 px-3">Road Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {zones.map((zone) => {
                const isTopPriority = zone.priority === 1;
                return (
                  <tr
                    key={zone.zoneId}
                    className={`hover:bg-slate-50 transition-colors ${
                      isTopPriority ? 'bg-red-50/40' : ''
                    }`}
                  >
                    {/* Priority Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${getPriorityBadge(
                          zone.priority
                        )}`}
                      >
                        P{zone.priority}
                      </span>
                    </td>

                    {/* Zone & Locality */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{zone.zoneName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{zone.locality}</span>
                      </div>
                    </td>

                    {/* D. Risk Score Visualization (Horizontal Bar) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 w-8 text-right">
                          {zone.riskScore}
                        </span>
                        <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden w-24">
                          <div
                            style={{ width: `${zone.riskScore}%` }}
                            className={`h-full rounded-full ${
                              zone.riskScore >= 80
                                ? 'bg-red-600'
                                : zone.riskScore >= 60
                                ? 'bg-orange-500'
                                : zone.riskScore >= 40
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                    </td>

                    {/* Risk Level */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] border ${getRiskLevelBadge(
                          zone.riskLevel
                        )}`}
                      >
                        {zone.riskLevel}
                      </span>
                    </td>

                    {/* Population */}
                    <td className="py-3 px-3 text-right font-medium whitespace-nowrap">
                      {zone.population.toLocaleString()}
                    </td>

                    {/* Water Level */}
                    <td className="py-3 px-3 text-right font-semibold text-blue-700 whitespace-nowrap">
                      {zone.waterLevel.toFixed(1)} m
                    </td>

                    {/* Injured */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          zone.injured > 0 ? 'text-red-600' : 'text-slate-400'
                        }`}
                      >
                        {zone.injured}
                      </span>
                    </td>

                    {/* Vulnerable */}
                    <td className="py-3 px-3 text-right font-medium text-slate-600 whitespace-nowrap">
                      {zone.vulnerablePopulation.toLocaleString()}
                    </td>

                    {/* Road Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 border border-slate-200">
                        {zone.roadStatus}
                      </span>
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setActiveZoneModal(zone)}
                        className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
                      >
                        Inspect Why &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* E. Explainable Zone Risk Inspector Modal (Prompt 9.E) */}
      {activeZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getPriorityBadge(
                    activeZoneModal.priority
                  )}`}
                >
                  P{activeZoneModal.priority}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeZoneModal.zoneName}
                  </h3>
                  <div className="text-xs text-slate-500">{activeZoneModal.locality}, Chennai</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveZoneModal(null);
                  if (onClearSelectedZone) onClearSelectedZone();
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              {/* Score Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                    Calculated Risk Score
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {activeZoneModal.riskScore}
                    </span>
                    <span className="text-sm font-medium text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block mb-1">
                    Risk Classification
                  </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getRiskLevelBadge(
                      activeZoneModal.riskLevel
                    )}`}
                  >
                    {activeZoneModal.riskLevel} (Priority {activeZoneModal.priority})
                  </span>
                </div>
              </div>

              {/* Baseline Telemetry Grid */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                  Zone Input Parameters
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Population</span>
                    <span className="text-xs font-bold text-slate-900">
                      {activeZoneModal.population.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Water Depth</span>
                    <span className="text-xs font-bold text-blue-700">
                      {activeZoneModal.waterLevel.toFixed(1)} meters
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Rainfall</span>
                    <span className="text-xs font-bold text-slate-900">
                      {activeZoneModal.rainfall.toFixed(1)} mm
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Casualties</span>
                    <span className="text-xs font-bold text-red-600">
                      {activeZoneModal.injured} injured
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Vulnerable</span>
                    <span className="text-xs font-bold text-indigo-700">
                      {activeZoneModal.vulnerablePopulation.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase block">Road Condition</span>
                    <span className="text-xs font-bold text-slate-900">
                      {activeZoneModal.roadStatus}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Severity Tag</span>
                    <span className="text-xs font-bold text-slate-900">
                      {activeZoneModal.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Causal Explanation (Prompt: "Why this zone is high risk") */}
              <div>
                <div className="flex items-center space-x-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Why this zone is ranked {activeZoneModal.riskLevel}:
                  </h4>
                </div>

                <div className="space-y-2">
                  {activeZoneModal.riskFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start space-x-3"
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap mt-0.5 ${
                          factor.impact === 'CRITICAL'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : factor.impact === 'HIGH'
                            ? 'bg-orange-100 text-orange-800 border border-orange-300'
                            : factor.impact === 'MODERATE'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {factor.factor}: {factor.value}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {factor.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Initial Action */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide block mb-1">
                  Recommended Initial Operational Directive:
                </span>
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  {activeZoneModal.recommendedAction}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => {
                  setActiveZoneModal(null);
                  if (onClearSelectedZone) onClearSelectedZone();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
