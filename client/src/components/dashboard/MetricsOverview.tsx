import React from 'react';
import { IScenario } from '../../types/scenario';
import { IScenarioRiskAnalysis } from '../../types/risk';
import {
  AlertTriangle,
  Flame,
  Activity,
  Award,
  ChevronRight,
} from 'lucide-react';

interface MetricsOverviewProps {
  scenario: IScenario | null;
  riskAnalysis?: IScenarioRiskAnalysis | null;
  onNavigateToRisk?: () => void;
  onRunRiskAnalysis?: () => void;
  isAnalyzingRisk?: boolean;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  scenario,
  riskAnalysis,
  onNavigateToRisk,
}) => {
  if (!scenario) return null;

  const zones = scenario.zones || [];
  const overview = riskAnalysis?.overview;

  const criticalCount = overview ? overview.criticalZones : zones.filter((z) => z.status === 'Critical' || z.status === 'Evacuation Required').length;
  const highRiskCount = overview ? overview.highZones : zones.filter((z) => z.severity === 'High').length;
  const highestZone = overview?.highestRiskZone;
  const averageScore = overview ? overview.averageScore : null;

  return (
    <div className="space-y-3">
      {/* 4 Primary Risk Summary Cards (Prompt requirement 11) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Critical Zones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Critical Zones
            </span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {criticalCount}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Priority 1 zones
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Immediate Response</span>
            <span className="text-red-700 font-semibold">{criticalCount > 0 ? 'Action Required' : 'Nominal'}</span>
          </div>
        </div>

        {/* Card 2: High Risk Zones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              High Risk Zones
            </span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {highRiskCount}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Priority 2 zones
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Escalation Threat</span>
            <span className="text-orange-700 font-semibold">Priority 2</span>
          </div>
        </div>

        {/* Card 3: Highest Risk Zone */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Highest Risk
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 truncate" title={highestZone?.name || 'Assessing...'}>
              {highestZone ? highestZone.name : 'Click Run'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Risk Score:</span>
              <span className="font-bold text-red-600">{highestZone ? `${highestZone.score} / 100` : '--'}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sector Status</span>
            <span className="text-indigo-700 font-semibold">{highestZone?.level || 'Pending'}</span>
          </div>
        </div>

        {/* Card 4: Average Risk Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Risk Score
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {averageScore !== null ? `${averageScore}` : '--'} <span className="text-sm font-medium text-slate-400">/ 100</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Average across {zones.length} sectors
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Model Engine</span>
            <span className="text-blue-700 font-semibold">Weighted MVP</span>
          </div>
        </div>
      </div>

      {/* Quick Action / View Details link */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs text-indigo-900">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Module 2 Active:</span>
          <span className="text-indigo-700">
            {riskAnalysis
              ? `Evaluated ${riskAnalysis.zones.length} zones. Sorted by Priority (P1 to P4).`
              : 'Risk prediction ready. Run analysis to rank zones by response priority.'}
          </span>
        </div>
        {onNavigateToRisk && (
          <button
            onClick={onNavigateToRisk}
            className="flex items-center space-x-1 font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
          >
            <span>View Full Analysis</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
