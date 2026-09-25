import React from 'react';
import { IZone, ZoneStatus, SeverityLevel } from '../../types/scenario';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MapPin,
} from 'lucide-react';

interface ZoneTableProps {
  zones: IZone[];
  selectedZone: IZone | null;
  onSelectZone: (zone: IZone) => void;
  onAddZone: () => void;
  onEditZone: (zone: IZone) => void;
  onDeleteZone: (zone: IZone) => void;
}

export const ZoneTable: React.FC<ZoneTableProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  onAddZone,
  onEditZone,
  onDeleteZone,
}) => {
  const getStatusBadge = (status: ZoneStatus) => {
    switch (status) {
      case 'Safe':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Monitoring':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Warning':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Evacuation Required':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
    }
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-700 font-semibold';
      case 'High':
        return 'text-orange-700 font-medium';
      case 'Moderate':
        return 'text-amber-700 font-medium';
      case 'Low':
        return 'text-emerald-700 font-medium';
    }
  };

  const getRoadBadge = (road: string) => {
    switch (road) {
      case 'Impassable':
      case 'Inundated':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'Waterlogged':
      case 'Partially Blocked':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Table Header Controls */}
      <div className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            Affected Zones & Localities ({zones.length})
          </h3>
        </div>
        <button
          onClick={onAddZone}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Zone</span>
        </button>
      </div>

      {/* Datatable */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">Zone & Locality</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4 text-right">Population</th>
              <th className="py-3 px-4 text-right">Injured</th>
              <th className="py-3 px-4 text-right">Rain (mm)</th>
              <th className="py-3 px-4 text-right">Water Level</th>
              <th className="py-3 px-4">Road Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {zones.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No affected zones configured. Click "Add New Zone" or create a scenario.
                </td>
              </tr>
            ) : (
              zones.map((zone) => {
                const isSelected = selectedZone?.id === zone.id;
                return (
                  <tr
                    key={zone.id || zone.name}
                    className={`transition-colors hover:bg-slate-50 cursor-pointer ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                    }`}
                    onClick={() => onSelectZone(zone)}
                  >
                    {/* Zone & Locality */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{zone.name}</div>
                      <div className="flex items-center text-[11px] text-slate-500 space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{zone.locality}</span>
                        <span>•</span>
                        <span>
                          {zone.latitude.toFixed(3)}, {zone.longitude.toFixed(3)}
                        </span>
                      </div>
                    </td>

                    {/* Zone Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(
                          zone.status
                        )}`}
                      >
                        {zone.status}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={getSeverityBadge(zone.severity)}>
                        {zone.severity}
                      </span>
                    </td>

                    {/* Population */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {zone.population.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Vuln: {zone.vulnerablePopulation.toLocaleString()}
                      </div>
                    </td>

                    {/* Injured */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          zone.injured > 0 ? 'text-red-600' : 'text-slate-500'
                        }`}
                      >
                        {zone.injured}
                      </span>
                    </td>

                    {/* Rainfall */}
                    <td className="py-3 px-4 text-right text-slate-800 whitespace-nowrap">
                      {zone.rainfall.toFixed(1)} mm
                    </td>

                    {/* Water Level */}
                    <td className="py-3 px-4 text-right font-medium text-blue-700 whitespace-nowrap">
                      {zone.waterLevel.toFixed(1)} m
                    </td>

                    {/* Road Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] border font-medium ${getRoadBadge(
                          zone.roadStatus
                        )}`}
                      >
                        {zone.roadStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div
                        className="inline-flex items-center space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectZone(zone)}
                          title="View on Map"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditZone(zone)}
                          title="Edit Zone"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteZone(zone)}
                          title="Delete Zone"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
