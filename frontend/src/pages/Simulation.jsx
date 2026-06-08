/**
 * Simulation Page
 * Fixed: fields aligned to SimulationResponse:
 *   { id, user_id, generated_text, similarity_score, psychological_score,
 *     persuasion_index, contextual_risk_weight, created_at }
 *   — no "name", "attack_type", or "status" fields.
 * Fixed: "Run New Simulation" wired to simulateAll action.
 * Fixed: hook exposes simulateAttack, simulateAll, getSimulation, getUserSimulations.
 */

import React, { useEffect, useState } from 'react';
import { useSimulation } from '../hooks';
import { formatDate } from '../utils/helpers';

const scoreBar = (value) => {
  if (value == null) return null;
  const pct = Math.min(Math.max(value * 100, 0), 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${pct.toFixed(0)}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-400 w-10 text-right">
        {value.toFixed(2)}
      </span>
    </div>
  );
};

export const Simulation = ({ userId }) => {
  const {
    simulations,
    loading,
    error,
    getUserSimulations,
    simulateAll,
    getSimulation,
  } = useSimulation();

  const [isRunning, setIsRunning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (userId) getUserSimulations(userId);
  }, [userId, getUserSimulations]);

  const handleRunAll = async () => {
    setIsRunning(true);
    try {
      await simulateAll(userId);
      getUserSimulations(userId);
    } finally {
      setIsRunning(false);
    }
  };

  const handleViewDetail = async (simId) => {
    setDetailLoading(true);
    const detail = await getSimulation(simId);
    setSelected(detail);
    setDetailLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-emerald-400 font-mono mb-2">
            PHSE // Attack Simulations
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Simulations
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            AI-generated social-engineering attack simulations against your persona.
          </p>
        </div>

        <button
          onClick={handleRunAll}
          disabled={isRunning || loading}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-mono rounded-lg transition-colors disabled:opacity-50"
        >
          {isRunning ? 'Running…' : '▶ Run All Simulations'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
          Loading simulations…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm font-mono rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation list */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {!simulations || simulations.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-mono text-sm mb-4">No simulations yet.</p>
              <button
                onClick={handleRunAll}
                disabled={isRunning}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-mono rounded-lg transition-colors disabled:opacity-50"
              >
                ▶ Run First Simulation
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  {['ID', 'Similarity', 'Psych Score', 'Persuasion', 'Date', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-mono uppercase tracking-widest text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {simulations.map((sim) => (
                  <tr
                    key={sim.id}
                    className={`border-b border-gray-800/50 transition-colors cursor-pointer ${
                      selected?.id === sim.id
                        ? 'bg-emerald-900/20'
                        : 'hover:bg-gray-800/30'
                    }`}
                    onClick={() => handleViewDetail(sim.id)}
                  >
                    {/* SimulationResponse fields */}
                    <td className="px-4 py-4 font-mono text-gray-500 text-xs">#{sim.id}</td>
                    <td className="px-4 py-4 font-mono text-emerald-400 text-xs">
                      {sim.similarity_score != null ? sim.similarity_score.toFixed(3) : '—'}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-300">
                      {sim.psychological_score != null ? sim.psychological_score.toFixed(3) : '—'}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-300">
                      {sim.persuasion_index != null ? sim.persuasion_index.toFixed(3) : '—'}
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs">
                      {formatDate(sim.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-emerald-600 text-xs font-mono">view →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">
            Simulation Detail
          </h2>
          {detailLoading && (
            <div className="text-emerald-400 font-mono text-xs animate-pulse">Loading…</div>
          )}
          {!selected && !detailLoading && (
            <p className="text-gray-600 text-xs font-mono">
              Click a row to inspect the generated attack text and scores.
            </p>
          )}
          {selected && !detailLoading && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Similarity</p>
                {scoreBar(selected.similarity_score)}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Psychological</p>
                {scoreBar(selected.psychological_score)}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Persuasion</p>
                {scoreBar(selected.persuasion_index)}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Contextual Weight</p>
                {scoreBar(selected.contextual_risk_weight)}
              </div>
              <div className="pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2">
                  Generated Text
                </p>
                <p className="text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selected.generated_text}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulation;