import React from 'react';
import {
  BrainCircuit,
  Scale,
} from 'lucide-react';
import { IExplainableAiDecision, IPriorityCalculation } from '../../types/coordinator';

interface ExplainableAiPanelProps {
  decisions: IExplainableAiDecision[];
  priority: IPriorityCalculation;
}

export const ExplainableAiPanel: React.FC<ExplainableAiPanelProps> = ({
  decisions,
  priority,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
              Explainable AI (XAI) Decision Rationale
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                Audited
              </span>
            </h3>
            <p className="text-xs text-indigo-200/80">
              Deterministic causal logic behind multi-agent autonomous activation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/10 text-white font-semibold">
            Priority: {priority.score} / 100
          </span>
        </div>
      </div>

      {/* Priority Weighted Breakdown Card */}
      <div className="p-4 bg-indigo-50/60 border-b border-indigo-100 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            Priority Calculation Heuristic
          </span>
          <span className="font-bold text-indigo-700">{priority.level} PRIORITY</span>
        </div>
        <p className="text-slate-700 mb-3 leading-relaxed">
          {priority.summary}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(priority.breakdown).map(([factor, pts]) => (
            <div key={factor} className="bg-white p-2 rounded-lg border border-indigo-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block truncate">{factor}</span>
              <span className="text-xs font-mono font-bold text-indigo-900 mt-0.5 block">
                +{pts} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Activation Explanations List */}
      <div className="p-4 divide-y divide-slate-100 space-y-3">
        {decisions.map((dec) => (
          <div key={dec.agent_type} className="pt-3 first:pt-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-900">
                  {dec.agent_name}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  {dec.agent_type}
                </span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                Trigger Verified
              </span>
            </div>

            {/* Core Reasoning Statement */}
            <div className="pl-4 border-l-2 border-indigo-500 py-1 my-1.5 bg-slate-50/70 rounded-r-lg">
              <p className="text-xs font-medium text-slate-800 italic">
                "{dec.reasoning}"
              </p>
            </div>

            {/* Contextual Sub-metrics */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pl-4 mt-1">
              <span>
                Trigger: <strong className="text-slate-700">{dec.primary_trigger}</strong>
              </span>
              <span>•</span>
              <span>
                Impact: <strong className="text-slate-700">{dec.impact_factor}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
