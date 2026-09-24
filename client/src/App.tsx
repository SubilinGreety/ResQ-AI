import React, { useState, useEffect } from 'react';
import { IScenario, IZone, IScenarioFormData } from './types/scenario';
import { IScenarioRiskAnalysis } from './types/risk';
import { IAlert, IAlertsData } from './types/alert';
import { scenarioApi, riskApi, alertApi } from './services/api';
import { EocHeader } from './components/layout/EocHeader';
import { StatusBar } from './components/layout/StatusBar';
import { CurrentScenarioCard } from './components/dashboard/CurrentScenarioCard';
import { MetricsOverview } from './components/dashboard/MetricsOverview';
import { ZoneTable } from './components/dashboard/ZoneTable';
import { ChennaiMap } from './components/map/ChennaiMap';
import { RiskAnalysisView } from './components/risk/RiskAnalysisView';
import { AlertsView } from './components/alerts/AlertsView';
import { ScenarioBuilderModal } from './components/scenario-builder/ScenarioBuilderModal';
import { ZoneModal } from './components/scenario-builder/ZoneModal';
import { AlertCircle, CheckCircle, Info, Activity, Bell } from 'lucide-react';

export const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<IScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<IScenario | null>(null);
  const [selectedZone, setSelectedZone] = useState<IZone | null>(null);

  // Tab State: 'overview' vs 'risk' vs 'alerts'
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'alerts'>('overview');

  // Risk Assessment State (Module 2)
  const [riskAnalysis, setRiskAnalysis] = useState<IScenarioRiskAnalysis | null>(null);
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState<boolean>(false);
  const [inspectZoneId, setInspectZoneId] = useState<string | null>(null);

  // Early Warning & Alerts State (Module 3)
  const [alertsData, setAlertsData] = useState<IAlertsData | null>(null);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState<boolean>(false);
  const [editingZone, setEditingZone] = useState<IZone | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch or evaluate risk analysis for active scenario
  const fetchRiskData = async (scenarioId: string) => {
    try {
      const data = await riskApi.getScenarioRisk(scenarioId);
      setRiskAnalysis(data);
    } catch (err: any) {
      console.warn('Risk data fetch notice:', err.message);
    }
  };

  const loadScenarios = async () => {
    try {
      setIsLoading(true);
      const data = await scenarioApi.getAll();
      setScenarios(data);
      if (data.length > 0) {
        const initial = data[0];
        setActiveScenario((prev: IScenario | null) => {
          if (!prev) return initial;
          const found = data.find((s: IScenario) => s.id === prev.id);
          return found || initial;
        });
      } else {
        const demo = await scenarioApi.seedDemo();
        setScenarios([demo]);
        setActiveScenario(demo);
      }
    } catch (err: any) {
      console.error('Failed to load scenarios:', err);
      showToast(err.message || 'Error connecting to database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  // Fetch alerts for active scenario
  const fetchAlertsData = async (scenarioId: string) => {
    try {
      setIsLoadingAlerts(true);
      const data = await alertApi.getAlerts(scenarioId);
      setAlertsData(data);
    } catch (err: any) {
      console.warn('Alerts data fetch notice:', err.message);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  // When active scenario changes, load its risk analysis and alerts
  useEffect(() => {
    if (activeScenario?.id) {
      fetchRiskData(activeScenario.id);
      fetchAlertsData(activeScenario.id);
    }
  }, [activeScenario?.id]);

  // Run or recalculate risk analysis
  const handleRunRiskAnalysis = async () => {
    if (!activeScenario) return;
    try {
      setIsAnalyzingRisk(true);
      const result = await riskApi.runRiskAnalysis(activeScenario.id);
      setRiskAnalysis(result);
      showToast(
        `Risk analysis computed for ${result.zones.length} sectors. Highest risk: ${result.overview.highestRiskZone?.name || 'N/A'}.`,
        'success'
      );
      // Auto-sync alerts data after risk calculation
      await fetchAlertsData(activeScenario.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to calculate risk analysis', 'error');
    } finally {
      setIsAnalyzingRisk(false);
    }
  };

  // Inspect specific zone from map
  const handleInspectRiskFromMap = (zoneId: string) => {
    setInspectZoneId(zoneId);
    setActiveTab('risk');
  };

  // View alerts from map
  const handleViewAlertsFromMap = (_zoneId?: string) => {
    setActiveTab('alerts');
  };

  // Generate / regenerate alerts from risk analysis
  const handleGenerateAlerts = async () => {
    if (!activeScenario) return;
    try {
      setIsLoadingAlerts(true);
      const data = await alertApi.generateAlerts(activeScenario.id);
      setAlertsData(data);
      showToast(
        `Generated ${data.alerts.length} CAP bilingual alerts synchronized with risk analysis.`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to generate alerts', 'error');
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  // Dispatch single alert
  const handleDispatchAlert = async (alertId: string, updates?: Partial<IAlert>) => {
    if (!activeScenario) return;
    try {
      const updated = await alertApi.dispatchAlert(activeScenario.id, alertId, updates);
      showToast(
        `Warning broadcasted to ${updated.targetPopulation.toLocaleString()} citizens via ${updated.channels.join(', ')}.`,
        'success'
      );
      await fetchAlertsData(activeScenario.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch alert', 'error');
    }
  };

  // Dispatch all Priority 1 critical alerts
  const handleDispatchAllP1 = async () => {
    if (!activeScenario) return;
    try {
      const data = await alertApi.dispatchAllP1(activeScenario.id);
      setAlertsData(data);
      showToast('All Priority 1 Critical Evacuation Warnings broadcasted immediately.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to broadcast Priority 1 alerts', 'error');
    }
  };

  // Update alert content/channels
  const handleUpdateAlert = async (alertId: string, data: Partial<IAlert>) => {
    if (!activeScenario) return;
    try {
      await alertApi.updateAlert(activeScenario.id, alertId, data);
      showToast('Alert instructions and channels updated successfully.', 'success');
      await fetchAlertsData(activeScenario.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to update alert', 'error');
    }
  };

  // Revoke alert
  const handleRevokeAlert = async (alertId: string) => {
    if (!activeScenario) return;
    try {
      await alertApi.revokeAlert(activeScenario.id, alertId);
      showToast('Alert broadcast revoked.', 'info');
      await fetchAlertsData(activeScenario.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke alert', 'error');
    }
  };

  const handleCreateScenario = async (formData: IScenarioFormData) => {
    try {
      const created = await scenarioApi.create(formData);
      showToast(`Scenario "${created.name}" created successfully`, 'success');
      await loadScenarios();
      setActiveScenario(created);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.response?.data?.errors?.[0]?.message || err.message;
      showToast(`Failed to create scenario: ${errorMsg}`, 'error');
      throw err;
    }
  };

  const handleDeleteScenario = async () => {
    if (!activeScenario) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete scenario "${activeScenario.name}"?`
    );
    if (!confirmDelete) return;

    try {
      await scenarioApi.delete(activeScenario.id);
      showToast('Scenario deleted successfully', 'info');
      await loadScenarios();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete scenario', 'error');
    }
  };

  const handleResetDemo = async () => {
    try {
      setIsLoading(true);
      const demo = await scenarioApi.seedDemo(true);
      showToast('Sample Chennai scenario reset successfully', 'success');
      await loadScenarios();
      setActiveScenario(demo);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset demo scenario', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveZone = async (zoneData: IZone) => {
    if (!activeScenario) return;

    try {
      if (editingZone && editingZone.id) {
        await scenarioApi.updateZone(activeScenario.id, editingZone.id, zoneData);
        showToast(`Zone "${zoneData.name}" updated`, 'success');
      } else {
        await scenarioApi.addZone(activeScenario.id, zoneData);
        showToast(`New zone "${zoneData.name}" added`, 'success');
      }

      const refreshed = await scenarioApi.getById(activeScenario.id);
      setActiveScenario(refreshed);
      setScenarios((prev: IScenario[]) => prev.map((s: IScenario) => (s.id === refreshed.id ? refreshed : s)));
      // Auto refresh risk calculation
      if (refreshed.id) {
        await handleRunRiskAnalysis();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to save zone', 'error');
    } finally {
      setEditingZone(null);
    }
  };

  const handleDeleteZone = async (zone: IZone) => {
    if (!activeScenario || !zone.id) return;
    if (activeScenario.zones.length <= 1) {
      showToast('A scenario must contain at least one affected zone.', 'error');
      return;
    }
    const confirmDelete = window.confirm(`Remove zone "${zone.name}" from scenario?`);
    if (!confirmDelete) return;

    try {
      await scenarioApi.deleteZone(activeScenario.id, zone.id);
      showToast(`Zone "${zone.name}" removed`, 'info');
      const refreshed = await scenarioApi.getById(activeScenario.id);
      setActiveScenario(refreshed);
      setScenarios((prev: IScenario[]) => prev.map((s: IScenario) => (s.id === refreshed.id ? refreshed : s)));
      if (refreshed.id) {
        await handleRunRiskAnalysis();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to delete zone', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Official Header with Tabs & Run Risk Button */}
      <EocHeader
        scenarios={scenarios}
        activeScenario={activeScenario}
        onSelectScenario={(sc) => {
          setActiveScenario(sc);
          setSelectedZone(null);
        }}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onResetDemo={handleResetDemo}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onRunRiskAnalysis={handleRunRiskAnalysis}
        isAnalyzingRisk={isAnalyzingRisk}
        isLoading={isLoading}
        alertsCount={alertsData?.overview.totalAlerts || 0}
        criticalAlertsCount={alertsData?.overview.criticalP1Count || 0}
      />

      {/* Notification Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-fadeIn">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-lg shadow-lg text-xs font-medium border ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: OVERVIEW & TACTICAL MAP */}
        {activeTab === 'overview' && (
          <>
            {/* Row 1: Current Scenario Card + Key Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <CurrentScenarioCard
                  scenario={activeScenario}
                  onEdit={() => setIsCreateModalOpen(true)}
                  onDelete={handleDeleteScenario}
                />
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between">
                <MetricsOverview
                  scenario={activeScenario}
                  riskAnalysis={riskAnalysis}
                  onNavigateToRisk={() => setActiveTab('risk')}
                  onRunRiskAnalysis={handleRunRiskAnalysis}
                  isAnalyzingRisk={isAnalyzingRisk}
                />

                {/* Module 2 Helper Banner */}
                <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">
                        Module 2: Risk Prediction & Priority Analysis Active
                      </div>
                      <div className="text-slate-500 text-xs">
                        Calculates explainable risk scores (0–100) and response priorities (Priority 1 to 4).
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('risk')}
                    className="whitespace-nowrap px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    Open Risk Analysis &rarr;
                  </button>
                </div>

                {/* Module 3 Early Warning Banner */}
                {alertsData && (
                  <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm flex items-center space-x-2">
                          <span>Module 3: Early Warning & Alerts Ready</span>
                          {alertsData.overview.criticalP1Count > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                              {alertsData.overview.criticalP1Count} P1 Critical
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {alertsData.overview.dispatchedCount} dispatched • {alertsData.overview.draftCount} drafts • {alertsData.overview.totalPopulationTargeted.toLocaleString()} citizens targeted (EN + தமிழ்).
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('alerts')}
                      className="whitespace-nowrap px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      Open Alerts Console &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Map Section with Risk & Alert Overlays */}
            <section>
              <ChennaiMap
                zones={activeScenario?.zones || []}
                selectedZone={selectedZone}
                onSelectZone={(zone) => setSelectedZone(zone)}
                riskZones={riskAnalysis?.zones}
                onInspectRisk={handleInspectRiskFromMap}
                alerts={alertsData?.alerts}
                onViewAlerts={handleViewAlertsFromMap}
              />
            </section>

            {/* Row 3: Affected Zones Datatable */}
            <section>
              <ZoneTable
                zones={activeScenario?.zones || []}
                selectedZone={selectedZone}
                onSelectZone={(zone) => setSelectedZone(zone)}
                onAddZone={() => {
                  setEditingZone(null);
                  setIsZoneModalOpen(true);
                }}
                onEditZone={(zone) => {
                  setEditingZone(zone);
                  setIsZoneModalOpen(true);
                }}
                onDeleteZone={handleDeleteZone}
              />
            </section>
          </>
        )}

        {/* TAB 2: RISK PREDICTION & ANALYSIS (MODULE 2) */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <RiskAnalysisView
              riskAnalysis={riskAnalysis}
              onRecalculate={handleRunRiskAnalysis}
              isCalculating={isAnalyzingRisk}
              selectedZoneId={inspectZoneId}
              onClearSelectedZone={() => setInspectZoneId(null)}
            />

            {/* Also embed the Leaflet map below for spatial correlation */}
            <section className="pt-2">
              <ChennaiMap
                zones={activeScenario?.zones || []}
                selectedZone={selectedZone}
                onSelectZone={(zone) => setSelectedZone(zone)}
                riskZones={riskAnalysis?.zones}
                onInspectRisk={handleInspectRiskFromMap}
                alerts={alertsData?.alerts}
                onViewAlerts={handleViewAlertsFromMap}
              />
            </section>
          </div>
        )}

        {/* TAB 3: EARLY WARNING & ALERTS (MODULE 3) */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <AlertsView
              activeScenario={activeScenario}
              alertsData={alertsData}
              isLoading={isLoadingAlerts}
              onRefreshAlerts={() => fetchAlertsData(activeScenario?.id || '')}
              onGenerateAlerts={handleGenerateAlerts}
              onDispatchAlert={handleDispatchAlert}
              onDispatchAllP1={handleDispatchAllP1}
              onUpdateAlert={handleUpdateAlert}
              onRevokeAlert={handleRevokeAlert}
            />

            {/* Embed the Leaflet map below with warning beacons */}
            <section className="pt-2">
              <ChennaiMap
                zones={activeScenario?.zones || []}
                selectedZone={selectedZone}
                onSelectZone={(zone) => setSelectedZone(zone)}
                riskZones={riskAnalysis?.zones}
                onInspectRisk={handleInspectRiskFromMap}
                alerts={alertsData?.alerts}
                onViewAlerts={handleViewAlertsFromMap}
              />
            </section>
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <StatusBar activeScenario={activeScenario} />

      {/* Scenario Builder Modal */}
      <ScenarioBuilderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveScenario={handleCreateScenario}
      />

      {/* Zone Modal */}
      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => {
          setIsZoneModalOpen(false);
          setEditingZone(null);
        }}
        onSave={handleSaveZone}
        initialZone={editingZone}
      />
    </div>
  );
};
