import React from 'react';
import { IScenarioFormData, SeverityLevel } from '../../types/scenario';
import {
  FileText,
  MapPin,
} from 'lucide-react';

interface ScenarioSummaryReviewProps {
  formData: IScenarioFormData;
}

export const ScenarioSummaryReview: React.FC<ScenarioSummaryReviewProps> = ({ formData }) => {
  const totalPopulation = formData.zones.reduce((sum, z) => sum + z.population, 0);
  const totalInjured = formData.zones.reduce((sum, z) => sum + z.injured, 0);
  const totalVulnerable = formData.zones.reduce((sum, z) => sum + z.vulnerablePopulation, 0);

  const getSeverityStyle = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'High':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Moderate':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Official Summary Card matching prompt format */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="border-b border-slate-200 pb-3 mb-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Scenario Summary & Verification
            </h4>
          </div>
          <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-medium border border-blue-200">
            Ready to Save
          </span>
        </div>

        {/* 6 Key Parameter Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Disaster */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <span className="text-slate-500 font-semibold text-xs uppercase block mb-1">
              DISASTER:
            </span>
            <div className="text-xl font-bold text-slate-900 uppercase">
              {formData.disasterType}
            </div>
            <span className="text-xs text-slate-500 truncate block mt-0.5">
              {formData.name}
            </span>
          </div>

          {/* Location */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <span className="text-slate-500 font-semibold text-xs uppercase block mb-1">
              LOCATION:
            </span>
            <div className="text-xl font-bold text-blue-700 uppercase flex items-center gap-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{formData.city || 'Chennai'}</span>
            </div>
            <span className="text-xs text-slate-500 block mt-0.5">Tamil Nadu, India</span>
          </div>

          {/* Severity */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <span className="text-slate-500 font-semibold text-xs uppercase block mb-1">
              SEVERITY:
            </span>
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${getSeverityStyle(
                formData.severity
              )}`}
            >
              {formData.severity === 'Critical' ? '🔴' : formData.severity === 'High' ? '🟠' : '🟡'} {formData.severity}
            </div>
          </div>

          {/* Affected Zones */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <span className="text-slate-500 font-semibold text-xs uppercase block mb-1">
              AFFECTED ZONES:
            </span>
            <div className="text-2xl font-bold text-slate-900">{formData.zones.length}</div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">
              {formData.zones.map((z) => z.locality).join(', ') || 'None'}
            </div>
          </div>

          {/* Affected Population */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <span className="text-slate-500 font-semibold text-xs uppercase block mb-1">
              AFFECTED POPULATION:
            </span>
            <div className="text-2xl font-bold text-indigo-700">
              {totalPopulation.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Vulnerable: {totalVulnerable.toLocaleString()} people
            </div>
          </div>

          {/* Injured */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <span className="text-slate-500 font-semibold text-xs uppercase block mb-1">
              INJURED:
            </span>
            <div className="text-2xl font-bold text-red-600">
              {totalInjured.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Reported casualties</div>
          </div>
        </div>

        {/* Resources Rollup */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <span className="text-slate-700 font-bold text-xs uppercase block mb-3">
            Available Emergency Resources Configured:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-[11px] block">Rescue Vehicles</span>
              <span className="text-base font-bold text-emerald-700">
                {formData.resources.rescueVehicles}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-[11px] block">Ambulances</span>
              <span className="text-base font-bold text-emerald-700">
                {formData.resources.ambulances}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-[11px] block">Medical Staff</span>
              <span className="text-base font-bold text-blue-700">
                {formData.resources.doctors} doctors ({formData.resources.medicalTeams} teams)
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-[11px] block">Rescue Personnel</span>
              <span className="text-base font-bold text-emerald-700">
                {formData.resources.rescuePersonnel}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-[11px] block">Relief Shelters</span>
              <span className="text-base font-bold text-amber-700">
                {formData.resources.shelters} centers
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-[11px] block">Food Kits</span>
              <span className="text-base font-bold text-amber-700">
                {formData.resources.foodKits.toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-[11px] block">Water Supplies</span>
              <span className="text-base font-bold text-blue-700">
                {formData.resources.waterSupplies.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
