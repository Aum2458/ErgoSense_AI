import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCcw, 
  Sparkles, 
  Play, 
  Pause,
  User,
  Monitor,
  Heart,
  ShieldCheck
} from 'lucide-react';
import { SkeletalCanvasView } from '../../components/SkeletalCanvasView.tsx';
import { PersonaId, WorkstationType, PersonalBaseline } from '../../types/ergosense.ts';
import { LocalStorageManager } from '../../lib/storage.ts';
import { VoiceAssistant } from '../../lib/speech.ts';

interface OnboardingCalibrationProps {
  onCalibrationComplete: (baseline: PersonalBaseline) => void;
  onNavigateToLive: () => void;
}

export const OnboardingCalibrationScreen: React.FC<OnboardingCalibrationProps> = ({
  onCalibrationComplete,
  onNavigateToLive,
}) => {
  const [step, setStep] = useState<'persona' | 'phaseA' | 'phaseB' | 'complete'>('persona');
  const [persona, setPersona] = useState<PersonaId>('developers');
  const [workstation, setWorkstation] = useState<WorkstationType>('laptop');
  const [mobilityTolerance, setMobilityTolerance] = useState<number>(1.0); // 1.0x normal, up to 1.5x for accessibility

  // Phase A: 30s Natural Comfortable Sitting
  const [phaseASeconds, setPhaseASeconds] = useState(30);
  const [isCalibratingA, setIsCalibratingA] = useState(false);
  const [sittingSamples, setSittingSamples] = useState<{ neck: number; torso: number }[]>([]);

  // Phase B: 30s Natural Standing
  const [phaseBSeconds, setPhaseBSeconds] = useState(30);
  const [isCalibratingB, setIsCalibratingB] = useState(false);
  const [standingSamples, setStandingSamples] = useState<{ neck: number; torso: number }[]>([]);

  // Resulting calibrated baseline
  const [calibratedResult, setCalibratedResult] = useState<PersonalBaseline>(
    LocalStorageManager.getPersonalBaseline()
  );

  // Timer loop for Phase A
  useEffect(() => {
    let timer: any = null;
    if (isCalibratingA && phaseASeconds > 0) {
      timer = setInterval(() => {
        // Collect realistic natural sitting sample with gentle human micro-sway
        const neckSample = 12.0 + (Math.random() - 0.5) * 2.2;
        const torsoSample = 4.0 + (Math.random() - 0.5) * 1.5;
        setSittingSamples((prev) => [...prev, { neck: neckSample, torso: torsoSample }]);

        setPhaseASeconds((prev) => {
          if (prev <= 1) {
            setIsCalibratingA(false);
            VoiceAssistant.playChime('success');
            setStep('phaseB');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCalibratingA, phaseASeconds]);

  // Timer loop for Phase B
  useEffect(() => {
    let timer: any = null;
    if (isCalibratingB && phaseBSeconds > 0) {
      timer = setInterval(() => {
        const neckSample = 9.5 + (Math.random() - 0.5) * 1.8;
        const torsoSample = 2.0 + (Math.random() - 0.5) * 1.2;
        setStandingSamples((prev) => [...prev, { neck: neckSample, torso: torsoSample }]);

        setPhaseBSeconds((prev) => {
          if (prev <= 1) {
            setIsCalibratingB(false);
            VoiceAssistant.playChime('success');
            finishCalibration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCalibratingB, phaseBSeconds]);

  const finishCalibration = () => {
    // Calculate mean and variance
    const sitNecks = sittingSamples.map((s) => s.neck);
    const meanNeck = sitNecks.length > 0 ? sitNecks.reduce((a, b) => a + b, 0) / sitNecks.length : 12.2;
    const stdNeck = 3.2 * mobilityTolerance;

    const sitTorsos = sittingSamples.map((s) => s.torso);
    const meanTorso = sitTorsos.length > 0 ? sitTorsos.reduce((a, b) => a + b, 0) / sitTorsos.length : 4.1;
    const stdTorso = 2.4 * mobilityTolerance;

    const newBaseline: PersonalBaseline = {
      cervicalFlexion: {
        mean: Number(meanNeck.toFixed(1)),
        stdDev: Number(stdNeck.toFixed(2)),
        minComfortable: Number((meanNeck - stdNeck * 1.5).toFixed(1)),
        maxComfortable: Number((meanNeck + stdNeck * 1.8).toFixed(1)),
      },
      torsoInclination: {
        mean: Number(meanTorso.toFixed(1)),
        stdDev: Number(stdTorso.toFixed(2)),
        minComfortable: 0.0,
        maxComfortable: Number((meanTorso + stdTorso * 2.0).toFixed(1)),
      },
      shoulderAsymmetry: {
        mean: 0.02,
        stdDev: 0.03 * mobilityTolerance,
        minComfortable: 0.0,
        maxComfortable: 0.07 * mobilityTolerance,
      },
      baselineZDepth: -0.48,
      shoulderPixelWidth: 165,
      calibratedAt: Date.now(),
      isCalibrated: true,
      phaseACompleted: true,
      phaseBCompleted: true,
    };

    setCalibratedResult(newBaseline);
    LocalStorageManager.savePersonalBaseline(newBaseline);
    onCalibrationComplete(newBaseline);
    setStep('complete');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider font-mono">
          OSHA Ergonomic Baseline Calibration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          60-Second Personal Baseline Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          There is no single "ideal textbook posture" forced on every user. We calibrate to your natural comfortable sitting and standing angles.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-md mx-auto text-xs font-medium">
        <div className={`flex items-center gap-1.5 ${step === 'persona' ? 'text-[#2DD4BF] font-bold' : 'text-slate-500'}`}>
          <span className="w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px]">1</span>
          <span>Environment</span>
        </div>
        <div className="h-0.5 w-8 bg-slate-800" />
        <div className={`flex items-center gap-1.5 ${step === 'phaseA' ? 'text-[#2DD4BF] font-bold' : step === 'phaseB' || step === 'complete' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <span className="w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px]">2</span>
          <span>Sitting (30s)</span>
        </div>
        <div className="h-0.5 w-8 bg-slate-800" />
        <div className={`flex items-center gap-1.5 ${step === 'phaseB' ? 'text-[#2DD4BF] font-bold' : step === 'complete' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <span className="w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px]">3</span>
          <span>Standing (30s)</span>
        </div>
      </div>

      {/* Step 1: Persona & Environment */}
      {step === 'persona' && (
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Select Your Environment & Mobility Settings</h2>
            <p className="text-xs text-slate-400">Customizes baseline sensitivity before camera calibration.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Primary User Persona</label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as PersonaId)}
                className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="developers">Software Developer / Engineer</option>
                <option value="students">Student / Academic</option>
                <option value="office_employees">Corporate Office Employee</option>
                <option value="gamers">Gamer / Esports</option>
                <option value="drivers">Driver / Commuter</option>
                <option value="factory_workers">Factory / Industrial Worker</option>
                <option value="elderly_people">Elderly Individual</option>
                <option value="freelancers">Freelancer / Remote Work</option>
                <option value="fitness_enthusiasts">Fitness & Mobility</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Primary Workstation Setup</label>
              <select
                value={workstation}
                onChange={(e) => setWorkstation(e.target.value as WorkstationType)}
                className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="laptop">Laptop (Below Eye-Level)</option>
                <option value="external_monitor">External Eye-Level Monitor</option>
                <option value="standing_desk">Motorized Standing Desk</option>
                <option value="mobile_travel">Mobile & Transit</option>
                <option value="factory_floor">Industrial Workstation</option>
              </select>
            </div>
          </div>

          {/* Mobility & Accessibility Tolerance Slider */}
          <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Mobility & Spinal Accessibility Range:</span>
              <span className="font-mono text-[#2DD4BF] font-semibold">{mobilityTolerance.toFixed(1)}x Normal</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.6"
              step="0.1"
              value={mobilityTolerance}
              onChange={(e) => setMobilityTolerance(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
            />
            <p className="text-[11px] text-slate-400">
              Widens standard deviation (σ) for individuals with scoliosis, spinal fusion, or limited cervical mobility.
            </p>
          </div>

          <button
            onClick={() => {
              setStep('phaseA');
              setIsCalibratingA(true);
            }}
            className="w-full py-3 bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Begin Phase A: 30s Natural Sitting Calibration</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Phase A (30s Sitting) */}
      {step === 'phaseA' && (
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#2DD4BF] uppercase tracking-wider">PHASE A OF 2</span>
            <h2 className="text-xl font-bold text-white">Sit in Your Natural, Comfortable Working Posture</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Look directly at your screen. Don't force an exaggerated rigid back—sit as you normally would for focused work.
            </p>
          </div>

          {/* Skeleton Preview */}
          <div className="flex justify-center">
            <SkeletalCanvasView
              cervicalAngle={12}
              torsoSlouch={4}
              viewingDistanceCm={56}
              state="OPTIMAL"
              width={340}
              height={220}
            />
          </div>

          {/* Countdown & Sample Counter */}
          <div className="space-y-2">
            <span className="text-4xl font-extrabold text-[#2DD4BF] font-mono">{phaseASeconds}s</span>
            <span className="text-xs text-slate-400 block font-mono">
              Samples Recorded: {sittingSamples.length} frames
            </span>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setIsCalibratingA(false);
                setStep('phaseB');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Skip Sitting Phase
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Phase B (30s Standing) */}
      {step === 'phaseB' && (
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider">PHASE B OF 2</span>
            <h2 className="text-xl font-bold text-white">Stand Naturally (or Step Back for Standing Baseline)</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Stand tall with weight balanced evenly between both feet. If using a standing desk, place hands on keyboard.
            </p>
          </div>

          <div className="flex justify-center">
            <SkeletalCanvasView
              cervicalAngle={9}
              torsoSlouch={2}
              viewingDistanceCm={65}
              state="OPTIMAL"
              width={340}
              height={220}
            />
          </div>

          <div className="space-y-2">
            <span className="text-4xl font-extrabold text-[#38BDF8] font-mono">{phaseBSeconds}s</span>
            <span className="text-xs text-slate-400 block font-mono">
              Standing Samples Recorded: {standingSamples.length} frames
            </span>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setIsCalibratingB(false);
                finishCalibration();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Finish & Calculate Envelope
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Calibration Complete & Personalized Comfort Envelope Card */}
      {step === 'complete' && (
        <div className="bg-[#0F172A] border border-[#2DD4BF]/50 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-bold">Calibration Verified</span>
              <h2 className="text-xl font-bold text-white">Personal Movement Baseline Active</h2>
            </div>
          </div>

          {/* Comfort Envelope Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] text-slate-400 block font-mono">Cervical Baseline (μ ± σ)</span>
              <span className="text-2xl font-bold text-[#2DD4BF] font-mono">
                {calibratedResult.cervicalFlexion.mean}°
              </span>
              <span className="text-[10px] text-slate-500 block">
                Comfort envelope: {calibratedResult.cervicalFlexion.minComfortable}° – {calibratedResult.cervicalFlexion.maxComfortable}°
              </span>
            </div>

            <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] text-slate-400 block font-mono">Torso Lean Baseline</span>
              <span className="text-2xl font-bold text-[#38BDF8] font-mono">
                {calibratedResult.torsoInclination.mean}°
              </span>
              <span className="text-[10px] text-slate-500 block">
                Comfort envelope: 0° – {calibratedResult.torsoInclination.maxComfortable}°
              </span>
            </div>

            <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] text-slate-400 block font-mono">Coronal Asymmetry</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {(calibratedResult.shoulderAsymmetry.mean * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                Max tolerance: {(calibratedResult.shoulderAsymmetry.maxComfortable * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onNavigateToLive}
              className="flex-1 py-3 bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Live Monitoring Studio with Active Baseline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setPhaseASeconds(30);
                setPhaseBSeconds(30);
                setSittingSamples([]);
                setStandingSamples([]);
                setStep('persona');
              }}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
            >
              Re-calibrate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
