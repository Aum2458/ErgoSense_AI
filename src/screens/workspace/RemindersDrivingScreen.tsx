import React, { useState } from 'react';
import { 
  Bell, 
  Car, 
  Volume2, 
  VolumeX, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Play, 
  Lock, 
  AlertTriangle 
} from 'lucide-react';
import { VoiceAssistant } from '../../lib/speech.ts';

interface RemindersDrivingScreenProps {
  onStartMicroBreak: () => void;
}

export const RemindersDrivingScreen: React.FC<RemindersDrivingScreenProps> = ({ onStartMicroBreak }) => {
  // Context-aware notification parameters
  const [persistenceThresholdSec, setPersistenceThresholdSec] = useState<number>(30); // 15s to 60s
  const [cooldownHysteresisMins, setCooldownHysteresisMins] = useState<number>(3); // 3 to 20 mins
  const [staticBreakIntervalMins, setStaticBreakIntervalMins] = useState<number>(40); // 30 to 60 mins

  // Delivery toggles
  const [desktopNotifs, setDesktopNotifs] = useState<boolean>(true);
  const [audioChime, setAudioChime] = useState<boolean>(true);
  const [visualToast, setVisualToast] = useState<boolean>(true);

  // Driving Safe Mode
  const [isDrivingModeActive, setIsDrivingModeActive] = useState<boolean>(false);
  const [drivingAudioIntervalMins, setDrivingAudioIntervalMins] = useState<number>(60);

  // Pre-drive checklist
  const [preDriveChecklist, setPreDriveChecklist] = useState({
    headrestGap: true,
    lumbarSupport: true,
    kneeAngle: false,
    mirrorHeight: true,
    steeringWristReach: false,
  });

  const toggleChecklistItem = (key: keyof typeof preDriveChecklist) => {
    setPreDriveChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestChime = () => {
    VoiceAssistant.playChime('subtle_nudge');
  };

  const requestDesktopPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setDesktopNotifs(perm === 'granted');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider font-mono">
          Contextual Support
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Smart Reminders & Driving Safe Mode
        </h1>
        <p className="text-xs text-slate-400">
          Configure temporal persistence thresholds and ensure road safety with camera-locked audio breaks.
        </p>
      </div>

      {/* 1. Context-Aware Notification Parameters */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#2DD4BF]" />
            <h2 className="text-base font-bold text-white">Smart Reminder Timing & Cooldowns</h2>
          </div>
          <button
            onClick={handleTestChime}
            className="px-3 py-1.5 bg-[#0B1120] hover:bg-slate-800 text-[#2DD4BF] border border-teal-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Chime</span>
          </button>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Persistence Threshold */}
          <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Temporal Persistence:</span>
              <span className="font-mono text-[#2DD4BF] font-bold">{persistenceThresholdSec}s</span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              value={persistenceThresholdSec}
              onChange={(e) => setPersistenceThresholdSec(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
            />
            <span className="text-[10px] text-slate-500 block leading-tight">
              Suppresses alerts for reaches under {persistenceThresholdSec}s to preserve flow.
            </span>
          </div>

          {/* Cooldown Hysteresis */}
          <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Alert Cooldown Hysteresis:</span>
              <span className="font-mono text-[#38BDF8] font-bold">{cooldownHysteresisMins} mins</span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              value={cooldownHysteresisMins}
              onChange={(e) => setCooldownHysteresisMins(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
            <span className="text-[10px] text-slate-500 block leading-tight">
              Guarantees zero repeat nudges within {cooldownHysteresisMins} minutes of an alert.
            </span>
          </div>

          {/* Static Break Interval */}
          <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Static Immobility Interval:</span>
              <span className="font-mono text-emerald-400 font-bold">{staticBreakIntervalMins} mins</span>
            </div>
            <input
              type="range"
              min="30"
              max="60"
              value={staticBreakIntervalMins}
              onChange={(e) => setStaticBreakIntervalMins(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block leading-tight">
              Prompts a 60s micro-break after {staticBreakIntervalMins} continuous static minutes.
            </span>
          </div>
        </div>

        {/* Delivery Channels */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Delivery Channels:</span>
          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={desktopNotifs}
              onChange={requestDesktopPermission}
              className="accent-[#0D9488] rounded"
            />
            <span>Browser Desktop Notifications</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={audioChime}
              onChange={(e) => setAudioChime(e.target.checked)}
              className="accent-[#0D9488] rounded"
            />
            <span>Subtle Web Audio Chime</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={visualToast}
              onChange={(e) => setVisualToast(e.target.checked)}
              className="accent-[#0D9488] rounded"
            />
            <span>In-App Visual Toast</span>
          </label>
        </div>
      </div>

      {/* 2. Driving Safe Mode Controller */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-[#38BDF8]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Driving Safe Mode Controller</h2>
              <span className="text-xs text-slate-400">Strict road distraction prevention policy</span>
            </div>
          </div>

          <button
            onClick={() => setIsDrivingModeActive(!isDrivingModeActive)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isDrivingModeActive
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-[#0D9488] hover:bg-[#0f766e] text-white shadow-md'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isDrivingModeActive ? 'Disengage Driving Lock' : 'Engage Driving Safe Mode'}</span>
          </button>
        </div>

        {/* Lock Notice Banner */}
        {isDrivingModeActive ? (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>STRICT DRIVING SAFETY LOCK ENGAGED</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              All visual popups and camera tracking are completely locked to prevent driver distraction. Safe, calm voice prompts will sound every {drivingAudioIntervalMins} minutes reminding you to perform shoulder blade retractions and plan rest stops.
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 leading-relaxed">
            When driving, visual screen notifications are illegal and hazardous. Engaging Driving Safe Mode completely deactivates webcam processing and delivers non-distracting audio breaks.
          </p>
        )}

        {/* Pre-Drive Ergonomic Seating Checklist */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
            Pre-Drive Ergonomic Seating Checklist (Tap to Verify):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <button
              onClick={() => toggleChecklistItem('headrestGap')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                preDriveChecklist.headrestGap ? 'bg-[#0D9488]/15 border-[#2DD4BF] text-white' : 'bg-[#0B1120] border-slate-800 text-slate-400'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${preDriveChecklist.headrestGap ? 'text-[#2DD4BF]' : 'text-slate-600'}`} />
              <div>
                <span className="font-semibold block">Headrest Gap &lt; 2 Inches</span>
                <span className="text-[10px] text-slate-400">Centers back of head to absorb sudden impact</span>
              </div>
            </button>

            <button
              onClick={() => toggleChecklistItem('lumbarSupport')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                preDriveChecklist.lumbarSupport ? 'bg-[#0D9488]/15 border-[#2DD4BF] text-white' : 'bg-[#0B1120] border-slate-800 text-slate-400'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${preDriveChecklist.lumbarSupport ? 'text-[#2DD4BF]' : 'text-slate-600'}`} />
              <div>
                <span className="font-semibold block">Lumbar Support Filled</span>
                <span className="text-[10px] text-slate-400">Maintains natural inward lordotic lumbar arch</span>
              </div>
            </button>

            <button
              onClick={() => toggleChecklistItem('kneeAngle')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                preDriveChecklist.kneeAngle ? 'bg-[#0D9488]/15 border-[#2DD4BF] text-white' : 'bg-[#0B1120] border-slate-800 text-slate-400'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${preDriveChecklist.kneeAngle ? 'text-[#2DD4BF]' : 'text-slate-600'}`} />
              <div>
                <span className="font-semibold block">Knee Slight Bend (120°)</span>
                <span className="text-[10px] text-slate-400">Pedals fully depressed without knee hyperextension</span>
              </div>
            </button>

            <button
              onClick={() => toggleChecklistItem('mirrorHeight')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                preDriveChecklist.mirrorHeight ? 'bg-[#0D9488]/15 border-[#2DD4BF] text-white' : 'bg-[#0B1120] border-slate-800 text-slate-400'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${preDriveChecklist.mirrorHeight ? 'text-[#2DD4BF]' : 'text-slate-600'}`} />
              <div>
                <span className="font-semibold block">Rearview Set to Upright Posture</span>
                <span className="text-[10px] text-slate-400">Slouching immediately impairs mirror vision</span>
              </div>
            </button>

            <button
              onClick={() => toggleChecklistItem('steeringWristReach')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                preDriveChecklist.steeringWristReach ? 'bg-[#0D9488]/15 border-[#2DD4BF] text-white' : 'bg-[#0B1120] border-slate-800 text-slate-400'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${preDriveChecklist.steeringWristReach ? 'text-[#2DD4BF]' : 'text-slate-600'}`} />
              <div>
                <span className="font-semibold block">Wrists Rest Atop Steering Wheel</span>
                <span className="text-[10px] text-slate-400">Shoulders remain flush with seat back</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
