import React, { useState, useEffect } from 'react';
import {
  Shield,
  ExternalLink,
  Smartphone,
  Sun,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Clock,
  Activity,
  Zap,
  Dumbbell,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { LiveTelemetry } from '../../services/telemetryClient.ts';
import { AppRoutePath } from '../../components/DashboardShell.tsx';

interface HomeDashboardProps {
  telemetry: LiveTelemetry;
  backgroundGuardian: boolean;
  onToggleGuardian: (next: boolean) => void;
  onOpenPiP: () => void;
  onNavigate: (path: AppRoutePath) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  telemetry,
  backgroundGuardian,
  onToggleGuardian,
  onOpenPiP,
  onNavigate,
}) => {
  const [quickModal, setQuickModal] = useState<{ title: string; totalSec: number; cues: string[] } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!quickModal || secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [quickModal, secondsLeft]);

  const startQuickAction = (type: 'reset' | 'workout') => {
    if (type === 'reset') {
      setQuickModal({
        title: 'Quick Reset (2-Min)',
        totalSec: 120,
        cues: [
          'Sit tall and drop your shoulders away from your ears.',
          'Perform 5 slow chin retractions holding 3 seconds each.',
          'Look 20 feet away to relax ocular ciliary muscles.',
        ],
      });
      setSecondsLeft(120);
    } else {
      setQuickModal({
        title: 'Desk Workout (5-Min)',
        totalSec: 300,
        cues: [
          'Stand and execute 10 thoracic overhead reaches.',
          'Perform 8 scapular wall angels against a flat surface.',
          'Stretch wrist flexors and extensors for 20 seconds per side.',
        ],
      });
      setSecondsLeft(300);
    }
  };

  const score = telemetry.ergoScore ?? 78;
  const scoreLabel = score >= 85 ? 'Optimal' : score >= 70 ? 'Good' : score >= 55 ? 'Fair' : 'Needs Focus';
  const scoreColor = score >= 70 ? '#00C49A' : '#F59E0B';

  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);

  const isPostureWarn = telemetry.neckFlexion > 15 || Math.abs(telemetry.shoulderTilt) >= 3 || telemetry.torsoLean > 6;
  const isDistanceClose = telemetry.proximity < 48;

  const formattedClock = `${Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Hero Grid: Circular ERGOSCORE Gauge + Background Guardian Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Large Teal Circular Progress Gauge */}
        <div className="lg:col-span-7 bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="210" height="210" className="-rotate-90">
              <circle
                cx="105"
                cy="105"
                r={radius}
                stroke="#0F172A"
                strokeWidth="14"
                fill="transparent"
              />
              <circle
                cx="105"
                cy="105"
                r={radius}
                stroke={scoreColor}
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                ERGOSCORE
              </span>
              <span className="text-5xl font-extrabold font-mono tabular-nums text-white mt-1">
                {score}
              </span>
              <span
                className="text-xs font-bold mt-1"
                style={{ color: scoreColor }}
              >
                {scoreLabel}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <h2 className="text-lg font-bold text-white">Live Posture Index</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Aggregated from sagittal neck flexion, shoulder symmetry, torso alignment, and screen distance telemetry.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800">
                <span className="text-slate-400 block">Neck Flexion</span>
                <span className={`font-mono tabular-nums text-base font-bold ${telemetry.neckFlexion > 15 ? 'text-[#F59E0B]' : 'text-[#00C49A]'}`}>
                  {telemetry.neckFlexion.toFixed(1)}°
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800">
                <span className="text-slate-400 block">Shoulder Tilt</span>
                <span className={`font-mono tabular-nums text-base font-bold ${Math.abs(telemetry.shoulderTilt) >= 3.5 ? 'text-[#F59E0B]' : 'text-[#00C49A]'}`}>
                  {telemetry.shoulderTilt.toFixed(1)}°
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/monitor')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-[#00C49A]" />
              <span>Open Live AI Monitor</span>
            </button>
          </div>
        </div>

        {/* Background Guardian Card */}
        <div className="lg:col-span-5 bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C49A]/15 border border-[#00C49A]/30 flex items-center justify-center text-[#00C49A]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Background Guardian</h3>
                  <p className="text-xs text-slate-400">
                    {backgroundGuardian ? 'Active in background' : 'Paused in background'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={backgroundGuardian}
                onClick={() => onToggleGuardian(!backgroundGuardian)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  backgroundGuardian ? 'bg-[#00C49A]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                    backgroundGuardian ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#0F172A] p-3.5 rounded-xl border border-slate-800">
              {backgroundGuardian
                ? 'Background Guardian tracks continuous posture shifts over 30-second sliding windows and keeps your PiP monitor updated while you work in other windows.'
                : 'Background Guardian is paused. Enable to receive subtle alerts when forward cervical lean persists.'}
            </p>
          </div>

          <button
            onClick={onOpenPiP}
            className="w-full py-3 px-4 rounded-xl bg-[#00C49A] hover:bg-[#00b08a] text-[#0B1120] font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00C49A]/20 active:scale-[0.99]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Floating PiP Window</span>
          </button>
        </div>
      </div>

      {/* Live Sensor Feed (Pusher-connected) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-center text-[#00C49A]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Device Tilt</div>
            <div className="text-base font-bold font-mono tabular-nums text-white mt-0.5">
              {telemetry.deviceTilt.pitch}° P / {telemetry.deviceTilt.roll}° R
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-center text-[#F59E0B]">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Ambient Light</div>
            <div className="text-base font-bold font-mono tabular-nums text-white mt-0.5">
              {telemetry.ambientLight} lx
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-center text-[#00C49A]">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Proximity</div>
            <div className="text-base font-bold font-mono tabular-nums text-white mt-0.5">
              {telemetry.proximity.toFixed(0)} cm
            </div>
          </div>
        </div>
      </div>

      {/* Live Ergonomic Metrics Rows */}
      <div className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Live Ergonomic Metrics</h3>
          <span className="text-xs font-mono text-slate-400">Pusher Real-Time Feed</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {/* Row 1: Posture & Spine */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPostureWarn ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'bg-[#00C49A]/15 text-[#00C49A]'}`}>
                {isPostureWarn ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Posture &amp; Spine</div>
                <div className="text-xs font-mono tabular-nums text-slate-400">
                  Neck {telemetry.neckFlexion.toFixed(1)}° · Shoulder {telemetry.shoulderTilt.toFixed(1)}° · Torso {telemetry.torsoLean.toFixed(1)}°
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${isPostureWarn ? 'text-[#F59E0B]' : 'text-[#00C49A]'}`}>
              {isPostureWarn ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{isPostureWarn ? 'Adjustment Needed' : 'Optimal'}</span>
            </div>
          </div>

          {/* Row 2: Eye Comfort */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C49A]/15 text-[#00C49A] flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Eye Comfort</div>
                <div className="text-xs font-mono tabular-nums text-slate-400">
                  {telemetry.blinkRate} blinks/min · 20-20-20 timer active
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00C49A]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Optimal</span>
            </div>
          </div>

          {/* Row 3: Screen Distance */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDistanceClose ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'bg-[#00C49A]/15 text-[#00C49A]'}`}>
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Screen Distance</div>
                <div className="text-xs font-mono tabular-nums text-slate-400">
                  ~{telemetry.proximity.toFixed(0)} cm (Target 50–70 cm)
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDistanceClose ? 'text-[#F59E0B]' : 'text-[#00C49A]'}`}>
              {isDistanceClose ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{isDistanceClose ? 'Too Close' : 'Safe Range'}</span>
            </div>
          </div>

          {/* Row 4: Fatigue & Sitting Duration */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C49A]/15 text-[#00C49A] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Fatigue &amp; Sitting Duration</div>
                <div className="text-xs font-mono tabular-nums text-slate-400">
                  34 mins continuous · {telemetry.fatigueIndex}% strain load
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00C49A]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Low Fatigue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions: Two half-width buttons side-by-side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => startQuickAction('reset')}
          className="w-full py-4 px-5 rounded-2xl bg-[#1E293B] hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2.5"
        >
          <Zap className="w-4 h-4 text-[#00C49A]" />
          <span>Quick Reset (2-Min)</span>
        </button>

        <button
          onClick={() => startQuickAction('workout')}
          className="w-full py-4 px-5 rounded-2xl bg-[#00C49A] hover:bg-[#00b08a] text-[#0B1120] font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#00C49A]/15"
        >
          <Dumbbell className="w-4 h-4" />
          <span>Desk Workout (5-Min)</span>
        </button>
      </div>

      {/* Guided Quick Action Timer Modal */}
      {quickModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">{quickModal.title}</h3>
              <button
                onClick={() => setQuickModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 rounded-xl bg-[#0B1120] border border-[#1E293B] text-center">
              <div className="text-5xl font-extrabold font-mono tabular-nums text-[#00C49A]">
                {formattedClock}
              </div>
              <div className="text-xs text-slate-400 mt-1">Guided Recovery Timer</div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              {quickModal.cues.map((cue, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#1E293B]/50">
                  <span className="font-mono text-[#00C49A] font-bold">0{idx + 1}.</span>
                  <span>{cue}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSecondsLeft(quickModal.totalSec)}
                className="px-4 py-2.5 rounded-xl bg-[#1E293B] text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={() => setQuickModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#00C49A] text-[#0B1120] text-xs font-bold"
              >
                Complete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
