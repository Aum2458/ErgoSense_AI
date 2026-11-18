import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, CheckCircle2, AlertTriangle, Clock, RefreshCw, Smartphone, Sparkles, Volume2 } from 'lucide-react';
import { PostureStatus } from '../types/ergosense.ts';

interface PostureGaugesProps {
  neckAngle: number;
  proximityCm: number;
  fatigueIndex?: number;
  blinkRate?: number;
  status: PostureStatus;
}

export const PostureGauges: React.FC<PostureGaugesProps> = ({
  neckAngle,
  proximityCm,
  fatigueIndex = 22,
  blinkRate = 18,
  status,
}) => {
  // 20-20-20 Rule Timer State (20 minutes = 1200 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1200);
  const [isBreakActive, setIsBreakActive] = useState<boolean>(false);
  const [breakTimer, setBreakTimer] = useState<number>(20);
  const [autoTimerEnabled, setAutoTimerEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (!autoTimerEnabled) return;

    const interval = setInterval(() => {
      if (!isBreakActive) {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsBreakActive(true);
            setBreakTimer(20);
            return 1200;
          }
          return prev - 1;
        });
      } else {
        setBreakTimer((prev) => {
          if (prev <= 1) {
            setIsBreakActive(false);
            return 20;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoTimerEnabled, isBreakActive]);

  const resetTimer = () => {
    setSecondsRemaining(1200);
    setIsBreakActive(false);
    setBreakTimer(20);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Proximity status determination (30 cm Close -> 70 cm Safe)
  const proximityPercent = Math.min(100, Math.max(0, ((proximityCm - 30) / (70 - 30)) * 100));
  let proximityColor = '#10B981';
  let proximityLabel = 'Safe Distance';
  if (proximityCm < 38) {
    proximityColor = '#F43F5E';
    proximityLabel = 'Too Close (Eye Strain Risk)';
  } else if (proximityCm < 48) {
    proximityColor = '#F59E0B';
    proximityLabel = 'Approaching Limit';
  }

  // Angle gauge calculation (0° - 35°+)
  const anglePercent = Math.min(100, (neckAngle / 35) * 100);
  let angleColor = '#10B981';
  let angleLabel = 'Optimal Alignment';
  if (neckAngle > 24) {
    angleColor = '#F43F5E';
    angleLabel = 'Critical Cervical Slouch';
  } else if (neckAngle >= 15) {
    angleColor = '#F59E0B';
    angleLabel = 'Forward Head Strain';
  }

  // Fatigue status
  const fatigueColor = fatigueIndex > 60 ? '#F43F5E' : fatigueIndex > 35 ? '#F59E0B' : '#06B6D4';

  return (
    <div className="space-y-4">
      {/* 1. Cervical Spine Angle Gauge */}
      <div className="bg-[#131E33] border border-[#1E293B] rounded-xl p-4 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: angleColor }}
            />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Cervical Spine Angle
            </h4>
          </div>
          <span className="text-sm font-bold font-mono" style={{ color: angleColor }}>
            {neckAngle.toFixed(1)}°
          </span>
        </div>

        {/* Linear Segmented Gauge */}
        <div className="relative w-full h-3 bg-[#0B1120] rounded-full overflow-hidden border border-[#1E293B]">
          {/* Optimal zone marker */}
          <div className="absolute left-0 top-0 bottom-0 w-[42%] bg-emerald-950/40 border-r border-emerald-500/30" />
          {/* Warning zone marker */}
          <div className="absolute left-[42%] top-0 bottom-0 w-[27%] bg-amber-950/40 border-r border-amber-500/30" />
          {/* Severe zone marker */}
          <div className="absolute left-[69%] top-0 bottom-0 right-0 bg-rose-950/40" />

          {/* Current position bar */}
          <div
            className="h-full rounded-full transition-all duration-300 relative"
            style={{
              width: `${Math.max(4, anglePercent)}%`,
              backgroundColor: angleColor,
              boxShadow: `0 0 10px ${angleColor}`,
            }}
          />
        </div>

        <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
          <span>0° (Upright)</span>
          <span className="font-medium" style={{ color: angleColor }}>{angleLabel}</span>
          <span>35°+ (Slouch)</span>
        </div>
      </div>

      {/* 2. Proximity to Display Gauge */}
      <div className="bg-[#131E33] border border-[#1E293B] rounded-xl p-4 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Display Proximity (TrueDepth)
            </h4>
          </div>
          <span className="text-sm font-bold font-mono" style={{ color: proximityColor }}>
            {proximityCm.toFixed(1)} cm
          </span>
        </div>

        {/* Gauge bar with radar range marker */}
        <div className="relative w-full h-3 bg-[#0B1120] rounded-full overflow-hidden border border-[#1E293B]">
          {/* Close danger zone */}
          <div className="absolute left-0 top-0 bottom-0 w-[25%] bg-rose-950/40 border-r border-rose-500/30" />
          {/* Caution zone */}
          <div className="absolute left-[25%] top-0 bottom-0 w-[30%] bg-amber-950/40 border-r border-amber-500/30" />
          {/* Safe ergonomic zone */}
          <div className="absolute left-[55%] top-0 bottom-0 right-0 bg-emerald-950/40" />

          {/* Fill indicator */}
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(4, proximityPercent)}%`,
              backgroundColor: proximityColor,
              boxShadow: `0 0 10px ${proximityColor}`,
            }}
          />
        </div>

        <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
          <span>30 cm (Close)</span>
          <span className="font-medium" style={{ color: proximityColor }}>{proximityLabel}</span>
          <span>70 cm (Safe)</span>
        </div>
      </div>

      {/* 3. Visual Fatigue Progress Bar & Blink Rate */}
      <div className="bg-[#131E33] border border-[#1E293B] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#06B6D4]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Visual Fatigue &amp; Blink Dynamics
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">
              {blinkRate} blinks/min
            </span>
            <span className="text-sm font-bold font-mono" style={{ color: fatigueColor }}>
              {fatigueIndex}%
            </span>
          </div>
        </div>

        <div className="w-full h-2.5 bg-[#0B1120] rounded-full overflow-hidden border border-[#1E293B]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${fatigueIndex}%`,
              backgroundColor: fatigueColor,
              boxShadow: `0 0 8px ${fatigueColor}`,
            }}
          />
        </div>

        <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
          <span className="text-cyan-400">Rest &amp; Alert</span>
          <span>{blinkRate >= 16 ? 'Healthy Micro-blinks' : 'Reduced Blink Rate (Dry Eyes)'}</span>
          <span>High Fatigue</span>
        </div>
      </div>

      {/* 4. 20-20-20 Rule Active Timer Widget */}
      <div className={`border rounded-xl p-4 transition-all ${
        isBreakActive 
          ? 'bg-cyan-950/30 border-[#06B6D4] ring-2 ring-[#06B6D4]/30' 
          : 'bg-[#131E33] border-[#1E293B]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isBreakActive ? 'text-[#06B6D4] animate-spin' : 'text-slate-400'}`} />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                20-20-20 Rule Active Timer
              </h4>
              <p className="text-[11px] text-slate-400">
                Every 20 min, look 20 ft away for 20 sec
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetTimer}
              title="Reset 20-20-20 Timer"
              className="p-1.5 rounded-lg bg-[#0B1120] hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-[#1E293B]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <div className={`px-3 py-1 rounded-lg font-mono font-bold text-sm border ${
              isBreakActive
                ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#06B6D4] animate-pulse'
                : 'bg-[#0B1120] border-[#1E293B] text-slate-200'
            }`}>
              {isBreakActive ? `${breakTimer}s REST` : formattedTimer}
            </div>
          </div>
        </div>

        {isBreakActive && (
          <div className="mt-3 pt-3 border-t border-[#06B6D4]/30 flex items-center justify-between text-xs text-cyan-200 bg-[#06B6D4]/10 p-2.5 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#06B6D4]" />
              <span>Shift gaze to an object 20 feet (6 meters) away now!</span>
            </div>
            <button
              onClick={() => setIsBreakActive(false)}
              className="text-[11px] underline hover:text-white"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
