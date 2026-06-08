/**
 * Dashboard Page
 * Fixed: riskScore field names aligned to RiskScoreResponse schema
 * Fixed: getRiskHistory returns void (sets state internally), not a Promise with data
 * Fixed: useRisk hook used correctly
 */

import React, { useEffect } from 'react';
import { HeroRiskPanel, StatsCards, ActivityFeed } from '../components/dashboard';
import { useRisk } from '../hooks';

const Dashboard = ({ userId = 1 }) => {
  const { riskScore, riskHistory, loading, getCurrentRisk, getRiskHistory } = useRisk();

  useEffect(() => {
    if (userId) {
      getCurrentRisk(userId);
      getRiskHistory(userId);
    }
  }, [userId, getCurrentRisk, getRiskHistory]);

  // RiskScoreResponse fields: weighted_total, osint_component, persona_component,
  // stylometry_component, simulation_component, risk_level, risk_percentile
  const stats = [
    {
      id: 1,
      label: 'Overall Risk Score',
      value: riskScore?.weighted_total != null
        ? `${riskScore.weighted_total.toFixed(1)}%`
        : '—',
      sub: riskScore?.risk_level ?? 'N/A',
    },
    {
      id: 2,
      label: 'OSINT Exposure',
      value: riskScore?.osint_component != null
        ? `${riskScore.osint_component.toFixed(1)}%`
        : '—',
      sub: 'component score',
    },
    {
      id: 3,
      label: 'Persona Risk',
      value: riskScore?.persona_component != null
        ? `${riskScore.persona_component.toFixed(1)}%`
        : '—',
      sub: 'component score',
    },
    {
      id: 4,
      label: 'Simulations',
      value: riskScore?.simulation_component != null
        ? `${riskScore.simulation_component.toFixed(1)}%`
        : '—',
      sub: 'component score',
    },
  ];

  // riskHistory entries: { total_risk, recorded_at }
  const recentActivity = Array.isArray(riskHistory) ? riskHistory.slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6">
        <p className="text-xs tracking-[0.3em] uppercase text-emerald-400 font-mono mb-2">
          PHSE // Risk Intelligence Platform
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Command Dashboard
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Real-time threat surface overview for user #{userId}
        </p>
      </div>

      {/* Hero risk panel */}
      <HeroRiskPanel userId={userId} riskScore={riskScore} loading={loading} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-800 transition-colors"
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-3">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">
              {stat.value}
            </p>
            <p className="text-xs text-gray-600 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Activity feed — risk history */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">
          Recent Risk Snapshots
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8 font-mono">
            No history recorded yet
          </p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((record, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
              >
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(record.recorded_at).toLocaleString()}
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {record.total_risk?.toFixed(2) ?? '—'}
                  <span className="text-gray-600 font-normal ml-1 text-xs">risk</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ActivityFeed activities={recentActivity} />
    </div>
  );
};

export default Dashboard;