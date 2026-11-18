import React from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  Video, 
  Dumbbell, 
  Heart, 
  BarChart3, 
  Smartphone, 
  User, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types/ergosense.ts';

export type ScreenRoute = 'home' | 'monitor' | 'fitness' | 'recovery' | 'insights' | 'devices' | 'profile';

interface MainNavbarProps {
  currentRoute: ScreenRoute;
  onRouteChange: (route: ScreenRoute) => void;
  users: UserProfile[];
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  onOpenSimulator: () => void;
}

export const MainNavbar: React.FC<MainNavbarProps> = ({
  currentRoute,
  onRouteChange,
  users,
  currentUser,
  onUserChange,
  connectionStatus,
  onOpenSimulator,
}) => {
  const navItems = [
    { route: 'home', label: 'Home', icon: LayoutDashboard },
    { route: 'monitor', label: 'AI Monitor', icon: Video },
    { route: 'fitness', label: 'Fitness', icon: Dumbbell },
    { route: 'recovery', label: 'Recovery', icon: Heart },
    { route: 'insights', label: 'Analytics', icon: BarChart3 },
    { route: 'devices', label: 'Devices', icon: Smartphone },
    { route: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Glowing Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => onRouteChange('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00BFA5] to-[#2DD4BF] p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0B1120] rounded-[10px] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#00BFA5]" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-tight text-white font-sans">
                    ErgoSense <span className="text-[#00BFA5]">AI</span>
                  </span>
                  <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#131E33] border border-[#1E293B] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    Pusher Sub-40ms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Bar (All 7 Screens) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#131E33] p-1 rounded-xl border border-[#1E293B] overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onRouteChange(item.route)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#00BFA5] text-[#0B1120] font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Telemetry Simulator Trigger */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#131E33] hover:bg-[#1E293B] text-teal-400 border border-teal-500/30 transition-all shadow-sm"
              title="Android Sensor Simulator"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sensor Injector</span>
            </button>

            {/* User Dropdown Selector */}
            <div className="relative flex items-center">
              <select
                value={currentUser.userId}
                onChange={(e) => {
                  const sel = users.find((u) => u.userId === e.target.value);
                  if (sel) onUserChange(sel);
                }}
                className="appearance-none bg-[#131E33] hover:bg-[#1E293B] text-white text-xs font-semibold pl-8 pr-7 py-1.5 rounded-xl border border-[#1E293B] focus:outline-none focus:border-[#00BFA5] cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.displayName.split(' ')[0]} ({u.role})
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

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 border-t border-[#1E293B]/60 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onRouteChange(item.route)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00BFA5] text-[#0B1120] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
