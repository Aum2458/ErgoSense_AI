import React, { useEffect, useRef, useState } from 'react';
import { PostureStatus } from '../types/ergosense.ts';

interface BiomechanicalSpineCanvasProps {
  neckAngle: number; // in degrees
  status?: PostureStatus;
  interactive?: boolean;
  onAngleChange?: (angle: number) => void;
  width?: number;
  height?: number;
  showLabels?: boolean;
}

export const BiomechanicalSpineCanvas: React.FC<BiomechanicalSpineCanvasProps> = ({
  neckAngle,
  status = 'optimal',
  interactive = false,
  onAngleChange,
  width = 460,
  height = 420,
  showLabels = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smoothedAngleRef = useRef(neckAngle);
  const [hoveredVertebra, setHoveredVertebra] = useState<string | null>(null);

  // Compute Cervical Disc Load in kg based on Hansraj Spinal Biomechanics model
  // 0° ~ 5kg (12 lbs), 15° ~ 12kg (27 lbs), 30° ~ 18kg (40 lbs), 45° ~ 22kg (49 lbs)
  const angleClamp = Math.max(0, Math.min(45, neckAngle));
  const spinalLoadKg = (5 + (angleClamp / 45) * 17).toFixed(1);
  const spinalLoadLbs = Math.round(Number(spinalLoadKg) * 2.20462);

  // Determine dynamic color
  let activeColor = '#10B981'; // Emerald
  let activeGlow = 'rgba(16, 185, 129, 0.4)';
  let statusText = 'Optimal Cervical Alignment';
  if (neckAngle > 24) {
    activeColor = '#F43F5E'; // Rose
    activeGlow = 'rgba(244, 63, 94, 0.45)';
    statusText = 'Severe Cervical Slouch';
  } else if (neckAngle >= 15) {
    activeColor = '#F59E0B'; // Amber
    activeGlow = 'rgba(245, 158, 11, 0.4)';
    statusText = 'Attention: Forward Head Posture';
  }

  // Smooth animation frame loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      // Lerp smoothed angle
      smoothedAngleRef.current += (neckAngle - smoothedAngleRef.current) * 0.12;
      const angle = smoothedAngleRef.current;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displayWidth = width;
      const displayHeight = height;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // 1. Draw 28px Dark Grid Overlay (rgba(255, 255, 255, 0.04))
      const gridSize = 28;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';

      for (let x = 0; x < displayWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, displayHeight);
        ctx.stroke();
      }

      for (let y = 0; y < displayHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(displayWidth, y);
        ctx.stroke();
      }

      // Vertical reference center line (ideal sagittal plane)
      const baseX = displayWidth / 2;
      const baseY = displayHeight - 36;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(baseX, 20);
      ctx.lineTo(baseX, baseY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Mathematical cubic bezier curve
      // Anchor at bottom center: (width/2, height - 36px)
      // Head position computed dynamically via:
      // headX = baseX + Math.sin(neckAngle * Math.PI / 180) * (width * 0.28)
      const spineLen = displayHeight * 0.62;
      const rad = (angle * Math.PI) / 180;
      const headX = baseX + Math.sin(rad) * (displayWidth * 0.28);
      const headY = baseY - Math.cos((angle * 0.45 * Math.PI) / 180) * spineLen;

      // Control points for anatomical cervical/thoracic curvature
      const cp1X = baseX + (headX - baseX) * 0.12;
      const cp1Y = baseY - spineLen * 0.42;

      const cp2X = baseX + (headX - baseX) * 0.65;
      const cp2Y = baseY - spineLen * 0.85;

      // Draw subtle ideal spine ghost curve for visual comparison
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.15)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.bezierCurveTo(baseX, baseY - spineLen * 0.4, baseX, baseY - spineLen * 0.8, baseX, baseY - spineLen);
      ctx.stroke();

      // Draw primary dynamic spine path
      ctx.shadowColor = activeGlow;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, headX, headY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Draw 7 Vertebrae Nodes along the cubic curve
      // Cubic bezier formula: B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
      const vertebraeLabels = ['T1/C7', 'C6', 'C5', 'C4', 'C3', 'C2 (Axis)', 'C1 (Atlas)'];
      const points: { x: number; y: number; label: string; t: number }[] = [];

      for (let i = 0; i < 7; i++) {
        const t = (i + 0.3) / 7.2;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;

        const vx = mt3 * baseX + 3 * mt2 * t * cp1X + 3 * mt * t2 * cp2X + t3 * headX;
        const vy = mt3 * baseY + 3 * mt2 * t * cp1Y + 3 * mt * t2 * cp2Y + t3 * headY;

        points.push({ x: vx, y: vy, label: vertebraeLabels[i], t });
      }

      // Draw vertebrae disc nodes with lateral processes
      points.forEach((pt, idx) => {
        const isHovered = hoveredVertebra === pt.label;
        const isStressPoint = idx <= 2 && angle > 20; // Lower cervical spine experiences highest stress

        ctx.save();
        ctx.translate(pt.x, pt.y);

        // Transverse process lateral wings
        ctx.strokeStyle = isStressPoint ? 'rgba(244, 63, 94, 0.7)' : 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();

        // Vertebral Body Disc
        ctx.fillStyle = isStressPoint ? '#F43F5E' : isHovered ? '#2DD4BF' : '#131E33';
        ctx.strokeStyle = isHovered ? '#2DD4BF' : activeColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = activeGlow;
        ctx.shadowBlur = isHovered ? 12 : 6;

        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Spinal canal center point
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Vertebra Label
        if (showLabels) {
          ctx.font = '10px monospace';
          ctx.fillStyle = isHovered ? '#2DD4BF' : 'rgba(255, 255, 255, 0.6)';
          ctx.textAlign = 'left';
          ctx.fillText(pt.label, 14, 3);
        }

        ctx.restore();
      });

      // 4. Render Cranial Skull Circle with Forward Gaze Vector Line
      const skullRadius = 22;
      ctx.save();
      ctx.translate(headX, headY);

      // Skull circle
      ctx.shadowColor = activeGlow;
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#131E33';
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(0, -skullRadius + 4, skullRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Facial angle tilt (tilt skull with neck flexion)
      const skullAngle = (angle * 0.85 * Math.PI) / 180;
      ctx.rotate(skullAngle);

      // Eye node
      ctx.fillStyle = '#06B6D4'; // Status Cyan
      ctx.beginPath();
      ctx.arc(skullRadius * 0.55, -skullRadius + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Forward Gaze Vector Line
      const gazeLength = 52;
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(skullRadius * 0.55, -skullRadius + 2);
      ctx.lineTo(skullRadius * 0.55 + gazeLength, -skullRadius + 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Gaze arrow pointer
      ctx.fillStyle = '#06B6D4';
      ctx.beginPath();
      ctx.moveTo(skullRadius * 0.55 + gazeLength + 5, -skullRadius + 2);
      ctx.lineTo(skullRadius * 0.55 + gazeLength, -skullRadius - 2);
      ctx.lineTo(skullRadius * 0.55 + gazeLength, -skullRadius + 6);
      ctx.closePath();
      ctx.fill();

      // Gaze Label
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#06B6D4';
      ctx.fillText('GAZE AXIS', skullRadius * 0.55 + 8, -skullRadius - 6);

      ctx.restore();

      // 5. Draw Thoracic/Pelvic Anchor Base
      ctx.save();
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(baseX - 32, baseY, 64, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('T1 / THORACIC BASE', baseX, baseY + 12);
      ctx.restore();

      // 6. Draw Angular Arc Indicator
      if (angle > 1) {
        ctx.save();
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const arcRadius = 70;
        ctx.arc(baseX, baseY - spineLen, arcRadius, -Math.PI / 2, -Math.PI / 2 + rad, false);
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = activeColor;
        ctx.textAlign = 'left';
        ctx.fillText(`${angle.toFixed(1)}°`, baseX + 14, baseY - spineLen - 5);
        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [neckAngle, status, activeColor, activeGlow, hoveredVertebra, showLabels, width, height]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Canvas container */}
      <div className="relative rounded-xl overflow-hidden border border-[#1E293B] bg-[#0B1120] p-1 shadow-inner">
        <canvas
          ref={canvasRef}
          style={{ width: `${width}px`, height: `${height}px` }}
          className="block"
        />

        {/* Live Status Overlay Tag */}
        <div className="absolute top-3 left-3 flex items-center space-x-2 bg-[#131E33]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1E293B]">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: activeColor }}
          />
          <span className="text-xs font-medium text-slate-200">
            Cervical Flexion: <strong style={{ color: activeColor }}>{neckAngle.toFixed(1)}°</strong>
          </span>
        </div>

        {/* Dynamic Spinal Biomechanical Load Card */}
        <div className="absolute top-3 right-3 bg-[#131E33]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1E293B] text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cervical Load</div>
          <div className="text-xs font-semibold text-slate-100 flex items-center justify-end gap-1">
            <span style={{ color: activeColor }}>{spinalLoadKg} kg</span>
            <span className="text-slate-400 font-normal">({spinalLoadLbs} lbs)</span>
          </div>
        </div>

        {/* Ideal vs Current Posture Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[11px] text-slate-400 bg-[#131E33]/80 px-2.5 py-1 rounded-md border border-[#1E293B]/60">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Optimal &lt;15°
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> 15°-24°
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F43F5E]" /> &gt;24° Slouch
          </span>
        </div>
      </div>

      {/* Optional Interactive Scrubbing Slider for Live Simulator Testing */}
      {interactive && onAngleChange && (
        <div className="w-full mt-3 px-2 flex items-center gap-3">
          <span className="text-xs text-slate-400 whitespace-nowrap">Tilt Control:</span>
          <input
            type="range"
            min="0"
            max="40"
            step="0.5"
            value={neckAngle}
            onChange={(e) => onAngleChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00BFA5]"
          />
          <span className="text-xs font-mono text-[#00BFA5] w-12 text-right">{neckAngle.toFixed(1)}°</span>
        </div>
      )}
    </div>
  );
};
