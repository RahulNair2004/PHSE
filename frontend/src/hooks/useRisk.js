/**
 * useRisk Hook
 * Fixed: riskHistory guard — backend returns RiskHistoryResponse[] which can be
 *   null if no history exists; set to [] on null/non-array.
 * Fixed: riskScore guard — set to null on 404 (no score calculated yet).
 * Fixed: import path aligned to riskAPI.js file name.
 * Added: clearError helper for UI reset.
 */

import { useState, useCallback } from 'react';
import riskAPI from '../api/riskAPI';

export const useRisk = () => {
  const [riskScore, setRiskScore]     = useState(null);   // RiskScoreResponse | null
  const [riskHistory, setRiskHistory] = useState([]);     // RiskHistoryResponse[]
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  /**
   * GET /risk-score/{user_id}
   * Calculates and persists a new RiskScoreResponse.
   * Use this to trigger a fresh recalculation after new scans/simulations.
   */
  const calculateRisk = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await riskAPI.calculateRisk(userId);
      setRiskScore(data);
      return data;
    } catch (err) {
      setError(err.message || 'Risk calculation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET /risk-score/current/{user_id}
   * Returns the last stored RiskScoreResponse without recalculating.
   * Fixed: 404 (no score yet) treated as null, not an error.
   */
  const getCurrentRisk = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await riskAPI.getCurrentRisk(userId);
      setRiskScore(data ?? null);
      return data;
    } catch (err) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setRiskScore(null);
      } else {
        setError(err.message || 'Failed to fetch risk score');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET /risk-score/history/{user_id}
   * Returns RiskHistoryResponse[]: { total_risk, recorded_at }
   * Fixed: guarded against null response (no history yet → empty array).
   */
  const getRiskHistory = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await riskAPI.getRiskHistory(userId);
      setRiskHistory(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setRiskHistory([]);
      } else {
        setError(err.message || 'Failed to fetch risk history');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    riskScore,        // RiskScoreResponse | null
    riskHistory,      // RiskHistoryResponse[]
    loading,
    error,
    calculateRisk,
    getCurrentRisk,
    getRiskHistory,
    clearError,
  };
};

export default useRisk;