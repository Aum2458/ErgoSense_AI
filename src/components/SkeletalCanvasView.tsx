import React, { useRef, useEffect } from 'react';
import { BiomechanicalState } from '../types/ergosense.ts';

interface SkeletalCanvasViewProps {
  cervicalAngle?: number;       // degrees (e.g. 12 - 32)
  torsoSlouch?: number;         // degrees (e.g. 0 - 25)
  shoulderTilt?: number;        // degrees (e.g. -10 to +10)
  viewingDistanceCm?: number;   // e.g. 40 - 75 cm
  state?: BiomechanicalState;
  interactive?: boolean;
  onAngleChange?: (neck: number, torso: number, shoulder: number) => void;
  width?: number;
  height?: number;
  showSkeletonOnly?: boolean;
  ambientLux?: number;
}

export const SkeletalCanvasView: React.FC<SkeletalCanvasViewProps> = ({
  cervicalAngle = 14,
  torsoSlouch = 4,
  shoulderTilt = 0,
  viewingDistanceCm = 56,
  state = 'OPTIMAL',
  width = 460,
  height = 360,
  showSkeletonOnly = false,
  ambientLux = 60,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Canvas Background
    if (showSkeletonOnly) {
      ctx.fillStyle = '#020617'; // Privacy Black Canvas
      ctx.fillRect(0, 0, width, height);
    } else {
      // Subtle biometric radar dark gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(1, '#0B1120');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle coordinate grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = step; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Biomechanical Color Tokens
    let accentColor = '#10B981'; // OPTIMAL
    let accentMuted = 'rgba(16, 185, 129, 0.2)';
    if (state === 'TRANSIENT_SHIFT') {
      accentColor = '#F59E0B'; // AMBER
      accentMuted = 'rgba(245, 158, 11, 0.2)';
    } else if (state === 'SUSTAINED_DEVIATION') {
      accentColor = '#F43F5E'; // ROSE
      accentMuted = 'rgba(244, 63, 94, 0.2)';
    } else if (state === 'STATIC_FATIGUE') {
      accentColor = '#06B6D4'; // CYAN
      accentMuted = 'rgba(6, 182, 212, 0.2)';
    } else if (state === 'UNRELIABLE_VIEW') {
      accentColor = '#64748B'; // SLATE
      accentMuted = 'rgba(100, 116, 139, 0.2)';
    }

    // Geometry Calculation
    const cx = width / 2;
    const cy = height / 2;

    // Scale scale with distance (closer = larger)
    const distScale = Math.max(0.7, Math.min(1.3, 55 / Math.max(30, viewingDistanceCm)));

    // Forward neck tilt translates head horizontally and lowers it
    const headTiltX = (cervicalAngle - 10) * 2.2 * distScale;
    const headTiltY = (cervicalAngle - 10) * 1.1 * distScale;

    // Torso lean offset
    const torsoOffsetX = torsoSlouch * 2.0 * distScale;

    // Shoulder tilt offset
    const shoulderDeltaY = (shoulderTilt * 2.2) * distScale;

    // Coordinates:
    // Mid-Hip
    const hipX = cx - 10 + torsoOffsetX * 0.3;
    const hipY = cy + 130 * distScale;

    // Mid-Shoulder
    const sternumX = cx + torsoOffsetX;
    const sternumY = cy + 30 * distScale;

    const shoulderSpan = 110 * distScale;
    const leftShoulder = { x: sternumX - shoulderSpan / 2, y: sternumY + shoulderDeltaY };
    const rightShoulder = { x: sternumX + shoulderSpan / 2, y: sternumY - shoulderDeltaY };

    // Head / Face
    const earY = sternumY - 80 * distScale + headTiltY;
    const earX = sternumX + headTiltX;

    const leftEar = { x: earX - 44 * distScale, y: earY };
    const rightEar = { x: earX + 44 * distScale, y: earY };
    const nose = { x: earX, y: earY + 12 * distScale };
    const cranialDot = { x: earX, y: earY - 45 * distScale };

    // Elbows & Wrists
    const leftElbow = { x: leftShoulder.x - 30 * distScale, y: leftShoulder.y + 75 * distScale };
    const rightElbow = { x: rightShoulder.x + 30 * distScale, y: rightShoulder.y + 75 * distScale };
    const leftWrist = { x: leftElbow.x + 35 * distScale, y: leftElbow.y + 50 * distScale };
    const rightWrist = { x: rightElbow.x - 35 * distScale, y: rightElbow.y + 50 * distScale };

    // 1. Draw Biometric Kinetic Spine Curve
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.quadraticCurveTo((hipX + sternumX) / 2 - 15, (hipY + sternumY) / 2, sternumX, sternumY);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 2. Draw Cervical Spine Arc (C1-C7)
    ctx.beginPath();
    ctx.moveTo(sternumX, sternumY);
    ctx.quadraticCurveTo(sternumX + headTiltX * 0.4, (sternumY + earY) / 2, earX, earY);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Draw Clavicle / Acromial Beam
    ctx.beginPath();
    ctx.moveTo(leftShoulder.x, leftShoulder.y);
    ctx.lineTo(rightShoulder.x, rightShoulder.y);
    ctx.strokeStyle = '#2DD4BF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4. Draw Arms
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.lineWidth = 2.5;

    // Left Arm
    ctx.beginPath();
    ctx.moveTo(leftShoulder.x, leftShoulder.y);
    ctx.lineTo(leftElbow.x, leftElbow.y);
    ctx.lineTo(leftWrist.x, leftWrist.y);
    ctx.stroke();

    // Right Arm
    ctx.beginPath();
    ctx.moveTo(rightShoulder.x, rightShoulder.y);
    ctx.lineTo(rightElbow.x, rightElbow.y);
    ctx.lineTo(rightWrist.x, rightWrist.y);
    ctx.stroke();

    // 5. Draw Dashed Head Bounding Box
    ctx.strokeStyle = accentMuted;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    const boxW = 100 * distScale;
    const boxH = 120 * distScale;
    ctx.strokeRect(earX - boxW / 2, cranialDot.y - 10, boxW, boxH);
    ctx.setLineDash([]);

    // 6. Ear-to-Ear Horizontal Tracking Beam
    ctx.beginPath();
    ctx.moveTo(leftEar.x, leftEar.y);
    ctx.lineTo(rightEar.x, rightEar.y);
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 7. Cranial Vertical Vector Line (Nose to Top of Head)
    ctx.beginPath();
    ctx.moveTo(nose.x, nose.y);
    ctx.lineTo(cranialDot.x, cranialDot.y);
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 8. Nodes / Joint Spheres
    const drawJoint = (x: number, y: number, radius: number, fill: string, stroke: string = '#0B1120') => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    };

    // Facial markers
    drawJoint(leftEar.x, leftEar.y, 5, '#EF4444');
    drawJoint(rightEar.x, rightEar.y, 5, '#EF4444');
    drawJoint(nose.x, nose.y, 5.5, '#EF4444');
    drawJoint(cranialDot.x, cranialDot.y, 6.5, '#06B6D4');

    // Shoulders
    drawJoint(leftShoulder.x, leftShoulder.y, 7, '#2DD4BF');
    drawJoint(rightShoulder.x, rightShoulder.y, 7, '#2DD4BF');
    drawJoint(sternumX, sternumY, 5, '#38BDF8');

    // Elbows & Wrists
    drawJoint(leftElbow.x, leftElbow.y, 4.5, '#94A3B8');
    drawJoint(rightElbow.x, rightElbow.y, 4.5, '#94A3B8');
    drawJoint(leftWrist.x, leftWrist.y, 4, '#CBD5E1');
    drawJoint(rightWrist.x, rightWrist.y, 4, '#CBD5E1');

    // 9. Angular Arc Indicator at Cervical Junction
    ctx.beginPath();
    const arcRadius = 26;
    ctx.arc(sternumX, sternumY, arcRadius, -Math.PI / 2, -Math.PI / 2 + (cervicalAngle * Math.PI) / 180);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Arc Label
    ctx.font = '10px monospace';
    ctx.fillStyle = accentColor;
    ctx.fillText(`${cervicalAngle.toFixed(1)}°`, sternumX + 18, sternumY - 14);

    // Dynamic HUD Watermark
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.fillText(`Cervical: ${cervicalAngle.toFixed(1)}° · Torso: ${torsoSlouch.toFixed(1)}° · Dist: ${viewingDistanceCm}cm`, 14, height - 14);

  }, [cervicalAngle, torsoSlouch, shoulderTilt, viewingDistanceCm, state, width, height, showSkeletonOnly, ambientLux]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#1E293B] shadow-xl bg-[#0F172A] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="block"
      />
    </div>
  );
};
