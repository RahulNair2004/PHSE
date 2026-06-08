/**
 * HeroRiskPanel Component
 * Fixed: riskScore fields aligned to RiskScoreResponse schema:
 *   weighted_total, osint_component, persona_component,
 *   stylometry_component, simulation_component, risk_level, risk_percentile
 *   — no "overall_score" field.
 * Fixed: accepts riskScore + loading as props from Dashboard (avoids double fetch).
 *   If not passed, falls back to fetching internally.
 */

import React, { useEffect } from 'react';
import { getRiskColor, getRiskLevel, formatRiskScore } from '../../utils/helpers';
import { RISK_COMPONENTS } from '../../utils/constants';
import { useRisk } from '../../hooks';

const RadialGauge = ({ score, color }) => {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score ?? 0, 0), 100);
  const dash = (pct / 100) * circ;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
      {/* Track */}
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#1f2937" strokeWidth="10" />
      {/* Fill */}
      <circle
        cx="70" cy="70" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Score text */}
      <text x="70" y="65" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold" fontFamily="monospace">
        {pct.toFixed(0)}
      </text>
      <text x="70" y="84" textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="monospace">
        / 100
      </text>
    </svg>
  );
};

export const HeroRiskPanel = ({ userId, riskScore: propScore, loading: propLoading }) => {
  const { riskScore: hookScore, loading: hookLoading, getCurrentRisk } = useRisk();

  // Use prop values if provided (parent already fetched), otherwise fetch internally
  const riskScore = propScore ?? hookScore;
  const loading   = propLoading ?? hookLoading;

  useEffect(() => {
    if (!propScore && userId) getCurrentRisk(userId);
  }, [userId, propScore, getCurrentRisk]);

  const score = riskScore?.weighted_total ?? 0;
  const color = getRiskColor(score);
  // Prefer backend risk_level string; derive locally as fallback
  const levelLabel = riskScore?.risk_level
    ? riskScore.risk_level.charAt(0).toUpperCase() + riskScore.risk_level.slice(1).toLowerCase()
    : getRiskLevel(score);

  const components = RISK_COMPONENTS.filter((c) => c.key !== 'weighted_total');

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      {loading ? (
        <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm py-8 justify-center">
          <span className="animate-spin w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full inline-block" />
          Fetching risk data…
        </div>
      ) : !riskScore ? (
        <div className="text-center py-10 text-gray-600 font-mono text-sm">
          No risk score yet — run a scan and calculate risk.
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Gauge + headline */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <RadialGauge score={score} color={color} />
            <span
              className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest font-bold"
              style={{
                color,
                backgroundColor: color + '1a',
                border: `1px solid ${color}40`,
              }}
            >
              {levelLabel} Risk
            </span>
            {riskScore.risk_percentile != null && (
              <span className="text-xs text-gray-600 font-mono">
                top {(100 - riskScore.risk_percentile).toFixed(0)}% most exposed
              </span>
            )}
          </div>

          {/* Component breakdown */}
          <div className="flex-1 w-full space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500">
              Component Breakdown
            </p>
            {components.map(({ key, label }) => {
              const val = riskScore[key];
              const pct = val != null ? Math.min(Math.max(val, 0), 100) : null;
              const barColor = getRiskColor(pct ?? 0);
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-mono text-gray-400">{label}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: barColor }}>
                      {formatRiskScore(val)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct ?? 0}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroRiskPanel;