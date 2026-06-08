/**
 * StatsCards Component
 * Fixed: stat shape aligned — value can be a string already formatted by Dashboard.
 * Fixed: change field uses explicit > 0 / < 0 / === 0 check (was truthy, skipped 0).
 * Improved: Tailwind dark theme, trend indicator, sub-label support.
 */

import React from 'react';

/**
 * stat shape expected:
 * {
 *   id:     number | string
 *   label:  string          — e.g. "Overall Risk Score"
 *   value:  string | number — already formatted by parent (e.g. "85.3%")
 *   sub?:   string          — secondary line (e.g. "component score")
 *   change?: number         — signed float; positive = worse for risk metrics
 *   icon?:  string          — optional emoji or text symbol
 * }
 */
export const StatsCards = ({ stats = [] }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const hasChange = stat.change !== undefined && stat.change !== null;
        const isUp = stat.change > 0;
        const isFlat = stat.change === 0;

        return (
          <div
            key={stat.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
          >
            {/* Icon + label row */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono uppercase tracking-widest text-gray-500">
                {stat.label}
              </p>
              {stat.icon && (
                <span className="text-base opacity-60 group-hover:opacity-100 transition-opacity">
                  {stat.icon}
                </span>
              )}
            </div>

            {/* Value */}
            <p className="text-2xl font-bold text-emerald-400 font-mono leading-none">
              {stat.value ?? '—'}
            </p>

            {/* Sub-label */}
            {stat.sub && (
              <p className="text-xs text-gray-600 font-mono mt-1">{stat.sub}</p>
            )}

            {/* Change indicator */}
            {hasChange && !isFlat && (
              <div
                className={`flex items-center gap-1 mt-3 text-xs font-mono ${
                  isUp ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                <span>{isUp ? '↑' : '↓'}</span>
                <span>{Math.abs(stat.change).toFixed(1)}%</span>
                <span className="text-gray-600 ml-1">vs last</span>
              </div>
            )}
            {hasChange && isFlat && (
              <div className="flex items-center gap-1 mt-3 text-xs font-mono text-gray-600">
                <span>→</span>
                <span>No change</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;