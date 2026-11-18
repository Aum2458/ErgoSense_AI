import React from 'react';
import { 
  Activity, 
  Radio, 
  Smartphone, 
  Users, 
  LayoutDashboard, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types/ergosense.ts';

interface NavbarProps {
  currentView: 'dashboard' | 'admin';
  onViewChange: (view: 'dashboard' | 'admin') => void;
  users: UserProfile[];
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  onOpenSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  users,
  currentUser,
  onUserChange,
  connectionStatus,
  onOpenSimulator,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Live Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00BFA5] to-[#2DD4BF] p-0.5 shadow-lg shadow-teal-500/20">
                <div className="w-full h-full bg-[#0B1120] rounded-[10px] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#00BFA5]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                    ErgoSense <span className="text-[#00BFA5]">AI</span>
                  </span>
                  {/* Glowing Live Status Badge */}
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#131E33] border border-[#1E293B] text-emerald-400 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                    </span>
                    Pusher Sub-40ms Connected
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 hidden sm:block">
                  Biometric Ergonomics Ecosystem • Web Twin Companion
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Screen Switcher */}
          <div className="flex items-center gap-2 bg-[#131E33] p-1 rounded-xl border border-[#1E293B]">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-[#00BFA5] text-[#0B1120] shadow-md font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>User Companion</span>
            </button>
            <button
              onClick={() => onViewChange('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'admin'
                  ? 'bg-[#00BFA5] text-[#0B1120] shadow-md font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Admin Fleet</span>
            </button>
          </div>

          {/* Right Controls: Simulator Button & User Selector */}
          <div className="flex items-center gap-3">
            {/* Telemetry Simulator Quick Trigger */}
            <button
              onClick={onOpenSimulator}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#131E33] hover:bg-[#1E293B] text-teal-400 border border-teal-500/30 transition-all"
              title="Open Android Telemetry Injector"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Simulator</span>
            </button>

            {/* User Selector Dropdown */}
            <div className="relative flex items-center">
              <select
                value={currentUser.userId}
                onChange={(e) => {
                  const selected = users.find((u) => u.userId === e.target.value);
                  if (selected) onUserChange(selected);
                }}
                className="appearance-none bg-[#131E33] hover:bg-[#1E293B] text-white text-xs font-medium pl-8 pr-7 py-1.5 rounded-xl border border-[#1E293B] focus:outline-none focus:border-[#00BFA5] cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.displayName} ({u.role === 'admin' ? 'Admin' : 'User'})
                  </option>
                ))}
              </select>
              <div className="absolute left-2.5 pointer-events-none">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&fit=crop&q=80'}
                  alt={currentUser.displayName}
                  className="w-4 h-4 rounded-full object-cover"
                />
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
