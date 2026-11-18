import React, { useState } from 'react';
import { 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Sliders, 
  Compass, 
  Brain, 
  Clock, 
  Sparkles, 
  Camera, 
  Smartphone, 
  Car, 
  Dumbbell, 
  BookOpen, 
  Briefcase, 
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  HeartPulse
} from 'lucide-react';
import { SkeletalCanvasView } from '../../components/SkeletalCanvasView.tsx';
import { PublicNavRoute } from '../../components/PublicNavbar.tsx';

interface PublicHomeScreenProps {
  onNavigate: (route: PublicNavRoute) => void;
  onLaunchApp: () => void;
  onCalibrate: () => void;
}

export const PublicHomeScreen: React.FC<PublicHomeScreenProps> = ({
  onNavigate,
  onLaunchApp,
  onCalibrate,
}) => {
  // Interactive hero skeleton preview controls
  const [heroNeck, setHeroNeck] = useState<number>(14);
  const [heroTorso, setHeroTorso] = useState<number>(4);
  const [heroDistance, setHeroDistance] = useState<number>(56);

  // Day in the Life interactive timeline state
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState<number>(0);

  const timelineSteps = [
    {
      time: '8:00 AM',
      title: 'Studying & Academic Focus',
      icon: BookOpen,
      mode: 'Laptop Vision Mode',
      description:
        'Laptop camera detects gradual downward cervical slump during reading. Context-aware prompt nudges raising laptop screen height.',
      benefit: 'Prevents study fatigue without distracting alarms.',
      metric: 'Cervical Angle: 12.4° (Optimal)',
    },
    {
      time: '10:30 AM',
      title: 'Travelling & Transit',
      icon: Smartphone,
      mode: 'IMU Motion Sensors (No Camera)',
      description:
        'Smartphone accelerometer and gyroscope track walking cadence and transit motion without activating the camera.',
      benefit: '24/7 awareness with zero privacy intrusion.',
      metric: 'Cadence: 112 steps/min · Transit: Metro',
    },
    {
      time: '12:00 PM',
      title: 'Desk Coding & Deep Work',
      icon: Briefcase,
      mode: 'Desktop Seated Desk Mode',
      description:
        'Biomechanical engine identifies prolonged static sitting (>40 mins). Recommends a 60-second seated thoracic extension.',
      benefit: 'Combats muscular immobilization ("statue sitting").',
      metric: 'Static Load Timer: 42m · Prompt: Micro-stretch',
    },
    {
      time: '3:00 PM',
      title: 'Workout & Mobility',
      icon: Dumbbell,
      mode: 'Exercise Form Coach (4-State FSM)',
      description:
        'Tracks 33 body landmarks through squats, thoracic rotations, and chin tucks with real-time rep counting and bilateral symmetry.',
      benefit: 'Guarantees balanced joint loading and recovery.',
      metric: 'Reps: 12 · Symmetry: 94% · Tempo: 2.4s',
    },
    {
      time: '6:00 PM',
      title: 'Commute & Driving',
      icon: Car,
      mode: 'Driving Safe Mode (Audio Only)',
      description:
        'Provides a pre-drive ergonomic seating checklist. Strictly disables all visual popups and camera tracking, delivering safe audio cues.',
      benefit: 'Zero driving distractions, ergonomic lumbar support.',
      metric: 'Visual UI: Locked · Audio Nudge: Active',
    },
    {
      time: '10:00 PM',
      title: 'Daily Movement Insights',
      icon: TrendingUp,
      mode: 'Personal Daily Report',
      description:
        'Summarizes day-long movement intelligence: alignment %, static hours, reminder compliance, and personalized suggestions for tomorrow.',
      benefit: 'Continuous habit refinement without rigid rules.',
      metric: 'Daily Score: 89/100 · 3 Micro-breaks followed',
    },
  ];

  const activeTimeline = timelineSteps[selectedTimelineIndex];
  const ActiveIcon = activeTimeline.icon;

  return (
    <div className="space-y-24 py-8">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D9488]/10 border border-[#0D9488]/30 text-[#2DD4BF] text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Personal Movement Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Move better. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] via-[#38BDF8] to-[#818CF8]">
                Live smarter.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Your intelligent companion for movement, posture, and everyday ergonomic wellness. 
              Calibrates to your unique body baseline following OSHA guidelines—100% in-browser, privacy-first, 
              and active across desk work, travel, exercise, and driving.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onLaunchApp}
                className="px-6 py-3.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-sm shadow-xl shadow-teal-500/25 transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Launch Web Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onCalibrate}
                className="px-6 py-3.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4 text-[#2DD4BF]" />
                <span>Calibrate My Baseline (60s)</span>
              </button>
            </div>

            {/* Key trust bullets */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-400">
              <div>
                <span className="text-white font-semibold block text-sm">100% Local</span>
                <span>Zero raw video uploads</span>
              </div>
              <div>
                <span className="text-white font-semibold block text-sm">OSHA Aligned</span>
                <span>Non-rigid dynamic baseline</span>
              </div>
              <div>
                <span className="text-white font-semibold block text-sm">24/7 Context</span>
                <span>Camera + Wearables + IMU</span>
              </div>
            </div>
          </div>

          {/* Right Hero Interactive Biomechanical Card */}
          <div className="lg:col-span-5 bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Biomechanical Posture Engine
                </span>
                <span className="text-[11px] text-slate-400">Interactive 33-landmark kinematic model</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                heroNeck > 22 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {heroNeck > 22 ? 'DEVIATED' : 'OPTIMAL'}
              </span>
            </div>

            {/* Render Canvas */}
            <div className="flex justify-center">
              <SkeletalCanvasView
                cervicalAngle={heroNeck}
                torsoSlouch={heroTorso}
                viewingDistanceCm={heroDistance}
                state={heroNeck > 22 ? 'SUSTAINED_DEVIATION' : 'OPTIMAL'}
                width={360}
                height={260}
              />
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-3 pt-2 bg-[#0B1120] p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Cervical Flexion:</span>
                  <span className="font-mono text-[#2DD4BF] font-semibold">{heroNeck}°</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={heroNeck}
                  onChange={(e) => setHeroNeck(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Viewing Distance:</span>
                  <span className="font-mono text-[#38BDF8] font-semibold">{heroDistance} cm</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="80"
                  value={heroDistance}
                  onChange={(e) => setHeroDistance(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Four Core Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built on Four Pillars of Body Wellness
          </h2>
          <p className="text-slate-400 text-sm">
            ErgoSense AI doesn't impose rigid posture rules. It combines continuous movement intelligence, 
            personal adaptation, and smart contextual timing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-3 hover:border-[#0D9488]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#2DD4BF]">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Live Movement AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time 33-point computer vision and motion sensor fusion observing joint angles at 30 FPS in local browser memory.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-3 hover:border-[#0D9488]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#38BDF8]">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Personal Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Learns your comfortable movement baseline, adapts through feedback, and accommodates individual body proportions.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-3 hover:border-[#0D9488]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#818CF8]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Wellness Insights</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Understands multi-day fatigue patterns, afternoon slouch windows, and correlates movement history with localized comfort.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-3 hover:border-[#0D9488]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AI Companion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multilingual coaching in English, Hindi, and Gujarati with context-aware micro-break nudges when you actually need them.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive "Day in the Life with ErgoSense" Timeline Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-[#0F172A] to-[#0B1120] border border-[#1E293B] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block">
                24/7 Context Awareness
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                A Day in the Life with ErgoSense AI
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Tap any block below to see how ErgoSense adapts monitoring across different environments—from desk work to walking, exercise, and driving.
            </p>
          </div>

          {/* Timeline Step Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {timelineSteps.map((step, idx) => {
              const isSelected = selectedTimelineIndex === idx;
              const StepIcon = step.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedTimelineIndex(idx)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#0D9488]/20 border-[#2DD4BF] shadow-lg shadow-teal-500/15'
                      : 'bg-[#0B1120] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">{step.time}</span>
                    <StepIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#2DD4BF]' : 'text-slate-500'}`} />
                  </div>
                  <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {step.title.split('&')[0]}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Timeline Detail View */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D9488]/20 border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF]">
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-[#2DD4BF]">{activeTimeline.time} · {activeTimeline.mode}</span>
                  <h3 className="text-lg font-bold text-white">{activeTimeline.title}</h3>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {activeTimeline.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{activeTimeline.benefit}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Live Sensor Telemetry
              </span>
              <p className="font-mono text-xs text-[#38BDF8] bg-[#070D18] p-3 rounded-lg border border-slate-800">
                {activeTimeline.metric}
              </p>
              <button
                onClick={onLaunchApp}
                className="w-full mt-2 py-2 text-xs font-semibold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Try this mode in studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
