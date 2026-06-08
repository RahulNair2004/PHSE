/**
 * Persona Page
 * Fixed: hook was using getUserPersonas — backend returns ONE PersonaProfile per user
 *   (unique constraint on user_id). Corrected to getPersona(userId).
 * Fixed: persona fields aligned to PersonaProfileResponse:
 *   { id, user_id, style_vector, topic_distribution, confidence_score,
 *     persona_embedding, source_hash, persona_json, created_at, updated_at }
 *   — no "name" or "trait_count" fields exist on this model.
 * Fixed: added generatePersona / rebuildPersona actions.
 */

import React, { useEffect, useState } from 'react';
import { usePersona } from '../hooks';
import { formatDate } from '../utils/helpers';

export const Persona = ({ userId }) => {
  const { persona, loading, error, generatePersona, getPersona, rebuildPersona, deletePersona } =
    usePersona();
  const [isRebuilding, setIsRebuilding] = useState(false);

  useEffect(() => {
    if (userId) getPersona(userId);
  }, [userId, getPersona]);

  const handleGenerate = async () => {
    await generatePersona(userId);
  };

  const handleRebuild = async () => {
    setIsRebuilding(true);
    await rebuildPersona(userId);
    setIsRebuilding(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this persona profile? This cannot be undone.')) {
      await deletePersona(userId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-emerald-400 font-mono mb-2">
            PHSE // Persona Engine
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Persona Profile</h1>
          <p className="text-gray-400 mt-1 text-sm">
            AI-derived behavioural fingerprint built from OSINT data.
          </p>
        </div>

        <div className="flex gap-3">
          {!persona ? (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-mono rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating…' : '+ Generate Persona'}
            </button>
          ) : (
            <>
              <button
                onClick={handleRebuild}
                disabled={loading || isRebuilding}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-mono rounded-lg border border-gray-700 transition-colors disabled:opacity-50"
              >
                {isRebuilding ? 'Rebuilding…' : '↺ Rebuild'}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-400 text-sm font-mono rounded-lg border border-red-800 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
          Processing persona…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm font-mono rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* No persona yet */}
      {!loading && !persona && !error && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
          <p className="text-gray-500 font-mono text-sm mb-4">No persona profile found.</p>
          <p className="text-gray-600 text-xs">
            Run OSINT scans first, then generate a persona to build a behavioural fingerprint.
          </p>
        </div>
      )}

      {/* Persona detail — PersonaProfileResponse */}
      {persona && (
        <div className="space-y-5">
          {/* Meta row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-2">
                Confidence
              </p>
              <p className="text-2xl font-bold text-emerald-400 font-mono">
                {persona.confidence_score != null
                  ? `${(persona.confidence_score * 100).toFixed(1)}%`
                  : '—'}
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-2">
                Style Dimensions
              </p>
              <p className="text-2xl font-bold text-white font-mono">
                {Array.isArray(persona.style_vector) ? persona.style_vector.length : '—'}
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-2">
                Topic Clusters
              </p>
              <p className="text-2xl font-bold text-white font-mono">
                {persona.topic_distribution
                  ? Object.keys(persona.topic_distribution).length
                  : '—'}
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-2">
                Last Updated
              </p>
              <p className="text-sm font-mono text-gray-300">
                {formatDate(persona.updated_at)}
              </p>
            </div>
          </div>

          {/* LLM-generated persona summary */}
          {persona.persona_json && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">
                AI Persona Summary
              </h2>
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed overflow-auto max-h-64">
                {JSON.stringify(persona.persona_json, null, 2)}
              </pre>
            </div>
          )}

          {/* Topic distribution */}
          {persona.topic_distribution &&
            Object.keys(persona.topic_distribution).length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">
                  Topic Distribution
                </h2>
                <div className="space-y-3">
                  {Object.entries(persona.topic_distribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([topic, weight]) => (
                      <div key={topic}>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-gray-300">{topic}</span>
                          <span className="text-emerald-400">
                            {(weight * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(weight * 100).toFixed(1)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Source hash */}
          {persona.source_hash && (
            <div className="text-xs font-mono text-gray-600 pt-2">
              source hash: {persona.source_hash}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Persona;