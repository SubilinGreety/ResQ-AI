import React from 'react';
import { IScenario, SeverityLevel } from '../../types/scenario';
import {
  MapPin,
  Users,
  HeartPulse,
  Layers,
  Edit2,
  Trash2,
  FileDown,
  AlertTriangle,
} from 'lucide-react';

interface CurrentScenarioCardProps {
  scenario: IScenario | null;
  onEdit: () => void;
  onDelete: () => void;
}

export const CurrentScenarioCard: React.FC<CurrentScenarioCardProps> = ({
  scenario,
  onEdit,
  onDelete,
}) => {
  if (!scenario) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 shadow-sm">
        <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="font-semibold text-sm text-slate-700">No Disaster Scenario Selected</p>
        <p className="text-xs text-slate-500 mt-1">
          Create or select a scenario to view status and zone details.
        </p>
      </div>
    );
  }

  const getDisasterIcon = (type: string) => {
    switch (type) {
      case 'Flood':
        return '🌊';
      case 'Cyclone':
        return '🌀';
      case 'Tsunami':
        return '🌊⚡';
      case 'Earthquake':
        return '🌋';
      default:
        return '⚠️';
    }
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-600',
          label: 'CRITICAL',
        };
      case 'High':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-600',
          label: 'HIGH',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-600',
          label: 'MODERATE',
        };
      case 'Low':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-600',
          label: 'LOW',
        };
    }
  };

  const badge = getSeverityBadge(scenario.severity);
  const totalPopulation =
    scenario.summary?.totalPopulation ??
    scenario.zones.reduce((sum, z) => sum + z.population, 0);
  const totalInjured =
    scenario.summary?.totalInjured ??
    scenario.zones.reduce((sum, z) => sum + z.injured, 0);
  const zoneCount = scenario.summary?.zoneCount ?? scenario.zones.length;

  const exportScenarioJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scenario, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `scenario_${scenario.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      {/* Top Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          CURRENT DISASTER SCENARIO
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={exportScenarioJson}
            title="Download JSON summary"
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            title="Edit scenario details"
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            title="Delete scenario"
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Disaster Headline */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl" role="img" aria-label={scenario.disasterType}>
              {getDisasterIcon(scenario.disasterType)}
            </span>
            <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
              {scenario.disasterType}
            </h1>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-700">{scenario.city || 'Chennai'}</span>
            <span>•</span>
            <span className="truncate max-w-[220px]" title={scenario.name}>
              {scenario.name}
            </span>
          </div>
        </div>

        {/* Severity Badge */}
        <div className="text-right">
          <span className="text-[11px] text-slate-500 font-medium block mb-1">
            Severity:
          </span>
          <div
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
            <span>{badge.label}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {scenario.description && (
        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 mb-4 leading-relaxed border border-slate-100">
          {scenario.description}
        </p>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs mb-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Affected Zones</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{zoneCount}</div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Population</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {totalPopulation.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs mb-1">
            <HeartPulse className="w-3.5 h-3.5 text-red-600" />
            <span>Injured</span>
          </div>
          <div className="text-xl font-bold text-red-600">
            {totalInjured.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Status:</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            SCENARIO CREATED
          </span>
        </div>
        <span className="text-slate-400 text-[11px]">
          Updated: {new Date(scenario.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
