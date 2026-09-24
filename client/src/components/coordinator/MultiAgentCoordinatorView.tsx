import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Bot,
  Sparkles,
  RefreshCw,
  Zap,
  Radio,
} from 'lucide-react';
import { coordinatorApi } from '../../services/api';
import { ICoordinatorDashboardResponse } from '../../types/coordinator';
import { WorkflowDiagram } from './WorkflowDiagram';
import { AgentCard } from './AgentCard';
import { ExplainableAiPanel } from './ExplainableAiPanel';
import { ResourceUsagePanel } from './ResourceUsagePanel';
import { MissionTimeline } from './MissionTimeline';

interface MultiAgentCoordinatorViewProps {
  onNavigateToMassAlerts?: () => void;
  onNavigateToPopulation?: () => void;
  onNavigateToClimate?: () => void;
}

export const MultiAgentCoordinatorView: React.FC<MultiAgentCoordinatorViewProps> = ({
  onNavigateToMassAlerts,
  onNavigateToPopulation,
  onNavigateToClimate,
}) => {
  const [data, setData] = useState<ICoordinatorDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEscalating, setIsEscalating] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await coordinatorApi.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load coordinator dashboard:', err);
      showToast('Error connecting to AI Orchestrator service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleEscalation = async (scenario: string, label: string) => {
    try {
      setIsEscalating(true);
      const res = await coordinatorApi.triggerEscalation(scenario);
      setData(res);
      showToast(`AI Orchestrator escalated scenario: ${label}`);
    } catch (err: any) {
      console.error('Failed to escalate scenario:', err);
      showToast('Escalation failed');
    } finally {
      setIsEscalating(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-white rounded-2xl border border-slate-200 p-8">
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
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Central Brain Status & Mission Metrics */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800/80 relative overflow-hidden">
        {/* Ambient neon backdrop */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Engine Identity */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30">
                <BrainCircuit className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Multi-Agent Disaster Response Coordinator
                  </h1>
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    Central Brain
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-normal">
                  Autonomous Multi-Modal Ingestion · Real-time Risk Priority · Zero-Intervention Agent Dispatch
                </p>
              </div>
            </div>

            {/* Micro Badge Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                AI Decision Engine: {data.engine_status}
              </span>
              <span className="text-slate-500">•</span>
              <button
                onClick={onNavigateToClimate}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="View Climate Telemetry in Module 5"
              >
                Active Zone: <strong className="text-white underline decoration-slate-600 underline-offset-2">{data.situation.location_name}</strong>
              </button>
              <span className="text-slate-500">•</span>
              <button
                onClick={onNavigateToPopulation}
                className="text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title="View Population Detection in Module 3"
              >
                Simulated Population: <strong className="text-cyan-400 underline decoration-cyan-700 underline-offset-2">{data.situation.active_sim_count.toLocaleString()} SIMs</strong>
              </button>
            </div>
          </div>

          {/* Right: Mission Progress & Priority Gauge */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Score Box */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 min-w-[150px]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                AI Priority Score
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-rose-400 font-mono tracking-tight">
                  {data.priority.score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-1.5 inline-block uppercase tracking-wider ${
                  data.priority.level === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {data.priority.level} PRIORITY
              </span>
            </div>

            {/* Overall Mission Progress */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 min-w-[170px]">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">
                <span>Mission Progress</span>
                <span className="text-indigo-400 font-bold">{data.overall_progress_percent}%</span>
              </div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                {data.active_agents_count}/{data.total_agents_count}{' '}
                <span className="text-xs font-sans text-slate-400 font-normal">Agents Deployed</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${data.overall_progress_percent}%` }}
                />
              </div>
            </div>

            {/* Refresh / Re-evaluate */}
            <button
              onClick={loadDashboard}
              disabled={isLoading}
              title="Re-run Multi-Modal AI Evaluation"
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Situation Escalation Control Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">Dynamic Scenario Simulation & Autonomous Reassignment:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleEscalation('DAM_RELEASE_SURGE', 'Reservoir Surge +12k Cusecs')}
              disabled={isEscalating}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold transition-all hover:scale-105 text-xs flex items-center gap-1.5"
            >
              <span>🌊 Surge: Dam Discharge</span>
            </button>

            <button
              onClick={() => handleEscalation('CYCLONIC_LANDFALL', 'Cyclone Landfall +92 km/h')}
              disabled={isEscalating}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-semibold transition-all hover:scale-105 text-xs flex items-center gap-1.5"
            >
              <span>🌀 Surge: Gale Winds</span>
            </button>

            <button
              onClick={() => handleEscalation('RECESSION', 'Floodwaters Receding')}
              disabled={isEscalating}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold transition-all hover:scale-105 text-xs flex items-center gap-1.5"
            >
              <span>📉 Basin Recession</span>
            </button>

            {onNavigateToMassAlerts && (
              <button
                onClick={onNavigateToMassAlerts}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-sm flex items-center gap-1.5 text-xs ml-1"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Broadcast via Alert Center</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: ANIMATED WORKFLOW PIPELINE DIAGRAM */}
      <WorkflowDiagram stages={data.workflow_stages} />

      {/* SECTION 2: 7 SPECIALIZED AI AGENTS GRID */}
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

      {/* SECTION 3: EXPLAINABLE AI REASONING & TELEMETRY PANELS */}
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
    </div>
  );
};
