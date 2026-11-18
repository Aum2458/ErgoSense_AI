import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Cpu, 
  Trash2, 
  CheckCircle2, 
  ServerOff,
  VideoOff,
  Database,
  ArrowRight
} from 'lucide-react';
import { PublicNavRoute } from '../../components/PublicNavbar.tsx';

interface PublicPrivacyScreenProps {
  onNavigate: (route: PublicNavRoute) => void;
  onLaunchApp: () => void;
}

export const PublicPrivacyScreen: React.FC<PublicPrivacyScreenProps> = ({ onNavigate, onLaunchApp }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
          Privacy & Engineering Ethics
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          24/7 Availability Without 24/7 Surveillance
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          We engineered ErgoSense with a fundamental boundary: camera tracking is strictly voluntary, processed 100% inside your device’s browser memory, and never transmitted across the network.
        </p>
      </div>

      {/* 4 Architectural Privacy Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Guarantee 1 */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#2DD4BF]">
            <ServerOff className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">100% In-Browser Edge Processing</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every camera frame is consumed solely by the WebGL/WASM MediaPipe runtime inside your browser tab. Raw video frames are discarded immediately after 33 coordinate pairs are extracted. Zero video bytes ever leave your machine.
          </p>
          <div className="pt-2 text-xs text-[#2DD4BF] font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Audit: Network tab confirms 0 frame uploads</span>
          </div>
        </div>

        {/* Guarantee 2 */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#38BDF8]">
            <VideoOff className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Physical Webcam LED Release Guarantee</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            When you tap "Pause", switch to Privacy Mode, or navigate away, the code explicitly invokes <code className="bg-[#0B1120] px-1.5 py-0.5 rounded text-[#38BDF8]">MediaStreamTrack.stop()</code>, immediately turning off your laptop’s physical green camera hardware indicator light.
          </p>
          <div className="pt-2 text-xs text-[#38BDF8] font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Hardware stream severed instantly</span>
          </div>
        </div>

        {/* Guarantee 3 */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[#818CF8]">
            <Database className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Summary-Only Telemetry Storage</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The database stores only anonymized joint angles, duration minutes, and high-level states (e.g. cervical angle: 14°, status: optimal). No biometric facial identifiers or biometric signatures are ever stored or reconstructed.
          </p>
          <div className="pt-2 text-xs text-[#818CF8] font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>No facial recognition or identity tracking</span>
          </div>
        </div>

        {/* Guarantee 4 */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">1-Click Local Data Deletion</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You own your movement data. In Settings, click "Purge All Data" to permanently erase all IndexedDB rollups, comfort journal entries, and baseline calibration records in a single instant transaction.
          </p>
          <div className="pt-2 text-xs text-rose-400 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero persistent residual tracking</span>
          </div>
        </div>
      </div>

      {/* Organizational Anonymity Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#131D33] border border-[#1E293B] rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-[#2DD4BF] text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>Enterprise & University Privacy Shield</span>
          </div>
          <h3 className="text-xl font-bold text-white">No Boss or Professor Spying</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            When used in enterprise or university settings, managers and administrators only see anonymized aggregate trends (e.g., "Engineering Team 78% Ergonomic Alignment", "Recommended 2:00 PM Break"). Managers can never view your camera feed, angle telemetry, or personal comfort journal.
          </p>
        </div>
        <button
          onClick={onLaunchApp}
          className="px-6 py-3.5 bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          <span>Open Live Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
