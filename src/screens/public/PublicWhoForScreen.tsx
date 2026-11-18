import React, { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Code, 
  Gamepad2, 
  Car, 
  Factory, 
  Heart, 
  Laptop, 
  Dumbbell, 
  ArrowRight,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { PublicNavRoute } from '../../components/PublicNavbar.tsx';
import { PersonaId } from '../../types/ergosense.ts';

interface PublicWhoForScreenProps {
  onNavigate: (route: PublicNavRoute) => void;
  onLaunchAppWithPersona: (persona: PersonaId) => void;
}

export const PublicWhoForScreen: React.FC<PublicWhoForScreenProps> = ({
  onNavigate,
  onLaunchAppWithPersona,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<number>(2); // Default Developers

  const personas = [
    {
      id: 'students' as PersonaId,
      name: 'Students',
      icon: GraduationCap,
      headline: 'Study Posture, Reading Alignment & Focus Habits',
      context: 'Exam cram sessions, textbook reading, and library laptop work.',
      painPoints: 'Prolonged downward cervical neck bending over textbooks and laptops.',
      solution: 'Discreet non-audible visual prompts, screen-elevation suggestions, and 20-20-20 eye strain breaks.',
      metricTarget: 'Target Cervical Angle: < 18° · Break Every: 45 min',
    },
    {
      id: 'office_employees' as PersonaId,
      name: 'Office Employees',
      icon: Briefcase,
      headline: 'Corporate Ergonomics & Screen Geometry',
      context: 'Daily 8-hour desktop workstations, conference calls, and spreadsheet review.',
      painPoints: 'Slouching into low-backed office chairs, static lumbar fatigue, and improper monitor height.',
      solution: 'Automatic desk setup analyzer, static sitting alerts, and anonymized team wellness reports.',
      metricTarget: 'Target Viewing Distance: 50–70cm · Static Sit: < 40 min',
    },
    {
      id: 'developers' as PersonaId,
      name: 'Developers & Engineers',
      icon: Code,
      headline: 'Deep Flow State Without Neck Strain',
      context: 'Intense 3-hour uninterrupted coding blocks with multi-monitor configurations.',
      painPoints: 'Severe forward head lean ("turtle neck"), shoulder shrugging, and ignoring bodily fatigue.',
      solution: 'Cross-browser Picture-in-Picture mini widget that floats over VS Code or terminal without stealing keyboard focus.',
      metricTarget: 'Hysteresis Window: 30s · Flow Cooldown: 180s',
    },
    {
      id: 'gamers' as PersonaId,
      name: 'Gamers & Esports',
      icon: Gamepad2,
      headline: 'Competitive Endurance & Between-Match Resets',
      context: 'High-focus gaming sessions lasting several hours.',
      painPoints: 'Aggressive forward hunch towards the monitor, tense shoulders, wrist and forearm fatigue.',
      solution: 'Non-disruptive between-match mobility alerts and forearm/wrist extensor recovery resets.',
      metricTarget: 'Shoulder Asymmetry: < 0.05 · Post-Match Stretch: 60s',
    },
    {
      id: 'drivers' as PersonaId,
      name: 'Drivers & Commuters',
      icon: Car,
      headline: 'Pre-Drive Seating & Audio-Only Break Safety',
      context: 'Highway driving, rideshare transit, and long commercial hauls.',
      painPoints: 'Restricted cabin movement, lower back lumbar compression, and highway hypnosis.',
      solution: 'Interactive 5-point pre-drive seating checklist and strict non-visual audio-only break nudges.',
      metricTarget: 'Visual UI: Locked · Audio Chimes: Enabled Every 60m',
    },
    {
      id: 'factory_workers' as PersonaId,
      name: 'Industrial & Assembly Workers',
      icon: Factory,
      headline: 'Repetitive Upper-Limb Cadence & Strain Awareness',
      context: 'Assembly lines, packing stations, and warehouse order processing.',
      painPoints: 'Repetitive shoulder/wrist elevation cycles causing repetitive strain injury (RSI).',
      solution: 'Arm cadence frequency tracking (cycles/min) to highlight high-frequency upper-body strain risk.',
      metricTarget: 'Max Elevation Cycles: < 24/min · Rest Intervals: 30m',
    },
    {
      id: 'elderly_people' as PersonaId,
      name: 'Elderly Individuals',
      icon: Heart,
      headline: 'Gentle Mobility & Mediolateral Balance Observations',
      context: 'Daily home mobility, reading, and gentle chair exercises.',
      painPoints: 'Decreased postural stability, increased mediolateral sway, and stiffness from immobility.',
      solution: 'Chair-assisted gentle mobility coaching, balance sway tracking, and voice support in Hindi & Gujarati.',
      metricTarget: 'Sway Variance: < 12mm · Gentle Voice Prompts: Active',
    },
    {
      id: 'freelancers' as PersonaId,
      name: 'Remote Workers & Freelancers',
      icon: Laptop,
      headline: 'Home Workstation Optimization & Daily Boundaries',
      context: 'Kitchen counters, couch laptops, and improvisational work spaces.',
      painPoints: 'Unregulated work hours, un-ergonomic chairs, and blur between work and rest.',
      solution: 'Desk geometry analyzer, posture baseline calibration, and daily structured movement pacing.',
      metricTarget: 'Baseline Alignment: > 85% · Micro-Breaks: 5/day',
    },
    {
      id: 'fitness_enthusiasts' as PersonaId,
      name: 'Fitness & Mobility Enthusiasts',
      icon: Dumbbell,
      headline: 'Real-Time Exercise Form & Bilateral Symmetry',
      context: 'Home workouts, bodyweight calisthenics, and active recovery days.',
      painPoints: 'Knee valgus collapse in squats, asymmetrical joint loading, and inconsistent tempo.',
      solution: '4-state FSM counting reps, tempo timing, and bilateral symmetry scores on camera.',
      metricTarget: 'Symmetry Score: > 90% · Tempo: 3.0s eccentric',
    },
  ];

  const current = personas[selectedPersona];
  const CurrentIcon = current.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
          Tailored Workflows
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Who ErgoSense AI Is Built For
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          From software engineers in deep focus to assembly line teams, students, drivers, and seniors—explore how 
          ErgoSense adapts to your specific environment.
        </p>
      </div>

      {/* 9-Persona Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        {personas.map((p, idx) => {
          const isSelected = selectedPersona === idx;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPersona(idx)}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                isSelected
                  ? 'bg-[#0D9488]/20 border-[#2DD4BF] text-white shadow-md ring-1 ring-[#2DD4BF]'
                  : 'bg-[#0B1120] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#0D9488] text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold leading-tight">{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Persona Detail Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#2DD4BF]">
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-[#2DD4BF] uppercase tracking-wider block">Selected Persona</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{current.headline}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-xl space-y-1.5">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">Context & Environment</span>
              <p className="text-slate-300 leading-relaxed">{current.context}</p>
            </div>
            <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-xl space-y-1.5">
              <span className="font-semibold text-rose-400 block uppercase tracking-wider text-[10px]">Specific Strain Risk</span>
              <p className="text-slate-300 leading-relaxed">{current.painPoints}</p>
            </div>
          </div>

          <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-xl space-y-1.5 text-xs">
            <span className="font-semibold text-[#2DD4BF] block uppercase tracking-wider text-[10px]">ErgoSense AI Solution</span>
            <p className="text-slate-300 leading-relaxed">{current.solution}</p>
          </div>
        </div>

        {/* Action card */}
        <div className="lg:col-span-4 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
          <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">Ergonomic Configuration</span>
          <div className="font-mono text-xs text-[#38BDF8] bg-[#070D18] p-3 rounded-lg border border-slate-800">
            {current.metricTarget}
          </div>
          <button
            onClick={() => onLaunchAppWithPersona(current.id)}
            className="w-full py-3 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Launch As {current.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
