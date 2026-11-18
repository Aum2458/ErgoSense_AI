import React, { useState } from 'react';
import {
  LayoutDashboard,
  ScanFace,
  Dumbbell,
  BarChart3,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Activity,
  Radio,
  Send,
} from 'lucide-react';

export type AppRoutePath = '/' | '/monitor' | '/fitness-recovery' | '/analytics' | '/devices';

interface DashboardShellProps {
  currentPath: AppRoutePath;
  onNavigate: (path: AppRoutePath) => void;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  onSendTestPayload: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { path: AppRoutePath; label: string; mobileLabel: string; icon: React.ComponentType<any> }[] = [
  { path: '/', label: 'Dashboard', mobileLabel: 'Home', icon: LayoutDashboard },
  { path: '/monitor', label: 'Live AI Monitor', mobileLabel: 'Monitor', icon: ScanFace },
  { path: '/fitness-recovery', label: 'Ergonomic Fitness', mobileLabel: 'Fitness', icon: Dumbbell },
  { path: '/analytics', label: 'Ergonomic Analytics', mobileLabel: 'Analytics', icon: BarChart3 },
  { path: '/devices', label: 'Device Linking & Profile', mobileLabel: 'Devices', icon: Smartphone },
];

export const DashboardShell: React.FC<DashboardShellProps> = ({
  currentPath,
  onNavigate,
  connectionStatus,
  onSendTestPayload,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Persistent Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between bg-[#0F172A] border-r border-[#1E293B] transition-all duration-200 sticky top-0 h-screen shrink-0 ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-4 border-b border-[#1E293B] flex items-center justify-between">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-[#00C49A]/15 border border-[#00C49A]/40 flex items-center justify-center text-[#00C49A] shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div>
                  <div className="text-sm font-bold tracking-tight text-white">
                    ErgoSense <span className="text-[#00C49A]">AI</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Telemetry Companion</div>
                </div>
              )}
            </button>

            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#00C49A]/15 text-[#00C49A] border border-[#00C49A]/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#1E293B]/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Connection Telemetry */}
        <div className="p-3 border-t border-[#1E293B] space-y-2.5">
          <div className="px-3 py-2.5 rounded-xl bg-[#0B1120] border border-[#1E293B] flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                connectionStatus === 'connected'
                  ? 'bg-[#00C49A] animate-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-[#F59E0B] animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-slate-200 truncate">
                  {connectionStatus === 'connected'
                    ? 'Pusher Stream Live'
                    : connectionStatus === 'connecting'
                    ? 'Connecting Channel'
                    : 'Stream Offline'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">ergosense-channel</div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={onSendTestPayload}
              className="w-full py-2 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/70 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-[#00C49A]" />
              <span>Push Edge Packet</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Top Context Bar */}
        <header className="h-16 bg-[#0B1120]/90 backdrop-blur-md border-b border-[#1E293B] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-lg bg-[#00C49A]/15 border border-[#00C49A]/40 flex items-center justify-center text-[#00C49A]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {NAV_ITEMS.find((i) => i.path === currentPath)?.label || 'Dashboard'}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Real-Time Telemetry &amp; Ergonomic Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Radio
                className={`w-3.5 h-3.5 ${
                  connectionStatus === 'connected' ? 'text-[#00C49A]' : 'text-[#F59E0B]'
                }`}
              />
              <span className="hidden sm:inline">
                {connectionStatus === 'connected' ? 'Live Telemetry' : 'Reconnecting'}
              </span>
            </div>

            <button
              onClick={onSendTestPayload}
              className="md:hidden px-3 py-1.5 rounded-lg bg-[#1E293B] text-xs font-semibold text-[#00C49A] border border-[#00C49A]/30"
            >
              Simulate
            </button>
          </div>
        </header>

        {/* Active Screen Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-lg border-t border-[#1E293B] px-2 py-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl min-w-[56px] transition-colors ${
                isActive ? 'text-[#00C49A]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.mobileLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
