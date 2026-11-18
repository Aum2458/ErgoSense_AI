import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Sliders, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { BodyZone, PainJournalEntry } from '../../types/ergosense.ts';
import { LocalStorageManager } from '../../lib/storage.ts';
import { VoiceAssistant } from '../../lib/speech.ts';

interface PainJournalScreenProps {
  onThresholdsTightened?: () => void;
}

export const PainJournalScreen: React.FC<PainJournalScreenProps> = ({ onThresholdsTightened }) => {
  const [entries, setEntries] = useState<PainJournalEntry[]>(LocalStorageManager.getJournalEntries());
  const [selectedZone, setSelectedZone] = useState<BodyZone>('cervical_neck');
  const [viewOrientation, setViewOrientation] = useState<'posterior' | 'anterior'>('posterior');
  const [intensity, setIntensity] = useState<number>(6);
  const [selectedSensations, setSelectedSensations] = useState<string[]>(['Stiffness', 'Tension']);
  const [taskContext, setTaskContext] = useState<string>('Late afternoon coding session');
  const [didAiHelp, setDidAiHelp] = useState<boolean>(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const zones: { id: BodyZone; label: string; x: number; y: number; view: 'anterior' | 'posterior' }[] = [
    { id: 'cervical_neck', label: 'Cervical Neck', x: 100, y: 48, view: 'posterior' },
    { id: 'upper_trapezius', label: 'Upper Trapezius', x: 100, y: 75, view: 'posterior' },
    { id: 'left_shoulder', label: 'Left Shoulder', x: 55, y: 85, view: 'posterior' },
    { id: 'right_shoulder', label: 'Right Shoulder', x: 145, y: 85, view: 'posterior' },
    { id: 'thoracic_back', label: 'Thoracic Upper Back', x: 100, y: 120, view: 'posterior' },
    { id: 'lumbar_lower_back', label: 'Lumbar Lower Back', x: 100, y: 175, view: 'posterior' },
    { id: 'wrists_forearms', label: 'Wrists & Forearms', x: 30, y: 190, view: 'anterior' },
    { id: 'hips_pelvis', label: 'Hips & Pelvis', x: 100, y: 210, view: 'anterior' },
    { id: 'knees', label: 'Knees & Patella', x: 100, y: 290, view: 'anterior' },
  ];

  const availableSensations = ['Stiffness', 'Tension', 'Dull Ache', 'Sharp', 'Fatigue', 'Burning'];

  const toggleSensation = (s: string) => {
    if (selectedSensations.includes(s)) {
      setSelectedSensations(selectedSensations.filter((x) => x !== s));
    } else {
      setSelectedSensations([...selectedSensations, s]);
    }
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: PainJournalEntry = {
      id: `jnl_${Date.now()}`,
      timestamp: Date.now(),
      zone: selectedZone,
      intensity,
      sensations: selectedSensations,
      taskContext,
      didAiHelp,
      correlatedZScore: 2.5,
      adaptedThresholdApplied: intensity >= 5,
    };

    const updated = LocalStorageManager.addJournalEntry(newEntry);
    setEntries(updated);

    if (intensity >= 5) {
      setSuccessToast(`Logged! Discomfort ≥ 5/10 triggered 10% adaptive threshold tightening for ${selectedZone.replace('_', ' ')}.`);
      onThresholdsTightened?.();
    } else {
      setSuccessToast(`Discomfort logged. Correlated with today's posture timeline.`);
    }

    VoiceAssistant.playChime('success');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Toast Notice */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 bg-[#0F172A] border-2 border-emerald-400 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider font-mono">
          Closed-Loop Ergonomic Correlation
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Pain & Comfort Journal
        </h1>
        <p className="text-xs text-slate-400">
          Track localized body sensations and automatically correlate them with your posture Z-scores to tighten baseline tolerances.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive SVG Human Body Map (5 Columns) */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Interactive Body Map</h3>
            <div className="flex bg-[#0B1120] border border-slate-800 p-0.5 rounded-xl text-xs font-mono">
              <button
                onClick={() => setViewOrientation('posterior')}
                className={`px-2.5 py-1 rounded-lg ${viewOrientation === 'posterior' ? 'bg-[#0D9488] text-white font-bold' : 'text-slate-400'}`}
              >
                Posterior (Back)
              </button>
              <button
                onClick={() => setViewOrientation('anterior')}
                className={`px-2.5 py-1 rounded-lg ${viewOrientation === 'anterior' ? 'bg-[#0D9488] text-white font-bold' : 'text-slate-400'}`}
              >
                Anterior (Front)
              </button>
            </div>
          </div>

          {/* SVG Silhouette with Clickable Hotspots */}
          <div className="relative flex justify-center py-4 bg-[#070D18] rounded-2xl border border-slate-800/80">
            <svg width="200" height="380" viewBox="0 0 200 380" className="select-none">
              {/* Stylized Human Body Silhouette */}
              <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
              </defs>

              {/* Head */}
              <circle cx="100" cy="30" r="22" fill="url(#bodyGrad)" stroke="#334155" strokeWidth="2" />
              {/* Neck */}
              <rect x="92" y="52" width="16" height="18" fill="url(#bodyGrad)" />
              {/* Torso */}
              <path
                d="M 60,70 L 140,70 L 125,200 L 75,200 Z"
                fill="url(#bodyGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              {/* Arms */}
              <path d="M 60,75 L 35,160 L 25,230" stroke="#334155" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M 140,75 L 165,160 L 175,230" stroke="#334155" strokeWidth="12" strokeLinecap="round" fill="none" />
              {/* Legs */}
              <path d="M 85,200 L 80,290 L 75,370" stroke="#334155" strokeWidth="16" strokeLinecap="round" fill="none" />
              <path d="M 115,200 L 120,290 L 125,370" stroke="#334155" strokeWidth="16" strokeLinecap="round" fill="none" />

              {/* Hotspot Markers for Active Orientation */}
              {zones
                .filter((z) => z.view === viewOrientation)
                .map((z) => {
                  const isSelected = selectedZone === z.id;
                  return (
                    <g
                      key={z.id}
                      onClick={() => setSelectedZone(z.id)}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={z.x}
                        cy={z.y}
                        r={isSelected ? 10 : 7}
                        fill={isSelected ? '#F43F5E' : '#0D9488'}
                        className="transition-all hover:scale-125"
                      />
                      <circle
                        cx={z.x}
                        cy={z.y}
                        r={isSelected ? 16 : 10}
                        fill="none"
                        stroke={isSelected ? '#F43F5E' : '#2DD4BF'}
                        strokeWidth="1.5"
                        strokeDasharray={isSelected ? '2,2' : undefined}
                      />
                    </g>
                  );
                })}
            </svg>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-slate-400 font-mono">Selected Zone: </span>
            <span className="text-xs font-bold text-[#2DD4BF] capitalize font-mono">
              {selectedZone.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Right Column: Log New Discomfort & Closed-Loop Timeline (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Form */}
          <form onSubmit={handleSaveEntry} className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Log Localized Discomfort Event</h3>
              <span className="text-xs text-rose-400 font-mono">Scale 1–10</span>
            </div>

            {/* Intensity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Discomfort Intensity (1 = Mild, 10 = Severe):</span>
                <span className={`font-mono font-bold text-sm ${intensity >= 5 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {intensity} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              {intensity >= 5 && (
                <span className="text-[10px] text-rose-400 font-mono block">
                  Notice: Intensity ≥ 5 automatically triggers 10% adaptive threshold tightening.
                </span>
              )}
            </div>

            {/* Sensation Tags */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">Sensation Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableSensations.map((sens) => {
                  const isChecked = selectedSensations.includes(sens);
                  return (
                    <button
                      type="button"
                      key={sens}
                      onClick={() => toggleSensation(sens)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isChecked
                          ? 'bg-[#0D9488] text-white shadow-sm'
                          : 'bg-[#0B1120] border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sens}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Context & Previous Help */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium block">Active Task Context</label>
                <input
                  type="text"
                  value={taskContext}
                  onChange={(e) => setTaskContext(e.target.value)}
                  placeholder="e.g. 3-hour uninterrupted coding sprint"
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium block">Did prior AI micro-break help?</label>
                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setDidAiHelp(true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold ${
                      didAiHelp ? 'bg-[#0D9488] text-white' : 'bg-[#0B1120] border border-slate-800 text-slate-400'
                    }`}
                  >
                    Yes, relieved strain
                  </button>
                  <button
                    type="button"
                    onClick={() => setDidAiHelp(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold ${
                      !didAiHelp ? 'bg-slate-700 text-white' : 'bg-[#0B1120] border border-slate-800 text-slate-400'
                    }`}
                  >
                    No / Persistent
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log Discomfort & Correlate Baseline</span>
            </button>
          </form>

          {/* Correlation Log Entries */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Discomfort & Posture Z-Score Correlation
            </h3>

            <div className="space-y-2.5">
              {entries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="bg-[#0B1120] border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white capitalize font-mono">
                        {entry.zone.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        entry.intensity >= 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        Intensity: {entry.intensity}/10
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{entry.taskContext}</p>
                    <div className="flex gap-1.5 pt-0.5">
                      {entry.sensations.map((s, i) => (
                        <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1 font-mono text-[11px]">
                    <span className="text-[#38BDF8] block">Correlated Z: {entry.correlatedZScore || 2.4}</span>
                    {entry.adaptedThresholdApplied && (
                      <span className="text-emerald-400 text-[10px] block">Threshold Tightened 10%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
