/**
 * ReportPreview Component
 * Fixed: MitigationReportResponse fields:
 *   { id, user_id, summary, recommendations, risk_breakdown,
 *     priority_actions, expected_risk_reduction, generated_at }
 *   — no "name", "status", "description", "pages", or "created_at" fields.
 * Fixed: onExport now passes userId (not report object) since POST /reports/export-pdf
 *   takes { user_id }, not a report ID.
 */

import React, { useState } from 'react';
import { formatDate } from '../../utils/helpers';

export const ReportPreview = ({ report, onExport }) => {
  const [expanded, setExpanded] = useState(false);

  if (!report) return null;

  const priorityCount = report.priority_actions
    ? Object.keys(report.priority_actions).length
    : 0;

  const recommendationCount = report.recommendations
    ? Object.keys(report.recommendations).length
    : 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            Mitigation Report
            <span className="text-gray-600 font-mono text-xs ml-2">#{report.id}</span>
          </p>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Generated {formatDate(report.generated_at)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            {expanded ? '▲ Collapse' : '▼ Expand'}
          </button>
          <button
            onClick={() => onExport?.(report.user_id)}
            className="px-3 py-1.5 text-xs font-mono text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors"
          >
            ↓ Export PDF
          </button>
        </div>
      </div>

      {/* Summary always visible */}
      {report.summary && (
        <div className="px-6 py-4 border-b border-gray-800/60">
          <p className="text-sm text-gray-300 leading-relaxed">{report.summary}</p>
        </div>
      )}

      {/* Quick stats */}
      <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-gray-800/60">
        <div>
          <p className="text-xs text-gray-500 font-mono mb-1">Expected Reduction</p>
          <p className="text-lg font-bold text-emerald-400 font-mono">
            {report.expected_risk_reduction != null
              ? `${report.expected_risk_reduction.toFixed(1)}%`
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-mono mb-1">Priority Actions</p>
          <p className="text-lg font-bold text-white font-mono">{priorityCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-mono mb-1">Recommendations</p>
          <p className="text-lg font-bold text-white font-mono">{recommendationCount}</p>
        </div>
      </div>

      {/* Expanded sections */}
      {expanded && (
        <div className="px-6 py-5 space-y-5">
          {/* Priority actions */}
          {priorityCount > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">
                Priority Actions
              </h4>
              <div className="space-y-2">
                {Object.entries(report.priority_actions).map(([key, action], idx) => (
                  <div
                    key={key}
                    className="flex gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <span className="text-emerald-400 font-mono font-bold text-xs min-w-6">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm text-gray-300">
                      {typeof action === 'string' ? action : JSON.stringify(action)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk breakdown */}
          {report.risk_breakdown && Object.keys(report.risk_breakdown).length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">
                Risk Breakdown
              </h4>
              <div className="divide-y divide-gray-800">
                {Object.entries(report.risk_breakdown).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2">
                    <span className="text-xs text-gray-400 font-mono capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {typeof val === 'number' ? val.toFixed(2) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportPreview;