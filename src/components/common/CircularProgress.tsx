'use client';

import React from 'react';

export interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number; // Size in px (default 120)
  strokeWidth?: number; // Stroke width (default 10)
  gradientId?: string;
  gradientColors?: [string, string];
  trackColor?: string;
  valueColor?: string;
  centerText?: string | number | React.ReactNode;
  subText?: string;
  showPercentSymbol?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  gradientId,
  gradientColors,
  trackColor = '#E2E8F0',
  valueColor = 'text-slate-900',
  centerText,
  subText,
  showPercentSymbol = true,
  className = '',
}) => {
  const clampedValue = Math.min(Math.max(Number(value) || 0, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  // Auto pick gradient colors if not explicitly provided based on performance
  const defaultColors: [string, string] =
    clampedValue >= 85
      ? ['#10B981', '#14B8A6'] // Emerald to Teal
      : clampedValue >= 75
      ? ['#3B82F6', '#06B6D4'] // Blue to Cyan
      : clampedValue >= 65
      ? ['#F59E0B', '#F97316'] // Amber to Orange
      : ['#EF4444', '#DC2626']; // Rose to Red

  const activeGradient = gradientColors || defaultColors;
  const uniqueId = gradientId || `circ_grad_${Math.floor(Math.random() * 100000)}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 origin-center"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={activeGradient[0]} />
            <stop offset="100%" stopColor={activeGradient[1]} />
          </linearGradient>
        </defs>

        {/* Background Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          className="transition-colors duration-300"
        />

        {/* Foreground Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${uniqueId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Centered Metric Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
        {centerText !== undefined ? (
          typeof centerText === 'string' || typeof centerText === 'number' ? (
            <span className={`font-extrabold font-heading tracking-tight leading-none ${valueColor}`}>
              {centerText}
              {showPercentSymbol && typeof centerText === 'number' && '%'}
            </span>
          ) : (
            centerText
          )
        ) : (
          <span className={`text-xl sm:text-2xl font-black font-heading tracking-tight leading-none ${valueColor}`}>
            {clampedValue}
            {showPercentSymbol && <span className="text-xs sm:text-sm font-bold ml-0.5">%</span>}
          </span>
        )}

        {subText && (
          <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider leading-tight">
            {subText}
          </span>
        )}
      </div>
    </div>
  );
};
