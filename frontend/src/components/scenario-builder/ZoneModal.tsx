import React, { useState, useEffect } from 'react';
import { IZone, ZoneStatus, SeverityLevel } from '../../types/scenario';
import { X, Layers, Save } from 'lucide-react';

interface ZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (zone: IZone) => void;
  initialZone?: IZone | null;
}

export const ZoneModal: React.FC<ZoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialZone,
}) => {
  const [formData, setFormData] = useState<IZone>({
    name: '',
    locality: '',
    population: 5000,
    severity: 'High',
    latitude: 13.0827,
    longitude: 80.2707,
    rainfall: 120,
    waterLevel: 1.0,
    roadStatus: 'Waterlogged',
    injured: 25,
    vulnerablePopulation: 400,
    status: 'Warning',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialZone) {
      setFormData(initialZone);
    } else {
      setFormData({
        name: '',
        locality: '',
        population: 4000,
        severity: 'High',
        latitude: 13.0,
        longitude: 80.22,
        rainfall: 150,
        waterLevel: 1.2,
        roadStatus: 'Waterlogged',
        injured: 10,
        vulnerablePopulation: 350,
        status: 'Warning',
      });
    }
    setErrors({});
  }, [initialZone, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Zone name is required';
    if (!formData.locality.trim()) newErrors.locality = 'Area / locality is required';
    if (formData.population < 0) newErrors.population = 'Population cannot be negative';
    if (formData.injured < 0) newErrors.injured = 'Injured count cannot be negative';
    if (formData.vulnerablePopulation < 0)
      newErrors.vulnerablePopulation = 'Vulnerable population cannot be negative';
    if (formData.rainfall < 0) newErrors.rainfall = 'Rainfall cannot be negative';
    if (formData.waterLevel < 0) newErrors.waterLevel = 'Water level cannot be negative';
    if (formData.latitude < -90 || formData.latitude > 90)
      newErrors.latitude = 'Latitude must be between -90 and 90';
    if (formData.longitude < -180 || formData.longitude > 180)
      newErrors.longitude = 'Longitude must be between -180 and 180';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              {initialZone ? 'Edit Affected Zone' : 'Add New Affected Zone'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Row 1: Name and Locality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Zone / Area Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Velachery Lake Catchment"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Locality / Suburb *
              </label>
              <input
                type="text"
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                placeholder="e.g. Velachery, Saidapet"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.locality && (
                <p className="text-red-600 text-xs mt-1">{errors.locality}</p>
              )}
            </div>
          </div>

          {/* Row 2: Status and Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Current Zone Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ZoneStatus })
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Safe">Safe</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
                <option value="Evacuation Required">Evacuation Required</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Severity Level *
              </label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value as SeverityLevel })
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Row 3: Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Latitude (Chennai: ~12.9 to 13.2) *
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.latitude && (
                <p className="text-red-600 text-xs mt-1">{errors.latitude}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Longitude (Chennai: ~80.1 to 80.3) *
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.longitude && (
                <p className="text-red-600 text-xs mt-1">{errors.longitude}</p>
              )}
            </div>
          </div>

          {/* Row 4: Population & Vulnerabilities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Population *</label>
              <input
                type="number"
                min="0"
                value={formData.population}
                onChange={(e) =>
                  setFormData({ ...formData, population: parseInt(e.target.value) || 0 })
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.population && (
                <p className="text-red-600 text-xs mt-1">{errors.population}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Injured Persons</label>
              <input
                type="number"
                min="0"
                value={formData.injured}
                onChange={(e) =>
                  setFormData({ ...formData, injured: parseInt(e.target.value) || 0 })
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.injured && (
                <p className="text-red-600 text-xs mt-1">{errors.injured}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Vulnerable Persons
              </label>
              <input
                type="number"
                min="0"
                value={formData.vulnerablePopulation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vulnerablePopulation: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.vulnerablePopulation && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.vulnerablePopulation}
                </p>
              )}
            </div>
          </div>

          {/* Row 5: Weather & Hazard Readings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Rainfall (mm)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.rainfall}
                onChange={(e) =>
                  setFormData({ ...formData, rainfall: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Water Level (meters)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.waterLevel}
                onChange={(e) =>
                  setFormData({ ...formData, waterLevel: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Road Condition</label>
              <select
                value={formData.roadStatus}
                onChange={(e) => setFormData({ ...formData, roadStatus: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Clear">Clear</option>
                <option value="Partially Blocked">Partially Blocked</option>
                <option value="Waterlogged">Waterlogged</option>
                <option value="Inundated">Inundated</option>
                <option value="Impassable">Impassable</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{initialZone ? 'Save Changes' : 'Add Zone'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
