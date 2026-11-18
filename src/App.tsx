import React, { useEffect, useRef, useState } from 'react';
import { X, Activity } from 'lucide-react';
import { AppRoutePath, DashboardShell } from './components/DashboardShell.tsx';
import { HomeDashboard } from './screens/dashboard/HomeDashboard.tsx';
import { LiveMonitorPage } from './screens/dashboard/LiveMonitorPage.tsx';
import { FitnessRecoveryPage } from './screens/dashboard/FitnessRecoveryPage.tsx';
import { AnalyticsPage } from './screens/dashboard/AnalyticsPage.tsx';
import { DevicesProfilePage } from './screens/dashboard/DevicesProfilePage.tsx';
import {
  DEFAULT_TELEMETRY,
  LiveTelemetry,
  UserPreferences,
  loadUserPreferences,
  postTelemetryUpdate,
  saveUserPreferences,
  subscribeToErgoSenseChannel,
} from './services/telemetryClient.ts';

function resolveRoutePath(pathname: string): AppRoutePath {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/monitor') return '/monitor';
  if (normalized === '/fitness-recovery') return '/fitness-recovery';
  if (normalized === '/analytics') return '/analytics';
  if (normalized === '/devices') return '/devices';
  return '/';
}

const TEST_PACKETS: Partial<LiveTelemetry>[] = [
  {
    neckFlexion: 11.8,
    shoulderTilt: 0.9,
    torsoLean: 3.1,
    proximity: 58,
    ambientLight: 72,
    deviceTilt: { pitch: 12, roll: 1 },
    blinkRate: 19,
    fatigueIndex: 16,
    alertMessage: '',
  },
  {
    neckFlexion: 22.4,
    shoulderTilt: 1.8,
    torsoLean: 7.4,
    proximity: 45,
    ambientLight: 61,
    deviceTilt: { pitch: 18, roll: 2 },
    blinkRate: 14,
    fatigueIndex: 31,
    alertMessage: 'Forward head tilt detected. Tuck your chin slightly and align ears over shoulders.',
  },
  {
    neckFlexion: 17.6,
    shoulderTilt: 4.8,
    torsoLean: 5.2,
    proximity: 53,
    ambientLight: 66,
    deviceTilt: { pitch: 15, roll: 5 },
    blinkRate: 17,
    fatigueIndex: 25,
    alertMessage: 'Uneven shoulders detected. Drop your high shoulder and balance your weight.',
  },
];

