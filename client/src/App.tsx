import React, { useState, useEffect } from 'react';
import { IScenario, IZone, IScenarioFormData } from './types/scenario';
import { IScenarioRiskAnalysis } from './types/risk';
import { scenarioApi, riskApi } from './services/api';
import { EocHeader } from './components/layout/EocHeader';
import { StatusBar } from './components/layout/StatusBar';
import { CurrentScenarioCard } from './components/dashboard/CurrentScenarioCard';
import { MetricsOverview } from './components/dashboard/MetricsOverview';
import { ZoneTable } from './components/dashboard/ZoneTable';
import { ChennaiMap } from './components/map/ChennaiMap';
import { RiskAnalysisView } from './components/risk/RiskAnalysisView';
import { ScenarioBuilderModal } from './components/scenario-builder/ScenarioBuilderModal';
import { ZoneModal } from './components/scenario-builder/ZoneModal';
import { PopulationDetectionView } from './components/population/PopulationDetectionView';
import { MassAlertCenter } from './components/mass-alerts/MassAlertCenter';
import { ClimateIntelligenceView } from './components/climate/ClimateIntelligenceView';
import { MultiAgentCoordinatorView } from './components/coordinator/MultiAgentCoordinatorView';
import { AlertCircle, CheckCircle, Info, Activity, Megaphone } from 'lucide-react';

export const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<IScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<IScenario | null>(null);
  const [selectedZone, setSelectedZone] = useState<IZone | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'population' | 'mass-alerts' | 'climate' | 'coordinator'>('overview');

  // Risk Assessment State (Module 2)
  const [riskAnalysis, setRiskAnalysis] = useState<IScenarioRiskAnalysis | null>(null);
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState<boolean>(false);
  const [inspectZoneId, setInspectZoneId] = useState<string | null>(null);

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

  // When active scenario changes, load its risk analysis
  useEffect(() => {
    if (activeScenario?.id) {
      fetchRiskData(activeScenario.id);
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
    setActiveTab('mass-alerts');
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

                {/* Module 4 Emergency Alert Center Banner */}
                <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">
                        Module 4: Emergency Alert Center Ready
                      </div>
                      <div className="text-slate-500 text-xs">
                        Broadcast emergency mass alerts to active mobile SIMs & custom phone numbers.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('mass-alerts')}
                    className="whitespace-nowrap px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    Open Alert Center &rarr;
                  </button>
                </div>
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
                onViewAlerts={handleViewAlertsFromMap}
              />
            </section>
          </div>
        )}

        {/* TAB 3: POPULATION DENSITY DETECTION (MODULE 3) */}
        {activeTab === 'population' && (
          <div className="space-y-6">
            <PopulationDetectionView />
          </div>
        )}

        {/* TAB 4: EMERGENCY MASS ALERT CENTER (MODULE 4) */}
        {activeTab === 'mass-alerts' && (
          <div className="space-y-6">
            <MassAlertCenter />
          </div>
        )}

        {/* TAB 5: CLIMATE INTELLIGENCE & EARLY WARNING SYSTEM (MODULE 5) */}
        {activeTab === 'climate' && (
          <div className="space-y-6">
            <ClimateIntelligenceView
              onNavigateToAlertCenter={(_hazard, _location) => {
                setActiveTab('mass-alerts');
              }}
            />
          </div>
        )}

        {/* TAB 6: MULTI-AGENT DISASTER RESPONSE COORDINATOR (MODULE 6 / CENTRAL BRAIN) */}
        {activeTab === 'coordinator' && (
          <div className="space-y-6">
            <MultiAgentCoordinatorView
              onNavigateToMassAlerts={() => setActiveTab('mass-alerts')}
              onNavigateToPopulation={() => setActiveTab('population')}
              onNavigateToClimate={() => setActiveTab('climate')}
            />
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
