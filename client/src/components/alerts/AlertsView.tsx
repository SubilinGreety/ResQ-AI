import React, { useState } from 'react';
import { IAlert, IAlertsData, AlertChannel } from '../../types/alert';
import { IScenario } from '../../types/scenario';
import {
  Radio,
  Send,
  Smartphone,
  Volume2,
  Share2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
  Edit3,
  X,
  ShieldAlert,
  Users,
  Check,
  Languages,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AlertsViewProps {
  activeScenario: IScenario | null;
  alertsData: IAlertsData | null;
  isLoading: boolean;
  onRefreshAlerts: () => Promise<void>;
  onGenerateAlerts: () => Promise<void>;
  onDispatchAlert: (alertId: string, updates?: Partial<IAlert>) => Promise<void>;
  onDispatchAllP1: () => Promise<void>;
  onUpdateAlert: (alertId: string, data: Partial<IAlert>) => Promise<void>;
  onRevokeAlert: (alertId: string) => Promise<void>;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  activeScenario,
  alertsData,
  isLoading,
  onRefreshAlerts,
  onGenerateAlerts,
  onDispatchAlert,
  onDispatchAllP1,
  onUpdateAlert,
  onRevokeAlert,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'dispatched' | 'drafts' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [langPreference, setLangPreference] = useState<'bilingual' | 'en' | 'ta'>('bilingual');
  const [previewAlert, setPreviewAlert] = useState<IAlert | null>(null);
  const [editModalAlert, setEditModalAlert] = useState<IAlert | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isBroadcastingP1, setIsBroadcastingP1] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [expandedAlertIds, setExpandedAlertIds] = useState<Record<string, boolean>>({});

  if (!alertsData || !activeScenario) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
        <Radio className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">
          Emergency Warning Engine Offline
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Generate CAP-compliant bilingual (English & தமிழ்) early warnings from the active scenario risk scores.
        </p>
        <button
          onClick={onGenerateAlerts}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Alerts from Risk Analysis</span>
        </button>
      </div>
    );
  }

  const { overview, alerts } = alertsData;

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await onGenerateAlerts();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBroadcastAllP1 = async () => {
    try {
      setIsBroadcastingP1(true);
      await onDispatchAllP1();
    } finally {
      setIsBroadcastingP1(false);
    }
  };

  const handleDispatchSingle = async (alertId: string) => {
    try {
      setActionLoadingId(alertId);
      await onDispatchAlert(alertId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAlertIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter alerts
  const filteredAlerts = alerts.filter((a) => {
    if (filterTab === 'dispatched' && a.status !== 'DISPATCHED') return false;
    if (filterTab === 'drafts' && a.status !== 'DRAFT') return false;
    if (filterTab === 'critical' && a.priority !== 1) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.zoneName.toLowerCase().includes(q);
      const matchLoc = a.locality.toLowerCase().includes(q);
      const matchHead = a.headline.toLowerCase().includes(q);
      return matchName || matchLoc || matchHead;
    }
    return true;
  });

  const getPriorityBadgeClass = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800 border-red-200 font-bold';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200 font-semibold';
      case 3:
        return 'bg-amber-100 text-amber-800 border-amber-200 font-medium';
      case 4:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DISPATCHED</span>
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>DRAFT</span>
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span>REVOKED</span>
          </span>
        );
      default:
        return null;
    }
  };

  const renderChannelIcon = (ch: AlertChannel) => {
    switch (ch) {
      case 'SMS':
        return (
          <span
            key={ch}
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium"
            title="Cell Broadcast / SMS Emergency Push"
          >
            <Smartphone className="w-3 h-3" />
            <span>Cell SMS</span>
          </span>
        );
      case 'WHATSAPP':
        return (
          <span
            key={ch}
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium"
            title="Tamil Nadu Disaster Management WhatsApp Channel"
          >
            <Share2 className="w-3 h-3" />
            <span>WhatsApp</span>
          </span>
        );
      case 'SIREN':
        return (
          <span
            key={ch}
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[11px] font-medium"
            title="High-Decibel Sector Siren Audio Alert"
          >
            <Volume2 className="w-3 h-3" />
            <span>Sirens</span>
          </span>
        );
      case 'TACTICAL':
        return (
          <span
            key={ch}
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-medium"
            title="First Responder & Police Tactical Dispatch"
          >
            <Radio className="w-3 h-3" />
            <span>Tactical</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Warnings */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dispatched Broadcasts
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {overview.dispatchedCount}
            </span>
            <span className="text-xs text-slate-500">
              / {overview.totalAlerts} total alerts
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Live across Chennai Cell towers</span>
          </div>
        </div>

        {/* Card 2: Critical P1 Flash Warnings */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Priority 1 Critical Alerts
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-red-600">
              {overview.criticalP1Count}
            </span>
            <span className="text-xs text-slate-500">
              Immediate Evacuation
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Requires EOC Operator Broadcast
          </div>
        </div>

        {/* Card 3: Citizens Targeted */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Citizens Targeted
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {overview.totalPopulationTargeted.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">
              residents
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Est. {overview.estimatedReached.toLocaleString()} reached
          </div>
        </div>

        {/* Card 4: System Reliability */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delivery Reliability
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-indigo-600">
              98.6%
            </span>
            <span className="text-xs text-slate-500">
              CAP v1.2 Compliant
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Multi-carrier GSM broadcast active
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Tab filters */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterTab === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Alerts ({overview.totalAlerts})
            </button>
            <button
              onClick={() => setFilterTab('critical')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterTab === 'critical'
                  ? 'bg-white text-red-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Critical P1 ({overview.criticalP1Count})
            </button>
            <button
              onClick={() => setFilterTab('dispatched')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterTab === 'dispatched'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dispatched ({overview.dispatchedCount})
            </button>
            <button
              onClick={() => setFilterTab('drafts')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterTab === 'drafts'
                  ? 'bg-white text-amber-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drafts ({overview.draftCount})
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Bilingual Display Selector */}
            <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5 text-xs bg-slate-50">
              <span className="px-2 py-1 text-slate-500 font-medium flex items-center space-x-1">
                <Languages className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lang:</span>
              </span>
              <button
                onClick={() => setLangPreference('bilingual')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  langPreference === 'bilingual'
                    ? 'bg-white text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Both (EN+தமிழ்)
              </button>
              <button
                onClick={() => setLangPreference('en')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  langPreference === 'en'
                    ? 'bg-white text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLangPreference('ta')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  langPreference === 'ta'
                    ? 'bg-white text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Refresh Feed */}
            <button
              onClick={onRefreshAlerts}
              disabled={isLoading}
              title="Refresh alert feed from database"
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Refresh / Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isLoading}
              title="Regenerate alerts based on updated risk scores"
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Syncing...' : 'Sync with Risk Engine'}</span>
            </button>

            {/* Broadcast All P1 Button */}
            {overview.criticalP1Count > 0 && (
              <button
                onClick={handleBroadcastAllP1}
                disabled={isBroadcastingP1 || isLoading}
                className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all animate-pulse hover:animate-none"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>
                  {isBroadcastingP1 ? 'Broadcasting...' : 'Broadcast All P1 Warnings'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts by sector name, locality (e.g. Saidapet, Velachery), or headline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            No emergency alerts match the current filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isExpanded = !!expandedAlertIds[alert.id];
            const isCrit = alert.priority === 1;

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-xl shadow-sm transition-all hover:shadow-md ${
                  isCrit ? 'border-red-200' : 'border-slate-200'
                }`}
              >
                {/* Alert Card Header */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Priority badge */}
                    <span
                      className={`px-2.5 py-1 rounded text-xs uppercase tracking-wide border ${getPriorityBadgeClass(
                        alert.priority
                      )}`}
                    >
                      P{alert.priority} • {alert.severity}
                    </span>

                    {/* Alert Type */}
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                      {alert.alertType}
                    </span>

                    {/* Zone & Locality */}
                    <div className="text-sm font-bold text-slate-900">
                      {alert.zoneName}
                      <span className="text-xs font-normal text-slate-500 ml-1.5">
                        ({alert.locality})
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="ml-auto lg:ml-2">
                      {getStatusBadge(alert.status)}
                    </div>
                  </div>

                  {/* Channel Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {alert.channels.map((ch) => renderChannelIcon(ch))}
                  </div>
                </div>

                {/* Alert Card Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Headline */}
                  <h4 className="text-sm font-bold text-slate-800">
                    {alert.headline}
                  </h4>

                  {/* Bilingual Message Contents */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* English Message */}
                    {(langPreference === 'bilingual' || langPreference === 'en') && (
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-700">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-slate-900 text-[11px] flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span>English Broadcast</span>
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">EN-IN</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">
                          {alert.messageEn}
                        </p>
                      </div>
                    )}

                    {/* Tamil Message */}
                    {(langPreference === 'bilingual' || langPreference === 'ta') && (
                      <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-200/70 text-xs text-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-amber-900 text-[11px] flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            <span>தமிழ் எச்சரிக்கை (Tamil)</span>
                          </span>
                          <span className="text-[10px] text-amber-700 uppercase font-semibold">TA-IN</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line font-medium font-tamil">
                          {alert.messageTa}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expandable Instructions */}
                  {alert.instructions && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleExpand(alert.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>
                          {isExpanded ? 'Hide Immediate Safety Instructions' : 'View Actionable Citizen Instructions'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
                          <div className="font-semibold text-slate-900 mb-1">
                            Protocol Directives for Citizens:
                          </div>
                          <p className="whitespace-pre-line leading-relaxed text-slate-600">
                            {alert.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Alert Card Footer & Actions */}
                <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Left: Population and reach stats */}
                  <div className="flex items-center space-x-4 text-slate-500">
                    <div>
                      Target:{' '}
                      <strong className="text-slate-700">
                        {alert.targetPopulation.toLocaleString()}
                      </strong>{' '}
                      citizens
                    </div>

                    {alert.status === 'DISPATCHED' && (
                      <div className="flex items-center space-x-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivery Rate: {alert.deliveryRate}%</span>
                      </div>
                    )}

                    {alert.dispatchedAt && (
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(alert.dispatchedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Mobile Lockscreen Preview */}
                    <button
                      onClick={() => setPreviewAlert(alert)}
                      title="Simulate how citizen receives this on their smartphone"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium flex items-center space-x-1 transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Phone Preview</span>
                    </button>

                    {/* Edit Alert */}
                    <button
                      onClick={() => setEditModalAlert(alert)}
                      title="Edit headline, messages, or channels"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium flex items-center space-x-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>

                    {/* Dispatch Button */}
                    {alert.status === 'DRAFT' && (
                      <button
                        onClick={() => handleDispatchSingle(alert.id)}
                        disabled={actionLoadingId === alert.id}
                        className={`px-3 py-1.5 rounded-lg text-white font-semibold flex items-center space-x-1.5 shadow-sm transition-all ${
                          isCrit
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {actionLoadingId === alert.id ? 'Broadcasting...' : 'Broadcast Now'}
                        </span>
                      </button>
                    )}

                    {/* Revoke Button */}
                    {alert.status === 'DISPATCHED' && (
                      <button
                        onClick={() => onRevokeAlert(alert.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-medium transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Citizen Mobile Phone Lockscreen Preview Modal */}
      {previewAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-700">
            {/* Phone Speaker Notch */}
            <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* Mobile Screen Surface */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-[28px] p-4 text-white min-h-[520px] flex flex-col justify-between shadow-inner">
              {/* Status bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium px-1">
                <span>12:45</span>
                <div className="flex items-center space-x-1.5">
                  <span>BSNL 5G</span>
                  <div className="w-4 h-2 border border-slate-300 rounded-xs flex items-center px-0.5">
                    <div className="w-full h-1 bg-white"></div>
                  </div>
                </div>
              </div>

              {/* Lockscreen Center Clock */}
              <div className="text-center my-4">
                <div className="text-4xl font-extralight tracking-tight">12:45</div>
                <div className="text-xs text-slate-400 font-normal">Thursday, September 24</div>
              </div>

              {/* Government Emergency Broadcast Notification Banner */}
              <div className="bg-red-600/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-red-500 text-white animate-bounce-short">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider mb-1.5">
                  <div className="p-1 rounded bg-white text-red-600">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <span>EMERGENCY ALERT • TNDMA</span>
                </div>

                <div className="text-sm font-black leading-tight mb-2">
                  {previewAlert.headline}
                </div>

                {/* English Message preview */}
                <div className="text-xs text-red-50 leading-relaxed mb-3 bg-red-700/60 p-2.5 rounded-lg border border-red-400/40">
                  {previewAlert.messageEn}
                </div>

                {/* Tamil Message preview */}
                <div className="text-xs text-amber-100 font-medium leading-relaxed bg-red-800/80 p-2.5 rounded-lg border border-amber-300/40 font-tamil">
                  {previewAlert.messageTa}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-red-200">
                  <span className="flex items-center space-x-1">
                    <Volume2 className="w-3 h-3" />
                    <span>Loud Audio Alarm</span>
                  </span>
                  <span className="font-semibold text-white">Helpline: 1070 / 112</span>
                </div>
              </div>

              {/* Bottom Phone Action bar */}
              <div className="mt-4 pt-3 flex items-center justify-center">
                <button
                  onClick={() => setPreviewAlert(null)}
                  className="px-6 py-2 rounded-full bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white shadow transition-colors"
                >
                  Close Mobile Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Alert Modal */}
      {editModalAlert && (
        <EditAlertModal
          alert={editModalAlert}
          onClose={() => setEditModalAlert(null)}
          onSave={async (data) => {
            await onUpdateAlert(editModalAlert.id, data);
            setEditModalAlert(null);
          }}
          onSaveAndDispatch={async (data) => {
            await onUpdateAlert(editModalAlert.id, data);
            await onDispatchAlert(editModalAlert.id);
            setEditModalAlert(null);
          }}
        />
      )}
    </div>
  );
};

interface EditAlertModalProps {
  alert: IAlert;
  onClose: () => void;
  onSave: (data: Partial<IAlert>) => Promise<void>;
  onSaveAndDispatch: (data: Partial<IAlert>) => Promise<void>;
}

const EditAlertModal: React.FC<EditAlertModalProps> = ({
  alert,
  onClose,
  onSave,
  onSaveAndDispatch,
}) => {
  const [headline, setHeadline] = useState(alert.headline);
  const [messageEn, setMessageEn] = useState(alert.messageEn);
  const [messageTa, setMessageTa] = useState(alert.messageTa);
  const [instructions, setInstructions] = useState(alert.instructions);
  const [channels, setChannels] = useState<AlertChannel[]>(alert.channels);
  const [isSaving, setIsSaving] = useState(false);

  const toggleChannel = (ch: AlertChannel) => {
    if (channels.includes(ch)) {
      if (channels.length > 1) {
        setChannels(channels.filter((c) => c !== ch));
      }
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleSave = async (dispatchNow = false) => {
    try {
      setIsSaving(true);
      const data: Partial<IAlert> = {
        headline,
        messageEn,
        messageTa,
        instructions,
        channels,
      };
      if (dispatchNow) {
        await onSaveAndDispatch(data);
      } else {
        await onSave(data);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Edit Emergency Warning • {alert.zoneName}
            </h3>
            <p className="text-xs text-slate-500">
              Modify broadcast text, Tamil translation, directives, and distribution channels.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Headline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Warning Headline (CAP Incident Title)
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Channels Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Active Broadcast Channels
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['SMS', 'WHATSAPP', 'SIREN', 'TACTICAL'] as AlertChannel[]).map((ch) => {
                const active = channels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span>{ch}</span>
                    {active && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* English Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              English Alert Message (SMS / Broadcast)
            </label>
            <textarea
              rows={3}
              value={messageEn}
              onChange={(e) => setMessageEn(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Tamil Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              தமிழ் எச்சரிக்கை செய்தி (Tamil Translation)
            </label>
            <textarea
              rows={3}
              value={messageTa}
              onChange={(e) => setMessageTa(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-tamil"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Directives & Protective Instructions
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-xs font-medium text-white transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm transition-colors flex items-center space-x-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Processing...' : 'Save & Broadcast'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
