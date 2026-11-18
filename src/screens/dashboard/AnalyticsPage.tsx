import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  Sparkles,
  Award,
  Lock,
  TrendingUp,
  RefreshCcw,
} from 'lucide-react';
import { fetchTelemetryHistory, TrendBucket } from '../../services/telemetryClient.ts';

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<1 | 7 | 30>(7);
  const [trendData, setTrendData] = useState<TrendBucket[]>([]);
  const [dataSource, setDataSource] = useState<'mongodb' | 'local-cache'>('local-cache');
  const [loading, setLoading] = useState(true);

  const loadHistory = async (days: 1 | 7 | 30) => {
    setLoading(true);
    try {
      const res = await fetchTelemetryHistory(days);
      setTrendData(res.trend || []);
      setDataSource(res.source || 'local-cache');
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(timeframe);
  }, [timeframe]);

  const avgScore =
    trendData.length > 0
      ? Math.round(trendData.reduce((acc, item) => acc + item.ergoScore, 0) / trendData.length)
      : 82;

  const formulaWeights = [
    { label: 'Spine & Neck', weight: 35, value: 86 },
    { label: 'Eye Comfort', weight: 20, value: 92 },
    { label: 'Fatigue Resistance', weight: 20, value: 79 },
    { label: 'Static Break Habits', weight: 15, value: 81 },
    { label: 'Recovery Resets', weight: 10, value: 88 },
  ];

  const insights = [
    {
      title: 'Peak Posture Morning',
      detail: 'Your cervical alignment averages 92% optimal between 8:30 AM and 12:00 PM.',
    },
    {
      title: 'Timely Eye Breaks',
      detail: '20-20-20 ocular rests reduced afternoon blink-rate dips by 24% this week.',
    },
    {
      title: 'Weekly Consistency: +6% vs Avg',
      detail: 'Sustained ErgoScore climbs steadily across consecutive desk sessions.',
    },
  ];

  const achievements = [
    {
      title: 'Century Club',
      description: 'Logged 100+ real-time ergonomic telemetry checkpoints.',
      unlocked: true,
      progress: 100,
    },
    {
      title: 'Posture Guardian',
      description: 'Maintained >= 80 ErgoScore across 5 consecutive workdays.',
      unlocked: true,
      progress: 100,
    },
    {
      title: 'Tension Free',
      description: 'Complete 15 AI-verified desk resets without skipped breaks.',
      unlocked: false,
      progress: 73,
    },
    {
      title: '30-Day Iron Spine',
      description: 'Maintain < 15° average neck flexion over a 30-day cycle.',
      unlocked: false,
      progress: 48,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Timeframe Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Ergonomic Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical ErgoScore trends &amp; multi-factor biomechanical breakdown ({dataSource === 'mongodb' ? 'MongoDB Atlas' : 'Local Telemetry Store'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-[#0F172A] border border-[#1E293B]">
            {([
              { days: 1 as const, label: 'Today' },
              { days: 7 as const, label: '7 Days' },
              { days: 30 as const, label: '30 Days' },
            ]).map((item) => (
              <button
                key={item.days}
                onClick={() => setTimeframe(item.days)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  timeframe === item.days
                    ? 'bg-[#00C49A] text-[#0B1120] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadHistory(timeframe)}
            aria-label="Refresh analytics"
            className="p-2 rounded-xl bg-[#0F172A] border border-[#1E293B] text-slate-300 hover:text-white"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Chart & Formula Weights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Responsive Recharts BarChart */}
        <div className="lg:col-span-7 bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00C49A]" />
                <span>ErgoScore Trend</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {timeframe === 1 ? 'Hourly progression today' : `Daily average over ${timeframe} days`}
              </p>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Period Avg</div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-[#00C49A]">
                {avgScore}
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={{ stroke: '#1E293B' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Bar dataKey="ergoScore" name="ErgoScore" radius={[6, 6, 0, 0]} maxBarSize={42}>
                  {trendData.map((entry, idx) => {
                    const isHighlighted = entry.isToday || idx === trendData.length - 1;
                    return (
                      <Cell
                        key={`cell-${idx}`}
                        fill={isHighlighted ? '#2DD4BF' : '#00C49A'}
                        fillOpacity={isHighlighted ? 1 : 0.72}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Formula Weights: 5 Horizontal Progress Bars */}
        <div className="lg:col-span-5 bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white">Formula Weights</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Component weighting in your holistic ErgoScore index
            </p>
          </div>

          <div className="space-y-4">
            {formulaWeights.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  <span className="font-mono tabular-nums text-slate-400">
                    Weight {item.weight}% · <strong className="text-[#00C49A]">{item.value}%</strong>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#0F172A] rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-[#00C49A] rounded-full transition-all duration-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-white">Actionable Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((ins) => (
            <div
              key={ins.title}
              className="bg-[#1E293B]/60 border border-[#1E293B] rounded-2xl p-5 flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[#00C49A]/15 border border-[#00C49A]/30 flex items-center justify-center text-[#00C49A] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{ins.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ins.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-white">Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((badge) => (
            <div
              key={badge.title}
              className={`rounded-2xl p-5 border flex flex-col justify-between gap-4 ${
                badge.unlocked
                  ? 'bg-[#00C49A] text-[#0B1120] border-[#00C49A]'
                  : 'bg-[#1E293B] text-slate-200 border-slate-700/80'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {badge.unlocked ? (
                    <Award className="w-5 h-5 text-[#0B1120]" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      badge.unlocked ? 'text-[#0B1120]' : 'text-slate-400'
                    }`}
                  >
                    {badge.unlocked ? 'UNLOCKED' : `${badge.progress}%`}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold">{badge.title}</h4>
                <p
                  className={`text-xs leading-relaxed ${
                    badge.unlocked ? 'text-[#0B1120]/80' : 'text-slate-400'
                  }`}
                >
                  {badge.description}
                </p>
              </div>

              {!badge.unlocked && (
                <div className="w-full h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00C49A] rounded-full"
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
