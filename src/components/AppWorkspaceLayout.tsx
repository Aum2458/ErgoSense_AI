import React, { useState } from 'react';
import {
  LayoutDashboard,
  Camera,
  Activity,
  Sliders,
  Bell,
  Sparkles,
  HeartHandshake,
  FileSpreadsheet,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  VideoOff,
  Maximize2,
  Globe,
  Clock,
  Play,
  Pause,
  X,
  Users,
  Building2,
  UserCheck,
  Home,
  LogOut,
  Dumbbell
} from 'lucide-react';
import { UserProfile, SupportedLanguage, ActivityMode } from '../types/ergosense.ts';
import { VoiceAssistant } from '../lib/speech.ts';

export type WorkspaceRoute =
  | 'onboarding'
  | 'dashboard'
  | 'live'
  | 'activity'
  | 'reminders'
  | 'coach'
  | 'journal'
  | 'reports'
  | 'devices'
  | 'settings';

export type WorkspaceProfileType = 'individual' | 'family' | 'organization';

interface AppWorkspaceLayoutProps {
  currentRoute: WorkspaceRoute;
  onRouteChange: (route: WorkspaceRoute) => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  cameraActive: boolean;
  onLaunchPiP: () => void;
  onExitToPublic: () => void;
  children: React.ReactNode;
}

