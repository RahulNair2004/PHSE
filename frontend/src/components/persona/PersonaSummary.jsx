/**
 * PersonaSummary Component
 * Fixed: PersonaProfileResponse fields:
 *   { id, user_id, style_vector, topic_distribution, confidence_score,
 *     persona_embedding, source_hash, persona_json, created_at, updated_at }
 *   — no "name", "aliases", "platforms", or "traits" fields.
 * Fixed: traits derived from style_vector (float[]) + STYLE_VECTOR_LABELS.
 * Fixed: topic_distribution is Dict[str, float] (JSONB), not an array.
 */

import React from 'react';
import { STYLE_VECTOR_LABELS } from '../../utils/constants';
import { formatPercent, formatDate } from '../../utils/helpers';
import TraitCard from './TraitCard';

export const PersonaSummary = ({ persona }) => {
  if (!persona) return null;

  // style_vector is float[] — zip with dimension labels
  const traits = Array.isArray(persona.style_vector)
    ? persona.style_vector.map((value, idx) => ({
        name:  STYLE_VECTOR_LABELS[idx] ?? `Dimension ${idx + 1}`,
        value: Math.round(value * 100), // normalize 0–1 → 0–100
      }))
    : [];

  // topic_distribution is { [topic: string]: float (0–1) }
  const topics = persona.topic_distribution
    ? Object.entries(persona.topic_distribution).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <div className="space-y-5">
      {/* Meta card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400">
          Persona Profile
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 font-mono mb-1">Confidence</p>
            <p className="text-xl font-bold text-emerald-400 font-mono">
              {formatPercent(persona.confidence_score)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-mono mb-1">Style Dimensions</p>
            <p className="text-xl font-bold text-white font-mono">
              {traits.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-mono mb-1">Topic Clusters</p>
            <p className="text-xl font-bold text-white font-mono">
              {topics.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-mono mb-1">Created</p>
            <p className="text-xs text-gray-300 font-mono">{formatDate(persona.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-mono mb-1">Last Updated</p>
            <p className="text-xs text-gray-300 font-mono">{formatDate(persona.updated_at)}</p>
          </div>
          {persona.source_hash && (
            <div className="col-span-full">
              <p className="text-xs text-gray-500 font-mono mb-1">Source Hash</p>
              <p className="text-xs text-gray-600 font-mono truncate">{persona.source_hash}</p>
            </div>
          )}
        </div>
      </div>

      {/* LLM persona summary */}
      {persona.persona_json && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-3">
            AI Summary
          </h3>
          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed overflow-auto max-h-48">
            {JSON.stringify(persona.persona_json, null, 2)}
          </pre>
        </div>
      )}

      {/* Style vector traits */}
      {traits.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">
            Personality Dimensions
          </h3>
          <div className="space-y-3">
            {traits.map((trait, idx) => (
              <TraitCard key={idx} name={trait.name} value={trait.value} max={100} />
            ))}
          </div>
        </div>
      )}

      {/* Topic distribution */}
      {topics.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">
            Topic Distribution
          </h3>
          <div className="space-y-3">
            {topics.map(([topic, weight]) => (
              <div key={topic}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-300 font-mono capitalize">{topic}</span>
                  <span className="text-xs text-emerald-400 font-mono font-bold">
                    {formatPercent(weight)}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(weight * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaSummary;