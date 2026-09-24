import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Calendar,
  X,
  Megaphone,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Zap,
  BarChart2,
  Radio,
  Globe,
  ChevronDown,
  Info,
  Loader2,
  TrendingUp,
  History,
  Shield,
  Phone,
  Plus,
  Trash2,
  MessageCircle,
} from 'lucide-react';
import { massAlertApi } from '../../services/api';
import {
  AlertType,
  AlertLanguage,
  AlertStatus,
  IMassAlertRecord,
  IDeliveryAnalytics,
  IRecipientEstimate,
} from '../../types/massAlert';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALERT_TYPES: { type: AlertType; emoji: string; color: string; bg: string; border: string; hex: string }[] =
  [
    { type: 'Flood', emoji: '🌊', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300', hex: '#1d4ed8' },
    { type: 'Earthquake', emoji: '🌍', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300', hex: '#c2410c' },
    { type: 'Fire', emoji: '🔥', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', hex: '#b91c1c' },
    { type: 'Cyclone', emoji: '🌀', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-300', hex: '#4338ca' },
    { type: 'Landslide', emoji: '⛰️', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', hex: '#b45309' },
    { type: 'Medical Emergency', emoji: '🏥', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', hex: '#047857' },
  ];

const CHENNAI_LOCATIONS = [
  { name: 'Saidapet', lat: 13.0206, lon: 80.2206 },
  { name: 'Velachery', lat: 12.9815, lon: 80.2183 },
  { name: 'T. Nagar', lat: 13.0418, lon: 80.2341 },
  { name: 'Tambaram', lat: 12.9249, lon: 80.1000 },
  { name: 'Adyar', lat: 13.0012, lon: 80.2565 },
  { name: 'Mylapore', lat: 13.0334, lon: 80.2681 },
  { name: 'Kodambakkam', lat: 13.0524, lon: 80.2237 },
  { name: 'Perambur', lat: 13.1165, lon: 80.2358 },
];

const LANGUAGES: AlertLanguage[] = ['English', 'Tamil', 'Hindi'];

const ALERT_TEMPLATES_PREVIEW: Record<AlertType, string> = {
  Flood:
    '🚨 EMERGENCY ALERT: A flood has been detected in your area. Please move IMMEDIATELY to the nearest safe shelter. Follow official instructions. Helpline: 1070 / 112.',
  Earthquake:
    '🚨 EMERGENCY ALERT: An earthquake has been detected. DROP, COVER, and HOLD ON. Move away from buildings. Helpline: 1070 / 112.',
  Fire:
    '🚨 EMERGENCY ALERT: A fire emergency has been reported. Evacuate IMMEDIATELY. Cover mouth. Call 101 or 112.',
  Cyclone:
    '🚨 CYCLONE WARNING: A severe cyclone is approaching. Seek IMMEDIATE shelter. Move away from coastal areas. Helpline: 1070 / 112.',
  Landslide:
    '🚨 LANDSLIDE WARNING: Landslide risk detected. Evacuate to higher, open ground IMMEDIATELY. Helpline: 1070 / 112.',
  'Medical Emergency':
    '🚨 MEDICAL EMERGENCY: A public health emergency has been declared. Follow health authority guidelines. Call 108 or 112.',
};

// ─── Status Helpers ───────────────────────────────────────────────────────────

const statusConfig: Record<AlertStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  SENDING: { label: 'Sending…', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  DELIVERED: { label: 'Delivered', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  FAILED: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <XCircle className="w-3 h-3" /> },
  SCHEDULED: { label: 'Scheduled', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', icon: <Calendar className="w-3 h-3" /> },
  CANCELLED: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', icon: <X className="w-3 h-3" /> },
};

// ─── Animated Counter ─────────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 1000): number {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = Date.now();
    const step = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// ─── Delivery Analytics Cards ─────────────────────────────────────────────────

const AnalyticsCard: React.FC<{
  label: string; value: number; icon: React.ReactNode; accent: string; iconBg: string; sub?: string;
}> = ({ label, value, icon, accent, iconBg, sub }) => {
  const animated = useAnimatedCounter(value);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      <div className={`text-3xl font-extrabold tabular-nums ${accent}`}>{animated.toLocaleString()}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
};

// ─── Sending Progress Overlay ─────────────────────────────────────────────────

const SendingOverlay: React.FC<{ total: number; status: AlertStatus }> = ({ total, status }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status !== 'SENDING') { setProgress(100); return; }
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(interval); return 95; }
        return p + 1.2 + Math.random() * 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        {status === 'SENDING' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <Radio className="w-8 h-8 text-rose-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Broadcasting Alert</h3>
            <p className="text-sm text-slate-500 mb-6">
              Dispatching to <span className="font-bold text-rose-600">{total.toLocaleString()}</span> active SIMs…
            </p>
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute inset-y-0 bg-white/30 w-32 skew-x-12 animate-[shimmer_1.5s_infinite]"
                  style={{ animation: 'shimmer 1.5s infinite' }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">{Math.round(progress)}% dispatched</p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-rose-400"
                  style={{ animation: `bounce 0.8s ${i * 0.15}s infinite` }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Alert Dispatched!</h3>
            <p className="text-sm text-slate-500">
              Successfully broadcast to <span className="font-bold text-emerald-600">{total.toLocaleString()}</span> recipients.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Alert History Row ────────────────────────────────────────────────────────

const AlertHistoryRow: React.FC<{
  record: IMassAlertRecord;
  onCancel: (id: string) => void;
  onPoll: (id: string) => void;
}> = ({ record, onCancel, onPoll }) => {
  const st = statusConfig[record.status];
  const typeConf = ALERT_TYPES.find((t) => t.type === record.alertType)!;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0">{typeConf.emoji}</span>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-900 truncate">{record.alertType}</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{record.location}</span>
              <span className="text-slate-300">·</span>
              <span>{record.radiusKm}km radius</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold ${st.bg} ${st.color}`}>
            {st.icon} {st.label}
          </span>
          {(record.status === 'SENDING' || record.status === 'PENDING') && (
            <button
              onClick={() => onPoll(record.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
              title="Refresh status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          {record.status === 'SCHEDULED' && (
            <button
              onClick={() => onCancel(record.id)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
              title="Cancel scheduled alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Delivery progress bar */}
      {record.status === 'DELIVERED' || record.status === 'SENDING' ? (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span>Delivery Rate</span>
            <span className="font-bold text-emerald-600">{record.deliveryRate}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
              style={{ width: `${record.deliveryRate}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-3">
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg py-1.5">
          <div className="font-bold text-emerald-700">{record.delivered.toLocaleString()}</div>
          <div className="text-emerald-500">Delivered</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-lg py-1.5">
          <div className="font-bold text-amber-700">{record.pending.toLocaleString()}</div>
          <div className="text-amber-500">Pending</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg py-1.5">
          <div className="font-bold text-red-700">{record.failed.toLocaleString()}</div>
          <div className="text-red-500">Failed</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Globe className="w-3 h-3" />
          {record.languages.map((l) => (
            <span key={l} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
              {l}
            </span>
          ))}
          {record.customRecipients && record.customRecipients.length > 0 && (
            <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded font-medium flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" /> +{record.customRecipients.length} direct
            </span>
          )}
        </div>
        <span className="text-slate-300">
          {new Date(record.createdAt).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const MassAlertCenter: React.FC = () => {
  // ── Form state ───────────────────────────────────────────────────────────────
  const [selectedLocation, setSelectedLocation] = useState(CHENNAI_LOCATIONS[0]);
  const [radiusKm, setRadiusKm] = useState(1);
  const [alertType, setAlertType] = useState<AlertType>('Flood');
  const [languages, setLanguages] = useState<AlertLanguage[]>(['English', 'Tamil']);
  const [customMessage, setCustomMessage] = useState('');
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [activeSection, setActiveSection] = useState<'compose' | 'analytics' | 'history'>('compose');

  // ── Custom phone numbers state ────────────────────────────────────────────────
  const [customRecipients, setCustomRecipients] = useState<string[]>([]);
  const [phoneInput, setPhoneInput] = useState('');

  // ── Data state ───────────────────────────────────────────────────────────────
  const [estimate, setEstimate] = useState<IRecipientEstimate | null>(null);
  const [analytics, setAnalytics] = useState<IDeliveryAnalytics | null>(null);
  const [history, setHistory] = useState<IMassAlertRecord[]>([]);
  const [activeSend, setActiveSend] = useState<IMassAlertRecord | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [isSending, setIsSending] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Estimate recipients ───────────────────────────────────────────────────────
  const doEstimate = useCallback(async () => {
    try {
      setIsEstimating(true);
      const data = await massAlertApi.estimateRecipients(radiusKm);
      setEstimate(data);
    } catch {
      setEstimate(null);
    } finally {
      setIsEstimating(false);
    }
  }, [radiusKm]);

  useEffect(() => { doEstimate(); }, [doEstimate]);

  // ── Load analytics & history ─────────────────────────────────────────────────
  const loadAnalytics = useCallback(async () => {
    try {
      const [a, h] = await Promise.all([massAlertApi.getAnalytics(), massAlertApi.getHistory()]);
      setAnalytics(a);
      setHistory(h);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // ── Poll active send for delivery updates ─────────────────────────────────────
  const pollAlert = async (id: string) => {
    try {
      const updated = await massAlertApi.getAlertById(id);
      setActiveSend(updated);
      setHistory((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (updated.status === 'DELIVERED' || updated.status === 'FAILED') {
        clearTimeout(pollRef.current);
        setShowOverlay(false);
        await loadAnalytics();
        showToast(
          `Alert delivered to ${updated.delivered.toLocaleString()} recipients (${updated.deliveryRate}% rate)`,
          'success'
        );
      } else {
        pollRef.current = setTimeout(() => pollAlert(id), 1500);
      }
    } catch { /* silent */ }
  };

  // ── Send alert ────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!languages.length) { showToast('Select at least one language', 'error'); return; }
    try {
      setIsSending(true);
      setShowOverlay(true);
      const record = await massAlertApi.sendAlert({
        location: selectedLocation.name,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lon,
        radiusKm,
        alertType,
        languages,
        customRecipients,
        ...(useCustomMessage && customMessage ? { customMessage } : {}),
      });
      setActiveSend(record);
      setHistory((prev) => [record, ...prev]);
      pollRef.current = setTimeout(() => pollAlert(record.id), 1500);
    } catch (err: any) {
      setShowOverlay(false);
      showToast(err.message || 'Failed to send alert', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // ── Schedule alert ────────────────────────────────────────────────────────────
  const handleSchedule = async () => {
    if (!scheduledAt) { showToast('Please select a scheduled date/time', 'error'); return; }
    if (!languages.length) { showToast('Select at least one language', 'error'); return; }
    try {
      setIsScheduling(true);
      const record = await massAlertApi.scheduleAlert({
        location: selectedLocation.name,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lon,
        radiusKm,
        alertType,
        languages,
        scheduledAt,
        customRecipients,
        ...(useCustomMessage && customMessage ? { customMessage } : {}),
      });
      setHistory((prev) => [record, ...prev]);
      await loadAnalytics();
      showToast(`Alert scheduled for ${new Date(scheduledAt).toLocaleString('en-IN')}`, 'success');
      setScheduledAt('');
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule alert', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  // ── Cancel alert ──────────────────────────────────────────────────────────────
  const handleCancel = async (id: string) => {
    try {
      await massAlertApi.cancelAlert(id);
      await loadAnalytics();
      showToast('Scheduled alert cancelled', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel', 'error');
    }
  };

  // ── Language toggle ───────────────────────────────────────────────────────────
  const toggleLanguage = (lang: AlertLanguage) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  // ── Custom recipient helpers ──────────────────────────────────────────────────
  const addPhoneNumber = () => {
    const cleaned = phoneInput.trim().replace(/\s/g, '');
    if (!cleaned) return;
    // Accept 10-digit Indian mobile or +91XXXXXXXXXX or international
    if (!/^[+]?[0-9]{7,15}$/.test(cleaned)) {
      showToast('Enter a valid phone number (7–15 digits, optional + prefix)', 'error');
      return;
    }
    if (customRecipients.includes(cleaned)) {
      showToast('This number is already in the list', 'info');
      return;
    }
    setCustomRecipients((prev) => [...prev, cleaned]);
    setPhoneInput('');
  };

  const removePhoneNumber = (num: string) => {
    setCustomRecipients((prev) => prev.filter((n) => n !== num));
  };

  const sendWhatsAppAlert = (num: string) => {
    const clean = num.replace(/[^0-9]/g, '');
    const phoneWithCountry = clean.length === 10 ? `91${clean}` : clean;
    const msg =
      useCustomMessage && customMessage
        ? customMessage
        : ALERT_TEMPLATES_PREVIEW[alertType].replace('your area', selectedLocation.name);
    const alertBody = `🚨 *RESQ AI EMERGENCY ALERT (${alertType.toUpperCase()})*\n\n📍 *Location:* ${selectedLocation.name}\n⚠️ *Alert Details:* ${msg}\n\n_Official Broadcast from ResQ AI Emergency Operations Center_`;
    const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(alertBody)}`;
    window.open(waUrl, '_blank');
  };

  const handlePhoneInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addPhoneNumber(); }
  };

  const selectedTypeConf = ALERT_TYPES.find((t) => t.type === alertType)!;

  return (
    <div className="space-y-6">
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-fadeIn">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-xs font-medium border max-w-sm ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Sending overlay ────────────────────────────────────────────────── */}
      {showOverlay && activeSend && (
        <SendingOverlay total={activeSend.totalRecipients} status={activeSend.status} />
      )}

      {/* ── Module Header ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-200">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">Emergency Alert Center</h2>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-[10px] font-bold tracking-wide">
                  MODULE 4
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mass broadcast emergency alerts to every active SIM in a disaster zone · Chennai EOC
              </p>
            </div>
          </div>

          {/* Section tabs */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            {(
              [
                { id: 'compose', label: 'Compose', icon: <Send className="w-3.5 h-3.5" /> },
                { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-3.5 h-3.5" /> },
                { id: 'history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
              ] as const
            ).map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => { setActiveSection(id); if (id !== 'compose') loadAnalytics(); }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all ${
                  activeSection === id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
           SECTION 1: COMPOSE
         ════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'compose' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left: Compose form (3 cols) */}
          <div className="xl:col-span-3 space-y-5">

            {/* Step 1: Location */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-rose-100"><MapPin className="w-4 h-4 text-rose-600" /></div>
                <span className="font-bold text-slate-900 text-sm">Step 1 — Disaster Location</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Area</label>
                  <div className="relative">
                    <select
                      value={selectedLocation.name}
                      onChange={(e) => {
                        const loc = CHENNAI_LOCATIONS.find((l) => l.name === e.target.value)!;
                        setSelectedLocation(loc);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
                    >
                      {CHENNAI_LOCATIONS.map((l) => (
                        <option key={l.name} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Alert Radius: <span className="text-rose-600 font-bold">{radiusKm < 1 ? `${radiusKm * 1000}m` : `${radiusKm}km`}</span>
                  </label>
                  <div className="flex rounded-xl border border-slate-300 overflow-hidden">
                    {[0.5, 1, 2, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRadiusKm(r)}
                        className={`flex-1 py-2.5 text-xs font-bold transition-all ${
                          radiusKm === r ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {r < 1 ? '500m' : `${r}km`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coordinates display */}
              <div className="mt-3 flex gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Lat:</span> {selectedLocation.lat.toFixed(4)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Lon:</span> {selectedLocation.lon.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Step 2: Alert Type */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-orange-100"><Zap className="w-4 h-4 text-orange-600" /></div>
                <span className="font-bold text-slate-900 text-sm">Step 2 — Alert Type</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ALERT_TYPES.map(({ type, emoji, color, bg, border }) => (
                  <button
                    key={type}
                    onClick={() => setAlertType(type)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      alertType === type
                        ? `${bg} ${border} ${color} shadow-sm scale-[1.02]`
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-xs">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Language */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-blue-100"><Globe className="w-4 h-4 text-blue-600" /></div>
                <span className="font-bold text-slate-900 text-sm">Step 3 — Broadcast Languages</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      languages.includes(lang)
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {lang === 'Tamil' ? 'தமிழ் (Tamil)' : lang === 'Hindi' ? 'हिंदी (Hindi)' : lang}
                  </button>
                ))}
              </div>
              {!languages.length && (
                <p className="mt-2 text-xs text-red-500 font-medium">⚠ Select at least one language</p>
              )}
            </div>

            {/* Step 4: Custom message (optional) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-100"><Eye className="w-4 h-4 text-violet-600" /></div>
                  <span className="font-bold text-slate-900 text-sm">Step 4 — Custom Message (Optional)</span>
                </div>
                <button
                  onClick={() => setUseCustomMessage(!useCustomMessage)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${useCustomMessage ? 'bg-violet-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${useCustomMessage ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {useCustomMessage ? (
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter a custom message to override the default template…"
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                />
              ) : (
                <p className="text-xs text-slate-400 mt-1">Default template will be used based on alert type and location.</p>
              )}
            </div>

            {/* Step 5: Custom phone numbers */}
            <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-indigo-100"><Phone className="w-4 h-4 text-indigo-600" /></div>
                <span className="font-bold text-slate-900 text-sm">Step 5 — Custom Phone Numbers</span>
                {customRecipients.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                    {customRecipients.length} added
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Add specific numbers to receive this alert in addition to all area SIMs. Press Enter or click + to add each number.
              </p>

              {/* Input row */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    onKeyDown={handlePhoneInputKeyDown}
                    placeholder="+91XXXXXXXXXX or 10-digit number"
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <button
                  onClick={addPhoneNumber}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Added numbers list */}
              {customRecipients.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {customRecipients.map((num, i) => (
                    <div
                      key={num}
                      className="flex items-center justify-between px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm font-mono font-semibold text-indigo-900">{num}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => sendWhatsAppAlert(num)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 text-xs font-semibold transition shadow-xs"
                          title="Deliver live alert directly to this phone via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => removePhoneNumber(num)}
                          className="p-1 rounded-lg text-indigo-400 hover:text-red-500 hover:bg-red-50 opacity-70 group-hover:opacity-100 transition-all"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-12 border border-dashed border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-400">No custom numbers added yet</span>
                </div>
              )}

              {customRecipients.length > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-semibold">
                    ✓ {customRecipients.length} number{customRecipients.length !== 1 ? 's' : ''} targeted for direct dispatch
                  </span>
                  <button
                    onClick={() => setCustomRecipients([])}
                    className="text-[11px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear all
                  </button>
                </div>
              )}

              {/* Delivery Guide Box */}
              <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Real Message Delivery Options:</span>
                </div>
                <div className="text-[11px] text-amber-800 space-y-1 leading-relaxed">
                  <div>
                    <span className="font-semibold text-emerald-800">⚡ Instant (No Setup):</span> Click the green <strong className="text-emerald-700 font-bold">WhatsApp</strong> button next to your number to send the emergency alert straight to your phone right now!
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">📶 Real Cellular SMS:</span> Add your free Fast2SMS key (<code>FAST2SMS_API_KEY</code>) or Twilio credentials in <code>server/.env</code> to broadcast real SMS over telecom networks.
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule datetime */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-amber-100"><Calendar className="w-4 h-4 text-amber-600" /></div>
                <span className="font-bold text-slate-900 text-sm">Schedule (optional)</span>
              </div>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              {scheduledAt && (
                <p className="text-xs text-amber-600 font-medium mt-1.5">
                  ⏰ Will broadcast on {new Date(scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSend}
                disabled={isSending || !languages.length}
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-rose-200 transition-all"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSending ? 'Broadcasting…' : 'Send Alert Now'}
              </button>
              <button
                onClick={handleSchedule}
                disabled={isScheduling || !scheduledAt || !languages.length}
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl font-bold text-sm shadow-md shadow-amber-100 transition-all"
              >
                {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                {isScheduling ? 'Scheduling…' : 'Schedule Alert'}
              </button>
              <button
                onClick={() => {
                  setAlertType('Flood');
                  setLanguages(['English', 'Tamil']);
                  setRadiusKm(1);
                  setScheduledAt('');
                  setCustomMessage('');
                  setUseCustomMessage(false);
                  setCustomRecipients([]);
                  setPhoneInput('');
                }}
                className="flex items-center justify-center gap-2 px-5 py-3.5 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Right: Preview pane (2 cols) */}
          <div className="xl:col-span-2 space-y-5">
            {/* Recipient estimate card */}
            <div className={`rounded-2xl border-2 p-5 ${selectedTypeConf.bg} ${selectedTypeConf.border}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{selectedTypeConf.emoji}</span>
                <div>
                  <div className={`font-bold text-sm ${selectedTypeConf.color}`}>{alertType} Alert</div>
                  <div className="text-xs text-slate-500">{selectedLocation.name} · {radiusKm < 1 ? `${radiusKm * 1000}m` : `${radiusKm}km`} radius</div>
                </div>
              </div>

              {isEstimating ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Estimating recipients…
                </div>
              ) : estimate ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">Estimated Recipients</span>
                    <span className={`text-2xl font-extrabold tabular-nums ${selectedTypeConf.color}`}>
                      {(estimate.estimatedRecipients + customRecipients.length).toLocaleString()}
                    </span>
                  </div>
                  {customRecipients.length > 0 && (
                    <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <span className="text-indigo-700 font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Custom Numbers:
                      </span>
                      <span className="font-bold text-indigo-700">+{customRecipients.length} direct recipients</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Est. Population Covered</span>
                    <span className="text-sm font-bold text-slate-700">{estimate.estimatedPopulation.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Languages</span>
                    <span className="text-xs font-bold text-slate-700">{languages.join(', ') || '—'}</span>
                  </div>
                  <div className="mt-2 p-2 bg-white/60 rounded-lg text-[10px] text-slate-500 flex items-start gap-1.5">
                    <Radio className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    {estimate.note}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Alert preview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-900 text-sm">Alert Preview</span>
              </div>

              {/* SMS mockup */}
              <div className="bg-slate-900 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                <div className="relative">
                  {/* Phone notch */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-slate-400 font-mono">09:41 AM</span>
                    <span className="text-[10px] text-slate-400">📶 4G</span>
                  </div>
                  {/* Alert banner */}
                  <div className="bg-rose-600 rounded-xl p-3 mb-2">
                    <div className="text-[10px] text-rose-200 font-bold uppercase tracking-wider mb-1">
                      🚨 Emergency Alert · TN-GOVT
                    </div>
                    <div className="text-white text-xs leading-relaxed font-medium">
                      {useCustomMessage && customMessage
                        ? customMessage
                        : ALERT_TEMPLATES_PREVIEW[alertType].replace('your area', selectedLocation.name)}
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 text-right">Govt of Tamil Nadu · NDMA</div>
                  {/* Language badges */}
                  {languages.length > 1 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {languages.map((l) => (
                        <span key={l} className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                          +{l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent activity */}
            {history.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-800 text-sm">Last Alert Status</span>
                </div>
                {(() => {
                  const last = history[0];
                  const st = statusConfig[last.status];
                  return (
                    <div className={`rounded-xl border p-3 ${st.bg}`}>
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${st.color} mb-2`}>
                        {st.icon} {last.alertType} — {last.location}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                        <div><div className="font-bold text-emerald-600">{last.delivered.toLocaleString()}</div><div className="text-slate-400">Delivered</div></div>
                        <div><div className="font-bold text-amber-600">{last.pending.toLocaleString()}</div><div className="text-slate-400">Pending</div></div>
                        <div><div className="font-bold text-slate-600">{last.deliveryRate}%</div><div className="text-slate-400">Rate</div></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Integration note */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2">
              <Shield className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-600">Production Integration: </span>
                Replace <code className="bg-slate-100 px-1 rounded font-mono">dispatchViaSmsGateway()</code> in{' '}
                <code className="bg-slate-100 px-1 rounded font-mono">massAlertController.ts</code> with Twilio, TRAI NDCP, or government emergency broadcast API. All response shapes remain unchanged.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
           SECTION 2: ANALYTICS
         ════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          {analytics ? (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <AnalyticsCard
                  label="Total Alerts Sent"
                  value={analytics.totalSent}
                  icon={<Send className="w-5 h-5 text-rose-600" />}
                  accent="text-rose-700"
                  iconBg="bg-rose-100"
                  sub="across all sessions"
                />
                <AnalyticsCard
                  label="Total Delivered"
                  value={analytics.totalDelivered}
                  icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
                  accent="text-emerald-700"
                  iconBg="bg-emerald-100"
                  sub="successful SMS deliveries"
                />
                <AnalyticsCard
                  label="Pending"
                  value={analytics.totalPending}
                  icon={<Clock className="w-5 h-5 text-amber-600" />}
                  accent="text-amber-700"
                  iconBg="bg-amber-100"
                  sub="awaiting delivery confirmation"
                />
                <AnalyticsCard
                  label="Failed"
                  value={analytics.totalFailed}
                  icon={<XCircle className="w-5 h-5 text-red-500" />}
                  accent="text-red-600"
                  iconBg="bg-red-100"
                  sub="undelivered recipients"
                />
              </div>

              {/* Delivery rate bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900 text-sm">Average Delivery Rate</span>
                  <span className="text-2xl font-extrabold text-emerald-600">{analytics.averageDeliveryRate}%</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 relative overflow-hidden"
                    style={{ width: `${analytics.averageDeliveryRate}%` }}
                  >
                    <div className="absolute inset-y-0 w-8 bg-white/30 skew-x-12 animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Alert Type */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="font-bold text-slate-900 text-sm mb-4">Alerts by Type</div>
                  {Object.keys(analytics.byAlertType).length ? (
                    <div className="space-y-3">
                      {Object.entries(analytics.byAlertType).map(([type, count]) => {
                        const conf = ALERT_TYPES.find((t) => t.type === type)!;
                        const maxCount = Math.max(...Object.values(analytics.byAlertType));
                        return (
                          <div key={type}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                <span>{conf?.emoji}</span>{type}
                              </span>
                              <span className="font-bold text-slate-800">{count}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${(count / maxCount) * 100}%`,
                                  background: conf ? undefined : '#6366f1',
                                  backgroundColor: conf?.hex,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No data yet. Send an alert to see breakdown.</p>
                  )}
                </div>

                {/* By Language */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="font-bold text-slate-900 text-sm mb-4">Broadcast Languages</div>
                  {Object.keys(analytics.byLanguage).length ? (
                    <div className="space-y-4">
                      {Object.entries(analytics.byLanguage).map(([lang, count]) => {
                        const total = Object.values(analytics.byLanguage).reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        const colors: Record<string, string> = {
                          English: '#3b82f6',
                          Tamil: '#10b981',
                          Hindi: '#f59e0b',
                        };
                        return (
                          <div key={lang}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-700">{lang}</span>
                              <span className="font-bold text-slate-800">{count} ({pct}%)</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, backgroundColor: colors[lang] || '#64748b' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No data yet.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400">
              <div className="text-center">
                <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No analytics data yet. Send your first alert.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
           SECTION 3: HISTORY
         ════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-800 text-sm">Alert History</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                {history.length} records
              </span>
            </div>
            <button
              onClick={loadAnalytics}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {history.length === 0 ? (
            <div className="flex items-center justify-center h-48 bg-white border border-slate-200 rounded-2xl">
              <div className="text-center text-slate-400">
                <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No alerts sent yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((record) => (
                <AlertHistoryRow
                  key={record.id}
                  record={record}
                  onCancel={handleCancel}
                  onPoll={(id) => { pollAlert(id); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