export default function App() {
  const [currentPath, setCurrentPath] = useState<AppRoutePath>(() =>
    typeof window !== 'undefined' ? resolveRoutePath(window.location.pathname) : '/'
  );
  const [telemetry, setTelemetry] = useState<LiveTelemetry>(DEFAULT_TELEMETRY);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadUserPreferences());
  const [inAppPiPOpen, setInAppPiPOpen] = useState(false);

  const packetIdxRef = useRef(0);
  const pipWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(resolveRoutePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToErgoSenseChannel(
      (incoming) => {
        setTelemetry(incoming);
      },
      (status) => {
        setConnectionStatus(status);
      }
    );
    return () => unsubscribe();
  }, []);

  // Keep external Document Picture-in-Picture window synced with live telemetry
  useEffect(() => {
    const pipWin = pipWindowRef.current;
    if (!pipWin || pipWin.closed) return;

    const scoreEl = pipWin.document.getElementById('pip-ergoscore');
    const neckEl = pipWin.document.getElementById('pip-neck');
    const shEl = pipWin.document.getElementById('pip-shoulder');
    const proxEl = pipWin.document.getElementById('pip-proximity');

    if (scoreEl) scoreEl.textContent = String(telemetry.ergoScore);
    if (neckEl) neckEl.textContent = `${telemetry.neckFlexion.toFixed(1)}°`;
    if (shEl) shEl.textContent = `${Math.abs(telemetry.shoulderTilt).toFixed(1)}°`;
    if (proxEl) proxEl.textContent = `${telemetry.proximity.toFixed(0)} cm`;
  }, [telemetry]);

  const handleNavigate = (path: AppRoutePath) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdatePrefs = (next: UserPreferences) => {
    setPrefs(next);
    saveUserPreferences(next);
  };

  const handleToggleGuardian = (next: boolean) => {
    handleUpdatePrefs({ ...prefs, backgroundGuardian: next });
  };

  const handleCalibrateBaseline = (baseline: {
    neckFlexion: number;
    shoulderTilt: number;
    torsoLean: number;
  }) => {
    handleUpdatePrefs({
      ...prefs,
      baseline: {
        ...baseline,
        calibratedAt: new Date().toISOString(),
      },
    });
  };

  const handleSendTestPayload = async () => {
    const payload = TEST_PACKETS[packetIdxRef.current % TEST_PACKETS.length];
    packetIdxRef.current += 1;
    try {
      const updated = await postTelemetryUpdate(payload);
      setTelemetry(updated);
    } catch (err) {
      console.warn('Edge packet dispatch fallback:', err);
    }
  };

  const handleOpenPiP = async () => {
    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      try {
        const pipWin: Window = await (window as any).documentPictureInPicture.requestWindow({
          width: 320,
          height: 220,
        });
        pipWindowRef.current = pipWin;

        const container = pipWin.document.createElement('div');
        container.style.cssText =
          'background:#0B1120;color:#F8FAFC;font-family:system-ui,sans-serif;height:100vh;box-sizing:border-box;padding:16px;display:flex;flex-direction:column;justify-content:space-between;';
        container.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1E293B;padding-bottom:8px;">
            <span style="font-size:11px;font-weight:700;letter-spacing:0.06em;color:#00C49A;">ERGOSENSE HUD</span>
            <span style="font-size:10px;font-family:monospace;color:#94A3B8;">LIVE</span>
          </div>
          <div style="display:flex;align-items:baseline;justify-content:center;gap:8px;padding:12px 0;">
            <span id="pip-ergoscore" style="font-size:44px;font-weight:800;font-family:monospace;color:#00C49A;">${telemetry.ergoScore}</span>
            <span style="font-size:11px;color:#94A3B8;font-weight:600;">ERGOSCORE</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:#0F172A;border:1px solid #1E293B;border-radius:10px;padding:8px;font-family:monospace;font-size:11px;text-align:center;">
            <div><div style="color:#64748B;font-size:9px;">NECK</div><div id="pip-neck" style="font-weight:700;">${telemetry.neckFlexion.toFixed(1)}°</div></div>
            <div><div style="color:#64748B;font-size:9px;">TILT</div><div id="pip-shoulder" style="font-weight:700;">${Math.abs(telemetry.shoulderTilt).toFixed(1)}°</div></div>
            <div><div style="color:#64748B;font-size:9px;">DIST</div><div id="pip-proximity" style="font-weight:700;">${telemetry.proximity.toFixed(0)} cm</div></div>
          </div>
        `;
        pipWin.document.body.style.margin = '0';
        pipWin.document.body.appendChild(container);
        pipWin.addEventListener('pagehide', () => {
          pipWindowRef.current = null;
        });
        return;
      } catch {
        // Fall through to in-app floating PiP HUD
      }
    }

    setInAppPiPOpen((prev) => !prev);
  };

  return (
    <>
      <DashboardShell
        currentPath={currentPath}
        onNavigate={handleNavigate}
        connectionStatus={connectionStatus}
        onSendTestPayload={handleSendTestPayload}
      >
        {currentPath === '/' && (
          <HomeDashboard
            telemetry={telemetry}
            backgroundGuardian={prefs.backgroundGuardian}
            onToggleGuardian={handleToggleGuardian}
            onOpenPiP={handleOpenPiP}
            onNavigate={handleNavigate}
          />
        )}

        {currentPath === '/monitor' && (
          <LiveMonitorPage
            telemetry={telemetry}
            prefs={prefs}
            onCalibrateBaseline={handleCalibrateBaseline}
          />
        )}

        {currentPath === '/fitness-recovery' && <FitnessRecoveryPage />}

        {currentPath === '/analytics' && <AnalyticsPage />}

        {currentPath === '/devices' && (
          <DevicesProfilePage prefs={prefs} onUpdatePrefs={handleUpdatePrefs} />
        )}
      </DashboardShell>

      {/* In-App Floating PiP Window Fallback */}
      {inAppPiPOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-72 bg-[#0F172A]/95 border border-[#00C49A]/60 rounded-2xl shadow-2xl backdrop-blur-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00C49A]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                Floating PiP HUD
              </span>
            </div>
            <button
              onClick={() => setInAppPiPOpen(false)}
              aria-label="Close PiP window"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline justify-between px-1">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                ERGOSCORE
              </div>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-[#00C49A]">
                {telemetry.ergoScore}
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                telemetry.status === 'optimal'
                  ? 'bg-[#00C49A]/15 text-[#00C49A]'
                  : 'bg-[#F59E0B]/15 text-[#F59E0B]'
              }`}
            >
              {telemetry.status === 'optimal' ? 'Optimal' : 'Adjust'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center bg-[#0B1120] border border-[#1E293B] rounded-xl p-2.5 font-mono tabular-nums">
            <div>
              <div className="text-[10px] text-slate-500">NECK</div>
              <div className="text-xs font-bold text-slate-100">{telemetry.neckFlexion.toFixed(1)}°</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">TILT</div>
              <div className="text-xs font-bold text-slate-100">
                {Math.abs(telemetry.shoulderTilt).toFixed(1)}°
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">DIST</div>
              <div className="text-xs font-bold text-slate-100">{telemetry.proximity.toFixed(0)}cm</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
