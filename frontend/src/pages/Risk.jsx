/**
 * Risk Page
 * Fixed: riskScore fields aligned to RiskScoreResponse schema:
 *   weighted_total, osint_component, persona_component,
 *   stylometry_component, simulation_component, risk_level, risk_percentile
 * Fixed: riskHistory entries are RiskHistoryResponse: { total_risk, recorded_at }
 *   (no per-component breakdown in history rows)
 * Fixed: getRiskColor receives weighted_total (0–100 float), not overall_score
 */

import React, { useEffect } from 'react';
import { useRisk } from '../hooks';
import { formatDate } from '../utils/helpers';

const getRiskBadgeClass = (level) => {
  switch ((level || '').toLowerCase()) {
    case 'critical': return 'bg-red-900/60 text-red-300 border border-red-700';
    case 'high':     return 'bg-orange-900/60 text-orange-300 border border-orange-700';
    case 'medium':   return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700';
    case 'low':      return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700';
    default:         return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
};

// Map a 0–100 float to a Tailwind bg color string for inline use
const scoreToColor = (score) => {
  if (score == null) return '#374151';
  if (score >= 75) return '#7f1d1d';
  if (score >= 50) return '#78350f';
  if (score >= 25) return '#713f12';
  return '#064e3b';
};

export const Risk = ({ userId }) => {
  const { riskScore, riskHistory, loading, getCurrentRisk, getRiskHistory } = useRisk();

  useEffect(() => {
    if (userId) {
      getCurrentRisk(userId);
      getRiskHistory(userId);
    }
  }, [userId, getCurrentRisk, getRiskHistory]);

  const components = riskScore
    ? [
        { label: 'Overall Risk',    value: riskScore.weighted_total,        key: 'weighted_total' },
        { label: 'OSINT',           value: riskScore.osint_component,       key: 'osint_component' },
        { label: 'Persona',         value: riskScore.persona_component,     key: 'persona_component' },
        { label: 'Stylometry',      value: riskScore.stylometry_component,  key: 'stylometry_component' },
        { label: 'Simulation',      value: riskScore.simulation_component,  key: 'simulation_component' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6">
        <p className="text-xs tracking-[0.3em] uppercase text-emerald-400 font-mono mb-2">
          PHSE // Risk Intelligence
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Risk Score</h1>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
          Calculating risk...
        </div>
      )}

      {/* Score cards */}
      {riskScore && (
        <>
          {/* Risk level badge */}
          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest ${getRiskBadgeClass(riskScore.risk_level)}`}
            >
              {riskScore.risk_level ?? 'Unknown'} Risk
            </span>
            {riskScore.risk_percentile != null && (
              <span className="text-xs text-gray-500 font-mono">
                {riskScore.risk_percentile.toFixed(1)}th percentile
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {components.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-5 text-center border border-gray-800"
                style={{ backgroundColor: scoreToColor(value) }}
              >
                <p className="text-xs uppercase tracking-widest text-gray-400 font-mono mb-2">
                  {label}
                </p>
                <p className="text-3xl font-bold text-white font-mono">
                  {value != null ? value.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">/ 100</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Risk History */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400">
            Risk History
          </h2>
        </div>

        {!riskHistory || riskHistory.length === 0 ? (
          <div className="text-center py-16 text-gray-600 font-mono text-sm">
            No risk history available
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-widest text-gray-500">
                  Recorded At
                </th>
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-widest text-gray-500">
                  Total Risk
                </th>
              </tr>
            </thead>
            <tbody>
              {riskHistory.map((record, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  {/* RiskHistoryResponse: { total_risk, recorded_at } */}
                  <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                    {formatDate(record.recorded_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold font-mono text-emerald-400">
                      {record.total_risk != null ? record.total_risk.toFixed(2) : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Risk;