import React from 'react';
import {
  AlertTriangle,
  CloudSun,
  Users,
  BarChart3,
  Calculator,
  Bot,
  Flame,
  Activity,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { IWorkflowStage } from '../../types/coordinator';

interface WorkflowDiagramProps {
  stages: IWorkflowStage[];
  activeStageId?: string;
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  'wf-1': <AlertTriangle className="w-4 h-4" />,
  'wf-2': <CloudSun className="w-4 h-4" />,
  'wf-3': <Users className="w-4 h-4" />,
  'wf-4': <BarChart3 className="w-4 h-4" />,
  'wf-5': <Calculator className="w-4 h-4" />,
  'wf-6': <Bot className="w-4 h-4" />,
  'wf-7': <Flame className="w-4 h-4" />,
  'wf-8': <Activity className="w-4 h-4" />,
};

export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ stages }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background cyber glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Autonomous AI Response Workflow Pipeline
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                End-to-End Orchestration
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic 8-stage data synthesis from sensory alert to multi-agent deployment
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Active Feedback Loop
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Latency: <span className="text-white font-mono font-semibold">180ms</span></span>
        </div>
      </div>

      {/* Horizontal Workflow Stepper */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="flex items-center min-w-[980px] justify-between relative py-2">
          {/* Continuous flow connecting line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />
          <div className="absolute top-1/2 left-6 right-1/4 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-400 z-0 animate-pulse" />

          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'active';
            const icon = STAGE_ICONS[stage.id] || <Activity className="w-4 h-4" />;

            return (
              <React.Fragment key={stage.id}>
                {/* Stage Node */}
                <div className="relative z-10 flex flex-col items-center group w-28 text-center cursor-default">
                  {/* Step Icon Node */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-lg ${
                      isCompleted
                        ? 'bg-slate-900 border-emerald-500/50 text-emerald-400 shadow-emerald-500/10 group-hover:scale-105'
                        : isActive
                        ? 'bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-400 text-white shadow-indigo-500/30 scale-110 ring-4 ring-indigo-500/20 animate-pulse'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : icon}
                  </div>

                  {/* Stage Index Badge */}
                  <span className="text-[10px] font-mono text-slate-500 mt-2">
                    Step 0{idx + 1}
                  </span>

                  {/* Title */}
                  <span
                    className={`text-xs font-semibold mt-0.5 leading-snug transition-colors ${
                      isActive
                        ? 'text-indigo-300 font-bold'
                        : isCompleted
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {stage.name}
                  </span>

                  {/* Micro Status */}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full mt-1 font-mono uppercase tracking-wider ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {stage.status}
                  </span>

                  {/* Hover tooltip */}
                  <div className="absolute top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 w-44 bg-slate-950 border border-slate-700 rounded-lg p-2 text-[11px] text-slate-300 text-left shadow-2xl mt-4">
                    <p className="font-semibold text-white mb-0.5">{stage.name}</p>
                    <p className="text-slate-400 text-[10px] leading-relaxed">{stage.description}</p>
                    <p className="text-[9px] font-mono text-indigo-400 mt-1">Processed: {stage.timestamp}</p>
                  </div>
                </div>

                {/* Arrow connector */}
                {idx < stages.length - 1 && (
                  <div className="relative z-10 text-slate-600 hidden sm:block">
                    <ChevronRight className="w-4 h-4 opacity-75" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
