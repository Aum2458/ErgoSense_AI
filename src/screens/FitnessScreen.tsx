import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Play, 
  Flame, 
  Clock, 
  CheckCircle, 
  Award, 
  Sparkles, 
  RotateCcw, 
  X, 
  Volume2, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

interface Routine {
  id: string;
  title: string;
  durationMins: number;
  durationSec: number;
  caloriesBurn: number;
  intensity: 'Gentle' | 'Beginner' | 'Moderate';
  description: string;
  steps: string[];
}

const ROUTINES: Routine[] = [
  {
    id: 'desk_reset_5',
    title: '5-Minute Desk Reset',
    durationMins: 5,
    durationSec: 300,
    caloriesBurn: 18,
    intensity: 'Gentle',
    description: 'Thoracic extensions, scapular retractions, and deep diaphragm pacing to reverse seated slump.',
    steps: [
      'Sit tall with feet flat on the floor',
      'Interlock fingers behind head and arch upper back gently over chair',
      'Squeeze shoulder blades together for 5 deep breaths',
      'Perform 5 lateral neck flexions to each side',
    ],
  },
  {
    id: 'movement_reset_10',
    title: '10-Minute Movement Reset',
    durationMins: 10,
    durationSec: 600,
    caloriesBurn: 38,
    intensity: 'Beginner',
    description: 'Full kinetic chain activation including standing hip-flexor stretches, wall angels, and hamstring openers.',
    steps: [
      'Stand up and take 10 slow overhead reaches',
      'Step into a gentle lunge to open tight anterior hip flexors',
      'Perform 10 wall angels keeping elbows and wrists flat',
      'Spinal rolls from neck down to lower back and return',
    ],
  },
  {
    id: 'wrist_forearm_relief',
    title: 'Wrist & Forearm Release',
    durationMins: 4,
    durationSec: 240,
    caloriesBurn: 12,
    intensity: 'Gentle',
    description: 'Carpal tunnel decompression, extensor stretches, and finger spreaders for keyboard-heavy workflows.',
    steps: [
      'Extend right arm forward with palm up, pull fingers gently back with left hand',
      'Hold extensor stretch for 20 seconds each arm',
      'Clench fists tightly and flare fingers wide 10 times',
      'Perform slow clockwise and counter-clockwise wrist rotations',
    ],
  },
];

export const FitnessScreen: React.FC = () => {
  const [completedSessions, setCompletedSessions] = useState<number>(4);
  const totalGoalSessions = 5;
  const progressPercent = Math.round((completedSessions / totalGoalSessions) * 100);

  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const handleStartRoutine = (routine: Routine) => {
    setActiveRoutine(routine);
    setSecondsLeft(routine.durationSec);
    setIsTimerRunning(true);
    setCurrentStepIndex(0);
    setShowCelebration(false);
  };

  useEffect(() => {
    if (!isTimerRunning || !activeRoutine) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          setShowCelebration(true);
          setCompletedSessions((c) => Math.min(totalGoalSessions, c + 1));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, activeRoutine]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#00BFA5]" />
            Ergonomic Fitness &amp; Movement Routines
          </h2>
          <p className="text-xs text-slate-400">
            Physical therapist-backed micro-routines to counteract sedentary spinal compression
          </p>
        </div>
      </div>

      {/* 1. Progress Card: WEEKLY FITNESS PROGRESS */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Weekly Fitness Progress
          </span>
          <h3 className="text-2xl font-bold text-white">
            {completedSessions} of {totalGoalSessions} Sessions Completed
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            You're on track! Completing 5 desk movement sessions per week lowers chronic cervical disc degeneration by 44%.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Streak: 4 Days Active
            </span>
          </div>
        </div>

        {/* Circular Percentage Ring (80%) */}
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
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Goal</span>
          </div>
        </div>
      </div>

      {/* 2. AI-Verified Desk Routines List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00BFA5]" />
          AI-Verified Desk Routines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROUTINES.map((routine) => (
            <div
              key={routine.id}
              className="bg-[#0F172A] border border-[#1E293B] hover:border-[#00BFA5]/50 transition-all rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#131E33] text-teal-400 border border-teal-500/30">
                    {routine.intensity}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                    <Flame className="w-3.5 h-3.5" />
                    <span>~{routine.caloriesBurn} kcal</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-white mt-3">{routine.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {routine.description}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#1E293B]">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {routine.durationMins} Mins
                  </span>
                  <span className="text-slate-500">No equipment</span>
                </div>

                <button
                  onClick={() => handleStartRoutine(routine)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#00BFA5] hover:bg-[#2DD4BF] text-[#0B1120] transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>▶ Start</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routine Active Player Modal */}
      {activeRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#00BFA5]" />
                  {activeRoutine.title}
                </h3>
                <span className="text-xs text-slate-400">AI-Guided Real-Time Exercise</span>
              </div>
              <button
                onClick={() => setActiveRoutine(null)}
                className="p-1 rounded-lg bg-[#131E33] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {showCelebration ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Routine Completed!</h4>
                <p className="text-xs text-slate-400">
                  You burned ~{activeRoutine.caloriesBurn} kcal and relieved accumulated spinal compression.
                </p>
                <button
                  onClick={() => setActiveRoutine(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase bg-[#00BFA5] text-[#0B1120] mt-4"
                >
                  Back to Fitness
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-4 bg-[#0B1120] rounded-xl border border-[#1E293B]">
                  <div className="text-5xl font-black font-mono text-[#00BFA5] tracking-tight">
                    {formattedTime}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 uppercase font-semibold">
                    Time Remaining
                  </span>
                </div>

                <div className="bg-[#131E33] p-4 rounded-xl border border-[#1E293B] space-y-2">
                  <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                    Step {currentStepIndex + 1} of {activeRoutine.steps.length}
                  </div>
                  <div className="text-sm font-medium text-white leading-relaxed">
                    "{activeRoutine.steps[currentStepIndex]}"
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() =>
                      setCurrentStepIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentStepIndex === 0}
                    className="px-4 py-2 rounded-lg text-xs bg-[#131E33] text-slate-300 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentStepIndex((prev) =>
                        Math.min(activeRoutine.steps.length - 1, prev + 1)
                      )
                    }
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-[#00BFA5] text-[#0B1120]"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
