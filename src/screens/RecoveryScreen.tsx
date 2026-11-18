import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Play, 
  CheckCircle, 
  RotateCcw, 
  X, 
  Heart, 
  ShieldCheck, 
  Activity,
  Award
} from 'lucide-react';

interface RecoveryRoutine {
  id: string;
  title: string;
  durationSec: number;
  targetArea: string;
  description: string;
  instructions: string[];
}

const RECOVERY_CATALOG: RecoveryRoutine[] = [
  {
    id: 'cervical_neck_reset',
    title: 'Cervical Neck Reset',
    durationSec: 90,
    targetArea: 'C1–C7 Cervical Spine & Suboccipitals',
    description: 'Relieves forward head tension and restores natural lordotic curvature.',
    instructions: [
      'Gently retract chin backward to create a double chin (Chin Tuck).',
      'Hold the tuck for 5 seconds while keeping gaze level.',
      'Tilt head gently to right shoulder; breathe deeply for 3 cycles.',
      'Repeat on left side; finish with slow circular shoulder shrugs.',
    ],
  },
  {
    id: 'wrist_tendon_relief',
    title: 'Wrist & Tendon Relief',
    durationSec: 120,
    targetArea: 'Flexor Digitorum & Median Nerve',
    description: 'Decompresses the carpal tunnel and reduces repetitive strain injury (RSI) stiffness.',
    instructions: [
      'Extend right arm out, fingertips facing downward.',
      'Apply gentle pressure to fingers with left hand for 15 seconds.',
      'Flip palm upward, gently pull back on fingertips.',
      'Switch to left arm and repeat sequence.',
    ],
  },
  {
    id: 'shoulder_trap_drop',
    title: 'Shoulder & Trapezius Drop',
    durationSec: 90,
    targetArea: 'Upper Trapezius & Levator Scapulae',
    description: 'Releases stress-induced hunched shoulders and upper thoracic rigidity.',
    instructions: [
      'Inhale deeply and shrug shoulders straight up to your ears.',
      'Hold maximum contraction for 4 seconds.',
      'Exhale sharply and drop shoulders completely down with gravity.',
      'Roll shoulders backward 5 times in slow, wide circles.',
    ],
  },
];

export const RecoveryScreen: React.FC = () => {
  const [completedResets, setCompletedResets] = useState<number>(2);
  const totalGoalResets = 3;
  const progressPercent = Math.round((completedResets / totalGoalResets) * 100);

  const [activeRoutine, setActiveRoutine] = useState<RecoveryRoutine | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showDone, setShowDone] = useState<boolean>(false);

  const handleStart = (routine: RecoveryRoutine) => {
    setActiveRoutine(routine);
    setSecondsRemaining(routine.durationSec);
    setIsRunning(true);
    setShowDone(false);
  };

  useEffect(() => {
    if (!isRunning || !activeRoutine) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setShowDone(true);
          setCompletedResets((c) => Math.min(totalGoalResets, c + 1));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, activeRoutine]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#00BFA5]" />
            Micro-Recovery Resets
          </h2>
          <p className="text-xs text-slate-400">
            Targeted 90-120 second neuromuscular recalibrations to clear static muscle fatigue
          </p>
        </div>
      </div>

      {/* 1. Progress Card: DAILY RECOVERY GOAL */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Daily Recovery Goal
          </span>
          <h3 className="text-2xl font-bold text-white">
            {completedResets} of {totalGoalResets} Resets Completed
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            Taking regular micro-breaks maintains sustained cognitive focus and prevents ischemic tension in postural neck muscles.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Optimal Recovery Cadence
            </span>
          </div>
        </div>

        {/* Circular Ring 66% */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width="130" height="130" className="transform -rotate-90">
            <circle
              cx="65"
              cy="65"
              r="52"
              stroke="#1E293B"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="65"
              cy="65"
              r="52"
              stroke="#00BFA5"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black font-mono text-white">{progressPercent}%</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Today</span>
          </div>
        </div>
      </div>

      {/* 2. Guided Recovery Catalog */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00BFA5]" />
          Guided Recovery Catalog
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECOVERY_CATALOG.map((item) => (
            <div
              key={item.id}
              className="bg-[#0F172A] border border-[#1E293B] hover:border-[#00BFA5]/50 transition-all rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#131E33] text-teal-400 border border-teal-500/30">
                    {item.targetArea}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mt-3">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#1E293B]">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {item.durationSec}s Guided
                  </span>
                  <span className="text-teal-400 text-xs font-semibold">Immediate Relief</span>
                </div>

                <button
                  onClick={() => handleStart(item)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#00BFA5] hover:bg-[#2DD4BF] text-[#0B1120] transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>▶ Start {item.durationSec}s</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Modal */}
      {activeRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{activeRoutine.title}</h3>
                <span className="text-xs text-teal-400">{activeRoutine.targetArea}</span>
              </div>
              <button
                onClick={() => setActiveRoutine(null)}
                className="p-1 rounded-lg bg-[#131E33] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {showDone ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-white">Reset Completed!</h4>
                <p className="text-xs text-slate-400">
                  Cervical blood flow restored. You are ready to resume work with optimal alignment.
                </p>
                <button
                  onClick={() => setActiveRoutine(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase bg-[#00BFA5] text-[#0B1120] mt-3"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-4 bg-[#0B1120] rounded-xl border border-[#1E293B]">
                  <div className="text-5xl font-black font-mono text-teal-400">
                    {secondsRemaining}s
                  </div>
                  <span className="text-xs text-slate-400 mt-1">Inhale 4s • Hold 4s • Exhale 4s</span>
                </div>

                <div className="space-y-2 bg-[#131E33] p-4 rounded-xl border border-[#1E293B]">
                  <div className="text-xs font-bold text-white">Action Steps:</div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {activeRoutine.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
