/**
 * OSINT API Calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';

export const osintAPI = {
  /**
   * POST /osint/scan
   * data: OSINTDataCreate { user_id, source, data_type, content }
   */
  triggerScan: (scanData) => {
    return apiClient.post(API_ENDPOINTS.OSINT_SCAN, scanData);
  },

  /**
   * POST /osint/scan/profile
   * data: ProfileScanCreate { user_id, github?, reddit?, twitter?, targets? }
   */
  scanProfile: (scanData) => {
    return apiClient.post(API_ENDPOINTS.OSINT_SCAN_PROFILE, scanData);
  },

  /**
   * GET /osint/scan/{scan_id}
   * Bug fix: was API_ENDPOINTS.OSINT_GET (undefined) → OSINT_GET_SCAN
   */
  getScan: (scanId) => {
    return apiClient.get(API_ENDPOINTS.OSINT_GET_SCAN(scanId));
  },

  /**
   * GET /osint/user/{user_id}
   * Bug fix: was API_ENDPOINTS.OSINT_USER (undefined) → OSINT_USER_SCANS
   */
  getUserScans: (userId) => {
    return apiClient.get(API_ENDPOINTS.OSINT_USER_SCANS(userId));
  },
};

export default osintAPI;