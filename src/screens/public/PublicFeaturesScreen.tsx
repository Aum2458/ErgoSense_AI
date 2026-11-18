import React, { useState } from 'react';
import { 
  Camera, 
  Activity, 
  Coffee, 
  User, 
  Dumbbell, 
  Monitor, 
  HeartHandshake, 
  LineChart, 
  Sparkles, 
  Smartphone, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { PublicNavRoute } from '../../components/PublicNavbar.tsx';

interface PublicFeaturesScreenProps {
  onNavigate: (route: PublicNavRoute) => void;
  onLaunchApp: () => void;
}

export const PublicFeaturesScreen: React.FC<PublicFeaturesScreenProps> = ({ onNavigate, onLaunchApp }) => {
  const [selectedModule, setSelectedModule] = useState<number>(0);

  const modules = [
    {
      num: '01',
      id: 'live_posture',
      name: 'Live Posture AI',
      icon: Camera,
      tag: 'Vision Engine',
      description: '33-point in-browser body alignment tracking with seated desk hip-occlusion fallback when legs are hidden.',
      metric: '30 FPS · Local WASM Memory',
    },
    {
      num: '02',
      id: 'movement_intelligence',
      name: 'Movement Intelligence',
      icon: Activity,
      tag: 'Temporal Classifier',
      description: 'Automated activity recognition distinguishing Sitting, Standing, Walking (IMU), Exercising, and Static Fatigue.',
      metric: '5-State Hysteresis Machine',
    },
    {
      num: '03',
      id: 'smart_break_coach',
      name: 'Smart Break Coach',
      icon: Coffee,
      tag: 'Contextual Timing',
      description: 'Adaptive micro-breaks based on static load timers and coordinate variance (σ²_motion), not arbitrary alarm clocks.',
      metric: '30–60 Min Adaptive Range',
    },
    {
      num: '04',
      id: 'personal_profile',
      name: 'Personal Body Profile',
      icon: User,
      tag: 'OSHA Calibration',
      description: 'Learns individual anatomical baseline (μ, σ) and refines tolerances via closed-loop "I\'m Comfortable" feedback.',
      metric: 'Reduces False Alerts by 84%',
    },
    {
      num: '05',
      id: 'exercise_coach',
      name: 'Exercise Form Coach',
      icon: Dumbbell,
      tag: 'Kinematic FSM',
      description: 'Real-time 4-state Finite State Machine tracking reps, tempo, and bilateral knee/shoulder symmetry on desk mobility drills.',
      metric: 'Squats · Chin Tucks · Thoracic',
    },
    {
      num: '06',
      id: 'desk_analyzer',
      name: 'Desk Setup Analyzer',
      icon: Monitor,
      tag: 'Ergonomic Geometry',
      description: 'Evaluates viewing distance in cm (50–75cm target), screen gaze angle, and generates workstation adjustment checklists.',
      metric: 'Focal Triangulation (±2cm)',
    },
    {
      num: '07',
      id: 'pain_journal',
      name: 'Pain & Comfort Journal',
      icon: HeartHandshake,
      tag: 'Closed-Loop Coupling',
      description: 'Interactive SVG body map tracking localized discomfort (1–10) and automatically correlating it with posture history.',
      metric: 'Adaptive Threshold Tightening',
    },
    {
      num: '08',
      id: 'daily_insights',
      name: 'Daily Body Insights',
      icon: LineChart,
      tag: 'Longitudinal Trends',
      description: 'Comprehensive day and week scorecards tracking alignment %, static load hours, and reminder compliance ratios.',
      metric: 'Time-of-Day Risk Heatmap',
    },
    {
      num: '09',
      id: 'ai_coach',
      name: 'AI Wellness Assistant',
      icon: Sparkles,
      tag: 'Multilingual RAG',
      description: 'Conversational coach explaining posture trends and providing 2-minute movement routines in English, Hindi, and Gujarati.',
      metric: 'Web Speech Synthesis & ASR',
    },
    {
      num: '10',
      id: 'multi_device',
      name: 'Multi-Device Sync',
      icon: Smartphone,
      tag: 'Device Bridge',
      description: 'Seamless continuity across desktop web, mobile browser PWA (with IMU sensors), and optional Bluetooth wearables.',
      metric: 'Sub-40ms Telemetry Pipeline',
    },
  ];

  const differentiators = [
    {
      title: 'A. Personal Movement Baseline (OSHA Non-Rigid)',
      text: 'No rigid textbook posture forced onto every person. Calibrates to your natural comfort envelope and widens tolerances when you confirm comfort.',
    },
    {
      title: 'B. Any-Activity AI Coach',
      text: 'Works seamlessly across desk coding, studying, walking transit, exercise mobility, factory cadence, elderly balance, and driving safe mode.',
    },
    {
      title: 'C. Context-Aware Smart Notifications',
      text: 'Uses 30-second temporal buffers and 3-minute hysteresis cooldowns. Suppresses transient reaches and honors flow state.',
    },
    {
      title: 'D. Personal AI Movement Coach (EN/HI/GU)',
      text: 'Answers "Why is my neck tired at 3 PM?" or "Give me a quick stretch in Gujarati" grounded directly in your personal session history.',
    },
    {
      title: 'E. Predictive Habit Intelligence',
      text: 'Anticipates recurring afternoon posture slumps before they happen, prompting a proactive 90-second thoracic reset.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
          Complete Feature Suite
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          10 Core Modules. 5 Differentiators.
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Engineered for comprehensive personal movement intelligence across your entire daily routine.
        </p>
      </div>

      {/* 1. 10 Core Product Modules */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          10 Core Product Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            const isSelected = selectedModule === idx;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedModule(idx)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0F172A] border-[#2DD4BF] shadow-lg shadow-teal-500/10 ring-1 ring-[#2DD4BF]'
                    : 'bg-[#0B1120] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] text-slate-500 font-bold">{m.num}</span>
                  <div className="p-2 rounded-lg bg-teal-500/10 text-[#2DD4BF]">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{m.name}</h3>
                <span className="text-[10px] text-[#38BDF8] font-mono block mb-2">{m.tag}</span>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                  {m.description}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block pt-2 border-t border-slate-800">
                  {m.metric}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. 5 Key Product Differentiators */}
      <section className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div>
          <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block">
            Competitive Edge
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            5 Key Product Differentiators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentiators.map((diff, i) => (
            <div key={i} className="bg-[#0B1120] border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-[#2DD4BF]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold text-white">{diff.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {diff.text}
              </p>
            </div>
          ))}
          <div className="bg-gradient-to-br from-[#0D9488]/20 to-[#0F172A] border border-[#2DD4BF]/40 p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Experience All 10 Modules</h3>
              <p className="text-xs text-slate-300 mt-1">
                Launch the studio right in your browser. No downloads or credit card required.
              </p>
            </div>
            <button
              onClick={onLaunchApp}
              className="py-2.5 px-4 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Launch Live Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
