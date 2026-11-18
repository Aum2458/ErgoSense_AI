import React from 'react';
import { Radio, Sun, UserCheck } from 'lucide-react';

interface SensorGridProps {
  deviceTilt?: string; // e.g. "40° P / 3° R"
  ambientLightLux?: number; // e.g. 57
  contextStatus?: string; // e.g. "Sitting at Desk"
}

export const SensorGrid: React.FC<SensorGridProps> = ({
  deviceTilt = '40° P / 3° R',
  ambientLightLux = 57,
  contextStatus = 'Sitting at Desk',
}) => {
  return (
    <div className="w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 shadow-xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1E293B]">
        {/* Sensor 1: Device Tilt */}
        <div className="py-2 sm:py-0 sm:px-6 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Radio className="w-4 h-4 text-[#2DD4BF]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Device Tilt</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-white tracking-tight">
            {deviceTilt}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Sagittal / Lateral</span>
        </div>

        {/* Sensor 2: Light Level */}
        <div className="py-3 sm:py-0 sm:px-6 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Sun className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Light Level</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-white tracking-tight">
            {ambientLightLux} lx
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Workspace Ambient</span>
        </div>

        {/* Sensor 3: Context */}
        <div className="py-2 sm:py-0 sm:px-6 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <UserCheck className="w-4 h-4 text-[#10B981]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Context</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-white tracking-tight">
            {contextStatus}
          </div>
          <span className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block animate-pulse" />
            Biometric Activity Validated
          </span>
        </div>
      </div>
    </div>
  );
};
