/**
 * TraitCard Component
 * Fixed: "trait" prop was accepted but unused — removed.
 * Fixed: value is 0–100 integer (derived from style_vector * 100 in PersonaSummary).
 * Improved: colour-coded bar, hover state, cleaner Tailwind layout.
 */

import React from 'react';

export const TraitCard = ({ name, value = 0, max = 100 }) => {
  const pct     = Math.min(Math.max((value / max) * 100, 0), 100);
  // Traits aren't strictly "risk" — we use a neutral blue-to-emerald gradient
  // but keep the colour helper so high-value traits stand out.
  const barColor = pct >= 70 ? '#34d399' : pct >= 40 ? '#60a5fa' : '#94a3b8';

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-gray-300 group-hover:text-white transition-colors">
          {name}
        </span>
        <span
          className="text-sm font-bold font-mono"
          style={{ color: barColor }}
        >
          {value}
          <span className="text-gray-600 text-xs font-normal ml-0.5">%</span>
        </span>
      </div>

      {/* Track */}
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};

export default TraitCard;