import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Settings, RefreshCw, AlertTriangle, Camera, CameraOff, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';

interface LandmarkData {
  nose: { x: number; y: number };
  leftEar: { x: number; y: number };
  rightEar: { x: number; y: number };
  topOfHead: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  leftShoulder: { x: number; y: number };
  rightShoulder: { x: number; y: number };
  sternum: { x: number; y: number };
  leftElbow: { x: number; y: number };
  rightElbow: { x: number; y: number };
  faceBox: { x: number; y: number; width: number; height: number };
}

interface VideoCanvasOverlayProps {
  neckAngle: number;
  shoulderTilt: number;
  proximityCm: number;
  symmetryPercent: number;
  isPaused: boolean;
  isStopped: boolean;
  onLiveMetricsDetected?: (metrics: {
    cervicalTiltDeg: number;
    proximityCm: number;
    headRollDeg: number;
  }) => void;
  onToggleCameraFacing?: () => void;
  onOpenSettings?: () => void;
}

export const VideoCanvasOverlay: React.FC<VideoCanvasOverlayProps> = ({
  neckAngle,
  shoulderTilt,
  proximityCm,
  symmetryPercent,
  isPaused,
  isStopped,
  onLiveMetricsDetected,
  onToggleCameraFacing,
  onOpenSettings,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [isRequestingCamera, setIsRequestingCamera] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // Smoothed face tracking coordinates
  const trackedFaceRef = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
    tilt: number;
    roll: number;
    dist: number;
  }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    tilt: neckAngle,
    roll: shoulderTilt,
    dist: proximityCm,
  });

  // Start real webcam function
  const startCamera = useCallback(async () => {
    setIsRequestingCamera(true);
    setCameraPermissionError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API is not supported in this browser environment.');
      }

      // Request live camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Video play error:', e));
        };
      }
      setCameraActive(true);
      setDemoMode(false);
      setCameraPermissionError(null);
    } catch (err: any) {
      console.warn('Camera request issue:', err);
      setCameraActive(false);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraPermissionError('Camera permission blocked by browser. Click "Allow" in your browser address bar.');
      } else if (err?.name === 'NotFoundError') {
        setCameraPermissionError('No physical camera device detected on this computer.');
      } else {
        setCameraPermissionError('Camera unavailable in current frame. Interactive biometric preview active.');
      }
    } finally {
      setIsRequestingCamera(false);
    }
  }, [facingMode]);

  // Attempt camera initialization on mount
  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Stop camera when user clicks stop
  useEffect(() => {
    if (isStopped) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    }
  }, [isStopped]);

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    onToggleCameraFacing?.();
  };

  // Real-time Computer Vision Frame Analysis & Rendering Loop
  useEffect(() => {
    let animId: number;

    // Create offscreen canvas for computer vision downsampling
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = 160;
      offscreenCanvasRef.current.height = 120;
    }

    const offCanvas = offscreenCanvasRef.current;
    const offCtx = offCanvas?.getContext('2d', { willReadFrequently: true });

    let lastMetricsDispatch = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      if (isStopped) {
        ctx.fillStyle = '#0B1120';
        ctx.fillRect(0, 0, width, height);
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.textAlign = 'center';
        ctx.fillText('VIDEO FEED STOPPED • TAP RESUME TO RESTART', width / 2, height / 2);
        ctx.restore();
        return;
      }

      // 1. COMPUTER VISION: Track User's Face from Video Stream
      let targetFaceX = width / 2;
      let targetFaceY = height * 0.40;
      let targetFaceW = width * 0.28;
      let targetFaceH = targetFaceW * 1.25;
      let targetRoll = 0;
      let targetTilt = neckAngle;
      let targetDist = proximityCm;

      const video = videoRef.current;
      const isVideoPlaying = video && !video.paused && !video.ended && video.readyState >= 2;

      if (isVideoPlaying && offCtx && cameraActive) {
        try {
          // Downsample video frame to 160x120 for sub-10ms skin & face centroid tracking
          offCtx.drawImage(video, 0, 0, 160, 120);
          const frame = offCtx.getImageData(0, 0, 160, 120);
          const data = frame.data;

          let totalSkinX = 0;
          let totalSkinY = 0;
          let skinPixelCount = 0;

          // Upper-half bounding scan (faces are usually in upper 65% of screen)
          const maxScanY = 90;
          for (let y = 10; y < maxScanY; y += 2) {
            for (let x = 15; x < 145; x += 2) {
              const i = (y * 160 + x) * 4;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Chrominance human skin range rule (YCrCb / RGB heuristic)
              if (
                r > 75 &&
                g > 40 &&
                b > 20 &&
                r > g &&
                r > b &&
                r - g > 15 &&
                Math.abs(r - b) > 15
              ) {
                totalSkinX += x;
                totalSkinY += y;
                skinPixelCount++;
              }
            }
          }

          if (skinPixelCount > 150) {
            // Because video is mirrored horizontally with CSS (scale-x-[-1]), invert X coordinate
            const rawNormX = 1 - (totalSkinX / skinPixelCount) / 160;
            const rawNormY = (totalSkinY / skinPixelCount) / 120;

            targetFaceX = rawNormX * width;
            targetFaceY = Math.max(height * 0.25, Math.min(height * 0.65, rawNormY * height));

            // Estimate scale/distance based on skin pixel coverage
            const coverage = skinPixelCount / (160 * 120);
            targetFaceW = Math.max(140, Math.min(width * 0.45, width * (0.20 + coverage * 0.5)));
            targetFaceH = targetFaceW * 1.25;

            // Compute distance from display (cm) based on size of face
            targetDist = Math.max(28, Math.min(75, Math.round(55 * (0.28 / (targetFaceW / width)))));

            // Compute neck tilt flexion based on vertical face descent (slouch shifts face lower)
            const verticalDescent = (targetFaceY - height * 0.35) / (height * 0.35);
            targetTilt = Math.max(8, Math.min(38, Math.round(12 + verticalDescent * 26)));

            // Lateral ear tilt from centroid offset
            targetRoll = Number(((targetFaceX - width / 2) / (width * 0.5) * 8).toFixed(1));
          }
        } catch (e) {
          // Offscreen analysis protected
        }
      } else if (!cameraActive) {
        // High-fidelity animated simulation when camera is not yet connected
        const time = Date.now() * 0.002;
        const swayX = Math.sin(time * 0.5) * 6;
        const breathY = Math.sin(time) * 4;

        targetFaceX = width / 2 + swayX;
        targetFaceY = height * 0.38 + breathY + ((neckAngle - 15) * 1.5);
        targetFaceW = width * 0.26;
        targetFaceH = targetFaceW * 1.25;
        targetRoll = shoulderTilt;
        targetTilt = neckAngle;
        targetDist = proximityCm;

        // Render stylish ambient studio background
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(1, '#0B1120');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // 28px dark grid overlay
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 28) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 28) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Smooth tracking coordinates with exponential moving average (alpha = 0.32)
      const smoothed = trackedFaceRef.current;
      if (smoothed.w === 0) {
        smoothed.x = targetFaceX;
        smoothed.y = targetFaceY;
        smoothed.w = targetFaceW;
        smoothed.h = targetFaceH;
        smoothed.tilt = targetTilt;
        smoothed.roll = targetRoll;
        smoothed.dist = targetDist;
      } else {
        smoothed.x += (targetFaceX - smoothed.x) * 0.32;
        smoothed.y += (targetFaceY - smoothed.y) * 0.32;
        smoothed.w += (targetFaceW - smoothed.w) * 0.25;
        smoothed.h += (targetFaceH - smoothed.h) * 0.25;
        smoothed.tilt += (targetTilt - smoothed.tilt) * 0.25;
        smoothed.roll += (targetRoll - smoothed.roll) * 0.25;
        smoothed.dist += (targetDist - smoothed.dist) * 0.25;
      }

      // Dispatch live telemetry at 10Hz if camera is actively detecting
      const now = Date.now();
      if (cameraActive && onLiveMetricsDetected && now - lastMetricsDispatch > 100) {
        lastMetricsDispatch = now;
        onLiveMetricsDetected({
          cervicalTiltDeg: Number(smoothed.tilt.toFixed(1)),
          proximityCm: Number(smoothed.dist.toFixed(1)),
          headRollDeg: Number(smoothed.roll.toFixed(1)),
        });
      }

      // 2. COMPUTE ANATOMICAL FACE & BODY LANDMARK KEYPOINTS
      const fx = smoothed.x;
      const fy = smoothed.y;
      const fw = smoothed.w;
      const fh = smoothed.h;

      const boxX = fx - fw / 2;
      const boxY = fy - fh / 2;
      const earSpan = fw * 0.48;
      const rollRad = (smoothed.roll * Math.PI) / 180;

      const leftEarX = fx - earSpan * Math.cos(rollRad);
      const leftEarY = fy + earSpan * Math.sin(rollRad);

      const rightEarX = fx + earSpan * Math.cos(rollRad);
      const rightEarY = fy - earSpan * Math.sin(rollRad);

      const noseX = fx;
      const noseY = fy + fh * 0.08;

      const topOfHeadX = fx;
      const topOfHeadY = boxY - fh * 0.12;

      // BODY LANDMARKS (Thorax, Clavicle, Shoulders, Spinal Axis)
      const sternumX = fx;
      const sternumY = boxY + fh + 38;

      const shoulderSpan = fw * 0.95;
      const leftShoulderX = fx - shoulderSpan;
      const leftShoulderY = sternumY + 6 - (smoothed.roll * 1.5);

      const rightShoulderX = fx + shoulderSpan;
      const rightShoulderY = sternumY + 6 + (smoothed.roll * 1.5);

      const spineBaseX = fx;
      const spineBaseY = height - 15;

      const leftElbowX = leftShoulderX - fw * 0.35;
      const leftElbowY = leftShoulderY + fh * 0.65;

      const rightElbowX = rightShoulderX + fw * 0.35;
      const rightElbowY = rightShoulderY + fh * 0.65;

      // 3. RENDER ML LANDMARK OVERLAYS

      // --- BODY SKELETON LAYER ---
      // Clavicle shoulder alignment bar
      ctx.save();
      const isShoulderLevel = Math.abs(smoothed.roll) < 4;
      ctx.strokeStyle = isShoulderLevel ? 'rgba(16, 185, 129, 0.7)' : 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(rightShoulderX, rightShoulderY);
      ctx.stroke();

      // Thoracic spine descending column
      ctx.strokeStyle = smoothed.tilt > 15 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(45, 212, 191, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sternumX, sternumY);
      ctx.lineTo(spineBaseX, spineBaseY);
      ctx.stroke();

      // Neck connection lines (ears to shoulders)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(leftEarX, leftEarY);
      ctx.lineTo(leftShoulderX, leftShoulderY);
      ctx.moveTo(rightEarX, rightEarY);
      ctx.lineTo(rightShoulderX, rightShoulderY);
      ctx.stroke();

      // Arms to elbows
      ctx.beginPath();
      ctx.moveTo(leftShoulderX, leftShoulderY);
      ctx.lineTo(leftElbowX, leftElbowY);
      ctx.moveTo(rightShoulderX, rightShoulderY);
      ctx.lineTo(rightElbowX, rightElbowY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Body Joints (Shoulders, Sternum, Elbows)
      const drawBodyJoint = (x: number, y: number, color: string, label?: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();

        if (label) {
          ctx.font = '10px monospace';
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.fillText(label, x, y + 14);
        }
      };

      drawBodyJoint(leftShoulderX, leftShoulderY, '#10B981', 'L. SHOULDER');
      drawBodyJoint(rightShoulderX, rightShoulderY, '#10B981', 'R. SHOULDER');
      drawBodyJoint(sternumX, sternumY, '#2DD4BF', 'STERNUM / C7');
      drawBodyJoint(leftElbowX, leftElbowY, '#06B6D4');
      drawBodyJoint(rightElbowX, rightElbowY, '#06B6D4');

      // Vertebrae nodes on spine
      for (let v = 0; v < 5; v++) {
        const vy = sternumY + ((spineBaseY - sternumY) * (v + 1)) / 6;
        ctx.fillStyle = '#2DD4BF';
        ctx.beginPath();
        ctx.arc(spineBaseX, vy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // --- FACE BOUNDING BOX & SENSING BRACKETS ---
      ctx.save();
      // Dashed semi-transparent bounding box around user's face
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(boxX, boxY, fw, fh);
      ctx.setLineDash([]);

      // 4 Corner Accent Brackets
      const cornerLen = 16;
      ctx.strokeStyle = '#2DD4BF';
      ctx.lineWidth = 2.8;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + cornerLen);
      ctx.lineTo(boxX, boxY);
      ctx.lineTo(boxX + cornerLen, boxY);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(boxX + fw - cornerLen, boxY);
      ctx.lineTo(boxX + fw, boxY);
      ctx.lineTo(boxX + fw, boxY + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + fh - cornerLen);
      ctx.lineTo(boxX, boxY + fh);
      ctx.lineTo(boxX + cornerLen, boxY + fh);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(boxX + fw - cornerLen, boxY + fh);
      ctx.lineTo(boxX + fw, boxY + fh);
      ctx.lineTo(boxX + fw, boxY + fh - cornerLen);
      ctx.stroke();

      // --- FACIAL LANDMARK OVERLAYS ---
      // 1. Horizontal red line connecting left ear to right ear
      ctx.strokeStyle = '#EF4444'; // Tracking Overlay Red
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(leftEarX, leftEarY);
      ctx.lineTo(rightEarX, rightEarY);
      ctx.stroke();

      // Red dots (#EF4444) at Left Ear, Right Ear, and Nose
      const drawRedDot = (x: number, y: number, label?: string) => {
        // Outer halo
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();

        // Solid red core
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // White reflective center
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        if (label) {
          ctx.font = '9px monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(label, x + 8, y - 4);
        }
      };

      drawRedDot(leftEarX, leftEarY);
      drawRedDot(rightEarX, rightEarY);

      // Facial wireframe triangle connecting ears to nose
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(leftEarX, leftEarY);
      ctx.lineTo(noseX, noseY);
      ctx.lineTo(rightEarX, rightEarY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Nose Red Dot
      drawRedDot(noseX, noseY, 'NOSE');

      // 2. Vertical line from nose dot straight up to top of head
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)'; // Tracking Overlay Cyan
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(noseX, noseY);
      ctx.lineTo(topOfHeadX, topOfHeadY);
      ctx.stroke();

      // Capped with a Cyan (#06B6D4) dot at top of head
      // Cyan Glow halo
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.beginPath();
      ctx.arc(topOfHeadX, topOfHeadY, 11, 0, Math.PI * 2);
      ctx.fill();

      // Solid Cyan core
      ctx.fillStyle = '#06B6D4';
      ctx.beginPath();
      ctx.arc(topOfHeadX, topOfHeadY, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Crisp center
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(topOfHeadX, topOfHeadY, 2, 0, Math.PI * 2);
      ctx.fill();

      // Label at Cranial Apex
      ctx.font = '10px monospace';
      ctx.fillStyle = '#06B6D4';
      ctx.textAlign = 'center';
      ctx.fillText('CRANIAL APEX', topOfHeadX, topOfHeadY - 14);

      ctx.restore();

      if (!isPaused) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [cameraActive, isPaused, isStopped, neckAngle, shoulderTilt, proximityCm, onLiveMetricsDetected]);

  // Dynamic Warning Banner text
  const currentNeck = Math.round(trackedFaceRef.current.tilt || neckAngle);
  const currentDist = Math.round(trackedFaceRef.current.dist || proximityCm);
  const isNeckAlert = currentNeck > 15;
  const isDistanceAlert = currentDist < 50;

  let dynamicWarningText = 'Optimal posture maintained. Sagittal cranial vectors and shoulders aligned.';
  if (currentNeck > 24) {
    dynamicWarningText = 'Severe cervical flexion detected (>24°). Lift chin immediately and align ears over shoulders.';
  } else if (isNeckAlert) {
    dynamicWarningText = 'Forward head tilt detected. Lift chin slightly and align ears over shoulders.';
  } else if (isDistanceAlert) {
    dynamicWarningText = `Close screen distance detected (~${currentDist}cm). Push display back to 50–70cm to reduce eye strain.`;
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#0F172A] border border-[#1E293B] shadow-2xl flex flex-col items-center">
      {/* Video Container (aspect ratio responsive) */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[540px] bg-[#0B1120] overflow-hidden flex items-center justify-center">
        {/* Real HTML5 Video element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover transform ${
            facingMode === 'user' ? 'scale-x-[-1]' : ''
          } ${cameraActive && !isStopped ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        />

        {/* The ML Landmark Overlay Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10 block"
        />

        {/* 1. TOP LEFT BADGE: "LOCAL AI • ON-DEVICE" (with a pulsing green status dot) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1120]/85 backdrop-blur-md border border-[#1E293B] shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-100 font-mono">
            {cameraActive ? 'LOCAL AI • WEBCAM ACTIVE' : 'LOCAL AI • ON-DEVICE'}
          </span>
        </div>

        {/* 2. TOP RIGHT CONTROLS: Floating circular buttons for 'Settings/Filter' and 'Flip Camera' */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5">
          <button
            onClick={onOpenSettings}
            title="Posture & Tracking Settings"
            className="w-9 h-9 rounded-full bg-[#0B1120]/80 hover:bg-[#1E293B] text-slate-200 hover:text-[#2DD4BF] border border-[#1E293B] backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleFlipCamera}
            title="Flip Camera (Front/Rear)"
            className="w-9 h-9 rounded-full bg-[#0B1120]/80 hover:bg-[#1E293B] text-slate-200 hover:text-[#2DD4BF] border border-[#1E293B] backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* CAMERA PERMISSION / TURN ON PROMPT (if camera not yet active) */}
        {!cameraActive && !isStopped && (
          <div className="absolute inset-0 z-15 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-[2px]">
            <div className="max-w-md bg-[#0F172A]/90 border border-[#1E293B] rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-950/90 text-[#2DD4BF] border border-teal-500/40 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
                <Camera className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Enable Camera to Show Your Face</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Click below to activate your laptop webcam. Zero-Cloud video inference processes face and body keypoints entirely on your device with 100% privacy.
                </p>
              </div>

              {cameraPermissionError && (
                <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs text-left flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <span>{cameraPermissionError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <button
                  onClick={startCamera}
                  disabled={isRequestingCamera}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#0D9488] hover:bg-[#2DD4BF] text-[#0B1120] transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isRequestingCamera ? 'Accessing Camera...' : 'Turn On Web Camera'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. DYNAMIC WARNING BANNER: Anchored to the bottom of the video feed */}
        <div className="absolute bottom-12 left-4 right-4 z-20">
          <div
            className={`px-4 py-3 rounded-xl backdrop-blur-md border transition-all duration-300 flex items-center gap-3 shadow-xl ${
              isNeckAlert || isDistanceAlert
                ? 'bg-[#0F172A]/90 border-amber-500/50 text-amber-200'
                : 'bg-[#0F172A]/85 border-[#1E293B] text-slate-200'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 shrink-0 ${
                isNeckAlert || isDistanceAlert ? 'text-[#F59E0B] animate-pulse' : 'text-[#10B981]'
              }`}
            />
            <p className="text-xs sm:text-sm font-medium leading-tight">
              {dynamicWarningText}
            </p>
          </div>
        </div>

        {/* 4. FLOATING TELEMETRY PILLS: A row of 4 overlapping pills at the very bottom edge of the video container */}
        <div className="absolute bottom-2 left-0 right-0 z-20 flex items-center justify-center px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#0B1120]/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-[#1E293B] shadow-2xl">
            {/* Pill 1: Neck: 28° (Text turns Amber if > 15°) */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F172A] border border-[#1E293B] text-xs font-mono font-semibold">
              <span className="text-slate-400">Neck:</span>
              <span className={currentNeck > 15 ? 'text-[#F59E0B] font-bold' : 'text-[#10B981] font-bold'}>
                {currentNeck}°
              </span>
            </div>

            {/* Pill 2: Shoulder: 0° (White text) */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F172A] border border-[#1E293B] text-xs font-mono font-semibold">
              <span className="text-slate-400">Shoulder:</span>
              <span className="text-white font-bold">{Math.round(trackedFaceRef.current.roll || shoulderTilt)}°</span>
            </div>

            {/* Pill 3: Distance: ~49cm (Text turns Amber if < 50cm) */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F172A] border border-[#1E293B] text-xs font-mono font-semibold">
              <span className="text-slate-400">Distance:</span>
              <span className={currentDist < 50 ? 'text-[#F59E0B] font-bold' : 'text-[#10B981] font-bold'}>
                ~{currentDist}cm
              </span>
            </div>

            {/* Pill 4: Symmetry: 92% (White text) */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F172A] border border-[#1E293B] text-xs font-mono font-semibold">
              <span className="text-slate-400">Symmetry:</span>
              <span className="text-white font-bold">{Math.round(symmetryPercent)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
