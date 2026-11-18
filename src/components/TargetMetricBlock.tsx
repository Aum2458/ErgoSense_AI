import React from 'react';

interface TargetMetricBlockProps {
  label: string;
  value: number;
  unit?: string;
  targetText: string;
  isAmber: boolean; // true if exceeding threshold, false if optimal
}

export const TargetMetricBlock: React.FC<TargetMetricBlockProps> = ({
  label,
  value,
  unit = '°',
  targetText,
  isAmber,
}) => {
  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-lg flex flex-col items-center text-center justify-between transition-all hover:border-[#1E293B]/80">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </div>

      <div
        className={`text-4xl sm:text-5xl font-black font-mono tracking-tight my-1 ${
          isAmber ? 'text-[#F59E0B]' : 'text-[#10B981]'
        }`}
      >
        {Math.round(value)}{unit}
      </div>

      <div className="text-xs text-slate-400 font-mono mt-2 bg-[#0B1120] px-3 py-1 rounded-full border border-[#1E293B]">
        {targetText}
      </div>
    </div>
  );
};
