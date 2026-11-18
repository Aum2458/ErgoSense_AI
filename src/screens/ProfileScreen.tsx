import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Sliders, 
  Moon, 
  Bell, 
  Check, 
  Radio, 
  Volume2, 
  Eye, 
  Smartphone,
  Save,
  Server
} from 'lucide-react';
import { UserProfile } from '../types/ergosense.ts';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
}) => {
  const [movementGoal, setMovementGoal] = useState<number>(45); // Daily Movement Goal in mins
  const [eyeInterval, setEyeInterval] = useState<number>(20); // Eye Comfort Interval in mins
  const [quietHoursEnabled, setQuietHoursEnabled] = useState<boolean>(true);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(true);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {savedToast && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Ergonomic goals and privacy preferences saved successfully!</span>
          </div>
          <button onClick={() => setSavedToast(false)} className="text-emerald-400 underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#00BFA5]" />
            Profile &amp; Ergonomic Ecosystem Settings
          </h2>
          <p className="text-xs text-slate-400">
            Identity verification, privacy-first computing policies, and haptic threshold governance
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#00BFA5] hover:bg-[#2DD4BF] text-[#0B1120] transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/20 active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Identity Card & Privacy Badge (col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* USER IDENTITY CARD */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-[#00BFA5]" />
              User Identity
            </h3>

            <div className="flex items-center gap-4">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.displayName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500/40 shadow-lg"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-white">{user.displayName}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-500/30 uppercase">
                    {user.role}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{user.email}</div>
                <div className="text-[11px] text-slate-500">
                  Member since: <strong className="text-slate-300 font-mono">October 14, 2024</strong>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#131E33] rounded-xl border border-[#1E293B] text-xs text-slate-300 flex items-center justify-between">
              <span>Department:</span>
              <span className="font-semibold text-white">{user.department}</span>
            </div>
          </div>

          {/* PRIVACY BADGE: Zero-Cloud Video Processing */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-950/80 text-[#00BFA5] border border-teal-500/40 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Zero-Cloud Video Processing</h4>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-semibold border border-emerald-500/30">
                    Client On-Device Only
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Camera and TrueDepth sensor frames never leave your local device. All skeletal landmark inference, neck flexion calculations, and distance triangulation run entirely on-device via WebAssembly/TensorFlow Lite. Only anonymous mathematical floats (degrees, cm) pass through the sub-40ms telemetry channel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-[#1E293B]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> No video recording
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> HIPAA/GDPR Compliant
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Goal Sliders & Toggles (col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* GOAL SLIDERS CARD */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00BFA5]" />
              Ergonomic Daily Targets
            </h3>

            {/* Daily Movement Goal (mins) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200">
                  Daily Movement Goal
                </label>
                <span className="font-mono font-bold text-[#00BFA5]">{movementGoal} mins/day</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={movementGoal}
                onChange={(e) => setMovementGoal(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-[#00BFA5]"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>15 mins (Minimum)</span>
                <span>45 mins (Recommended)</span>
                <span>120 mins</span>
              </div>
            </div>

            {/* Eye Comfort Interval (mins) */}
            <div className="space-y-2 pt-2 border-t border-[#1E293B]">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200">
                  Eye Comfort Interval (20-20-20)
                </label>
                <span className="font-mono font-bold text-cyan-400">Every {eyeInterval} mins</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={eyeInterval}
                onChange={(e) => setEyeInterval(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10 mins</span>
                <span>20 mins (Optometric Standard)</span>
                <span>60 mins</span>
              </div>
            </div>
          </div>

          {/* TOGGLES CARD: Quiet Hours & Notification Policies */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#F59E0B]" />
              Notification &amp; Haptic Policies
            </h3>

            {/* Toggle 1: Quiet Hours (22:00 - 07:00) */}
            <div className="flex items-center justify-between p-3 bg-[#131E33] rounded-xl border border-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0B1120] text-amber-400 border border-[#1E293B]">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Quiet Hours (22:00 - 07:00)</div>
                  <div className="text-[11px] text-slate-400">
                    Suppress phone haptic motor buzz and chimes automatically
                  </div>
                </div>
              </div>
              <button
                onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  quietHoursEnabled ? 'bg-[#00BFA5]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    quietHoursEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Haptic Vibration on Phone */}
            <div className="flex items-center justify-between p-3 bg-[#131E33] rounded-xl border border-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0B1120] text-teal-400 border border-[#1E293B]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Android Haptic Feedback</div>
                  <div className="text-[11px] text-slate-400">
                    Activate native vibration motor on posture deviation &gt; 15s
                  </div>
                </div>
              </div>
              <button
                onClick={() => setHapticFeedback(!hapticFeedback)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  hapticFeedback ? 'bg-[#00BFA5]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    hapticFeedback ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
