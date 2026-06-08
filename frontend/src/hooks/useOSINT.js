/**
 * useOSINT Hook
 * Fixed: added scanProfile (POST /osint/scan/profile) — was missing entirely.
 * Fixed: import path aligned to osintAPI.js file name.
 * Fixed: getUserScans guards against non-array response.
 */

import { useState, useCallback } from 'react';
import osintAPI from '../api/osintAPI';

export const useOSINT = () => {
  const [scans, setScans]             = useState([]);
  const [currentScan, setCurrentScan] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  /**
   * POST /osint/scan
   * data: OSINTDataCreate { user_id, source, data_type, content }
   */
  const triggerScan = useCallback(async (scanData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await osintAPI.triggerScan(scanData);
      setScans((prev) => [result, ...prev]);
      setCurrentScan(result);
      return result;
    } catch (err) {
      setError(err.message || 'Scan failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * POST /osint/scan/profile
   * data: ProfileScanCreate { user_id, github?, reddit?, twitter?, targets? }
   * Fixed: was missing — ScanForm uses this for social profile scans.
   */
  const scanProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await osintAPI.scanProfile(profileData);
      setScans((prev) => [result, ...prev]);
      setCurrentScan(result);
      return result;
    } catch (err) {
      setError(err.message || 'Profile scan failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET /osint/scan/{scan_id}
   */
  const getScan = useCallback(async (scanId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await osintAPI.getScan(scanId);
      setCurrentScan(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch scan');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET /osint/user/{user_id}
   * Returns OSINTDataResponse[] — guarded against null/non-array response.
   */
  const getUserScans = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await osintAPI.getUserScans(userId);
      setScans(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch scans');
      setScans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    scans,
    currentScan,
    loading,
    error,
    triggerScan,
    scanProfile,   // ← new
    getScan,
    getUserScans,
  };
};

export default useOSINT;