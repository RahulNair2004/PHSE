/**
 * ScanList Component
 * Fixed: OSINTDataResponse fields:
 *   { id, user_id, source, data_type, content, email_exposure_score,
 *     social_exposure_score, domain_exposure_score, breach_count,
 *     normalized_risk, profile_url, scan_type, created_at }
 *   — no "status" or "data_count" fields exist.
 * Fixed: risk displayed from normalized_risk (0–1 float) → shown as 0–100.
 */

import React, { useEffect, useState } from 'react';
import { formatDate, formatPercent, getRiskColor, truncateText } from '../../utils/helpers';
import { useOSINT } from '../../hooks';

const RiskPill = ({ value }) => {
  if (value == null) return <span className="text-gray-600 font-mono text-xs">—</span>;
  const score = value * 100;
  const color = getRiskColor(score);
  return (
    <span
      className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
      style={{ color, backgroundColor: color + '1a', border: `1px solid ${color}33` }}
    >
      {score.toFixed(1)}
    </span>
  );
};

export const ScanList = ({ userId }) => {
  const { scans, loading, getUserScans } = useOSINT();
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (userId) getUserScans(userId);
  }, [userId, getUserScans]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm py-8 justify-center">
        <span className="animate-spin w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full inline-block" />
        Loading scans…
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600 font-mono text-sm">
        No scans yet — run your first scan above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-mono uppercase tracking-widest text-gray-600">
        <span className="col-span-3">Source</span>
        <span className="col-span-2">Type</span>
        <span className="col-span-2">Risk</span>
        <span className="col-span-2">Breaches</span>
        <span className="col-span-3">Date</span>
      </div>

      {scans.map((scan) => (
        <div key={scan.id} className="rounded-lg border border-gray-800 overflow-hidden">
          {/* Row */}
          <div
            className="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-gray-800/40 transition-colors cursor-pointer items-center"
            onClick={() => setExpanded(expanded === scan.id ? null : scan.id)}
          >
            {/* OSINTDataResponse fields */}
            <span className="col-span-3 text-sm text-gray-300 font-mono truncate">
              {scan.source}
            </span>
            <span className="col-span-2 text-xs text-gray-500 font-mono">
              {scan.data_type}
            </span>
            <span className="col-span-2">
              <RiskPill value={scan.normalized_risk} />
            </span>
            <span className="col-span-2 text-xs font-mono text-gray-400">
              {scan.breach_count ?? 0}
              <span className="text-gray-700 ml-1">found</span>
            </span>
            <span className="col-span-3 text-xs text-gray-600 font-mono">
              {formatDate(scan.created_at)}
            </span>
          </div>

          {/* Expanded detail */}
          {expanded === scan.id && (
            <div className="border-t border-gray-800 bg-gray-900/50 px-4 py-4 space-y-3">
              {/* Exposure scores */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Email Exposure',  value: scan.email_exposure_score },
                  { label: 'Social Exposure', value: scan.social_exposure_score },
                  { label: 'Domain Exposure', value: scan.domain_exposure_score },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-mono mb-1">{label}</p>
                    <p className="text-sm font-bold font-mono text-emerald-400">
                      {value != null ? value.toFixed(2) : '—'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Profile URL */}
              {scan.profile_url && (
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-1">Profile URL</p>
                  <a
                    href={scan.profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 font-mono hover:underline truncate block"
                  >
                    {scan.profile_url}
                  </a>
                </div>
              )}

              {/* Content preview */}
              {scan.content && (
                <div>
                  <p className="text-xs text-gray-500 font-mono mb-1">Content Preview</p>
                  <p className="text-xs text-gray-400 font-mono leading-relaxed">
                    {truncateText(scan.content, 200)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScanList;