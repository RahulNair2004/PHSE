/**
 * Reports Page
 * Fixed: backend has ONE report per user (unique user_id constraint on MitigationReport).
 *   The old code called getUserReports() expecting a list — no such route exists.
 *   Correct route: GET /reports/{user_id} → MitigationReportResponse (single object).
 * Fixed: fields aligned to MitigationReportResponse:
 *   { id, user_id, summary, recommendations, risk_breakdown,
 *     priority_actions, expected_risk_reduction, generated_at }
 *   — no "name", "status", or "created_at" fields.
 * Fixed: export calls POST /reports/export-pdf with { user_id }.
 * Fixed: "Generate Report" should call GET /risk-score/{user_id} to trigger
 *   a recalc first, then GET /reports/{user_id} to fetch the updated report.
 */

import React, { useEffect, useState } from 'react';
import { useReports } from '../hooks';
import { formatDate } from '../utils/helpers';

export const Reports = ({ userId }) => {
  const { report, loading, error, getSecurityReport, exportPDF } = useReports();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (userId) getSecurityReport(userId);
  }, [userId, getSecurityReport]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportPDF(userId);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    if (userId) getSecurityReport(userId);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-emerald-400 font-mono mb-2">
            PHSE // Security Reports
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Mitigation Report
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            AI-generated risk analysis and remediation recommendations.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-mono rounded-lg border border-gray-700 transition-colors disabled:opacity-50"
          >
            ↺ Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={loading || isExporting || !report}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-mono rounded-lg transition-colors disabled:opacity-50"
          >
            {isExporting ? 'Exporting…' : '↓ Export PDF'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
          Loading report…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm font-mono rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* No report */}
      {!loading && !report && !error && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
          <p className="text-gray-500 font-mono text-sm mb-2">No report generated yet.</p>
          <p className="text-gray-600 text-xs">
            Calculate a risk score first — the report is generated automatically.
          </p>
        </div>
      )}

      {/* MitigationReportResponse */}
      {report && (
        <div className="space-y-5">
          {/* Meta */}
          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
            <span>Report #{report.id}</span>
            <span className="text-gray-700">|</span>
            <span>Generated: {formatDate(report.generated_at)}</span>
            {report.expected_risk_reduction != null && (
              <>
                <span className="text-gray-700">|</span>
                <span className="text-emerald-400">
                  Expected reduction: {report.expected_risk_reduction.toFixed(1)}%
                </span>
              </>
            )}
          </div>

          {/* Summary */}
          {report.summary && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-3">
                Executive Summary
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">{report.summary}</p>
            </div>
          )}

          {/* Priority actions */}
          {report.priority_actions && Object.keys(report.priority_actions).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">
                Priority Actions
              </h2>
              <div className="space-y-3">
                {Object.entries(report.priority_actions).map(([key, action], idx) => (
                  <div
                    key={key}
                    className="flex gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <span className="text-emerald-400 font-mono font-bold text-sm min-w-6">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p className="text-gray-300 text-sm">
                      {typeof action === 'string' ? action : JSON.stringify(action)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations && Object.keys(report.recommendations).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">
                Recommendations
              </h2>
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed overflow-auto max-h-64">
                {JSON.stringify(report.recommendations, null, 2)}
              </pre>
            </div>
          )}

          {/* Risk breakdown */}
          {report.risk_breakdown && Object.keys(report.risk_breakdown).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">
                Risk Breakdown
              </h2>
              <div className="space-y-3">
                {Object.entries(report.risk_breakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                    <span className="text-gray-400 text-xs font-mono capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-emerald-400 text-sm font-mono font-bold">
                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
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

export default Reports;