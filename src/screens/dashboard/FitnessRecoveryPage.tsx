import React, { useState, useEffect } from 'react';
import {
  Flame,
  Play,
  Clock,
  Dumbbell,
  Eye,
  Wind,
  CheckCircle2,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface DeskRoutine {
  id: string;
  title: string;
  targetMuscles: string;
  durationMins: number;
  durationSec: number;
  kcal: number;
  steps: string[];
}

interface MicroRecovery {
  id: string;
  title: string;
  durationSec: number;
  description: string;
  type: 'eye' | 'breath' | 'posture';
  steps: string[];
}

const DESK_ROUTINES: DeskRoutine[] = [
  {
    id: 'desk-reset',
    title: '5-Minute Desk Reset',
    targetMuscles: 'Thoracic Spine · Upper Trapezius · Cervical Extensors',
    durationMins: 5,
    durationSec: 300,
    kcal: 18,
    steps: [
      'Place both feet flat on the floor and lengthen through the crown of your head.',
      'Interlace fingers behind your head and gently extend your upper back over the chair.',
      'Squeeze shoulder blades down and back for 5 slow breaths.',
      'Perform 6 controlled cervical chin retractions.',
    ],
  },
  {
    id: 'wrist-release',
    title: 'Wrist & Forearm Release',
    targetMuscles: 'Carpal Flexors · Extensors · Pronators',
    durationMins: 4,
    durationSec: 240,
    kcal: 12,
    steps: [
      'Extend your right arm straight with palm facing up and draw fingers gently back for 20s.',
      'Flip palm downward and stretch the forearm extensors for 20s.',
      'Repeat on the left forearm.',
      'Open and close fingers wide 15 times to restore tendon glide.',
    ],
  },
  {
    id: 'neck-trap-release',
    title: 'Cervical & Shoulder Release',
    targetMuscles: 'Levator Scapulae · Upper Traps · Suboccipitals',
    durationMins: 6,
    durationSec: 360,
    kcal: 22,
    steps: [
      'Drop your right ear gently toward your right shoulder while anchoring your left hand.',
      'Hold 25 seconds per side without forcing range.',
      'Roll both shoulders backward in wide slow circles 10 times.',
    ],
  },
  {
    id: 'lumbar-hip-mobility',
    title: 'Standing Lumbar & Hip Opener',
    targetMuscles: 'Hip Flexors · Erector Spinae · Glutes',
    durationMins: 7,
    durationSec: 420,
    kcal: 31,
    steps: [
      'Stand tall and take a staggered lunge stance to lengthen anterior hip flexors.',
      'Raise the trailing arm overhead and lean slightly away for 20s per side.',
      'Finish with 10 gentle standing cat-cow spinal mobilizations.',
    ],
  },
];

const MICRO_RECOVERIES: MicroRecovery[] = [
  {
    id: 'eye-20-20-20',
    title: '20-20-20 Eye Comfort Break',
    durationSec: 60,
    description: 'Shift visual focal depth 20 feet away to relax ocular ciliary strain.',
    type: 'eye',
    steps: [
      'Look away from your monitor toward a distant object at least 20 feet away.',
      'Blink slowly and deliberately 10 times to refresh tear film.',
      'Cup palms gently over closed eyes for the final 15 seconds.',
    ],
  },
  {
    id: 'box-breathing',
    title: 'Diaphragmatic Box Breathing',
    durationSec: 90,
    description: '4-4-4-4 parasympathetic cadence to drop shoulder elevation tension.',
    type: 'breath',
    steps: [
      'Inhale smoothly through your nose for 4 seconds, expanding lower ribs.',
      'Hold gently at the top for 4 seconds with jaw relaxed.',
      'Exhale completely for 4 seconds, letting shoulders drop.',
      'Hold empty for 4 seconds and repeat.',
    ],
  },
  {
    id: 'scapular-drop',
    title: 'Seated Shoulder Drop & Reset',
    durationSec: 120,
    description: 'Decompress upper trapezius stiffness accumulated during typing.',
    type: 'posture',
    steps: [
      'Inhale and shrug both shoulders tightly toward your ears for 3 seconds.',
      'Exhale audibly and drop shoulders completely down.',
      'Hold fingertips behind your lower back to open the chest for 20 seconds.',
    ],
  },
];

export const FitnessRecoveryPage: React.FC = () => {
  const [completedSessions, setCompletedSessions] = useState(4);
  const goalSessions = 5;
  const pct = Math.min(100, Math.round((completedSessions / goalSessions) * 100));

  const [activePlayer, setActivePlayer] = useState<{
    title: string;
    totalSec: number;
    steps: string[];
    countsTowardWeekly: boolean;
  } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!activePlayer || secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [activePlayer, secondsLeft]);

  const startPlayer = (title: string, totalSec: number, steps: string[], countsTowardWeekly: boolean) => {
    setActivePlayer({ title, totalSec, steps, countsTowardWeekly });
    setSecondsLeft(totalSec);
    setStepIdx(0);
  };

  const handleComplete = () => {
    if (activePlayer?.countsTowardWeekly) {
      setCompletedSessions((c) => Math.min(goalSessions, c + 1));
    }
    setActivePlayer(null);
  };

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  const formattedClock = `${Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-8">
      {/* Weekly Progress Card */}
      <div className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              WEEKLY FITNESS PROGRESS
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/15 border border-[#F59E0B]/30 px-2.5 py-0.5 rounded-full">
              <Flame className="w-3.5 h-3.5" />
              3-Day Streak
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white">
            {completedSessions} of {goalSessions} Sessions Completed
          </h2>

          <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
            Consistent 5-minute ergonomic resets keep cervical load balanced and reduce afternoon static stiffness.
          </p>
        </div>

        {/* 80% Circular Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width="120" height="120" className="-rotate-90">
            <circle cx="60" cy="60" r={radius} stroke="#0F172A" strokeWidth="10" fill="transparent" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#00C49A"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-white">{pct}%</span>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Weekly</span>
          </div>
        </div>
      </div>

      {/* AI-Verified Desk Routines */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#00C49A]" />
              <span>AI-Verified Desk Routines</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted mobility protocols calibrated for desk posture recovery
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DESK_ROUTINES.map((routine) => (
            <div
              key={routine.id}
              className="bg-[#1E293B]/60 border border-[#1E293B] hover:border-[#00C49A]/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-bold text-white">{routine.title}</h4>
                  <span className="text-xs font-mono text-[#F59E0B] shrink-0 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    {routine.kcal} kcal
                  </span>
                </div>
                <p className="text-xs text-slate-400">{routine.targetMuscles}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-[#00C49A]" />
                  <span>{routine.durationMins} mins</span>
                </div>

                <button
                  onClick={() => startPlayer(routine.title, routine.durationSec, routine.steps, true)}
                  className="px-4 py-2 rounded-xl bg-[#00C49A] hover:bg-[#00b08a] text-[#0B1120] font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-[#00C49A]/15 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>▶ Start</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Micro-Recovery Resets (60-120s Tension Decompressions) */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00C49A]" />
            <span>Micro-Recovery Resets</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Rapid 60–120 second tension decompressions between focus blocks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MICRO_RECOVERIES.map((item) => {
            const Icon = item.type === 'eye' ? Eye : item.type === 'breath' ? Wind : CheckCircle2;
            return (
              <div
                key={item.id}
                className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-center text-[#00C49A]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">{item.durationSec}s</span>
                  </div>
                  <h4 className="text-sm font-bold text-white pt-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>

                <button
                  onClick={() => startPlayer(item.title, item.durationSec, item.steps, false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-[#00C49A]" />
                  <span>Start Reset</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Guided Routine Timer Modal */}
      {activePlayer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">{activePlayer.title}</h3>
              <button
                onClick={() => setActivePlayer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 rounded-xl bg-[#0B1120] border border-[#1E293B] text-center">
              <div className="text-5xl font-extrabold font-mono tabular-nums text-[#00C49A]">
                {formattedClock}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Step {stepIdx + 1} of {activePlayer.steps.length}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1E293B]/60 border border-slate-700/60 text-sm text-slate-100 leading-relaxed">
              {activePlayer.steps[stepIdx]}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setSecondsLeft(activePlayer.totalSec)}
                className="px-3.5 py-2.5 rounded-xl bg-[#1E293B] text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>

              <div className="flex gap-2">
                {stepIdx < activePlayer.steps.length - 1 && (
                  <button
                    onClick={() => setStepIdx((i) => Math.min(activePlayer.steps.length - 1, i + 1))}
                    className="px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-xs font-semibold text-white"
                  >
                    Next Cue
                  </button>
                )}
                <button
                  onClick={handleComplete}
                  className="px-5 py-2.5 rounded-xl bg-[#00C49A] text-[#0B1120] text-xs font-bold"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
