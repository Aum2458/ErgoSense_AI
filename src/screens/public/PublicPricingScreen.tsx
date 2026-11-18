import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  ArrowRight, 
  Layers, 
  MapPin, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Users, 
  Dumbbell, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';
import { PublicNavRoute } from '../../components/PublicNavbar.tsx';

interface PublicPricingScreenProps {
  onNavigate: (route: PublicNavRoute) => void;
  onLaunchApp: () => void;
}

export const PublicPricingScreen: React.FC<PublicPricingScreenProps> = ({ onNavigate, onLaunchApp }) => {
  const [selectedSegment, setSelectedSegment] = useState<number>(0);

  const segments = [
    {
      id: 'individuals',
      name: 'Individuals & Remote Workers',
      type: 'B2C',
      price: '$9',
      period: '/ month',
      description: 'Complete personal movement intelligence for students, programmers, freelancers, and home desk workers.',
      features: [
        'Full browser-native 33-point posture tracking',
        'Personal Baseline Calibration (Sitting & Standing)',
        '30-second temporal hysteresis (no false alarms)',
        'Multilingual AI Coach (English, Hindi, Gujarati)',
        'Desk Setup Geometry & Proximity Analyzer',
        'Cross-browser Picture-in-Picture Mini-HUD',
      ],
      cta: 'Start 14-Day Free Trial',
    },
    {
      id: 'families',
      name: 'Families & Households',
      type: 'B2C',
      price: '$19',
      period: '/ month',
      description: 'Up to 5 family member profiles with separate baselines for kids studying, parents working, and grandparents mobility.',
      features: [
        '5 synchronized family household accounts',
        'Tailored profiles: Student Study + Elderly Balance',
        'Pre-drive seating checklist for family commutes',
        'Shared weekly ergonomic wellness scorecard',
        'Family privacy guarantee (individual privacy preserved)',
      ],
      cta: 'Get Family Plan',
    },
    {
      id: 'companies',
      name: 'Enterprises & Tech Companies',
      type: 'B2B',
      price: '$6',
      period: '/ seat / mo',
      description: 'Prevent developer burnout, reduce RSI claims, and foster ergonomic posture culture with anonymized fleet metrics.',
      features: [
        'Anonymized cohort ergonomic risk heatmaps',
        'Scheduled team micro-break synchronization',
        'Zero camera feed access for managers',
        'OSHA ergonomic compliance documentation',
        'Dedicated Enterprise Success Specialist',
      ],
      cta: 'Book Enterprise Demo',
    },
    {
      id: 'universities',
      name: 'Universities & Academic Labs',
      type: 'B2B',
      price: '$2',
      period: '/ student / term',
      description: 'Campus-wide student posture wellness, engineering thesis validation suite, and research volunteer recording tools.',
      features: [
        'B.Tech / Academic Volunteer Benchmark Suite',
        'Library desk focus & study ergonomics mode',
        'Anonymous student posture risk aggregated reporting',
        'CSV/JSON research dataset export',
      ],
      cta: 'Academic Licensing',
    },
    {
      id: 'factories',
      name: 'Manufacturing & Industrial Floors',
      type: 'B2B',
      price: 'Custom',
      period: 'annually',
      description: 'Repetitive arm cadence and upper-limb cycle observation for assembly workers and packaging teams.',
      features: [
        'Repetitive upper-limb cycle frequency counter',
        'Shift-based cadence monitoring',
        'RSI ergonomic strain early warning alerts',
        'Industrial workstation geometry scanner',
      ],
      cta: 'Contact Industrial Ergonomics',
    },
    {
      id: 'fitness',
      name: 'Fitness & Mobility Centres',
      type: 'B2B',
      price: '$79',
      period: '/ facility / mo',
      description: 'Coach clients with real-time 4-state exercise FSM, squat depth, tempo timing, and bilateral symmetry readouts.',
      features: [
        'Real-time 4-state Finite State Machine coach',
        'Bilateral joint loading & valgus alerts',
        'Client workout symmetry progress reports',
        'Custom warm-up and thoracic reset sequences',
      ],
      cta: 'Partner With ErgoSense',
    },
    {
      id: 'rehab',
      name: 'Physiotherapists & Rehab Clinics',
      type: 'B2B',
      price: '$99',
      period: '/ clinic / mo',
      description: 'Complement clinical therapy with client home movement baselines, pain journal tracking, and range-of-motion logs.',
      features: [
        'Client Personal Baseline Range-of-Motion setup',
        'Pain & Comfort Journal correlation export',
        'Elderly mediolateral postural sway tracking',
        'Non-medical wellness compliance monitoring',
      ],
      cta: 'Clinical Partner Access',
    },
  ];

  const roadmapPhases = [
    {
      phase: 'Phase 1',
      title: 'Working AI MVP & Browser Engine',
      status: 'LIVE NOW',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      items: [
        'In-browser MediaPipe 33-point Pose tracking at 30 FPS',
        'Personal Movement Baseline calibration (OSHA non-rigid)',
        '30-second temporal hysteresis state machine',
        'Desk hip-occlusion fallback geometry',
        '25-volunteer B.Tech thesis benchmark recorder',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Multilingual AI Coach & Everywhere Sensing',
      status: 'CURRENT RELEASE',
      color: 'bg-teal-500/20 text-[#2DD4BF] border-teal-500/30',
      items: [
        'Multilingual Voice Coach in English, Hindi, and Gujarati',
        'Web Worker 10Hz Heartbeat Clock solving background tab throttling',
        'Cross-browser Picture-in-Picture (documentPiP + canvas fallback)',
        'Interactive Pain & Comfort Journal with body map correlation',
        'Driving Safe Mode with strict audio-only safety lock',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Everywhere Support & Wearable Ecosystem',
      status: 'Q1 2027',
      color: 'bg-cyan-500/20 text-[#38BDF8] border-cyan-500/30',
      items: [
        'Web Bluetooth smartwatch & posture wearable sensor bridge',
        'Mobile PWA with offline background sync and QR pairing',
        'Enterprise fleet dashboard with aggregated anonymized metrics',
        'Predictive afternoon slouch machine learning model',
      ],
    },
    {
      phase: 'Phase 4',
      title: 'Intelligent Wellness Ecosystem & Developer API',
      status: 'Q3 2027',
      color: 'bg-indigo-500/20 text-[#818CF8] border-indigo-500/30',
      items: [
        'Public Developer Web SDK for fitness and ergonomic apps',
        'Integration with smart motorized standing desks via BLE',
        'Smart car infotainment audio bridge via Apple CarPlay/Android Auto',
        'Clinical telemetry exchange with rehabilitation EHR systems',
      ],
    },
  ];

  const current = segments[selectedSegment];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
          Transparent Pricing & Roadmap
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Solutions for Every Movement Setting
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          From individual knowledge workers and households to enterprise fleets, universities, and industrial facilities.
        </p>
      </div>

      {/* 1. Customer Segments Matrix */}
      <section className="space-y-8">
        {/* Segment Pills / Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {segments.map((seg, idx) => (
            <button
              key={seg.id}
              onClick={() => setSelectedSegment(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSegment === idx
                  ? 'bg-[#0D9488] text-white shadow-lg shadow-teal-500/20'
                  : 'bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span className="opacity-75 text-[10px] uppercase font-mono mr-1.5">{seg.type}:</span>
              <span>{seg.name.split('&')[0]}</span>
            </button>
          ))}
        </div>

        {/* Selected Plan Showcase Card */}
        <div className="max-w-3xl mx-auto bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-mono text-[#2DD4BF] uppercase tracking-wider block">
                {current.type} SOLUTION
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">{current.name}</h2>
              <p className="text-xs text-slate-400 mt-1">{current.description}</p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-3xl font-extrabold text-white">{current.price}</span>
              <span className="text-xs text-slate-400 font-medium">{current.period}</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              Included In This Tier:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">14-day risk-free trial · No credit card required</span>
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-6 py-3 bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{current.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. 4-Phase Product Development Roadmap */}
      <section className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div>
          <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider block">
            Product Vision
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            4-Phase Product Development Roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmapPhases.map((phase, idx) => (
            <div key={idx} className="bg-[#0B1120] border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">{phase.phase}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${phase.color}`}>
                    {phase.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-tight">{phase.title}</h3>
                <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  {phase.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-[#2DD4BF] font-mono">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
