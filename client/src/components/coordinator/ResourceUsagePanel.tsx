import React from 'react';
import {
  Boxes,
  LifeBuoy,
  Users,
  Home,
  Droplets,
  Utensils,
  Ambulance,
} from 'lucide-react';
import { IResourceUtilization } from '../../types/coordinator';

interface ResourceUsagePanelProps {
  resources: IResourceUtilization;
}

export const ResourceUsagePanel: React.FC<ResourceUsagePanelProps> = ({ resources }) => {
  const ambulancePct = Math.round((resources.ambulances_deployed / resources.ambulances_total) * 100);
  const boatPct = Math.round((resources.rescue_boats_deployed / resources.rescue_boats_total) * 100);
  const personnelPct = Math.round((resources.rescue_personnel_active / resources.rescue_personnel_total) * 100);
  const shelterPct = Math.round((resources.shelter_beds_occupied / resources.shelter_beds_total) * 100);
  const foodPct = Math.round((resources.food_rations_distributed / resources.food_rations_total) * 100);
  const waterPct = Math.round((resources.water_liters_distributed / resources.water_liters_total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Live Field Resource Utilization
            </h4>
            <p className="text-xs text-slate-500">Autonomous supply & fleet allocation tracking</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
          Dynamic Balancing
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Ambulances */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Ambulance className="w-3.5 h-3.5 text-rose-500" />
              Ambulances
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{ambulancePct}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${ambulancePct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Deployed: <strong className="text-slate-800">{resources.ambulances_deployed}</strong></span>
            <span>Total: {resources.ambulances_total}</span>
          </div>
        </div>

        {/* Rescue Boats */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5 text-amber-500" />
              Rescue Boats
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{boatPct}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${boatPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Active: <strong className="text-slate-800">{resources.rescue_boats_deployed}</strong></span>
            <span>Total: {resources.rescue_boats_total}</span>
          </div>
        </div>

        {/* Personnel */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Rescue Personnel
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{personnelPct}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${personnelPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Active: <strong className="text-slate-800">{resources.rescue_personnel_active}</strong></span>
            <span>Total: {resources.rescue_personnel_total}</span>
          </div>
        </div>

        {/* Shelter Beds */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-blue-500" />
              Shelter Beds
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{shelterPct}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${shelterPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Occupied: <strong className="text-slate-800">{resources.shelter_beds_occupied.toLocaleString()}</strong></span>
            <span>Cap: {resources.shelter_beds_total.toLocaleString()}</span>
          </div>
        </div>

        {/* Food Rations */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-500" />
              Food Rations (MREs)
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{foodPct}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${foodPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Distributed: <strong className="text-slate-800">{resources.food_rations_distributed.toLocaleString()}</strong></span>
            <span>Total: {resources.food_rations_total.toLocaleString()}</span>
          </div>
        </div>

        {/* Potable Water */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-500" />
              Clean Water (Litres)
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{waterPct}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${waterPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Delivered: <strong className="text-slate-800">{resources.water_liters_distributed.toLocaleString()} L</strong></span>
            <span>Total: {resources.water_liters_total.toLocaleString()} L</span>
          </div>
        </div>
      </div>
    </div>
  );
};
