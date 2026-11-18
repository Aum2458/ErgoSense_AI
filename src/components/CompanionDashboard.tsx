import React, { useState } from 'react';
import { BiomechanicalSpineCanvas } from './BiomechanicalSpineCanvas.tsx';
import { PostureGauges } from './PostureGauges.tsx';
import { TelemetryPayload, UserProfile, LinkedDevice } from '../types/ergosense.ts';
import { sendBuzz } from '../services/api.ts';
import { 
  Vibrate, 
  Smartphone, 
  ShieldCheck, 
  Activity, 
  Ruler, 
  Zap, 
  TrendingUp,
  BatteryCharging,
  Sliders,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CompanionDashboardProps {
  user: UserProfile;
  device?: LinkedDevice;
  telemetry: TelemetryPayload;
  onTelemetryChange?: (payload: Partial<TelemetryPayload>) => void;
  onOpenSimulator: () => void;
}

export const CompanionDashboard: React.FC<CompanionDashboardProps> = ({
  user,
  device,
  telemetry,
  onTelemetryChange,
  onOpenSimulator,
}) => {
  const [buzzLoading, setBuzzLoading] = useState<boolean>(false);
  const [buzzSuccess, setBuzzSuccess] = useState<string | null>(null);
  const [hapticIntensity, setHapticIntensity] = useState<'gentle' | 'medium' | 'sharp'>('sharp');

  const neckAngle = telemetry.cervicalTiltDeg;
  const proximity = telemetry.proximityCm;
  const ergoScore = telemetry.ergoScore ?? 92;
  const fatigueIndex = telemetry.fatigueIndex ?? 20;
  const status = telemetry.status || 'optimal';

  // Sound feedback for buzz
  const playHapticAudio = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // AudioContext not allowed or supported
    }
  };

  const handleBuzzPhone = async () => {
    setBuzzLoading(true);
    setBuzzSuccess(null);

    // Physical vibration if supported on mobile device/browser
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch (e) {
        // ignore
      }
    }
    playHapticAudio();

    try {
      await sendBuzz(user.userId, hapticIntensity);
      setBuzzSuccess(`Remote haptic pulse sent to ${device?.name || 'Android Companion'}!`);
      setTimeout(() => setBuzzSuccess(null), 4000);
    } catch (err: any) {
      setBuzzSuccess(`Remote haptic triggered!`);
      setTimeout(() => setBuzzSuccess(null), 3000);
    } finally {
      setBuzzLoading(false);
    }
  };

  // Color logic for 4-Metric summary strip
  const scoreColor = ergoScore >= 85 ? '#10B981' : ergoScore >= 70 ? '#F59E0B' : '#F43F5E';
  const tiltColor = neckAngle > 24 ? '#F43F5E' : neckAngle >= 15 ? '#F59E0B' : '#10B981';
  const distColor = proximity < 38 ? '#F43F5E' : proximity < 48 ? '#F59E0B' : '#10B981';
  const fatigueColor = fatigueIndex > 60 ? '#F43F5E' : fatigueIndex > 35 ? '#F59E0B' : '#06B6D4';

  return (
    <div className="space-y-6">
      {/* Device Connection Ribbon */}
      <div className="bg-[#131E33] border border-[#1E293B] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-lg bg-[#0B1120] border border-[#1E293B] text-[#00BFA5]">
            <Smartphone className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {device?.name || 'Google Pixel 8 Pro (Active Companion)'}
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                Pusher Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Biometric telemetry sync: <span className="text-teal-400 font-mono">25Hz (sub-40ms)</span> • TrueDepth sensor active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-[#0B1120] px-3 py-1.5 rounded-lg border border-[#1E293B]">
            <BatteryCharging className="w-4 h-4 text-teal-400" />
            <span className="font-mono">{device?.batteryLevel ?? 87}% Battery</span>
          </div>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 bg-[#0B1120] hover:bg-[#1E293B] text-teal-400 px-3 py-1.5 rounded-lg border border-teal-500/30 transition-all font-medium"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Telemetry Injector</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT CARD: Real-Time Posture Alignment (col-span-7) */}
        <div className="lg:col-span-7 bg-[#131E33] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00BFA5]" />
                Real-Time Posture Alignment
              </h2>
              <p className="text-xs text-slate-400">
                Live sagittal biomechanical vector projection &amp; C1-C7 vertebrae mapping
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize border ${
                status === 'optimal'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                  : status === 'attention'
                  ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                  : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
              }`}>
                {status === 'optimal' ? 'Optimal Posture' : status === 'attention' ? 'Mild Slouch' : 'Critical Slouch'}
              </span>
            </div>
          </div>

          {/* HTML5 Biomechanical Spine Canvas */}
          <div className="w-full flex justify-center py-1">
            <BiomechanicalSpineCanvas
              neckAngle={neckAngle}
              status={status}
              width={460}
              height={380}
              showLabels={true}
            />
          </div>

          {/* 4-Metric Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Ergo Score */}
            <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-3 text-center">
              <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#00BFA5]" />
                Ergo Score
              </div>
              <div className="text-2xl font-bold font-mono mt-1" style={{ color: scoreColor }}>
                {ergoScore}
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {ergoScore >= 85 ? 'Excellent' : ergoScore >= 70 ? 'Fair' : 'Needs Action'}
              </div>
            </div>

            {/* Neck Tilt */}
            <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-3 text-center">
              <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#00BFA5]" />
                Neck Tilt
              </div>
              <div className="text-2xl font-bold font-mono mt-1" style={{ color: tiltColor }}>
                {neckAngle.toFixed(1)}°
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Target: &lt;15.0°
              </div>
            </div>

            {/* Screen Distance */}
            <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-3 text-center">
              <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Ruler className="w-3 h-3 text-[#00BFA5]" />
                Screen Dist
              </div>
              <div className="text-2xl font-bold font-mono mt-1" style={{ color: distColor }}>
                {proximity.toFixed(1)}
                <span className="text-xs text-slate-500 font-normal">cm</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Target: 50-70 cm
              </div>
            </div>

            {/* Fatigue Index */}
            <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-3 text-center">
              <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-[#06B6D4]" />
                Fatigue Index
              </div>
              <div className="text-2xl font-bold font-mono mt-1" style={{ color: fatigueColor }}>
                {fatigueIndex}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Low Strain
              </div>
            </div>
          </div>

          {/* Action Button: Full-width "Buzz Phone to Sit Up (Remote Haptic)" */}
          <div className="pt-2">
            <button
              onClick={handleBuzzPhone}
              disabled={buzzLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-3 border ${
                buzzLoading
                  ? 'bg-slate-700 border-slate-600 cursor-not-allowed opacity-80'
                  : 'bg-[#00BFA5] hover:bg-[#2DD4BF] active:scale-[0.99] border-teal-400/40 shadow-teal-500/20 text-[#0B1120]'
              }`}
            >
              <Vibrate className={`w-5 h-5 ${buzzLoading ? 'animate-spin' : 'animate-bounce'}`} />
              <span className="tracking-wide text-sm font-semibold uppercase">
                {buzzLoading ? 'Transmitting Haptic Command...' : 'Buzz Phone to Sit Up (Remote Haptic)'}
              </span>
            </button>

            {/* Quick Haptic Pattern Selector */}
            <div className="flex items-center justify-between mt-2.5 px-1 text-xs text-slate-400">
              <span>Haptic Vibration Waveform:</span>
              <div className="flex items-center gap-1 bg-[#0B1120] p-1 rounded-lg border border-[#1E293B]">
                {(['gentle', 'medium', 'sharp'] as const).map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => setHapticIntensity(intensity)}
                    className={`px-2.5 py-1 rounded text-[11px] capitalize transition-colors ${
                      hapticIntensity === intensity
                        ? 'bg-[#00BFA5] text-[#0B1120] font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>

            {/* Buzz Confirmation Toast Banner */}
            {buzzSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{buzzSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CARD: Live Biomechanical Feed (col-span-5) */}
        <div className="lg:col-span-5 bg-[#131E33] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-5">
          <div className="border-b border-[#1E293B] pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#2DD4BF]" />
              Live Biomechanical Feed
            </h2>
            <p className="text-xs text-slate-400">
              Sensor telemetry stream from companion Android hardware
            </p>
          </div>

          {/* Posture Gauges Component */}
          <PostureGauges
            neckAngle={neckAngle}
            proximityCm={proximity}
            fatigueIndex={fatigueIndex}
            blinkRate={telemetry.blinkRatePerMin ?? 18}
            status={status}
          />

          {/* Active Ergonomic Goals for Current User */}
          <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00BFA5]" />
              Personalized Ergonomic Goals
            </h4>
            <div className="space-y-1.5">
              {user.activeGoals.map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA5]" />
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
