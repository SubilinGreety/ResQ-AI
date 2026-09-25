import React from 'react';
import { Clock } from 'lucide-react';
import { IMissionTimelineEvent } from '../../types/coordinator';

interface MissionTimelineProps {
  timeline: IMissionTimelineEvent[];
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({ timeline }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Live Mission Execution Timeline
            </h4>
            <p className="text-xs text-slate-500">Autonomous decision & field dispatch log</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold uppercase">
          Chronological
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((evt, idx) => {
          const isLatest = idx === 0;
          return (
            <div key={evt.id} className="relative group">
              {/* Bullet node */}
              <div
                className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white transition-all ${
                  isLatest
                    ? 'bg-indigo-600 ring-4 ring-indigo-100 animate-pulse'
                    : 'bg-slate-400'
                }`}
              />

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                      {evt.timestamp}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {evt.event}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                      evt.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                  {evt.details}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                  <span>Actor: <strong className="text-slate-600">{evt.actor}</strong></span>
                  <span className="text-slate-500 font-medium">Stage: {evt.stage}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
