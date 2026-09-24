import React, { useState, useEffect } from 'react';
import { IScenario } from '../../types/scenario';
import {
  Shield,
  Plus,
  RotateCcw,
  Clock,
  CheckCircle2,
  Activity,
  BarChart3,
  Map,
  Bell,
} from 'lucide-react';

interface EocHeaderProps {
  scenarios: IScenario[];
  activeScenario: IScenario | null;
  onSelectScenario: (scenario: IScenario) => void;
  onOpenCreateModal: () => void;
  onResetDemo: () => void;
  activeTab: 'overview' | 'risk' | 'alerts';
  onTabChange: (tab: 'overview' | 'risk' | 'alerts') => void;
  onRunRiskAnalysis: () => void;
  isAnalyzingRisk: boolean;
  isLoading: boolean;
  alertsCount?: number;
  criticalAlertsCount?: number;
}

export const EocHeader: React.FC<EocHeaderProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario,
  onOpenCreateModal,
  onResetDemo,
  activeTab,
  onTabChange,
  onRunRiskAnalysis,
  isAnalyzingRisk,
  isLoading,
  alertsCount = 0,
  criticalAlertsCount = 0,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand & Actions */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Official Portal Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">
                  ResQ AI
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Chennai Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Disaster Intelligence & Scenario Risk Analysis
              </p>
            </div>
          </div>

          {/* Center: Live Time */}
          <div className="hidden md:flex items-center space-x-4 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{timeStr}</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Online (MySQL)</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2.5">
            {/* Scenario Dropdown */}
            <div className="relative">
              <select
                aria-label="Select Scenario"
                value={activeScenario?.id || ''}
                onChange={(e) => {
                  const target = scenarios.find((s) => s.id === e.target.value);
                  if (target) onSelectScenario(target);
                }}
                disabled={isLoading || scenarios.length === 0}
                className="bg-white text-slate-700 text-xs font-medium rounded-lg pl-3 pr-8 py-2 border border-slate-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm max-w-[190px] truncate"
              >
                {scenarios.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name} ({sc.disasterType})
                  </option>
                ))}
              </select>
            </div>

            {/* Run Risk Analysis Button */}
            <button
              onClick={onRunRiskAnalysis}
              disabled={isAnalyzingRisk || !activeScenario}
              title="Execute explainable risk scoring engine"
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
            >
              <Activity className={`w-3.5 h-3.5 ${isAnalyzingRisk ? 'animate-spin' : ''}`} />
              <span>{isAnalyzingRisk ? 'Analyzing...' : 'Run Risk Analysis'}</span>
            </button>

            {/* Reload Demo */}
            <button
              onClick={onResetDemo}
              disabled={isLoading}
              title="Reset sample Chennai flood scenario"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Reset</span>
            </button>

            {/* Create Scenario */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Scenario</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-8 border-t border-slate-100 text-xs font-medium -mb-px">
          <button
            onClick={() => onTabChange('overview')}
            className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Overview & Tactical Map</span>
          </button>

          <button
            onClick={() => onTabChange('risk')}
            className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'risk'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Risk Prediction & Analysis (Module 2)</span>
          </button>

          <button
            onClick={() => onTabChange('alerts')}
            className={`py-2.5 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'alerts'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Early Warning & Alerts (Module 3)</span>
            {alertsCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  criticalAlertsCount > 0
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                {alertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
