import React from 'react';
import { IScenario } from '../../types/scenario';
import { Database, Info } from 'lucide-react';

interface StatusBarProps {
  activeScenario: IScenario | null;
}

export const StatusBar: React.FC<StatusBarProps> = () => {
  return (
    <footer className="bg-white border-t border-slate-200 px-4 py-3 text-xs text-slate-500 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            <strong>Simulated Data Notice:</strong> All zones, precipitation, and resource figures are for disaster simulation and planning exercises. Not connected to live NDRF/TNDMA feeds.
          </span>
        </div>

        <div className="flex items-center space-x-4 text-slate-400">
          <span className="flex items-center text-slate-600">
            <Database className="w-3.5 h-3.5 mr-1 text-slate-400" />
            MySQL 8.0 Connected
          </span>
          <span>•</span>
          <span className="text-slate-600">Module 1: Scenario Setup</span>
        </div>
      </div>
    </footer>
  );
};
