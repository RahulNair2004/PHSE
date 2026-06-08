/**
 * Risk Scoring API Calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';

export const riskAPI = {
  /**
   * GET /risk-score/{user_id}
   * Calculates (or recalculates) and persists the composite risk score.
   */
  calculateRisk: (userId) => {
    return apiClient.get(API_ENDPOINTS.RISK_CALCULATE(userId));
  },

  /**
   * GET /risk-score/current/{user_id}
   * Returns the most recently stored risk score without recalculating.
   */
  getCurrentRisk: (userId) => {
    return apiClient.get(API_ENDPOINTS.RISK_CURRENT(userId));
  },

  /**
   * GET /risk-score/history/{user_id}
   * Returns the full RiskHistory list for a user.
   */
  getRiskHistory: (userId) => {
    return apiClient.get(API_ENDPOINTS.RISK_HISTORY(userId));
  },
};

export default riskAPI;