import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { IZone } from '../../types/scenario';
import { IZoneRiskAssessment, RiskLevel } from '../../types/risk';
import { IAlert } from '../../types/alert';
import { MapPin, Navigation, Info } from 'lucide-react';

interface ChennaiMapProps {
  zones: IZone[];
  selectedZone: IZone | null;
  onSelectZone: (zone: IZone) => void;
  riskZones?: IZoneRiskAssessment[];
  onInspectRisk?: (zoneId: string) => void;
  alerts?: IAlert[];
  onViewAlerts?: (zoneId?: string) => void;
}

const CHENNAI_CENTER: [number, number] = [13.04, 80.22];
const DEFAULT_ZOOM = 11;

export const ChennaiMap: React.FC<ChennaiMapProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  riskZones,
  onInspectRisk,
  alerts,
  onViewAlerts,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Map risk level to color
  const getRiskColor = (level?: RiskLevel): string => {
    switch (level) {
      case 'CRITICAL':
        return '#DC2626'; // Red
      case 'HIGH':
        return '#EA580C'; // Orange
      case 'MODERATE':
        return '#CA8A04'; // Yellow
      case 'LOW':
        return '#16A34A'; // Green
      default:
        return '#2563EB'; // Blue fallback
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CHENNAI_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    if (zones.length === 0) return;

    const bounds = L.latLngBounds([]);

    zones.forEach((zone) => {
      if (typeof zone.latitude !== 'number' || typeof zone.longitude !== 'number') return;

      const riskData = riskZones?.find((rz) => rz.zoneId === zone.id || rz.zoneName === zone.name);
      const zoneAlert = alerts?.find((a) => a.zoneId === zone.id || a.zoneName === zone.name);
      const isDispatched = zoneAlert?.status === 'DISPATCHED';
      const markerColor = riskData ? getRiskColor(riskData.riskLevel) : '#2563EB';
      const isSelected = selectedZone?.id === zone.id || selectedZone?.name === zone.name;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            ${
              isDispatched
                ? `<div style="
                    position: absolute;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background-color: #ef4444;
                    opacity: 0.4;
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                  "></div>`
                : ''
            }
            <div style="
              position: relative;
              width: ${isSelected ? '26px' : '22px'};
              height: ${isSelected ? '26px' : '22px'};
              border-radius: 50%;
              background-color: ${markerColor};
              border: 2px solid #ffffff;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <span style="font-size: 10px; font-weight: bold; color: white;">
                ${riskData ? `P${riskData.priority}` : ''}
              </span>
              ${
                isDispatched
                  ? `<span style="
                      position: absolute;
                      top: -6px;
                      right: -6px;
                      font-size: 10px;
                      background: #ffffff;
                      border-radius: 50%;
                      padding: 1px;
                      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                    ">🚨</span>`
                  : ''
              }
            </div>
            <div style="
              position: absolute;
              bottom: -18px;
              background: #ffffff;
              color: #1e293b;
              font-size: 11px;
              font-weight: 600;
              padding: 1px 6px;
              border-radius: 4px;
              border: 1px solid #cbd5e1;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              white-space: nowrap;
              pointer-events: none;
            ">
              ${zone.locality || zone.name}
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([zone.latitude, zone.longitude], { icon: customIcon });

      const circle = L.circle([zone.latitude, zone.longitude], {
        color: isDispatched ? '#ef4444' : markerColor,
        fillColor: markerColor,
        fillOpacity: isDispatched ? 0.2 : 0.12,
        radius: isDispatched ? 1400 : 1200,
        weight: isDispatched ? 2.5 : 1.5,
      });

      // Prompt 10 Popup specification: Zone Name, Risk Score, Risk Level, Priority, and Alert Status
      const popupHtml = `
        <div style="min-width: 220px; font-family: inherit; font-size: 12px; color: #1e293b; padding: 2px;">
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: #0f172a;">${zone.name}</strong>
            <div style="font-size: 11px; color: #64748b;">${zone.locality}</div>
          </div>

          ${
            riskData
              ? `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; background: ${markerColor}15; color: ${markerColor}; border: 1px solid ${markerColor}40; font-weight: 700; font-size: 11px;">
                ${riskData.riskLevel} (P${riskData.priority})
              </span>
              <span style="font-weight: 700; font-size: 13px; color: ${markerColor};">
                ${riskData.riskScore} / 100
              </span>
            </div>
          `
              : `
            <div style="margin-bottom: 6px;">
              <span style="font-size: 11px; color: #64748b;">Status: ${zone.status}</span>
            </div>
          `
          }

          ${
            zoneAlert
              ? `
            <div style="margin-bottom: 8px; padding: 6px; border-radius: 6px; background: ${
              isDispatched ? '#fef2f2' : '#fffbeb'
            }; border: 1px solid ${isDispatched ? '#fecaca' : '#fef08a'};">
              <div style="font-weight: 700; font-size: 10px; color: ${
                isDispatched ? '#991b1b' : '#854d0e'
              }; display: flex; align-items: center; gap: 4px;">
                <span>${isDispatched ? '🚨 BROADCAST DISPATCHED' : '⚠️ WARNING DRAFTED'}</span>
              </div>
              <div style="font-size: 11px; color: #1e293b; font-weight: 600; margin-top: 2px; line-height: 1.3;">
                ${zoneAlert.headline}
              </div>
            </div>
          `
              : ''
          }

          <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #475569; margin-bottom: 8px;">
            <tr><td style="color: #64748b; padding: 2px 0;">Population:</td><td style="text-align: right; font-weight: 500;">${zone.population.toLocaleString()}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">Water Depth:</td><td style="text-align: right; font-weight: 600; color: #2563eb;">${zone.waterLevel} m</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">Rainfall:</td><td style="text-align: right; font-weight: 500;">${zone.rainfall} mm</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">Injured:</td><td style="text-align: right; font-weight: 600; color: #dc2626;">${zone.injured}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">Roads:</td><td style="text-align: right; font-weight: 500;">${zone.roadStatus}</td></tr>
          </table>

          <div style="display: flex; gap: 6px;">
            <button 
              id="popup-inspect-btn-${zone.id}"
              style="flex: 1; padding: 6px 0; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;"
            >
              Analysis &rarr;
            </button>
            <button 
              id="popup-alert-btn-${zone.id}"
              style="flex: 1; padding: 6px 0; background: #d97706; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: center;"
            >
              Alerts &rarr;
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const inspectBtn = document.getElementById(`popup-inspect-btn-${zone.id}`);
        if (inspectBtn && onInspectRisk) {
          inspectBtn.onclick = () => {
            if (zone.id) onInspectRisk(zone.id);
          };
        }
        const alertBtn = document.getElementById(`popup-alert-btn-${zone.id}`);
        if (alertBtn && onViewAlerts) {
          alertBtn.onclick = () => {
            onViewAlerts(zone.id);
          };
        }
      });

      marker.on('click', () => {
        onSelectZone(zone);
      });

      circle.addTo(markersGroup);
      marker.addTo(markersGroup);
      bounds.extend([zone.latitude, zone.longitude]);
    });

    if (zones.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [zones, selectedZone, riskZones]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(CHENNAI_CENTER, DEFAULT_ZOOM);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px] relative">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-sm text-slate-800">
            Chennai Multi-Hazard GIS Map
          </span>
          <span className="text-xs text-slate-500">
            ({zones.length} zones • {riskZones ? 'Risk Overlay Active' : 'Baseline View'})
          </span>
        </div>

        <button
          onClick={handleRecenter}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm text-xs font-medium transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>Recenter</span>
        </button>
      </div>

      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

      {/* Risk Level Legend (Prompt 10) */}
      <div className="absolute bottom-4 left-4 bg-white/95 border border-slate-200 rounded-lg p-3 z-10 shadow-md text-xs">
        <div className="text-slate-700 font-semibold mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Risk Level Indicator</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>LOW (0–39) • P4</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-600" />
            <span>MODERATE (40–59) • P3</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            <span>HIGH (60–79) • P2</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>CRITICAL (80–100) • P1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
