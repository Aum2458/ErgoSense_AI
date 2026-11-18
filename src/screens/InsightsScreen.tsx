import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  Sliders, 
  Users, 
  ArrowUpRight,
  Info 
} from 'lucide-react';
import { AdminFleetDashboard } from '../components/AdminFleetDashboard.tsx';

interface InsightsScreenProps {
  onSelectUserForCompanionView?: (userId: string) => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  onSelectUserForCompanionView,
}) => {
  const [timeframe, setTimeframe] = useState<'Today' | '7 Days' | '30 Days'>('7 Days');
  const [subTab, setSubTab] = useState<'Posture' | 'Fitness' | 'Recovery' | 'Fleet Admin'>('Posture');

  // 7-day trend data
  const days = [
    { label: 'Mon', score: 78, slouchCount: 18 },
    { label: 'Tue', score: 82, slouchCount: 14 },
    { label: 'Wed', score: 75, slouchCount: 22 },
    { label: 'Thu', score: 88, slouchCount: 8 },
    { label: 'Fri', score: 84, slouchCount: 12 },
    { label: 'Sat', score: 91, slouchCount: 5 },
    { label: 'Sun', score: 94, slouchCount: 3 },
  ];

  const avgScore = Math.round(days.reduce((acc, d) => acc + d.score, 0) / days.length);

  // Formula Weights Breakdown
  const weights = [
    { category: 'Spine & Neck Posture', weight: 35, current: 86, color: '#00BFA5' },
    { category: 'Eye Comfort & 20-20-20', weight: 20, current: 92, color: '#06B6D4' },
    { category: 'Fatigue & Sitting Duration', weight: 20, current: 78, color: '#F59E0B' },
    { category: 'Static Break Adherence', weight: 15, current: 80, color: '#10B981' },
    { category: 'Micro-Recovery Execution', weight: 10, current: 90, color: '#2DD4BF' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header with Timeframe Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00BFA5]" />
            Ergonomic Analytics &amp; Biomechanical Trends
          </h2>
          <p className="text-xs text-slate-400">
            Multi-day longitudinal posture telemetry and algorithmic weight distribution
          </p>
        </div>

        {/* Timeframe Pills: [Today], [7 Days] (Active), [30 Days] */}
        <div className="flex items-center gap-1 bg-[#131E33] p-1 rounded-xl border border-[#1E293B]">
          {(['Today', '7 Days', '30 Days'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-[#00BFA5] text-[#0B1120] font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-navigation: Posture, Fitness, Recovery, Fleet Admin */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2 overflow-x-auto">
        {(['Posture', 'Fitness', 'Recovery', 'Fleet Admin'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              subTab === tab
                ? 'bg-[#131E33] text-white border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === 'Fleet Admin' ? (
        <AdminFleetDashboard onSelectUserForCompanionView={onSelectUserForCompanionView} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Charts: ErgoScore Trend (7 Days) (col-span-7) */}
          <div className="lg:col-span-7 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00BFA5]" />
                  ErgoScore Trend (7 Days)
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous day-by-day aggregate postural alignment
                </p>
              </div>

              {/* Avg Badge */}
              <div className="flex items-center gap-2 bg-[#131E33] px-3 py-1.5 rounded-xl border border-[#1E293B]">
                <span className="text-xs text-slate-400 uppercase font-semibold">Avg</span>
                <span className="text-base font-bold font-mono text-[#00BFA5]">{avgScore}</span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +6.4%
                </span>
              </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-[#1E293B]">
              {days.map((item, idx) => {
                const heightPercent = Math.max(15, (item.score / 100) * 100);
                const barColor =
                  item.score >= 85 ? '#00BFA5' : item.score >= 75 ? '#F59E0B' : '#F43F5E';

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Hover tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-[#1E293B] text-white px-1.5 py-0.5 rounded shadow">
                      {item.score}
                    </div>

                    <div className="w-full bg-[#131E33] rounded-t-lg h-full flex items-end overflow-hidden">
                      <div
                        className="w-full rounded-t-lg transition-all duration-700 ease-out"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: barColor,
                          boxShadow: `0 0 10px ${barColor}40`,
                        }}
                      />
                    </div>

                    <span className="text-xs text-slate-400 font-medium mt-1">{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Benchmark: Optimal 80+ score</span>
              <span className="text-teal-400 font-mono">Total Slouch Incidents: 82</span>
            </div>
          </div>

          {/* Formula Weights Breakdown (col-span-5) */}
          <div className="lg:col-span-5 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#06B6D4]" />
                Formula Weights Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Mathematical multi-factor weight contributions to holistic ErgoScore
              </p>
            </div>

            <div className="space-y-4">
              {weights.map((w, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{w.category}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400 text-[11px]">Weight: {w.weight}%</span>
                      <span className="font-bold text-white">{w.current}%</span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="w-full h-2 bg-[#0B1120] rounded-full overflow-hidden border border-[#1E293B]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${w.current}%`,
                        backgroundColor: w.color,
                        boxShadow: `0 0 8px ${w.color}50`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#131E33] rounded-xl border border-[#1E293B] text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200 font-medium">Algorithmic note:</strong> Posture angles contribute 35% of total score based on continuous cervical spinal load physics (Hansraj cervical biomechanics index).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
