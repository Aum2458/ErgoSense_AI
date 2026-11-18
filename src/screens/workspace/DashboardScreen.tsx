import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Monitor, 
  Dumbbell, 
  Car, 
  Smartphone, 
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Zap
} from 'lucide-react';
import { ActivityMode, TelemetryPayload, UserProfile } from '../../types/ergosense.ts';

interface DashboardScreenProps {
  telemetry: TelemetryPayload;
  currentUser: UserProfile;
  onLaunchActivity: (mode: ActivityMode) => void;
  onStartMicroBreak: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  telemetry,
  currentUser,
  onLaunchActivity,
  onStartMicroBreak,
}) => {
  const ergoScore = telemetry.ergoScore || 88;
  const alignmentPct = 92;
  const staticLoadMins = 34;
  const compliancePct = 86;

  const quickLaunchStudios: { id: ActivityMode; name: string; icon: any; desc: string; badge: string }[] = [
    { id: 'sitting_desk', name: 'Sitting Desk Mode', icon: Monitor, desc: 'Seated desk hip-occlusion fallback tracking', badge: 'Popular' },
    { id: 'standing_desk', name: 'Standing Desk Mode', icon: Activity, desc: 'Full-body balance & locked-knee sway tracking', badge: 'Ergonomic' },
    { id: 'exercise_coach', name: 'Exercise Form Coach', icon: Dumbbell, desc: '4-state FSM reps & bilateral symmetry', badge: 'Active' },
    { id: 'desk_analyzer', name: 'Desk Setup Analyzer', icon: Monitor, desc: 'Distance triangulation (cm) & screen gaze offset', badge: 'Utility' },
    { id: 'travel_imu', name: 'Travelling IMU Mode', icon: Smartphone, desc: 'Camera-free accelerometer & gyroscope cadence', badge: 'Mobile' },
    { id: 'driving_safe', name: 'Driving Safe Mode', icon: Car, desc: 'Pre-drive checklist & safe audio-only break nudges', badge: 'Safety Lock' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Predictive Habit Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-teal-500/10 to-[#0F172A] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                Predictive Habit Insight
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">2:30 PM Peak</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
              Cervical flexion typically rises 34% between 2:30 PM and 4:00 PM during deep coding sessions. Start a 90-second thoracic reset now to prevent afternoon neck tension?
            </p>
          </div>
        </div>

        <button
          onClick={onStartMicroBreak}
          className="px-4 py-2 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-xl shadow-md shrink-0 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <span>Start 90s Stretch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Daily Movement Score */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Movement Score</span>
            <Activity className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{ergoScore}</span>
            <span className="text-xs text-emerald-400 font-semibold font-mono">+4 vs yesterday</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0D9488] to-[#2DD4BF]" style={{ width: `${ergoScore}%` }} />
          </div>
        </div>

        {/* KPI 2: Personal Baseline Alignment % */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Baseline Alignment</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{alignmentPct}%</span>
            <span className="text-xs text-slate-400 font-mono">7-day avg: 89%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${alignmentPct}%` }} />
          </div>
        </div>

        {/* KPI 3: Active Static Load Timer */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Static Load</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{staticLoadMins}m</span>
            <span className="text-xs text-cyan-400 font-mono">Max limit: 40m</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400" style={{ width: `${(staticLoadMins / 40) * 100}%` }} />
          </div>
        </div>

        {/* KPI 4: Reminder Compliance */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Reminder Compliance</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{compliancePct}%</span>
            <span className="text-xs text-indigo-400 font-mono">6 of 7 followed</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${compliancePct}%` }} />
          </div>
        </div>
      </div>

      {/* 3. Chronological Daily Activity Timeline */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Today's Movement Timeline</h3>
            <p className="text-xs text-slate-400">Continuous context awareness across study, transit, and desk blocks</p>
          </div>
          <span className="text-xs text-[#2DD4BF] font-mono">Active: Coding Work</span>
        </div>

        {/* Timeline Blocks */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-[#0B1120] border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 font-mono block">8:00 AM</span>
            <span className="font-semibold text-white block mt-0.5">Study Focus</span>
            <span className="text-[10px] text-emerald-400 font-mono">94% Align</span>
          </div>
          <div className="bg-[#0B1120] border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 font-mono block">10:30 AM</span>
            <span className="font-semibold text-white block mt-0.5">Transit IMU</span>
            <span className="text-[10px] text-cyan-400 font-mono">1,840 steps</span>
          </div>
          <div className="bg-[#0D9488]/15 border border-[#2DD4BF]/50 p-3 rounded-xl">
            <span className="text-[10px] text-[#2DD4BF] font-mono block font-bold">1:30 PM (NOW)</span>
            <span className="font-semibold text-white block mt-0.5">Desk Coding</span>
            <span className="text-[10px] text-emerald-400 font-mono">88% Align</span>
          </div>
          <div className="bg-[#0B1120] border border-slate-800 p-3 rounded-xl opacity-60">
            <span className="text-[10px] text-slate-500 font-mono block">4:00 PM</span>
            <span className="font-semibold text-slate-300 block mt-0.5">Exercise Form</span>
            <span className="text-[10px] text-slate-500 font-mono">Scheduled</span>
          </div>
          <div className="bg-[#0B1120] border border-slate-800 p-3 rounded-xl opacity-60">
            <span className="text-[10px] text-slate-500 font-mono block">6:30 PM</span>
            <span className="font-semibold text-slate-300 block mt-0.5">Drive Home</span>
            <span className="text-[10px] text-slate-500 font-mono">Audio Safe</span>
          </div>
        </div>
      </div>

      {/* 4. Quick-Launch Activity Studios */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Quick-Launch Activity Studios</h3>
            <p className="text-xs text-slate-400">Launch a dedicated tracking mode with customized biomechanical rules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLaunchStudios.map((studio) => {
            const Icon = studio.icon;
            return (
              <div
                key={studio.id}
                onClick={() => onLaunchActivity(studio.id)}
                className="bg-[#0F172A] border border-[#1E293B] hover:border-[#2DD4BF]/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 text-[#2DD4BF] group-hover:bg-[#0D9488] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {studio.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#2DD4BF] transition-colors">{studio.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{studio.desc}</p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-[#2DD4BF] font-semibold">
                  <span>Enter Studio</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
