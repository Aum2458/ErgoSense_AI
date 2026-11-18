import React, { useState } from 'react';
import { 
  Activity, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Building
} from 'lucide-react';
import { PersonaId, UserProfile, WorkstationType } from '../../types/ergosense.ts';

interface PublicAuthScreenProps {
  mode: 'login' | 'register';
  onAuthenticate: (user: UserProfile) => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export const PublicAuthScreen: React.FC<PublicAuthScreenProps> = ({
  mode,
  onAuthenticate,
  onSwitchMode,
}) => {
  const [email, setEmail] = useState('alex.rivera@ergosense.internal');
  const [displayName, setDisplayName] = useState('Alex Rivera');
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>('developers');
  const [workstation, setWorkstation] = useState<WorkstationType>('laptop');

  const handle1ClickEvaluatorLogin = () => {
    onAuthenticate({
      userId: 'usr_ergo_01',
      email: 'alex.rivera@ergosense.internal',
      displayName: 'Alex Rivera',
      role: 'user',
      department: 'Software Engineering',
      persona: 'developers',
      workstation: 'laptop',
      activeGoals: ['Cervical spine < 15°', 'Screen distance > 50cm', '20-20-20 rule adherence'],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthenticate({
      userId: `usr_${Date.now().toString(36)}`,
      email: email || 'user@ergosense.internal',
      displayName: displayName || 'ErgoSense Evaluator',
      role: 'user',
      department: 'Product & Design',
      persona: selectedPersona,
      workstation: workstation,
      activeGoals: ['Maintain personal baseline', 'Micro-break compliance'],
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Brand Icon */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] flex items-center justify-center shadow-lg shadow-teal-500/20 mx-auto">
          <Activity className="w-6 h-6 text-[#0B1120]" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {mode === 'login' ? 'Sign In to ErgoSense AI' : 'Create Personal Account'}
        </h1>
        <p className="text-xs text-slate-400">
          Personal movement intelligence companion platform
        </p>
      </div>

      {/* 1-Click Evaluator Demo Button */}
      <div className="bg-[#0F172A] border border-[#2DD4BF]/40 rounded-2xl p-4 shadow-xl text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#2DD4BF]">
          <Sparkles className="w-4 h-4" />
          <span>Faculty & Evaluator Fast Pass</span>
        </div>
        <p className="text-[11px] text-slate-300">
          Skip registration and instantly access the authenticated workspace with pre-seeded multi-day telemetry and 25-volunteer benchmark trials.
        </p>
        <button
          onClick={handle1ClickEvaluatorLogin}
          className="w-full py-2.5 px-4 bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span>1-Click Evaluator Demo Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="flex-shrink mx-4 text-slate-500 text-xs font-mono uppercase">or manual entry</span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      {/* Manual Form */}
      <form onSubmit={handleSubmit} className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
        {mode === 'register' && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300 block">Work or Personal Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.rivera@ergosense.internal"
              className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        {mode === 'register' && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Primary Persona</label>
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value as PersonaId)}
                className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="developers">Software Developer</option>
                <option value="students">Student / Academic</option>
                <option value="office_employees">Office Employee</option>
                <option value="gamers">Gamer / Esports</option>
                <option value="drivers">Driver / Commuter</option>
                <option value="factory_workers">Factory / Industrial Worker</option>
                <option value="elderly_people">Elderly Individual</option>
                <option value="freelancers">Freelancer / Remote</option>
                <option value="fitness_enthusiasts">Fitness & Mobility</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Workstation Type</label>
              <select
                value={workstation}
                onChange={(e) => setWorkstation(e.target.value as WorkstationType)}
                className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="laptop">Laptop (Desk Level)</option>
                <option value="external_monitor">External Eye-Level Monitor</option>
                <option value="standing_desk">Standing Desk</option>
                <option value="mobile_travel">Mobile & Transit</option>
                <option value="factory_floor">Factory Workstation</option>
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
        </button>

        <div className="text-center text-xs text-slate-400 pt-2">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('register')}
                className="text-[#2DD4BF] hover:underline font-medium"
              >
                Create one
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="text-[#2DD4BF] hover:underline font-medium"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
