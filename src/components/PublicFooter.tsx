import React from 'react';
import { Activity, Shield, Heart, ExternalLink, CheckCircle } from 'lucide-react';
import { PublicNavRoute } from './PublicNavbar.tsx';

interface PublicFooterProps {
  onNavigate: (route: PublicNavRoute) => void;
  onLaunchApp: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate, onLaunchApp }) => {
  return (
    <footer className="border-t border-[#1E293B] bg-[#070D18] text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#0B1120]" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">ErgoSense AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Personal Movement Intelligence Platform combining browser-native computer vision, 
              sensor fusion, and OSHA-aligned baseline calibration. Move better. Live smarter.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#2DD4BF] font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Local Browser Memory • Zero Raw Video Uploaded</span>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-white transition-colors">
                  Three Intelligence Layers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('technology')} className="hover:text-white transition-colors">
                  5-Layer AI Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-white transition-colors">
                  10 Core Product Modules
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('who_for')} className="hover:text-white transition-colors">
                  9-Persona Explorer
                </button>
              </li>
              <li>
                <button onClick={onLaunchApp} className="text-[#2DD4BF] hover:underline font-medium">
                  Live Monitoring Studio
                </button>
              </li>
            </ul>
          </div>

          {/* Ecosystem Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Ecosystem</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">
                  B2C & B2B Segments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">
                  4-Phase Roadmap
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">
                  Privacy & Camera Security
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition-colors">
                  Evaluator Demo Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Verification Guardrails */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Guarantees</h4>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>OSHA non-rigid personal baseline methodology</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant webcam LED release on pause/stop</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Non-medical ergonomic wellness guardrail</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1E293B] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ErgoSense AI. All rights reserved. Designed for web-first personal wellness.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-300">Privacy Policy</button>
            <span>·</span>
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-300">Biometric Safeguards</button>
            <span>·</span>
            <button onClick={() => onNavigate('how_it_works')} className="hover:text-slate-300">OSHA Alignment</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
