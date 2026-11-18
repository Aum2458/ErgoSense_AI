import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Compass, 
  Layers, 
  UserCheck, 
  CreditCard, 
  LogIn, 
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

export type PublicNavRoute = 
  | 'home' 
  | 'how_it_works' 
  | 'technology' 
  | 'features' 
  | 'who_for' 
  | 'privacy' 
  | 'pricing' 
  | 'login' 
  | 'register';

interface PublicNavbarProps {
  currentRoute: PublicNavRoute;
  onRouteChange: (route: PublicNavRoute) => void;
  onLaunchApp: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentRoute,
  onRouteChange,
  onLaunchApp,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: PublicNavRoute; label: string }[] = [
    { id: 'home', label: 'Overview' },
    { id: 'how_it_works', label: 'How It Works' },
    { id: 'technology', label: 'AI Technology' },
    { id: 'features', label: 'Features' },
    { id: 'who_for', label: 'Who It Is For' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'pricing', label: 'Pricing & Roadmap' },
  ];

  const handleNav = (route: PublicNavRoute) => {
    onRouteChange(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B1120]/85 backdrop-blur-md border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div 
          onClick={() => handleNav('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-[#0B1120]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">ErgoSense</span>
              <span className="text-xs font-semibold text-[#2DD4BF] uppercase tracking-wider font-mono">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Move better. Live smarter.</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors relative ${
                  isActive 
                    ? 'text-[#2DD4BF] font-semibold' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#2DD4BF] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={() => handleNav('login')}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={onLaunchApp}
            className="px-4 py-2 text-xs font-semibold bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 group active:scale-95"
          >
            <span>Launch Web Studio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#1E293B] bg-[#0F172A] px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg ${
                currentRoute === item.id ? 'bg-[#0D9488]/15 text-[#2DD4BF]' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => handleNav('login')}
              className="flex-1 py-2 text-xs font-medium text-center text-slate-300 bg-slate-800 rounded-lg"
            >
              Sign In
            </button>
            <button
              onClick={onLaunchApp}
              className="flex-1 py-2 text-xs font-semibold text-center text-white bg-[#0D9488] rounded-lg"
            >
              Launch App
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
