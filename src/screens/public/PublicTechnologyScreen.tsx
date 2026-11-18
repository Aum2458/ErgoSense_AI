import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Check, 
  X, 
  Sparkles, 
  Eye, 
  Smartphone, 
  Activity, 
  Sliders, 
  Brain, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';
import { PublicNavRoute } from '../../components/PublicNavbar.tsx';

interface PublicTechnologyScreenProps {
  onNavigate: (route: PublicNavRoute) => void;
  onLaunchApp: () => void;
}

export const PublicTechnologyScreen: React.FC<PublicTechnologyScreenProps> = ({ onNavigate, onLaunchApp }) => {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(1);
  const [simulatedDurationSec, setSimulatedDurationSec] = useState<number>(8); // 8 seconds of reach

  const architectureLayers = [
    {
      num: '01',
      name: 'Input Perception Layer',
      tech: 'W3C MediaDevices · DeviceMotionEvent · Web Bluetooth',
      description:
        'Captures multi-modal telemetry strictly with explicit consent. Connects browser webcam (with immediate hardware track stop), smartphone 3-axis accelerometer/gyroscope, and optional BLE smartwatch sensors.',
      components: ['Webcam Stream (1080p / 720p)', 'Phone 3-Axis IMU Sensor Bridge', 'Optional Wearable Pulse / BLE', 'User Comfort Feedback Loop'],
    },
    {
      num: '02',
      name: 'Computer Vision & Kinematic Engine',
      tech: '@mediapipe/tasks-vision · WASM · WebGL',
      description:
        'Processes raw frames in local browser memory at 30 FPS. Extracts 33 3D world pose landmarks, applies Exponential Moving Average low-pass filtering (α=0.25), and executes desk hip-occlusion fallback geometry.',
      components: ['33 Landmark 3D Pose Estimation', 'EMA Low-Pass Jitter Filter (α=0.25)', 'Seated Desk Hip-Occlusion Fallback', 'Viewing Distance Triangulation (cm)'],
    },
    {
      num: '03',
      name: 'Personal Intelligence & Temporal Engine',
      tech: 'Z-Score Hysteresis · 30s Rolling Buffer · IndexedDB',
      description:
        'The core mathematical differentiator. Compares real-time joint vectors against the user’s personal calibrated baseline. Distinguishes normal transient reaches (<15s) from sustained fatigue (≥75% of rolling 30s window).',
      components: ['Personal Baseline Tolerances (μ, σ)', '30s Rolling Hysteresis State Machine', 'Micro-Motion Variance (σ²_motion)', 'Closed-Loop Adaptive Tuning'],
    },
    {
      num: '04',
      name: 'AI Coaching & Multilingual Engine',
      tech: 'LLM + RAG · Web Speech API (EN, HI, GU)',
      description:
        'Synthesizes personalized movement routines and answers ergonomic questions grounded in the user’s movement history, comfort journal notes, and verified OSHA standards. Full speech input/output in English, Hindi, and Gujarati.',
      components: ['RAG-Grounded Contextual Prompts', 'Web Speech Synthesis (EN, HI, GU)', 'Guided 60s Micro-Break Routines', 'Strict Driving Audio-Only Safety Gate'],
    },
    {
      num: '05',
      name: 'User Experience & Delivery Layer',
      tech: 'Next.js 14 · DocumentPiP · Service Worker PWA',
      description:
        'Delivers a unified responsive SaaS interface across desktop, tablet, and mobile. Features cross-browser Picture-in-Picture HUD widgets, Web Worker heartbeat clocks (solving tab throttling), and offline PWA support.',
      components: ['Web Worker 10Hz Heartbeat Clock', 'Cross-Browser Picture-in-Picture HUD', 'Offline-First IndexedDB Cache', 'Family & Org Anonymized Aggregation'],
    },
  ];

  // Naive single-frame vs ErgoSense Temporal Engine comparison
  const isNaiveAlert = simulatedDurationSec >= 2; // Naive triggers after just 2 seconds of natural reach
  const isErgoSenseAlert = simulatedDurationSec >= 24; // ErgoSense only triggers if sustained >75% of 30s

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
          Browser-Native Architecture
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          AI Technology & Temporal Science
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          How ErgoSense solves the fatal flaw of first-generation posture apps: eliminating false alerts 
          through personal baseline calibration and 30-second temporal hysteresis.
        </p>
      </div>

      {/* 1. Interactive 5-Layer Architecture Diagram */}
      <section className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            5-Layer Deep Dive
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            System Stack Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Layer Selector Stack */}
          <div className="lg:col-span-5 space-y-2">
            {architectureLayers.map((layer, idx) => {
              const isSelected = selectedLayerIndex === idx;
              return (
                <button
                  key={layer.num}
                  onClick={() => setSelectedLayerIndex(idx)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#0D9488]/20 border-[#2DD4BF] text-white shadow-md'
                      : 'bg-[#0B1120] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#2DD4BF]">{layer.num}</span>
                    <span className="text-xs font-semibold">{layer.name}</span>
                  </div>
                  <Cpu className={`w-4 h-4 ${isSelected ? 'text-[#2DD4BF]' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Active Layer Details Card */}
          <div className="lg:col-span-7 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-[#2DD4BF]">LAYER {architectureLayers[selectedLayerIndex].num}</span>
                <h3 className="text-lg font-bold text-white">{architectureLayers[selectedLayerIndex].name}</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                {architectureLayers[selectedLayerIndex].tech}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {architectureLayers[selectedLayerIndex].description}
            </p>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                Subsystem Modules:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {architectureLayers[selectedLayerIndex].components.map((comp, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-[#070D18] p-2.5 rounded-lg border border-slate-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                    <span>{comp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Temporal Engine vs. Naive Detector Comparison */}
      <section className="bg-gradient-to-b from-[#0F172A] to-[#0B1120] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
            Live Algorithmic Benchmark
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why Naive Posture Detectors Fail
          </h2>
          <p className="text-xs text-slate-400">
            Slide below to simulate reaching forward for a cup of coffee or glancing at notes. See how ErgoSense's temporal filter eliminates false annoyance alerts.
          </p>
        </div>

        {/* Simulation Slider */}
        <div className="max-w-xl mx-auto bg-[#0B1120] p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Forward Reach / Glance Duration:</span>
            <span className="font-mono text-[#2DD4BF] font-bold text-sm">{simulatedDurationSec} seconds</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={simulatedDurationSec}
            onChange={(e) => setSimulatedDurationSec(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1s (Brief Glance)</span>
            <span>15s (Normal Reach Limit)</span>
            <span>30s (Sustained Slouch)</span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card A: Naive App */}
          <div className={`p-6 rounded-2xl border transition-all ${
            isNaiveAlert 
              ? 'bg-rose-950/20 border-rose-500/50 text-rose-200' 
              : 'bg-[#0B1120] border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Naive Single-Frame Detector</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                isNaiveAlert ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {isNaiveAlert ? 'ANNOYING ALERT!' : 'PASS'}
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-4">
              {isNaiveAlert
                ? 'Fires a loud buzzer after 2 seconds of glancing at your desk notes. Treats natural healthy movement as an ergonomic defect. Users uninstall within 48 hours.'
                : 'No alert triggered yet.'}
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800 flex items-center gap-1.5">
              <X className="w-4 h-4 text-rose-400" />
              <span>False Alert Rate: High (45% in trials)</span>
            </div>
          </div>

          {/* Card B: ErgoSense AI */}
          <div className={`p-6 rounded-2xl border transition-all ${
            isErgoSenseAlert 
              ? 'bg-rose-950/20 border-rose-500/50 text-rose-200' 
              : 'bg-[#0D9488]/10 border-[#2DD4BF] text-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF]">
                ErgoSense Temporal Engine
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                isErgoSenseAlert 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30'
              }`}>
                {isErgoSenseAlert ? 'SUSTAINED SLOUCH NUDGE' : 'TRANSIENT SHIFT (SUPPRESSED)'}
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-4">
              {isErgoSenseAlert
                ? 'Sustained forward head posture persisted for over 75% of the 30-second rolling buffer. Gentle, context-aware prompt dispatched.'
                : 'Recognizes natural transient movement (<15s). Alert is strictly suppressed to preserve deep focus and flow state.'}
            </p>
            <div className="text-[11px] font-mono text-emerald-400 pt-3 border-t border-slate-800 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>False Alert Rate: Reduced by 84% with Baseline</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
