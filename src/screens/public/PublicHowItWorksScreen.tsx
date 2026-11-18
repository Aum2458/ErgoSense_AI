import React, { useState } from 'react';
import { 
  Eye, 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Sliders,
  Clock,
  Compass,
  AlertCircle
} from 'lucide-react';
import { PublicNavRoute } from '../../components/PublicNavbar.tsx';

interface PublicHowItWorksProps {
  onNavigate: (route: PublicNavRoute) => void;
  onLaunchApp: () => void;
}

export const PublicHowItWorksScreen: React.FC<PublicHowItWorksProps> = ({ onNavigate, onLaunchApp }) => {
  const [activeLayer, setActiveLayer] = useState<number>(0);

  const layers = [
    {
      step: '01',
      title: 'Observe — Understand Body Movement',
      subtitle: 'Non-invasive, multi-modal perception',
      icon: Eye,
      accent: 'text-[#2DD4BF]',
      badgeColor: 'bg-teal-500/10 text-[#2DD4BF] border-teal-500/30',
      description:
        'ErgoSense gathers biometric movement signals strictly with your explicit permission. In desk mode, your laptop camera tracks 33 3D skeletal landmarks locally in browser memory. During travel or walking, smartphone accelerometer and gyroscope motion sensors provide camera-free continuity.',
      highlights: [
        'Browser-native MediaPipe Pose extracting 33 landmarks at 30 FPS',
        'Seated desk hip-occlusion fallback when legs are hidden under desks',
        'Viewing distance calculation in cm (eye-to-screen focal geometry)',
        'Physical webcam hardware LED released instantly when paused or stopped',
      ],
      techSpecs: 'WASM + WebGL Acceleration · 30–40ms Inference · Zero Video Upload',
    },
    {
      step: '02',
      title: 'Understand — Personal AI Intelligence',
      subtitle: 'OSHA-aligned baseline calibration and temporal context',
      icon: Brain,
      accent: 'text-[#38BDF8]',
      badgeColor: 'bg-cyan-500/10 text-[#38BDF8] border-cyan-500/30',
      description:
        'Unlike primitive apps that yell whenever you tilt your head for 2 seconds, ErgoSense runs a 30-second rolling temporal buffer. It calibrates to your personal movement baseline (your natural comfort angles) and distinguishes healthy transient reaches from sustained fatigue.',
      highlights: [
        '60-second guided onboarding to record personal baseline mean (μ) and variance (σ)',
        'Closed-loop adaptive tuning: "I\'m Comfortable" button dynamically refines tolerances',
        '30-second rolling temporal window: transient shifts (<15s) strictly suppress alerts',
        'Static micro-motion variance tracking (σ²_motion) detects muscular freezing',
      ],
      techSpecs: 'EMA Low-Pass Filtering (α=0.25) · Z-Score Tolerance · Hysteresis State Machine',
    },
    {
      step: '03',
      title: 'Support — Help at the Right Moment',
      subtitle: 'Contextual coaching without annoying interruptions',
      icon: Sparkles,
      accent: 'text-[#818CF8]',
      badgeColor: 'bg-indigo-500/10 text-[#818CF8] border-indigo-500/30',
      description:
        'When genuine fatigue or sustained postural drift is detected, ErgoSense provides gentle, non-disruptive support. Choose from subtle audio chimes, desktop notifications, picture-in-picture widgets, or interactive 60-second stretch breaks.',
      highlights: [
        'Multilingual AI Coach speaking and listening in English, Hindi, and Gujarati',
        'Guided 60-second micro-breaks with animated biomechanical form cues',
        'Strict Driving Safe Mode: disables visual popups and offers non-distracting audio checks',
        'Cross-browser Picture-in-Picture (PiP) mini companion stays visible over any app',
      ],
      techSpecs: 'Web Speech API · Web Audio Synthesis · documentPictureInPicture API',
    },
  ];

  const current = layers[activeLayer];
  const CurrentIcon = current.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
          How ErgoSense AI Works
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          The Three Intelligence Layers
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          From multi-sensor perception to temporal baseline modeling and context-aware nudges, 
          explore how our browser-native system delivers intelligent movement wellness.
        </p>
      </div>

      {/* Layer Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {layers.map((layer, index) => {
          const isSelected = activeLayer === index;
          const Icon = layer.icon;
          return (
            <button
              key={layer.step}
              onClick={() => setActiveLayer(index)}
              className={`p-6 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#0F172A] border-[#2DD4BF] shadow-xl shadow-teal-500/10 ring-1 ring-[#2DD4BF]/50'
                  : 'bg-[#0B1120] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-slate-500">LAYER {layer.step}</span>
                <Icon className={`w-5 h-5 ${isSelected ? layer.accent : 'text-slate-500'}`} />
              </div>
              <h3 className={`text-base font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {layer.title.split('—')[0]}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{layer.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Detailed Layer Card */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${current.badgeColor}`}>
              LAYER {current.step}
            </span>
            <span className="text-xs text-slate-400">{current.subtitle}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {current.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {current.description}
          </p>

          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              Key Capabilities:
            </span>
            {current.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">Architecture Pipeline:</span>
            <span className="font-mono text-xs text-[#2DD4BF] bg-[#0B1120] px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
              {current.techSpecs}
            </span>
          </div>
        </div>

        {/* Visual Callout */}
        <div className="lg:col-span-5 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#2DD4BF]">
              <CurrentIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">OSHA Ergonomic Principle</h4>
              <p className="text-xs text-slate-400">Non-rigid posture guideline</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed italic bg-[#070D18] p-4 rounded-xl border border-slate-800/80">
            "A person's preferred posture changes continuously during the workday. Forcing an arbitrary textbook 90-degree spine increases muscle tension and reduces compliance. Ergonomics works best when calibrated to individual movement range."
          </p>

          <button
            onClick={onLaunchApp}
            className="w-full py-3 text-xs font-semibold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            <span>Experience Layer {current.step} in Live Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
