/**
 * Reports API Calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';

export const reportsAPI = {
  /**
   * GET /reports/{user_id}
   * Bug fix: was REPORTS_GET(reportId) with a phantom reportId arg.
   * The backend route takes user_id, not report_id, and is a GET (not POST).
   * There is no separate REPORTS_GENERATE or REPORTS_LIST route in the backend.
   */
  getSecurityReport: (userId) => {
    return apiClient.get(API_ENDPOINTS.REPORTS_GET(userId));
  },

  /**
   * POST /reports/export-pdf
   * Bug fix: was REPORTS_EXPORT(reportId) as a GET (undefined endpoint).
   * The actual route is a POST that accepts { user_id } in the body.
   */
  exportPDF: (userId) => {
    return apiClient.post(API_ENDPOINTS.REPORTS_EXPORT_PDF, { user_id: userId });
  },
};

export default reportsAPI;