import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Crosshair,
  RefreshCcw,
  Sliders,
  X,
  Zap,
} from 'lucide-react';
import { LiveTelemetry, postTelemetryUpdate, UserPreferences } from '../../services/telemetryClient.ts';

interface LiveMonitorPageProps {
  telemetry: LiveTelemetry;
  prefs: UserPreferences;
  onCalibrateBaseline: (baseline: { neckFlexion: number; shoulderTilt: number; torsoLean: number }) => void;
}

export const LiveMonitorPage: React.FC<LiveMonitorPageProps> = ({
  telemetry,
  prefs,
  onCalibrateBaseline,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [calibrationToast, setCalibrationToast] = useState<string | null>(null);
  const [shoulderAlertToast, setShoulderAlertToast] = useState<string | null>(null);

  // Smooth interpolated wireframe coordinates for 60fps canvas rendering
  const animStateRef = useRef({
    neck: telemetry.neckFlexion,
    shoulder: telemetry.shoulderTilt,
    torso: telemetry.torsoLean,
  });

  // Trigger floating alert toast when Pusher telemetry indicates uneven shoulders
  useEffect(() => {
    const isUneven =
      Math.abs(telemetry.shoulderTilt) >= 3.5 ||
      (telemetry.alertMessage && telemetry.alertMessage.toLowerCase().includes('uneven shoulders'));

    if (isUneven) {
      setShoulderAlertToast(
        telemetry.alertMessage ||
          'Uneven shoulders detected. Drop your high shoulder and balance your weight.'
      );
    }
  }, [telemetry.shoulderTilt, telemetry.alertMessage, telemetry.timestamp]);

  // Toggle optional local browser webcam backdrop
  const handleToggleWebcam = async () => {
    if (webcamEnabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setWebcamEnabled(false);
      setWebcamError(null);
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Webcam API unavailable in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setWebcamEnabled(true);
      setWebcamError(null);
    } catch {
      setWebcamError('Camera permission denied or unavailable. Running wireframe telemetry canvas.');
      setWebcamEnabled(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Compute baseline-adjusted deltas
  const adjustedNeck = Math.max(0, telemetry.neckFlexion - (prefs.baseline?.neckFlexion || 0));
  const adjustedShoulder = telemetry.shoulderTilt - (prefs.baseline?.shoulderTilt || 0);
  const adjustedTorso = Math.max(0, telemetry.torsoLean - (prefs.baseline?.torsoLean || 0));

  // HTML5 Canvas 60fps Red/Blue Skeletal Wireframe Cross Loop
  useEffect(() => {
    let rafId = 0;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // EMA smoothing toward incoming Pusher coordinates
          animStateRef.current.neck += (adjustedNeck - animStateRef.current.neck) * 0.16;
          animStateRef.current.shoulder += (adjustedShoulder - animStateRef.current.shoulder) * 0.16;
          animStateRef.current.torso += (adjustedTorso - animStateRef.current.torso) * 0.16;

          const neck = animStateRef.current.neck;
          const shoulder = animStateRef.current.shoulder;
          const torso = animStateRef.current.torso;

          ctx.clearRect(0, 0, w, h);

          // Camera viewfinder subtle dark grid when webcam is off
          if (!webcamEnabled) {
            const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.75);
            bgGrad.addColorStop(0, '#131F38');
            bgGrad.addColorStop(1, '#090F1E');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = 'rgba(30, 41, 59, 0.55)';
            ctx.lineWidth = 1;
            for (let gx = 40; gx < w; gx += 40) {
              ctx.beginPath();
              ctx.moveTo(gx, 0);
              ctx.lineTo(gx, h);
              ctx.stroke();
            }
            for (let gy = 40; gy < h; gy += 40) {
              ctx.beginPath();
              ctx.moveTo(0, gy);
              ctx.lineTo(w, gy);
              ctx.stroke();
            }
          }

          // Camera corner reticle brackets
          const pad = 24;
          const br = 22;
          ctx.strokeStyle = 'rgba(0, 196, 154, 0.45)';
          ctx.lineWidth = 2;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(pad, pad + br);
          ctx.lineTo(pad, pad);
          ctx.lineTo(pad + br, pad);
          // Top-right
          ctx.moveTo(w - pad - br, pad);
          ctx.lineTo(w - pad, pad);
          ctx.lineTo(w - pad, pad + br);
          // Bottom-left
          ctx.moveTo(pad, h - pad - br);
          ctx.lineTo(pad, h - pad);
          ctx.lineTo(pad + br, h - pad);
          // Bottom-right
          ctx.moveTo(w - pad - br, h - pad);
          ctx.lineTo(w - pad, h - pad);
          ctx.lineTo(w - pad, h - pad - br);
          ctx.stroke();

          // Wireframe Coordinate Mapping
          const cx = w / 2;
          const hipY = h * 0.84;
          const hipX = cx;

          // Torso lean displaces sternum laterally/forward
          const torsoOffsetX = torso * 3.2;
          const sternumX = cx + torsoOffsetX;
          const sternumY = h * 0.56;

          // Shoulder tilt tilts the horizontal shoulder bar
          const shoulderHalfSpan = Math.min(w * 0.24, 150);
          const shoulderTiltPx = shoulder * 5.2;
          const leftShoulder = { x: sternumX - shoulderHalfSpan, y: sternumY - shoulderTiltPx };
          const rightShoulder = { x: sternumX + shoulderHalfSpan, y: sternumY + shoulderTiltPx };

          // Neck flexion displaces head/cranial axis
          const headX = sternumX + (neck - 10) * 2.1;
          const headY = h * 0.34 + (neck - 10) * 1.4;
          const cranialY = headY - 58;

          // 1. Face / Cranial Bounding Reticle
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(headX - 58, cranialY - 14, 116, 134);
          ctx.setLineDash([]);

          // 2. BLUE SPINAL VERTICAL AXIS (Hip -> Sternum -> Nose -> Cranial Apex)
          ctx.strokeStyle = '#3B82F6'; // Vibrant Blue
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(hipX, hipY);
          ctx.lineTo(sternumX, sternumY);
          ctx.lineTo(headX, headY);
          ctx.lineTo(headX, cranialY);
          ctx.stroke();

          // 3. RED HORIZONTAL SHOULDER WIREFRAME BAR (Left Shoulder <-> Right Shoulder)
          ctx.strokeStyle = '#EF4444'; // Vibrant Red
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(leftShoulder.x, leftShoulder.y);
          ctx.lineTo(rightShoulder.x, rightShoulder.y);
          ctx.stroke();

          // 4. RED EAR-TO-EAR HORIZONTAL CROSSBAR
          const earSpan = 46;
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(headX - earSpan, headY - 8);
          ctx.lineTo(headX + earSpan, headY - 8);
          ctx.stroke();

          // 5. Lower Ribcage / Arms Kinetic Wireframe (Blue)
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.55)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(leftShoulder.x, leftShoulder.y);
          ctx.lineTo(leftShoulder.x - 26, leftShoulder.y + 88);
          ctx.moveTo(rightShoulder.x, rightShoulder.y);
          ctx.lineTo(rightShoulder.x + 26, rightShoulder.y + 88);
          ctx.stroke();

          // Draw Landmark Nodes
          const drawNode = (x: number, y: number, r: number, color: string) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0B1120';
            ctx.stroke();
          };

          // Red nodes on shoulders & ears
          drawNode(leftShoulder.x, leftShoulder.y, 7, '#EF4444');
          drawNode(rightShoulder.x, rightShoulder.y, 7, '#EF4444');
          drawNode(headX - earSpan, headY - 8, 5, '#EF4444');
          drawNode(headX + earSpan, headY - 8, 5, '#EF4444');

          // Blue/Cyan nodes on Spine Cross & Cranial Apex
          drawNode(hipX, hipY, 6, '#3B82F6');
          drawNode(sternumX, sternumY, 7, '#3B82F6');
          drawNode(headX, headY, 6, '#EF4444');
          drawNode(headX, cranialY, 6, '#00C49A');

          // Coordinate HUD text inside canvas
          ctx.font = '12px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(226, 232, 240, 0.78)';
          ctx.fillText(
            `NECK ${neck.toFixed(1)}°  |  SHOULDER ${shoulder.toFixed(1)}°  |  TORSO ${torso.toFixed(1)}°`,
            28,
            h - 24
          );
        }
      }
      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(rafId);
  }, [adjustedNeck, adjustedShoulder, adjustedTorso, webcamEnabled]);

  const handleCalibrate = () => {
    onCalibrateBaseline({
      neckFlexion: Number(Math.max(0, telemetry.neckFlexion - 10).toFixed(1)),
      shoulderTilt: Number(telemetry.shoulderTilt.toFixed(1)),
      torsoLean: Number(Math.max(0, telemetry.torsoLean - 2).toFixed(1)),
    });
    setCalibrationToast('Posture baseline calibrated to your current upright alignment.');
    setTimeout(() => setCalibrationToast(null), 4000);
  };

  const handleTestShoulderAlert = async () => {
    try {
      await postTelemetryUpdate({
        neckFlexion: 19.2,
        shoulderTilt: 5.4,
        torsoLean: 5.1,
        proximity: 52,
        ambientLight: 65,
        deviceTilt: { pitch: 15, roll: 5 },
        alertMessage: 'Uneven shoulders detected. Drop your high shoulder and balance your weight.',
      });
    } catch {
      setShoulderAlertToast('Uneven shoulders detected. Drop your high shoulder and balance your weight.');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Alert Toast System */}
      {shoulderAlertToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-[calc(100%-2rem)] bg-[#0F172A] border border-[#F59E0B] rounded-2xl p-4 shadow-2xl flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
              Posture Alert
            </div>
            <p className="text-xs text-slate-100 mt-1 leading-relaxed">{shoulderAlertToast}</p>
          </div>
          <button
            onClick={() => setShoulderAlertToast(null)}
            className="p-1 text-slate-400 hover:text-white"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Calibration Confirmation Toast */}
      {calibrationToast && (
        <div className="bg-[#00C49A]/15 border border-[#00C49A]/40 rounded-xl p-3.5 flex items-center justify-between text-xs text-[#00C49A]">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{calibrationToast}</span>
          </div>
          <button onClick={() => setCalibrationToast(null)} className="text-slate-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Central Canvas Viewport (8 cols) + Telemetry Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Real-Time Canvas Viewport */}
        <div className="lg:col-span-8 bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C49A] animate-pulse" />
              <span className="text-xs font-mono font-semibold text-slate-200">
                {webcamEnabled ? 'WEBCAM + PUSHER WIREFRAME' : 'EDGE TELEMETRY WIREFRAME FEED'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleWebcam}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                  webcamEnabled
                    ? 'bg-[#00C49A]/15 text-[#00C49A] border-[#00C49A]/40'
                    : 'bg-[#0F172A] text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {webcamEnabled ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
                <span>{webcamEnabled ? 'Disable Camera' : 'Overlay Local Camera'}</span>
              </button>

              <button
                onClick={handleTestShoulderAlert}
                className="px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-[#F59E0B]/40 text-xs font-semibold text-[#F59E0B] flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Test Shoulder Alert</span>
              </button>
            </div>
          </div>

          {webcamError && (
            <div className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-2 rounded-xl">
              {webcamError}
            </div>
          )}

          {/* Video + Skeletal Wireframe Cross Canvas Container */}
          <div className="relative w-full aspect-[16/10] bg-[#090F1E] rounded-xl overflow-hidden border border-slate-800">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${
                webcamEnabled ? 'opacity-65' : 'hidden'
              }`}
            />
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="relative z-10 w-full h-full block"
            />
          </div>

          {/* Wireframe Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#EF4444] inline-block" />
                Shoulder &amp; Ear Crossbar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#3B82F6] inline-block" />
                Cervical &amp; Thoracic Spine Axis
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Channel: ergosense-channel · Event: new-telemetry
            </span>
          </div>
        </div>

        {/* Telemetry Widgets & Calibration Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00C49A]" />
                <h3 className="text-sm font-bold text-white">Live Telemetry</h3>
              </div>
              <span className="text-xs font-mono text-[#00C49A]">Score {telemetry.ergoScore}</span>
            </div>

            {/* Widget 1: Neck Flexion */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Neck Flexion</span>
                <span className="text-[11px] font-mono text-slate-400">Target: &lt; 15°</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-3xl font-extrabold font-mono tabular-nums ${
                    adjustedNeck > 15 ? 'text-[#F59E0B]' : 'text-[#00C49A]'
                  }`}
                >
                  {adjustedNeck.toFixed(1)}°
                </span>
                <span className={`text-xs font-semibold ${adjustedNeck > 15 ? 'text-[#F59E0B]' : 'text-[#00C49A]'}`}>
                  {adjustedNeck > 15 ? 'Forward Tilt' : 'Aligned'}
                </span>
              </div>
            </div>

            {/* Widget 2: Shoulder Tilt */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Shoulder Tilt</span>
                <span className="text-[11px] font-mono text-slate-400">Target: &lt; 4°</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-3xl font-extrabold font-mono tabular-nums ${
                    Math.abs(adjustedShoulder) >= 3.5 ? 'text-[#F59E0B]' : 'text-[#00C49A]'
                  }`}
                >
                  {Math.abs(adjustedShoulder).toFixed(1)}°
                </span>
                <span
                  className={`text-xs font-semibold ${
                    Math.abs(adjustedShoulder) >= 3.5 ? 'text-[#F59E0B]' : 'text-[#00C49A]'
                  }`}
                >
                  {Math.abs(adjustedShoulder) >= 3.5 ? 'Uneven Shoulders' : 'Balanced'}
                </span>
              </div>
            </div>

            {/* Widget 3: Torso Lean */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Torso Lean</span>
                <span className="text-[11px] font-mono text-slate-400">Target: &lt; 6°</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-3xl font-extrabold font-mono tabular-nums ${
                    adjustedTorso > 6 ? 'text-[#F59E0B]' : 'text-[#00C49A]'
                  }`}
                >
                  {adjustedTorso.toFixed(1)}°
                </span>
                <span className={`text-xs font-semibold ${adjustedTorso > 6 ? 'text-[#F59E0B]' : 'text-[#00C49A]'}`}>
                  {adjustedTorso > 6 ? 'Leaning' : 'Upright'}
                </span>
              </div>
            </div>
          </div>

          {/* Calibration Card */}
          <div className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C49A]/15 text-[#00C49A] flex items-center justify-center shrink-0">
                <Crosshair className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Baseline Reference</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Sit naturally upright facing your display, then calibrate to set your zeroed ergonomic offsets.
                </p>
              </div>
            </div>

            {prefs.baseline?.calibratedAt && (
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <RefreshCcw className="w-3 h-3 text-[#00C49A]" />
                <span>
                  Last calibrated {new Date(prefs.baseline.calibratedAt).toLocaleTimeString()}
                </span>
              </div>
            )}

            <button
              onClick={handleCalibrate}
              className="w-full py-3.5 px-4 rounded-xl bg-[#00C49A] hover:bg-[#00b08a] text-[#0B1120] font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00C49A]/20 active:scale-[0.99]"
            >
              <Crosshair className="w-4 h-4" />
              <span>Calibrate Posture Baseline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
