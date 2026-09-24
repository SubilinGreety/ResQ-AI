import React, { useState } from 'react';
import {
  IScenarioFormData,
  IZone,
  DisasterType,
  SeverityLevel,
} from '../../types/scenario';
import { ZoneModal } from './ZoneModal';
import { ScenarioSummaryReview } from './ScenarioSummaryReview';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Shield,
} from 'lucide-react';

interface ScenarioBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveScenario: (data: IScenarioFormData) => Promise<void>;
}

const DEMO_CHENNAI_ZONES: IZone[] = [
  {
    name: 'Velachery Lake Catchment',
    locality: 'Velachery',
    population: 4200,
    severity: 'Critical',
    latitude: 12.9815,
    longitude: 80.218,
    rainfall: 245.5,
    waterLevel: 1.8,
    roadStatus: 'Inundated',
    injured: 84,
    vulnerablePopulation: 620,
    status: 'Critical',
  },
  {
    name: 'Saidapet Adyar Basin Sector',
    locality: 'Saidapet',
    population: 5100,
    severity: 'Critical',
    latitude: 13.0213,
    longitude: 80.2231,
    rainfall: 260.0,
    waterLevel: 2.3,
    roadStatus: 'Impassable',
    injured: 110,
    vulnerablePopulation: 850,
    status: 'Evacuation Required',
  },
  {
    name: 'T. Nagar Commercial & Residential Hub',
    locality: 'T. Nagar',
    population: 3600,
    severity: 'High',
    latitude: 13.0418,
    longitude: 80.2341,
    rainfall: 180.0,
    waterLevel: 0.9,
    roadStatus: 'Waterlogged',
    injured: 42,
    vulnerablePopulation: 310,
    status: 'Warning',
  },
  {
    name: 'Adyar Estuary & Coastal Belt',
    locality: 'Adyar',
    population: 2800,
    severity: 'Moderate',
    latitude: 13.0012,
    longitude: 80.2565,
    rainfall: 140.0,
    waterLevel: 0.4,
    roadStatus: 'Partially Blocked',
    injured: 18,
    vulnerablePopulation: 190,
    status: 'Monitoring',
  },
  {
    name: 'Tambaram Southern Gateway Sector',
    locality: 'Tambaram',
    population: 2800,
    severity: 'High',
    latitude: 12.9249,
    longitude: 80.1,
    rainfall: 210.5,
    waterLevel: 1.2,
    roadStatus: 'Waterlogged',
    injured: 66,
    vulnerablePopulation: 430,
    status: 'Warning',
  },
];