export const AppWorkspaceLayout: React.FC<AppWorkspaceLayoutProps> = ({
  currentRoute,
  onRouteChange,
  currentUser,
  onUserChange,
  language,
  onLanguageChange,
  cameraActive,
  onLaunchPiP,
  onExitToPublic,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeProfileType, setActiveProfileType] = useState<WorkspaceProfileType>('individual');
  const [isMicroBreakOpen, setIsMicroBreakOpen] = useState(false);
  const [microBreakSecondsLeft, setMicroBreakSecondsLeft] = useState(60);
  const [microBreakActive, setMicroBreakActive] = useState(false);

  // Micro break countdown interval
  React.useEffect(() => {
    let timer: any = null;
    if (isMicroBreakOpen && microBreakActive && microBreakSecondsLeft > 0) {
      timer = setInterval(() => {
        setMicroBreakSecondsLeft((prev) => {
          if (prev <= 1) {
            VoiceAssistant.playChime('success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMicroBreakOpen, microBreakActive, microBreakSecondsLeft]);

  const navModules = [
    { id: 'dashboard' as WorkspaceRoute, label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'onboarding' as WorkspaceRoute, label: '60s Baseline Calibration', icon: Sliders },
    { id: 'live' as WorkspaceRoute, label: 'Live AI Monitoring Studio', icon: Camera, badge: cameraActive ? 'LIVE' : undefined },
    { id: 'activity' as WorkspaceRoute, label: 'Activity & Movement Intel', icon: Activity },
    { id: 'reminders' as WorkspaceRoute, label: 'Smart Reminders & Driving', icon: Bell },
    { id: 'coach' as WorkspaceRoute, label: 'Personal AI Coach', icon: Sparkles },
    { id: 'journal' as WorkspaceRoute, label: 'Pain & Comfort Journal', icon: HeartHandshake },
    { id: 'reports' as WorkspaceRoute, label: 'Reports & B.Tech Validation', icon: FileSpreadsheet },
    { id: 'devices' as WorkspaceRoute, label: 'Connected Devices & IMU', icon: Cpu },
    { id: 'settings' as WorkspaceRoute, label: 'Personal Settings & Privacy', icon: Settings },
  ];

  const handleStartMicroBreak = () => {
    setMicroBreakSecondsLeft(60);
    setMicroBreakActive(true);
    setIsMicroBreakOpen(true);
    VoiceAssistant.playChime('micro_break');
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col font-sans selection:bg-[#0D9488]/30">
      {/* Top Universal App Header Bar */}
      <header className="h-16 bg-[#0B1120] border-b border-[#1E293B] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={onExitToPublic}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] flex items-center justify-center shadow-md">
              <Activity className="w-4 h-4 text-[#0B1120]" />
            </div>
            <span className="font-bold text-sm text-white hidden sm:block tracking-tight">ErgoSense AI</span>
          </div>

          {/* Workspace Profile Switcher */}
          <div className="flex items-center bg-[#0F172A] border border-[#1E293B] rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveProfileType('individual')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeProfileType === 'individual' ? 'bg-[#0D9488] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setActiveProfileType('family')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeProfileType === 'family' ? 'bg-[#0D9488] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Family
            </button>
            <button
              onClick={() => setActiveProfileType('organization')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeProfileType === 'organization' ? 'bg-[#0D9488] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Org / University
            </button>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Live Camera Hardware Privacy Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0F172A] border border-[#1E293B] text-[11px] font-mono">
            {cameraActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-semibold hidden md:inline">CAM ON-DEVICE (0 Upload)</span>
              </>
            ) : (
              <>
                <VideoOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 hidden md:inline">CAM STOPPED (LED OFF)</span>
              </>
            )}
          </div>

          {/* Launch PiP Mini-Widget */}
          <button
            onClick={onLaunchPiP}
            title="Launch Floating Picture-in-Picture Mini-HUD"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Language Switcher (EN | हिं | ગુજ) */}
          <div className="flex items-center bg-[#0F172A] border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-lg ${language === 'en' ? 'bg-[#0D9488] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-1 rounded-lg ${language === 'hi' ? 'bg-[#0D9488] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              हिं
            </button>
            <button
              onClick={() => onLanguageChange('gu')}
              className={`px-2 py-1 rounded-lg ${language === 'gu' ? 'bg-[#0D9488] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              ગુજ
            </button>
          </div>

          {/* Quick Stretch Button */}
          <button
            onClick={handleStartMicroBreak}
            className="px-3 py-1.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Stretch</span>
          </button>

          {/* Exit to Public Site */}
          <button
            onClick={onExitToPublic}
            title="Return to Public Website"
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <aside
          className={`bg-[#0B1120] border-r border-[#1E293B] transition-all duration-300 flex flex-col justify-between ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            {navModules.map((item) => {
              const isActive = currentRoute === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onRouteChange(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#0D9488] text-white shadow-md shadow-teal-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-400 text-[#0B1120]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current User Card */}
          <div className="p-3 border-t border-[#1E293B] bg-[#070D18]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-[#0B1120]">
                {currentUser.displayName.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <div className="truncate flex-1">
                  <p className="text-xs font-semibold text-white truncate">{currentUser.displayName}</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {activeProfileType === 'organization' ? 'Univ Engineering Cohort' : currentUser.persona || 'Developer'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Screen Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Guided 60-Second Micro-Break Modal */}
      {isMicroBreakOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0F172A] border-2 border-[#2DD4BF] rounded-3xl p-6 shadow-2xl space-y-6 text-center animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Guided 60s Thoracic Reset</span>
              </div>
              <button
                onClick={() => setIsMicroBreakOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Countdown Circle */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 border-t-[#2DD4BF] animate-spin-slow" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white font-mono">{microBreakSecondsLeft}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">seconds</span>
              </div>
            </div>

            {/* Micro-break Exercise Steps */}
            <div className="space-y-2 text-xs text-slate-300 bg-[#0B1120] p-4 rounded-xl border border-slate-800 text-left">
              <span className="font-bold text-white block">Step {microBreakSecondsLeft > 30 ? '1 of 2: Chin Retraction' : '2 of 2: Seated Thoracic Opener'}</span>
              <p className="text-slate-400 leading-relaxed">
                {microBreakSecondsLeft > 30
                  ? 'Gently draw chin back horizontally like making a soft double chin. Hold 3 seconds, relax, repeat 5 times.'
                  : 'Place hands behind neck, gently arch upper back over chair backrest, take two deep diaphragmatic breaths.'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  VoiceAssistant.playChime('success');
                  setIsMicroBreakOpen(false);
                }}
                className="flex-1 py-2.5 bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-xs rounded-xl shadow-md"
              >
                Complete Break (+15 Score)
              </button>
              <button
                onClick={() => setIsMicroBreakOpen(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Snooze 5m
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
