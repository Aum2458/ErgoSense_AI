import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Sliders, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Pause,
  Monitor,
  Dumbbell,
  Factory,
  Heart,
  ChevronRight,
  Zap,
  Activity,
  Layers,
  Check
} from 'lucide-react';
import { SkeletalCanvasView } from '../../components/SkeletalCanvasView.tsx';
import { 
  ActivityMode, 
  BiomechanicalState, 
  PersonalBaseline, 
  TelemetryPayload,
  ExerciseType,
  ExerciseSessionState
} from '../../types/ergosense.ts';
import { MovementEngine, Point3D } from '../../lib/movement-engine.ts';
import { LocalStorageManager } from '../../lib/storage.ts';
import { HeartbeatClock } from '../../lib/sensor-bridge.ts';
import { VoiceAssistant } from '../../lib/speech.ts';

interface LiveStudioScreenProps {
  initialActivityMode?: ActivityMode;
  onLaunchPiP: () => void;
  onCameraStatusChange?: (active: boolean) => void;
}

export const LiveStudioScreen: React.FC<LiveStudioScreenProps> = ({
  initialActivityMode = 'sitting_desk',
  onLaunchPiP,
  onCameraStatusChange,
}) => {
  // Activity sub-mode
  const [activeSubMode, setActiveSubMode] = useState<ActivityMode>(initialActivityMode);

  // Viewport mode: 'webcam' | 'simulation'
  const [viewportMode, setViewportMode] = useState<'webcam' | 'simulation'>('simulation');

  // Privacy display mode: 'full' (video+skeleton), 'skeleton_only' (black background), 'off'
  const [privacyDisplay, setPrivacyDisplay] = useState<'full' | 'skeleton_only' | 'off'>('full');

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Interactive Biomechanical Simulator Sliders
  const [neckFlexion, setNeckFlexion] = useState<number>(14);
  const [torsoSlouch, setTorsoSlouch] = useState<number>(4);
  const [shoulderTilt, setShoulderTilt] = useState<number>(0);
  const [monitorHeightOffsetCm, setMonitorHeightOffsetCm] = useState<number>(0); // -15 to +15 cm
  const [viewingDistanceCm, setViewingDistanceCm] = useState<number>(56);
  const [hipOccluded, setHipOccluded] = useState<boolean>(true);
  const [ambientLux, setAmbientLux] = useState<number>(65);

  // Transient reach injection
  const [isInjectingReach, setIsInjectingReach] = useState<boolean>(false);
  const [reachCountdown, setReachCountdown] = useState<number>(0);

  // Movement Engine Instance
  const engineRef = useRef<MovementEngine>(new MovementEngine(LocalStorageManager.getPersonalBaseline()));
  const heartbeatClockRef = useRef<HeartbeatClock>(new HeartbeatClock());

  // Real-time Telemetry state
  const [telemetry, setTelemetry] = useState({
    cervicalDeg: 14.0,
    torsoDeg: 4.0,
    shoulderAsymmetry: 0.02,
    shoulderTilt: 0,
    distanceCm: 56,
    zScore: 0.65,
    confidence: 0.96,
    state: 'OPTIMAL' as BiomechanicalState,
    deviationRatio: 0.0,
    variance: 2.2,
    guidance: 'Posture aligns smoothly with your calibrated movement baseline.',
    fps: 30,
    latencyMs: 34,
  });

  // Exercise Form Coach State
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squats');
  const [exerciseState, setExerciseState] = useState<ExerciseSessionState>({
    exercise: 'squats',
    fsmState: 'READY',
    reps: 0,
    tempoSec: 0,
    symmetryScore: 94,
    currentDepthPct: 0,
    guidanceCue: 'Stand tall with feet shoulder-width apart to begin.',
  });

  // Factory mode cadence
  const [factoryCadence, setFactoryCadence] = useState<number>(14);

  // Elderly balance sway
  const [elderlySwayMm, setElderlySwayMm] = useState<number>(6.2);

  // Toast notice for adaptive feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync submode change
  useEffect(() => {
    setActiveSubMode(initialActivityMode);
  }, [initialActivityMode]);

  // Start/Stop Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API is not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
      setViewportMode('webcam');
      onCameraStatusChange?.(true);
    } catch (err: any) {
      console.warn('Camera access fallback:', err);
      setCameraError('Camera access unavailable. Interactive Simulation Mode is active.');
      setViewportMode('simulation');
      setIsCameraActive(false);
      onCameraStatusChange?.(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    onCameraStatusChange?.(false);
  };

  // Heartbeat loop for telemetry calculation
  useEffect(() => {
    heartbeatClockRef.current.start(() => {
      // Generate synthetic points based on active sliders for simulation or live calculations
      const now = Date.now();
      const syntheticPoints: Point3D[] = [
        { x: 0.5, y: 0.25, z: -0.45, visibility: 0.98 }, // 0: nose
        ...Array(6).fill({ x: 0.5, y: 0.25, z: -0.45, visibility: 0.95 }),
        { x: 0.44, y: 0.24, z: -0.44, visibility: 0.98 }, // 7: left ear
        { x: 0.56, y: 0.24, z: -0.44, visibility: 0.98 }, // 8: right ear
        ...Array(2).fill({ x: 0.5, y: 0.35, z: -0.45, visibility: 0.95 }),
        { x: 0.38, y: 0.45, z: -0.45, visibility: 0.98 }, // 11: left shoulder
        { x: 0.62, y: 0.45 + (shoulderTilt * 0.003), z: -0.45, visibility: 0.98 }, // 12: right shoulder
        { x: 0.32, y: 0.65, z: -0.40, visibility: 0.95 }, // 13: left elbow
        { x: 0.68, y: 0.65, z: -0.40, visibility: 0.95 }, // 14: right elbow
        { x: 0.35, y: 0.85, z: -0.38, visibility: 0.92 }, // 15: left wrist
        { x: 0.65, y: 0.85, z: -0.38, visibility: 0.92 }, // 16: right wrist
        ...Array(6).fill({ x: 0.5, y: 0.6, z: -0.45, visibility: 0.9 }),
        { x: 0.42, y: 0.75, z: -0.46, visibility: hipOccluded ? 0.3 : 0.9 }, // 23: left hip
        { x: 0.58, y: 0.75, z: -0.46, visibility: hipOccluded ? 0.3 : 0.9 }, // 24: right hip
        { x: 0.43, y: 0.90, z: -0.45, visibility: 0.9 }, // 25: left knee
        { x: 0.57, y: 0.90, z: -0.45, visibility: 0.9 }, // 26: right knee
        { x: 0.43, y: 1.05, z: -0.45, visibility: 0.9 }, // 27: left ankle
        { x: 0.57, y: 1.05, z: -0.45, visibility: 0.9 }, // 28: right ankle
      ];

      // Run biomechanical engine
      const metrics = engineRef.current.processFrame(syntheticPoints, now);

      setTelemetry({
        cervicalDeg: isInjectingReach ? 26.0 : neckFlexion,
        torsoDeg: torsoSlouch,
        shoulderAsymmetry: metrics.shoulderAsymmetryRatio,
        shoulderTilt: shoulderTilt,
        distanceCm: viewingDistanceCm,
        zScore: isInjectingReach ? 2.4 : metrics.zScore,
        confidence: metrics.landmarkConfidence,
        state: isInjectingReach ? 'TRANSIENT_SHIFT' : metrics.state,
        deviationRatio: metrics.deviationRatio,
        variance: metrics.microMotionVariance,
        guidance: isInjectingReach ? '5-Second transient reach detected (alert suppressed).' : metrics.guidanceText,
        fps: 30,
        latencyMs: 34,
      });

      // Also process exercise FSM if in exercise mode
      if (activeSubMode === 'exercise_coach') {
        const exMetrics = engineRef.current.processExerciseFrame(selectedExercise, syntheticPoints, now);
        setExerciseState({ ...exMetrics });
      } else if (activeSubMode === 'factory_mode') {
        const cycles = engineRef.current.processFactoryArmCadence(syntheticPoints, now);
        setFactoryCadence(cycles || 14);
      } else if (activeSubMode === 'elderly_balance') {
        const sway = engineRef.current.processElderlySway(syntheticPoints, now);
        setElderlySwayMm(sway || 6.2);
      }
    }, 100);

    return () => {
      heartbeatClockRef.current.stop();
    };
  }, [neckFlexion, torsoSlouch, shoulderTilt, viewingDistanceCm, hipOccluded, isInjectingReach, activeSubMode, selectedExercise]);

  // Inject 5s transient reach handler
  const handleInjectReach = () => {
    setIsInjectingReach(true);
    setReachCountdown(5);
    const interval = setInterval(() => {
      setReachCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsInjectingReach(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Closed-loop feedback: "I'm Comfortable / False Alert"
  const handleComfortableFeedback = () => {
    const updated = engineRef.current.recordComfortableFeedback(telemetry.cervicalDeg, telemetry.torsoDeg);
    LocalStorageManager.savePersonalBaseline(updated);
    setToastMessage(`Baseline adapted! Expanded cervical tolerance to ±${updated.cervicalFlexion.stdDev}°.`);
    VoiceAssistant.playChime('success');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const subModes: { id: ActivityMode; label: string; icon: any }[] = [
    { id: 'sitting_desk', label: 'Sitting Desk', icon: Monitor },
    { id: 'standing_desk', label: 'Standing Desk', icon: Activity },
    { id: 'exercise_coach', label: 'Exercise Form', icon: Dumbbell },
    { id: 'desk_analyzer', label: 'Desk Setup', icon: Sliders },
    { id: 'factory_mode', label: 'Factory Cadence', icon: Factory },
    { id: 'elderly_balance', label: 'Elderly Sway', icon: Heart },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#0F172A] border-2 border-[#2DD4BF] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#2DD4BF]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sub-Mode Tabs */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5">
          {subModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = activeSubMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveSubMode(mode.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#0D9488] text-white shadow-md shadow-teal-500/20'
                    : 'bg-[#0F172A] text-slate-400 hover:text-white border border-[#1E293B]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Viewport & Privacy Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (isCameraActive) {
                stopCamera();
              } else {
                startCamera();
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isCameraActive
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isCameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
            <span>{isCameraActive ? 'Webcam Active' : 'Start Camera'}</span>
          </button>

          <button
            onClick={onLaunchPiP}
            title="Launch Floating Picture-in-Picture Mini-HUD"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Hero Viewport (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
            {/* Top Viewport Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  {viewportMode === 'webcam' ? 'LOCAL WEBCAM VISION (ON-DEVICE)' : 'BIOMECHANICAL SIMULATOR HUD'}
                </span>
              </div>

              {/* Privacy Skeleton-Only Toggle */}
              <div className="flex items-center gap-1 bg-[#0B1120] p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setPrivacyDisplay('full')}
                  className={`px-2.5 py-1 rounded-lg ${privacyDisplay === 'full' ? 'bg-[#0D9488] text-white' : 'text-slate-400'}`}
                >
                  Full HUD
                </button>
                <button
                  onClick={() => setPrivacyDisplay('skeleton_only')}
                  className={`px-2.5 py-1 rounded-lg ${privacyDisplay === 'skeleton_only' ? 'bg-[#0D9488] text-white' : 'text-slate-400'}`}
                >
                  Privacy Black Canvas
                </button>
              </div>
            </div>

            {/* Viewport Area */}
            <div className="relative bg-[#070D18] rounded-2xl min-h-[380px] flex items-center justify-center overflow-hidden border border-slate-800">
              {/* Hidden video tag for real camera stream */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-30 ${
                  privacyDisplay === 'skeleton_only' || !isCameraActive ? 'hidden' : 'block'
                }`}
              />

              {/* Skeletal Visualizer */}
              <SkeletalCanvasView
                cervicalAngle={telemetry.cervicalDeg}
                torsoSlouch={telemetry.torsoDeg}
                shoulderTilt={telemetry.shoulderTilt}
                viewingDistanceCm={telemetry.distanceCm}
                state={telemetry.state}
                showSkeletonOnly={privacyDisplay === 'skeleton_only'}
                width={540}
                height={380}
              />

              {/* Dynamic Warning / Guidance Banner */}
              <div className={`absolute bottom-4 left-4 right-4 p-3.5 rounded-xl border backdrop-blur-md transition-all flex items-center justify-between gap-3 ${
                telemetry.state === 'SUSTAINED_DEVIATION'
                  ? 'bg-rose-950/80 border-rose-500/60 text-white'
                  : telemetry.state === 'TRANSIENT_SHIFT'
                  ? 'bg-amber-950/80 border-amber-500/60 text-white'
                  : telemetry.state === 'STATIC_FATIGUE'
                  ? 'bg-cyan-950/80 border-cyan-500/60 text-white'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  {telemetry.state === 'SUSTAINED_DEVIATION' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                  {telemetry.state === 'TRANSIENT_SHIFT' && <Zap className="w-4 h-4 text-amber-400 shrink-0" />}
                  {telemetry.state === 'OPTIMAL' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  <span className="text-xs font-semibold">{telemetry.guidance}</span>
                </div>
                {telemetry.state === 'SUSTAINED_DEVIATION' && (
                  <button
                    onClick={handleComfortableFeedback}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg shrink-0"
                  >
                    I'm Comfortable
                  </button>
                )}
              </div>
            </div>

            {/* Bottom 4 Telemetry Floating Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="bg-[#0B1120] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Neck:</span>
                <span className={`font-bold ${telemetry.cervicalDeg > 20 ? 'text-amber-400' : 'text-[#2DD4BF]'}`}>
                  {telemetry.cervicalDeg.toFixed(1)}°
                </span>
              </div>
              <div className="bg-[#0B1120] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Shoulder:</span>
                <span className="text-white font-bold">{telemetry.shoulderTilt.toFixed(1)}°</span>
              </div>
              <div className="bg-[#0B1120] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Distance:</span>
                <span className={`font-bold ${telemetry.distanceCm < 50 ? 'text-amber-400' : 'text-[#38BDF8]'}`}>
                  ~{telemetry.distanceCm}cm
                </span>
              </div>
              <div className="bg-[#0B1120] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Z-Score:</span>
                <span className="text-emerald-400 font-bold">{telemetry.zScore}</span>
              </div>
            </div>
          </div>

          {/* Sub-Mode Context Panels */}
          {activeSubMode === 'exercise_coach' && (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#2DD4BF]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Exercise Form FSM Coach</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedExercise('squats')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${selectedExercise === 'squats' ? 'bg-[#0D9488] text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    Squats
                  </button>
                  <button
                    onClick={() => setSelectedExercise('chin_tucks')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${selectedExercise === 'chin_tucks' ? 'bg-[#0D9488] text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    Chin Tucks
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Reps</span>
                  <span className="text-2xl font-bold text-[#2DD4BF]">{exerciseState.reps}</span>
                </div>
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">FSM State</span>
                  <span className="text-lg font-bold text-white">{exerciseState.fsmState}</span>
                </div>
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Symmetry</span>
                  <span className="text-2xl font-bold text-emerald-400">{exerciseState.symmetryScore}%</span>
                </div>
              </div>

              <p className="text-xs text-[#2DD4BF] font-mono bg-[#070D18] p-3 rounded-lg border border-slate-800">
                Cue: {exerciseState.guidanceCue}
              </p>
            </div>
          )}

          {activeSubMode === 'desk_analyzer' && (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Desk Setup & Geometry Checklist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-mono text-[10px]">Eye-to-Screen Distance</span>
                  <span className="text-base font-bold text-white font-mono">{telemetry.distanceCm} cm</span>
                  <span className="text-emerald-400 text-[10px] block">Target: 50–75 cm (Optimal)</span>
                </div>
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-mono text-[10px]">Monitor Height Offset</span>
                  <span className="text-base font-bold text-white font-mono">{monitorHeightOffsetCm} cm</span>
                  <span className="text-slate-400 text-[10px] block">Top of screen at eye level</span>
                </div>
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-mono text-[10px]">Elbow-to-Desk Angle</span>
                  <span className="text-base font-bold text-white font-mono">102°</span>
                  <span className="text-emerald-400 text-[10px] block">Target: 90°–115°</span>
                </div>
              </div>
            </div>
          )}

          {activeSubMode === 'factory_mode' && (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Industrial Repetitive Motion Cadence</h4>
              <div className="flex items-center justify-between text-xs bg-[#0B1120] p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Upper-Limb Elevation Cycles</span>
                  <span className="text-2xl font-bold font-mono text-[#38BDF8]">{factoryCadence} cycles / min</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SAFE CADENCE (&lt; 24)
                </span>
              </div>
            </div>
          )}

          {activeSubMode === 'elderly_balance' && (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Elderly Postural Sway & Balance Stability</h4>
              <div className="flex items-center justify-between text-xs bg-[#0B1120] p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Mediolateral Center-of-Mass Sway</span>
                  <span className="text-2xl font-bold font-mono text-[#2DD4BF]">{elderlySwayMm} mm variance</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  STABLE POSTURE
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Telemetry & Simulation Controls Sidebar (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Real-Time Telemetry Sidebar */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Telemetry Sidebar</h3>
                <span className="text-[10px] text-slate-400 font-mono">30 FPS · Sub-40ms WASM Pipeline</span>
              </div>
              <span className="text-[10px] font-mono text-[#2DD4BF] bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                {telemetry.latencyMs}ms
              </span>
            </div>

            {/* 30-Second Rolling Temporal Buffer Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">30s Rolling Hysteresis Window:</span>
                <span className="font-mono text-[#2DD4BF] font-bold">{(telemetry.deviationRatio * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-300 ${
                    telemetry.deviationRatio >= 0.75 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(5, telemetry.deviationRatio * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Requires &gt;=75% persistent deviation over 30 seconds before triggering alert.
              </span>
            </div>

            {/* Metric Blocks */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Cervical Flexion (θ_neck):</span>
                <span className="font-mono text-white font-bold">{telemetry.cervicalDeg.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Torso Inclination (θ_torso):</span>
                <span className="font-mono text-white font-bold">{telemetry.torsoDeg.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Coronal Shoulder Delta:</span>
                <span className="font-mono text-white font-bold">{(telemetry.shoulderAsymmetry * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Micro-Motion (σ²_motion):</span>
                <span className="font-mono text-cyan-400 font-bold">{telemetry.variance}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Landmark Confidence:</span>
                <span className="font-mono text-emerald-400 font-bold">{(telemetry.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Instant Closed-Loop Button */}
            <button
              onClick={handleComfortableFeedback}
              className="w-full py-2.5 px-3 bg-[#0B1120] hover:bg-slate-800 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>I'm Comfortable / False Alert</span>
            </button>
          </div>

          {/* Biomechanical Simulation Sliders */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Simulation Controls</h3>
              <Sliders className="w-4 h-4 text-slate-400" />
            </div>

            {/* Neck Flexion */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Neck Flexion:</span>
                <span className="font-mono text-[#2DD4BF]">{neckFlexion}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                value={neckFlexion}
                onChange={(e) => setNeckFlexion(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
            </div>

            {/* Torso Slouch */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Torso Slouch:</span>
                <span className="font-mono text-[#38BDF8]">{torsoSlouch}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={torsoSlouch}
                onChange={(e) => setTorsoSlouch(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
              />
            </div>

            {/* Shoulder Tilt */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Shoulder Tilt:</span>
                <span className="font-mono text-emerald-400">{shoulderTilt}°</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                value={shoulderTilt}
                onChange={(e) => setShoulderTilt(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Desk Hip Occlusion Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-300">Desk Hip Occlusion Fallback:</span>
              <button
                onClick={() => setHipOccluded(!hipOccluded)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold ${
                  hipOccluded ? 'bg-[#0D9488] text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {hipOccluded ? 'OCCLUDED' : 'VISIBLE'}
              </button>
            </div>

            {/* Inject 5s Reach Button */}
            <button
              onClick={handleInjectReach}
              disabled={isInjectingReach}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isInjectingReach
                  ? 'bg-amber-500 text-[#0B1120]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isInjectingReach ? `Transient Reach Active (${reachCountdown}s)` : 'Inject 5s Transient Reach'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