export const ScenarioBuilderModal: React.FC<ScenarioBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveScenario,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<IScenarioFormData>({
    name: 'Chennai Monsoon Flood Simulation',
    disasterType: 'Flood',
    city: 'Chennai',
    description:
      'Heavy Northeast monsoon precipitation causing Adyar river overflow and waterlogging in low-lying southern and central Chennai areas.',
    severity: 'Critical',
    dateTime: new Date().toISOString().slice(0, 16),
    zones: DEMO_CHENNAI_ZONES,
    resources: {
      rescueVehicles: 10,
      ambulances: 5,
      doctors: 8,
      medicalTeams: 4,
      shelters: 3,
      foodKits: 3000,
      waterSupplies: 5000,
      rescuePersonnel: 50,
    },
  });

  const [isZoneModalOpen, setIsZoneModalOpen] = useState<boolean>(false);
  const [editingZoneIndex, setEditingZoneIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        alert('Please enter a scenario name');
        return;
      }
    }
    if (currentStep === 2) {
      if (formData.zones.length === 0) {
        alert('At least one affected zone is required before proceeding.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleZoneSave = (zone: IZone) => {
    if (editingZoneIndex !== null) {
      const updated = [...formData.zones];
      updated[editingZoneIndex] = zone;
      setFormData({ ...formData, zones: updated });
    } else {
      setFormData({ ...formData, zones: [...formData.zones, zone] });
    }
    setEditingZoneIndex(null);
  };

  const handleZoneDelete = (index: number) => {
    const updated = formData.zones.filter((_, i) => i !== index);
    setFormData({ ...formData, zones: updated });
  };

  const handleLoadDemoZones = () => {
    setFormData({ ...formData, zones: DEMO_CHENNAI_ZONES });
  };

  const handleFinalSubmit = async () => {
    if (formData.zones.length === 0) {
      alert('At least one affected zone is required.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSaveScenario(formData);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save scenario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Disaster Scenario Setup
              </h2>
              <p className="text-xs text-slate-500">
                Configure disaster parameters, affected areas, and available response resources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="bg-slate-50/70 px-6 py-3 border-b border-slate-200 text-xs flex items-center justify-between overflow-x-auto">
          <div className="flex items-center space-x-3 sm:space-x-6 min-w-max">
            <div
              className={`flex items-center space-x-2 ${
                currentStep === 1
                  ? 'text-blue-700 font-bold'
                  : currentStep > 1
                  ? 'text-emerald-700 font-medium'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  currentStep === 1
                    ? 'bg-blue-600 text-white'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                1
              </span>
              <span>1. Scenario Details</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300" />

            <div
              className={`flex items-center space-x-2 ${
                currentStep === 2
                  ? 'text-blue-700 font-bold'
                  : currentStep > 2
                  ? 'text-emerald-700 font-medium'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  currentStep === 2
                    ? 'bg-blue-600 text-white'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </span>
              <span>2. Affected Zones ({formData.zones.length})</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300" />

            <div
              className={`flex items-center space-x-2 ${
                currentStep === 3
                  ? 'text-blue-700 font-bold'
                  : currentStep > 3
                  ? 'text-emerald-700 font-medium'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  currentStep === 3
                    ? 'bg-blue-600 text-white'
                    : currentStep > 3
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </span>
              <span>3. Resources</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300" />

            <div
              className={`flex items-center space-x-2 ${
                currentStep === 4 ? 'text-blue-700 font-bold' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                4
              </span>
              <span>4. Summary & Save</span>
            </div>
          </div>
        </div>

        {/* Modal Body / Active Step */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: SCENARIO DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Disaster Type */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Disaster Type *
                  </label>
                  <select
                    value={formData.disasterType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        disasterType: e.target.value as DisasterType,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Flood">🌊 Flood</option>
                    <option value="Cyclone">🌀 Cyclone</option>
                    <option value="Tsunami">🌊⚡ Tsunami</option>
                    <option value="Earthquake">🌋 Earthquake</option>
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Overall Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        severity: e.target.value as SeverityLevel,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Scenario Name */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Scenario Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cyclone Michaung Flood Inundation"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* City and Date Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Chennai"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Default: Chennai</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Description / Situation Overview
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the simulated conditions, weather advisories, or scenario notes..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: AFFECTED ZONES */}
          {currentStep === 2 && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Affected Zones ({formData.zones.length} Configured)
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    At least one zone is required. You can load standard Chennai demo zones or add custom areas.
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleLoadDemoZones}
                    title="Load standard Chennai zones: Velachery, Saidapet, T. Nagar, Adyar, Tambaram"
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm font-medium transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Load Chennai Demo Zones</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingZoneIndex(null);
                      setIsZoneModalOpen(true);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Zone</span>
                  </button>
                </div>
              </div>

              {/* Zones Table List */}
              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Zone & Locality</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3 text-right">Population</th>
                      <th className="p-3 text-right">Injured</th>
                      <th className="p-3 text-right">Water Level</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.zones.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          No zones added. Click "Load Chennai Demo Zones" or "Add Zone".
                        </td>
                      </tr>
                    ) : (
                      formData.zones.map((zone, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3">
                            <span className="font-semibold text-slate-900">{zone.name}</span>
                            <div className="text-[11px] text-slate-500">{zone.locality}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 border border-slate-300">
                              {zone.status}
                            </span>
                          </td>
                          <td className="p-3 font-medium">{zone.severity}</td>
                          <td className="p-3 text-right">{zone.population.toLocaleString()}</td>
                          <td className="p-3 text-right text-red-600 font-semibold">{zone.injured}</td>
                          <td className="p-3 text-right text-blue-700 font-medium">{zone.waterLevel}m</td>
                          <td className="p-3 text-center">
                            <div className="inline-flex space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingZoneIndex(idx);
                                  setIsZoneModalOpen(true);
                                }}
                                className="p-1 text-slate-500 hover:text-slate-800"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleZoneDelete(idx)}
                                className="p-1 text-slate-500 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: RESOURCES CONFIGURATION */}
          {currentStep === 3 && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Available Emergency Resources
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Enter the total available response personnel and relief items.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      resources: {
                        rescueVehicles: 15,
                        ambulances: 8,
                        doctors: 12,
                        medicalTeams: 6,
                        shelters: 5,
                        foodKits: 5000,
                        waterSupplies: 8000,
                        rescuePersonnel: 80,
                      },
                    })
                  }
                  className="px-3 py-1.5 text-xs text-blue-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm font-medium"
                >
                  Apply High-Mobilization Preset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rescue Vehicles
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.resources.rescueVehicles}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resources: {
                          ...formData.resources,
                          rescueVehicles: Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ambulances</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.resources.ambulances}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resources: {
                          ...formData.resources,
                          ambulances: Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Doctors</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.resources.doctors}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resources: {
                          ...formData.resources,
                          doctors: Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Medical Teams
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.resources.medicalTeams}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resources: {
                          ...formData.resources,
                          medicalTeams: Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Relief Shelters
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.resources.shelters}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resources: {
                          ...formData.resources,
                          shelters: Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Food Kits</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.resources.foodKits}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resources: {
                          ...formData.resources,
                          foodKits: Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Water Supplies
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.resources.waterSupplies}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resources: {
                          ...formData.resources,
                          waterSupplies: Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rescue Personnel
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.resources.rescuePersonnel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resources: {
                          ...formData.resources,
                          rescuePersonnel: Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUMMARY & REVIEW */}
          {currentStep === 4 && <ScenarioSummaryReview formData={formData} />}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs font-medium">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center space-x-1 px-4 py-2 text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1 px-5 py-2 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2.5 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving to Database...' : 'Save Disaster Scenario'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => {
          setIsZoneModalOpen(false);
          setEditingZoneIndex(null);
        }}
        onSave={handleZoneSave}
        initialZone={editingZoneIndex !== null ? formData.zones[editingZoneIndex] : null}
      />
    </div>
  );
};
