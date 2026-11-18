import React, { useState } from 'react';
import { ErgoScoreGauge } from '../components/ErgoScoreGauge.tsx';
import { TelemetryPayload } from '../types/ergosense.ts';
import { 
  Shield, 
  Pipette, 
  ExternalLink, 
  Smartphone, 
  Sun, 
  Ruler, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Clock, 
  Zap, 
  Play, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';

interface HomeScreenProps {
  telemetry: TelemetryPayload;
  onOpenLiveMonitor: () => void;
  onOpenPiP: () => void;
  onOpenSimulator: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  telemetry,
  onOpenLiveMonitor,
  onOpenPiP,
  onOpenSimulator,
}) => {
  const [guardianActive, setGuardianActive] = useState<boolean>(true);

  const ergoScore = telemetry.ergoScore ?? 72;
  const neckAngle = telemetry.cervicalTiltDeg ?? 29.0;
  const proximity = telemetry.proximityCm ?? 49.0;
  const fatigueIndex = telemetry.fatigueIndex ?? 20;
  const ambientLight = telemetry.ambientLightLux ?? 60;
  const pitch = telemetry.headPitchDeg ?? 14.0;
  const roll = telemetry.headRollDeg ?? 7.0;

  // Posture status calculation
  const isNeckAlert = neckAngle > 24;
  const isNeckAttention = neckAngle >= 15 && neckAngle <= 24;
  const postureStatusText = isNeckAlert ? 'Needs Correction' : isNeckAttention ? 'Attention' : 'Optimal';
  const postureStatusColor = isNeckAlert ? 'rose' : isNeckAttention ? 'amber' : 'emerald';

  // Eye comfort calculation
  const eyeStatusText = telemetry.blinkRatePerMin && telemetry.blinkRatePerMin < 15 ? 'Attention' : 'Good';
  const eyeStatusColor = eyeStatusText === 'Attention' ? 'amber' : 'emerald';

  // Screen distance calculation
  const isClose = proximity < 45;
  const distanceStatusText = isClose ? 'Close' : 'Safe';
  const distanceStatusColor = isClose ? 'amber' : 'emerald';

  // Fatigue calculation
  const fatigueStatusText = fatigueIndex > 50 ? 'High Strain' : 'Low Fatigue';
  const fatigueStatusColor = fatigueIndex > 50 ? 'rose' : 'emerald';

  // Guidance string
  let guidanceText = 'Posture aligns with ergonomic benchmark. Maintain gaze angle and spinal curvature.';
  if (isNeckAlert) {
    guidanceText = 'Forward head tilt detected. Lift chin slightly and align ears over shoulders to decompress cervical discs.';
  } else if (isClose) {
    guidanceText = 'Display distance too close (~49 cm). Push screen back to at least 50–70 cm to prevent ciliary muscle strain.';
  } else if (fatigueIndex > 40) {
    guidanceText = 'Visual fatigue accumulating. Perform 20-20-20 rule gaze shift or initiate a 90-second Cervical Reset.';
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ErgoSense <span className="text-[#00BFA5]">AI</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Twin Sync Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-Time Telemetry &amp; Ergonomic Intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSimulator}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#131E33] hover:bg-[#1E293B] text-teal-400 border border-teal-500/30 transition-all flex items-center gap-1.5"
          >
            <span>Android Sensor Stream</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Hero Section & Background Guardian */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* HERO SECTION: Glowing half-circle ErgoScore ring (col-span-7) */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle radial ambient backdrop */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#00BFA5]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00BFA5]" />
              Holistic Biometric Posture Index
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Live TrueDepth Sensor
            </span>
          </div>

          {/* Half Circle Ring */}
          <div className="my-2 flex justify-center items-center py-2">
            <ErgoScoreGauge score={ergoScore} size={280} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1E293B]/70 text-center">
            <div className="p-2 rounded-lg bg-[#0B1120]/60 border border-[#1E293B]/40">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Spine Health</div>
              <div className="text-sm font-bold text-teal-400 font-mono mt-0.5">88%</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0B1120]/60 border border-[#1E293B]/40">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Eye Comfort</div>
              <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">92%</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0B1120]/60 border border-[#1E293B]/40">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Rest Rhythm</div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">74%</div>
            </div>
          </div>
        </div>

        {/* BACKGROUND GUARDIAN CARD (col-span-5) */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-950/80 text-[#00BFA5] border border-teal-500/30">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Background Posture Guardian</h3>
                  <p className="text-[11px] text-slate-400">Sub-40ms background telemetry analysis</p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => setGuardianActive(!guardianActive)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  guardianActive ? 'bg-[#00BFA5]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    guardianActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-[#0B1120] p-3 rounded-xl border border-[#1E293B]">
              {guardianActive
                ? 'Guardian is actively monitoring sagittal cervical deviation in background. Phone haptic pulse triggers if slouch persists > 15s.'
                : 'Guardian is currently paused. Live background alerts and Android haptic buzz triggers are suspended.'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onOpenPiP}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#131E33] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#00BFA5]" />
              <span>Floating PiP Window</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Haptic Threshold: 20° tilt</span>
              <span className="text-teal-400 font-mono">Synced to Pixel 8 Pro</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE HARDWARE SENSORS: 3 Horizontal Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pill 1: Device Tilt */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-3.5 flex items-center gap-3 shadow-md">
          <div className="p-2.5 rounded-lg bg-[#0B1120] text-[#00BFA5] border border-[#1E293B]">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Device Tilt
            </div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">
              {pitch.toFixed(0)}° P / {roll.toFixed(0)}° R
            </div>
          </div>
        </div>

        {/* Pill 2: Ambient Light */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-3.5 flex items-center gap-3 shadow-md">
          <div className="p-2.5 rounded-lg bg-[#0B1120] text-[#F59E0B] border border-[#1E293B]">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Ambient Light
            </div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">
              {ambientLight} lx <span className="text-[11px] font-normal text-amber-400">(Low Light)</span>
            </div>
          </div>
        </div>

        {/* Pill 3: Proximity */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-3.5 flex items-center gap-3 shadow-md">
          <div className="p-2.5 rounded-lg bg-[#0B1120] text-[#06B6D4] border border-[#1E293B]">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Display Proximity
            </div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">
              {proximity.toFixed(1)} cm <span className="text-[11px] font-normal text-cyan-400">(TrueDepth)</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE ERGONOMIC METRICS LIST */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#00BFA5]" />
          Live Ergonomic Biometric Telemetry
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Metric 1: Posture & Spine */}
          <div className="bg-[#131E33] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0B1120] text-teal-400 border border-[#1E293B]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Posture &amp; Spine</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Neck {neckAngle.toFixed(0)}°, Shoulder 1°, Lean 1°
                </div>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                postureStatusColor === 'rose'
                  ? 'bg-rose-950/80 text-rose-400 border-rose-500/40'
                  : postureStatusColor === 'amber'
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {postureStatusText}
            </span>
          </div>

          {/* Metric 2: Eye Comfort */}
          <div className="bg-[#131E33] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0B1120] text-cyan-400 border border-[#1E293B]">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Eye Comfort</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  20-20-20 active, {telemetry.blinkRatePerMin ?? 18} blinks/min
                </div>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                eyeStatusColor === 'amber'
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {eyeStatusText}
            </span>
          </div>

          {/* Metric 3: Screen Distance */}
          <div className="bg-[#131E33] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0B1120] text-[#00BFA5] border border-[#1E293B]">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Screen Distance</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  ~{proximity.toFixed(0)} cm (optimal: 50–70cm)
                </div>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                distanceStatusColor === 'amber'
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {distanceStatusText}
            </span>
          </div>

          {/* Metric 4: Fatigue & Sitting Duration */}
          <div className="bg-[#131E33] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0B1120] text-emerald-400 border border-[#1E293B]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Fatigue &amp; Sitting Duration</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  42 mins continuous • {fatigueIndex}% load
                </div>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                fatigueStatusColor === 'rose'
                  ? 'bg-rose-950/80 text-rose-400 border-rose-500/40'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {fatigueStatusText}
            </span>
          </div>
        </div>
      </div>

      {/* LIVE POSTURE GUIDANCE CARD */}
      <div className="bg-gradient-to-r from-[#131E33] via-[#0F172A] to-[#131E33] border border-[#1E293B] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-teal-950/80 text-[#00BFA5] border border-teal-500/40 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Biomechanical Guidance
            </h4>
            <p className="text-sm font-medium text-slate-100 mt-1 leading-relaxed">
              "{guidanceText}"
            </p>
          </div>
        </div>

        {/* Large Primary CTA */}
        <button
          onClick={onOpenLiveMonitor}
          className="w-full md:w-auto whitespace-nowrap py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#00BFA5] hover:bg-[#2DD4BF] text-[#0B1120] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>▶ Open Live AI Monitor</span>
        </button>
      </div>
    </div>
  );
};
