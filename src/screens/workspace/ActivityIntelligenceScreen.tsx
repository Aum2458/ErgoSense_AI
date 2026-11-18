import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  Zap, 
  BarChart2, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ActivityIntelligenceScreen: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'today' | 'week'>('today');

  const activityDistribution = [
    { name: 'Sitting Desk Work', hours: 5.4, pct: 60, color: 'bg-teal-500' },
    { name: 'Active Standing Desk', hours: 1.8, pct: 20, color: 'bg-cyan-500' },
    { name: 'Walking / IMU Transit', hours: 1.1, pct: 12, color: 'bg-emerald-500' },
    { name: 'Exercise & Mobility', hours: 0.5, pct: 6, color: 'bg-indigo-500' },
    { name: 'Static Fatigue Risk', hours: 0.2, pct: 2, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider font-mono">
            Movement Intelligence Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Activity & Kinetic Distribution
          </h1>
          <p className="text-xs text-slate-400">
            Automated activity classification, micro-motion variance analysis, and predictive habit forecasting.
          </p>
        </div>

        {/* Timeframe switch */}
        <div className="flex items-center bg-[#0F172A] border border-[#1E293B] p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 rounded-lg ${timeframe === 'today' ? 'bg-[#0D9488] text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 rounded-lg ${timeframe === 'week' ? 'bg-[#0D9488] text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Past 7 Days
          </button>
        </div>
      </div>

      {/* 1. Multi-Activity Distribution Stack */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Movement State Distribution</h3>
            <span className="text-xs text-slate-400">Total Monitored Time: 9.0 Hours</span>
          </div>
          <span className="text-xs text-[#2DD4BF] font-mono">Active Classification: 98% Accurate</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
          {activityDistribution.map((item, idx) => (
            <div
              key={idx}
              className={`h-full ${item.color}`}
              style={{ width: `${item.pct}%` }}
              title={`${item.name}: ${item.hours}h (${item.pct}%)`}
            />
          ))}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {activityDistribution.map((item, idx) => (
            <div key={idx} className="bg-[#0B1120] border border-slate-800 p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-xs font-semibold text-slate-200 truncate">{item.name}</span>
              </div>
              <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                <span className="text-white font-bold">{item.hours}h</span>
                <span className="text-slate-400">{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Micro-Motion Variance Chart: Detecting "Statue Sitting" */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Micro-Motion Variance (σ²_motion)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Distinguishes natural dynamic stillness from dangerous muscular immobilization ("statue sitting").
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Threshold: &gt; 1.2
          </span>
        </div>

        {/* Synthetic Micro-motion Waveform */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="h-44 flex items-end gap-1.5 sm:gap-2">
            {[2.4, 2.8, 3.1, 1.9, 2.2, 0.8, 0.6, 0.7, 1.1, 3.4, 4.2, 2.1, 1.8, 0.9, 0.5, 0.8, 2.6, 3.0, 2.2, 2.5].map((val, i) => {
              const isStatue = val < 1.2;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isStatue ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700 group-hover:bg-[#0D9488]'
                    }`}
                    style={{ height: `${Math.min(100, val * 24)}%` }}
                  />
                  <span className="text-[9px] text-slate-500 font-mono hidden sm:block">{i * 15}m</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />
              <span>Cyan blocks: Muscular immobilization window detected</span>
            </span>
            <span className="font-mono text-[11px]">Rolling 5-Hour Window</span>
          </div>
        </div>
      </div>

      {/* 3. Predictive Habit Intelligence Panel */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider font-mono">
            Longitudinal Forecasting
          </span>
          <h3 className="text-base font-bold text-white mt-1">Weekly Predictive Habit Intelligence</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#0B1120] border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Afternoon Slump Pattern (2:30 PM - 4:00 PM)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Detected across 4 of the past 5 workdays. Cervical tilt increases from 12° to 27° during this window.
            </p>
            <span className="text-[#2DD4BF] font-mono block pt-1">
              AI Action: Automated proactive 90s stretch alert scheduled for 2:20 PM tomorrow.
            </span>
          </div>

          <div className="bg-[#0B1120] border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Morning Movement Habit Formation</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Standing desk transition within the first 60 minutes of the workday achieved a 94% compliance rate this week.
            </p>
            <span className="text-emerald-400 font-mono block pt-1">
              AI Action: Positive reinforcement streak active (+18 Ergonomic Wellness points).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
