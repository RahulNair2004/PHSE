/**
 * ActivityFeed Component
 * Fixed: activity shape aligned to RiskHistoryResponse { total_risk, recorded_at }
 * — no "type", "title", "status", or "timestamp" fields exist on history records.
 * Added: derived icon/label from total_risk value.
 */

import React from 'react';
import { formatRelativeTime, getRiskColor } from '../../utils/helpers';

const getRiskIcon = (totalRisk) => {
  if (totalRisk >= 80) return { icon: '🔴', label: 'Critical spike' };
  if (totalRisk >= 60) return { icon: '🟠', label: 'High risk recorded' };
  if (totalRisk >= 40) return { icon: '🟡', label: 'Medium risk recorded' };
  if (totalRisk >= 20) return { icon: '🟢', label: 'Low risk recorded' };
  return { icon: '⚪', label: 'Minimal risk recorded' };
};

export const ActivityFeed = ({ activities = [] }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400">
          Activity Feed
        </h2>
        <span className="text-xs font-mono text-gray-600">
          {activities.length} record{activities.length !== 1 ? 's' : ''}
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-600 font-mono text-sm">
          No recent activity recorded
        </div>
      ) : (
        <div className="divide-y divide-gray-800/60">
          {activities.map((activity, idx) => {
            // RiskHistoryResponse: { total_risk, recorded_at }
            const { icon, label } = getRiskIcon(activity.total_risk);
            const riskColor = getRiskColor(activity.total_risk);

            return (
              <div
                key={idx}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/30 transition-colors"
              >
                {/* Icon bubble */}
                <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-base shrink-0">
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 font-medium truncate">{label}</p>
                  <p className="text-xs text-gray-600 font-mono mt-0.5">
                    {formatRelativeTime(activity.recorded_at)}
                  </p>
                </div>

                {/* Risk score pill */}
                <div
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{
                    color: riskColor,
                    backgroundColor: riskColor + '1a',
                    border: `1px solid ${riskColor}40`,
                  }}
                >
                  {activity.total_risk != null ? activity.total_risk.toFixed(1) : '—'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;