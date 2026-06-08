/**
 * useReports Hook
 * Fixed: backend has ONE MitigationReport per user (unique user_id constraint).
 *   — removed reports[] array and getUserReports / generateReport / getReport
 *     (none of those routes exist).
 *   — state is now a single `report` object, matching MitigationReportResponse.
 * Fixed: getReport(reportId) → getSecurityReport(userId) (GET /reports/{user_id}).
 * Fixed: generateReport → removed (no such route; report is auto-generated on risk calc).
 * Fixed: exportReport(reportId) → exportPDF(userId) (POST /reports/export-pdf).
 * Fixed: import path aligned to reportsAPI.js file name.
 */

import { useState, useCallback } from 'react';
import reportsAPI from '../api/reportsAPI';

export const useReports = () => {
  const [report, setReport]   = useState(null);   // MitigationReportResponse | null
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  /**
   * GET /reports/{user_id}
   * Returns the single MitigationReportResponse for a user.
   * Fixed: was getUserReports(userId) expecting an array.
   */
  const getSecurityReport = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsAPI.getSecurityReport(userId);
      setReport(data);
      return data;
    } catch (err) {
      // 404 → no report yet; surface other errors
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setReport(null);
      } else {
        setError(err.message || 'Failed to fetch report');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * POST /reports/export-pdf
   * body: { user_id }
   * Fixed: was exportReport(reportId) — backend takes user_id, not report_id.
   */
  const exportPDF = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsAPI.exportPDF(userId);
      return data;
    } catch (err) {
      setError(err.message || 'PDF export failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    report,             // MitigationReportResponse | null  (single object, not array)
    loading,
    error,
    getSecurityReport,  // (userId) — replaces getUserReports / getReport / generateReport
    exportPDF,          // (userId) — replaces exportReport(reportId)
  };
};

export default useReports;