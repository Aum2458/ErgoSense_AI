import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Database,
  RefreshCcw,
  User,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import {
  UserPreferences,
  getQueuedRecords,
  setQueuedRecords,
  syncQueuedRecords,
  clearAllLocalStorageData,
  DEFAULT_PREFS,
} from '../../services/telemetryClient.ts';

interface DevicesProfilePageProps {
  prefs: UserPreferences;
  onUpdatePrefs: (next: UserPreferences) => void;
}

export const DevicesProfilePage: React.FC<DevicesProfilePageProps> = ({
  prefs,
  onUpdatePrefs,
}) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [queuedRecords, setLocalQueue] = useState(() => getQueuedRecords());
  const [syncing, setSyncing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const localSocketIp = 'ws://192.168.1.42:8080';

  const handleSyncNow = async () => {
    if (queuedRecords.length === 0) {
      setStatusNotice('All local records are already synchronized.');
      setTimeout(() => setStatusNotice(null), 3000);
      return;
    }

    setSyncing(true);
    try {
      const count = await syncQueuedRecords(queuedRecords);
      setQueuedRecords([]);
      setLocalQueue([]);
      setStatusNotice(`Successfully synced ${count} offline telemetry records to backend.`);
    } catch {
      setStatusNotice('Sync unavailable right now; records remain safely queued locally.');
    } finally {
      setSyncing(false);
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  const handleExportJson = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile: prefs,
      queuedRecordsCount: queuedRecords.length,
      queuedRecords,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ergosense-personal-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatusNotice('Personal ErgoSense data exported as JSON.');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleClearLocalData = () => {
    clearAllLocalStorageData();
    setLocalQueue([]);
    onUpdatePrefs(DEFAULT_PREFS);
    setConfirmClear(false);
    setStatusNotice('Local storage records and preferences cleared.');
    setTimeout(() => setStatusNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {statusNotice && (
        <div className="p-3.5 rounded-xl bg-[#00C49A]/15 border border-[#00C49A]/40 text-[#00C49A] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Top Row: Zero-Cloud Device Linking & Offline-First Local Persistence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Zero-Cloud Device Linking Card */}
        <div className="lg:col-span-7 bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Desktop &lt;-&gt; Mobile Socket</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero-cloud local WebSocket pairing for edge sensor streaming
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
                socketConnected
                  ? 'bg-[#00C49A]/15 text-[#00C49A] border-[#00C49A]/40'
                  : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
              }`}
            >
              {socketConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Mock SVG QR Code */}
            <div className="p-3 bg-white rounded-2xl shrink-0 shadow-lg">
              <svg width="132" height="132" viewBox="0 0 100 100" fill="none">
                <rect x="6" y="6" width="26" height="26" rx="3" fill="#0B1120" />
                <rect x="10" y="10" width="18" height="18" rx="2" fill="#FFFFFF" />
                <rect x="14" y="14" width="10" height="10" rx="1" fill="#00C49A" />

                <rect x="68" y="6" width="26" height="26" rx="3" fill="#0B1120" />
                <rect x="72" y="10" width="18" height="18" rx="2" fill="#FFFFFF" />
                <rect x="76" y="14" width="10" height="10" rx="1" fill="#00C49A" />

                <rect x="6" y="68" width="26" height="26" rx="3" fill="#0B1120" />
                <rect x="10" y="72" width="18" height="18" rx="2" fill="#FFFFFF" />
                <rect x="14" y="76" width="10" height="10" rx="1" fill="#00C49A" />

                <rect x="40" y="8" width="7" height="7" fill="#0B1120" />
                <rect x="52" y="8" width="7" height="7" fill="#0B1120" />
                <rect x="40" y="20" width="7" height="7" fill="#00C49A" />
                <rect x="52" y="20" width="7" height="7" fill="#0B1120" />

                <rect x="8" y="42" width="7" height="7" fill="#0B1120" />
                <rect x="20" y="42" width="7" height="7" fill="#00C49A" />
                <rect x="38" y="38" width="24" height="24" rx="4" fill="#0B1120" />
                <circle cx="50" cy="50" r="6" fill="#00C49A" />
                <rect x="72" y="42" width="7" height="7" fill="#0B1120" />
                <rect x="84" y="42" width="7" height="7" fill="#00C49A" />

                <rect x="42" y="70" width="7" height="7" fill="#0B1120" />
                <rect x="54" y="70" width="7" height="7" fill="#00C49A" />
                <rect x="42" y="82" width="7" height="7" fill="#0B1120" />
                <rect x="68" y="68" width="8" height="8" fill="#0B1120" />
                <rect x="82" y="68" width="8" height="8" fill="#00C49A" />
                <rect x="68" y="82" width="8" height="8" fill="#00C49A" />
                <rect x="82" y="82" width="8" height="8" fill="#0B1120" />
              </svg>
            </div>

            {/* Radar Animation & Local IP */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center gap-4">
                {/* Radar Animation Graphic */}
                <div className="relative w-16 h-16 rounded-full bg-[#0F172A] border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  <div className="absolute inset-2 rounded-full border border-slate-700/60" />
                  <div className="absolute inset-0 rounded-full border border-[#00C49A]/40 animate-radar-ping" />
                  <div className="absolute inset-0 animate-radar">
                    <div className="w-1/2 h-1/2 origin-bottom-right bg-gradient-to-tl from-[#00C49A]/45 to-transparent" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#00C49A] relative z-10" />
                </div>

                <div>
                  <div className="text-xs text-slate-400">Local Socket Endpoint</div>
                  <div className="font-mono text-sm font-bold text-white mt-0.5">{localSocketIp}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {socketConnected ? 'Streaming 30Hz LAN packets' : 'Listening on local subnet'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSocketConnected((s) => !s)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2"
              >
                {socketConnected ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Disconnect Local Socket</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-[#00C49A]" />
                    <span>Pair Local Socket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Local Persistence Card */}
        <div className="lg:col-span-5 bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  OFFLINE-FIRST LOCAL PERSISTENCE
                </h3>
                <p className="text-base font-bold font-mono text-[#F59E0B] mt-0.5">
                  {queuedRecords.length} records queued
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#0F172A] p-3.5 rounded-xl border border-slate-800">
              Telemetry checkpoints buffer automatically in browser storage when offline and flush cleanly to MongoDB Atlas on sync.
            </p>
          </div>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="w-full py-3 px-4 rounded-xl bg-[#00C49A] hover:bg-[#00b08a] text-[#0B1120] font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <RefreshCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Records...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Profile Settings & Privacy Shield */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-6 space-y-6">
          {/* User Card */}
          <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#00C49A]/20 border border-[#00C49A]/40 flex items-center justify-center text-[#00C49A]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{prefs.displayName}</h3>
              <p className="text-xs font-mono text-slate-400">{prefs.email}</p>
            </div>
          </div>

          {/* Custom Sliders */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-[#00C49A]" />
              <span>Wellness Targets</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200">Daily Movement Goal</span>
                <span className="font-mono font-bold text-[#00C49A]">
                  {prefs.dailyMovementGoalMins} mins
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={120}
                step={5}
                value={prefs.dailyMovementGoalMins}
                onChange={(e) =>
                  onUpdatePrefs({ ...prefs, dailyMovementGoalMins: Number(e.target.value) })
                }
                className="w-full h-2 bg-[#0F172A] rounded-lg appearance-none cursor-pointer accent-[#00C49A]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200">Eye Comfort Interval</span>
                <span className="font-mono font-bold text-[#00C49A]">
                  {prefs.eyeComfortIntervalMins} mins
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={prefs.eyeComfortIntervalMins}
                onChange={(e) =>
                  onUpdatePrefs({ ...prefs, eyeComfortIntervalMins: Number(e.target.value) })
                }
                className="w-full h-2 bg-[#0F172A] rounded-lg appearance-none cursor-pointer accent-[#00C49A]"
              />
            </div>
          </div>
        </div>

        {/* Privacy Shield + Data Management */}
        <div className="lg:col-span-5 space-y-6">
          {/* Zero-Cloud Video Processing Privacy Shield */}
          <div className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00C49A]/15 border border-[#00C49A]/30 flex items-center justify-center text-[#00C49A]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Zero-Cloud Video Processing</h4>
                <span className="text-xs text-[#00C49A] font-medium">On-Device Edge Privacy</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Raw webcam frames remain strictly inside browser memory. Only numeric posture coordinates and ErgoScore telemetry are transmitted.
            </p>
          </div>

          {/* Data Management */}
          <div className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2">
              Data Management
            </div>

            <button
              onClick={handleExportJson}
              className="w-full p-3.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs font-semibold text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-[#00C49A]" />
                Export Personal ErgoSense Data (JSON)
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full p-3.5 rounded-xl bg-[#0F172A] hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 flex items-center justify-between text-xs font-semibold text-rose-400 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4" />
                  Clear Local Data
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2.5">
                <p className="text-xs text-rose-200">
                  Erase local queued records and reset preferences?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearLocalData}
                    className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                  >
                    Confirm Clear
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-4 py-2 rounded-lg bg-[#0F172A] text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
