import React, { useState } from 'react';
import {
  HeartPulse,
  LifeBuoy,
  Radio,
  Truck,
  Home,
  Navigation,
  Wrench,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { IAIAgentState, AgentType } from '../../types/coordinator';

interface AgentCardProps {
  agent: IAIAgentState;
  onInspect?: (agent: IAIAgentState) => void;
}

const AGENT_CONFIG: Record<
  AgentType,
  {
    icon: React.ReactNode;
    color: string;
    border: string;
    accentBg: string;
    tag: string;
  }
> = {
  MEDICAL: {
    icon: <HeartPulse className="w-5 h-5 text-rose-500" />,
    color: 'text-rose-500',
    border: 'border-rose-200 dark:border-rose-900/50',
    accentBg: 'bg-rose-50 dark:bg-rose-950/30',
    tag: 'Triage & Hospitals',
  },
  RESCUE: {
    icon: <LifeBuoy className="w-5 h-5 text-amber-500" />,
    color: 'text-amber-500',
    border: 'border-amber-200 dark:border-amber-900/50',
    accentBg: 'bg-amber-50 dark:bg-amber-950/30',
    tag: 'Extraction & Boats',
  },
  COMMUNICATION: {
    icon: <Radio className="w-5 h-5 text-blue-500" />,
    color: 'text-blue-500',
    border: 'border-blue-200 dark:border-blue-900/50',
    accentBg: 'bg-blue-50 dark:bg-blue-950/30',
    tag: 'Mass SMS & Authorities',
  },
  LOGISTICS: {
    icon: <Truck className="w-5 h-5 text-emerald-500" />,
    color: 'text-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-900/50',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    tag: 'Rations & Water Supply',
  },
  SHELTER: {
    icon: <Home className="w-5 h-5 text-indigo-500" />,
    color: 'text-indigo-500',
    border: 'border-indigo-200 dark:border-indigo-900/50',
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    tag: 'Capacity & Diversion',
  },
  TRAFFIC: {
    icon: <Navigation className="w-5 h-5 text-purple-500" />,
    color: 'text-purple-500',
    border: 'border-purple-200 dark:border-purple-900/50',
    accentBg: 'bg-purple-50 dark:bg-purple-950/30',
    tag: 'Flooded Roads & Green Corridors',
  },
  RESOURCE: {
    icon: <Wrench className="w-5 h-5 text-cyan-500" />,
    color: 'text-cyan-500',
    border: 'border-cyan-200 dark:border-cyan-900/50',
    accentBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    tag: 'Equipment & Heavy Pumps',
  },
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cfg = AGENT_CONFIG[agent.type] || AGENT_CONFIG.MEDICAL;

  const completedCount = agent.assigned_tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalTasks = agent.assigned_tasks.length;
  const avgProgress = totalTasks > 0
    ? Math.round(agent.assigned_tasks.reduce((acc, t) => acc + t.progress_percent, 0) / totalTasks)
    : 0;

  return (
    <div
      className={`bg-white rounded-2xl border ${cfg.border} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between`}
    >
      {/* Top Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${cfg.accentBg} border ${cfg.border}`}>
              {cfg.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">{agent.name}</h4>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {cfg.tag}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {agent.id}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                agent.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {agent.status}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Conf: <strong className="text-slate-700">{Math.round(agent.confidence * 100)}%</strong>
            </span>
          </div>
        </div>

        {/* Explainable AI Reason Banner */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 relative">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider mb-0.5 text-indigo-600">
                AI Autonomous Decision Reasoning
              </span>
              <p className="italic text-slate-700 leading-relaxed font-sans">
                "{agent.activation_reason}"
              </p>
            </div>
          </div>
        </div>

        {/* High-level Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium">
              Tasks: <strong className="text-slate-900">{completedCount}/{totalTasks} Completed</strong>
            </span>
            <span className="font-mono font-bold text-slate-800">{avgProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 to-indigo-600`}
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Body: Key Metrics Snippets */}
      <div className="p-4 bg-slate-50/50 flex-1">
        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          Live Agent Telemetry & Targets
        </h5>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(agent.key_metrics)
            .filter(([k]) => typeof agent.key_metrics[k] === 'string' || typeof agent.key_metrics[k] === 'number')
            .slice(0, 4)
            .map(([k, val]) => (
              <div key={k} className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 uppercase font-mono block truncate">
                  {k.replace(/_/g, ' ')}
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block truncate">
                  {String(val)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Collapsible: Full Assigned Tasks & Activity Logs */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-200 bg-white space-y-4">
          {/* Tasks List */}
          <div>
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Assigned Mission Tasks ({totalTasks})</span>
              <span className="text-[10px] font-normal text-slate-500">Autonomous Queue</span>
            </h5>
            <div className="space-y-2">
              {agent.assigned_tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white text-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-slate-900 leading-tight">
                      {task.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed mb-2">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
                    <span>Target: <strong className="text-slate-700">{task.target_entity}</strong></span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        ETA: {task.estimated_completion_min}m
                      </span>
                      <span className="font-bold text-indigo-600">{task.progress_percent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Agent Activity Stream</span>
              <span className="text-[10px] text-slate-400">Live Telemetry</span>
            </h5>
            <div className="space-y-1.5 font-mono text-[11px]">
              {agent.activity_log.map((log, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-slate-50 border border-slate-100 flex items-start gap-2 text-slate-700"
                >
                  <span className="text-slate-400 shrink-0 text-[10px]">{log.timestamp}</span>
                  <div>
                    <span className="font-bold text-slate-900 mr-1.5">[{log.action}]</span>
                    <span className="text-slate-600">{log.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Toggle Button */}
      <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center space-x-1 py-1 text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          <span>{isExpanded ? 'Collapse Details' : 'View Full Mission Tasks & Logs'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
