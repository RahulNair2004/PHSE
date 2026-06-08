/**
 * AttackCard Component
 * Fixed: SimulationResponse fields:
 *   { id, user_id, generated_text, similarity_score, psychological_score,
 *     persuasion_index, contextual_risk_weight, created_at }
 *   — no "name", "success", "description", "type", "date",
 *     "success_rate", or "impact" fields.
 * Fixed: all scores are 0–1 floats, displayed as percentages.
 * Renamed prop: attack → simulation (matches SimulationResponse).
 */

import React, { useState } from 'react';
import { formatDate, truncateText, computeSimulationDanger } from '../../utils/helpers';

const ScoreRow = ({ label, value }) => {
  const pct = value != null ? Math.min(Math.max(value * 100, 0), 100) : null;
  const color = pct == null ? '#4b5563'
    : pct >= 70 ? '#ef4444'
    : pct >= 40 ? '#f97316'
    : '#22c55e';

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500 font-mono">{label}</span>
        <span className="text-xs font-bold font-mono" style={{ color }}>
          {pct != null ? `${pct.toFixed(1)}%` : '—'}
        </span>
      </div>
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct ?? 0}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export const AttackCard = ({ simulation }) => {
  const [showText, setShowText] = useState(false);

  if (!simulation) return null;

  const danger     = computeSimulationDanger(simulation);
  const dangerPct  = (danger * 100).toFixed(1);
  const dangerColor = danger >= 0.7 ? '#ef4444' : danger >= 0.4 ? '#f97316' : '#22c55e';

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 font-mono">#{simulation.id}</span>
          <span
            className="text-xs font-bold font-mono px-2.5 py-1 rounded-full"
            style={{
              color: dangerColor,
              backgroundColor: dangerColor + '1a',
              border: `1px solid ${dangerColor}33`,
            }}
          >
            {dangerPct}% danger
          </span>
        </div>
        <span className="text-xs text-gray-600 font-mono">
          {formatDate(simulation.created_at)}
        </span>
      </div>

      {/* Score breakdown */}
      <div className="px-5 py-4 space-y-3">
        <ScoreRow label="Similarity Score"       value={simulation.similarity_score} />
        <ScoreRow label="Psychological Score"    value={simulation.psychological_score} />
        <ScoreRow label="Persuasion Index"       value={simulation.persuasion_index} />
        <ScoreRow label="Contextual Risk Weight" value={simulation.contextual_risk_weight} />
      </div>

      {/* Generated text preview */}
      {simulation.generated_text && (
        <div className="px-5 pb-4">
          <button
            onClick={() => setShowText(!showText)}
            className="text-xs font-mono text-emerald-500 hover:text-emerald-400 transition-colors mb-2"
          >
            {showText ? '▲ Hide attack text' : '▼ Show attack text'}
          </button>
          {showText ? (
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                {simulation.generated_text}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-600 font-mono italic">
              {truncateText(simulation.generated_text, 100)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AttackCard;