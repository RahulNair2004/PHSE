/**
 * RiskScoreCard Component
 * Fixed: score prop is a 0–100 float from RiskScoreResponse component fields
 *   (weighted_total, osint_component, etc.) — not a raw integer.
 * Fixed: Badge variant derived from level string, not hardcoded "Critical" check.
 * Improved: animated ring, formatted score display, Tailwind dark theme.
 */

import React from 'react';
import { getRiskColor, getRiskLevel, formatRiskScore, getRiskTailwindClasses } from '../../utils/helpers';

export const RiskScoreCard = ({ score, label, description }) => {
  const color       = getRiskColor(score);
  const level       = getRiskLevel(score);
  const twClasses   = getRiskTailwindClasses(level);
  const displayVal  = formatRiskScore(score);

  // SVG ring gauge
  const radius  = 28;
  const circ    = 2 * Math.PI * radius;
  const pct     = Math.min(Math.max(score ?? 0, 0), 100);
  const dash    = (pct / 100) * circ;

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-colors">
      <div className="flex items-center gap-4">
        {/* Ring gauge */}
        <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#1f2937" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
          <text
            x="36" y="40"
            textAnchor="middle"
            fill="white"
            fontSize="13"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {displayVal}
          </text>
        </svg>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
          )}
          <span
            className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-mono uppercase tracking-widest ${twClasses.bg} ${twClasses.text} border ${twClasses.border}`}
          >
            {level}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default RiskScoreCard;