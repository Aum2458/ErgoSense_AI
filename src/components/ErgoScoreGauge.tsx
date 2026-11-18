import React from 'react';

interface ErgoScoreGaugeProps {
  score: number; // 0 to 100
  size?: number;
}

export const ErgoScoreGauge: React.FC<ErgoScoreGaugeProps> = ({ score, size = 260 }) => {
  // Clamp score
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Half-circle arc
  // Radius, stroke width, center
  const strokeWidth = 18;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;
  
  // Circumference of half circle = Math.PI * radius
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  // Status text and colors
  let statusText = 'Excellent';
  let strokeColor = '#10B981'; // Emerald
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let bgBadge = 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';

  if (clampedScore < 60) {
    statusText = 'Needs Action';
    strokeColor = '#F43F5E'; // Rose
    glowColor = 'rgba(244, 63, 94, 0.4)';
    bgBadge = 'bg-rose-950/80 text-rose-400 border-rose-500/40';
  } else if (clampedScore < 80) {
    statusText = 'Fair';
    strokeColor = '#F59E0B'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.4)';
    bgBadge = 'bg-amber-950/80 text-amber-400 border-amber-500/40';
  } else if (clampedScore < 90) {
    statusText = 'Good';
    strokeColor = '#2DD4BF'; // Teal
    glowColor = 'rgba(45, 212, 191, 0.4)';
    bgBadge = 'bg-teal-950/80 text-teal-400 border-teal-500/40';
  }

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        width={size}
        height={size * 0.64}
        viewBox={`0 0 ${size} ${size * 0.65}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="scoreTrackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="scoreValueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={strokeColor === '#F43F5E' ? '#F43F5E' : '#00BFA5'} />
            <stop offset="100%" stopColor={strokeColor} />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={strokeColor} floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Background track arc (180 degrees from -180 to 0) */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#scoreTrackGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Dynamic active score arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#scoreValueGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          filter="url(#gaugeGlow)"
          className="transition-all duration-700 ease-out"
        />

        {/* Start tick (0) and End tick (100) */}
        <text
          x={cx - radius - 2}
          y={cy + 18}
          fill="#64748B"
          fontSize="11"
          fontFamily="monospace"
          textAnchor="middle"
        >
          0
        </text>
        <text
          x={cx + radius + 2}
          y={cy + 18}
          fill="#64748B"
          fontSize="11"
          fontFamily="monospace"
          textAnchor="middle"
        >
          100
        </text>
      </svg>

      {/* Center Digital Readout */}
      <div className="absolute top-[38%] flex flex-col items-center justify-center text-center">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          ErgoScore
        </div>
        <div
          className="text-5xl font-black font-mono tracking-tight transition-colors duration-300"
          style={{ color: strokeColor }}
        >
          {clampedScore}
        </div>
        <div
          className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgBadge}`}
        >
          {clampedScore} {statusText}
        </div>
      </div>
    </div>
  );
};
