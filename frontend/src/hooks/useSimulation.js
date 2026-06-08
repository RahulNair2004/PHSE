/**
 * useSimulation Hook
 * Fixed: createSimulation → simulateAttack (POST /simulation/simulate-attack).
 *   SimulationCreate body: { user_id, generated_text } — not generic simData.
 * Fixed: added simulateAll (POST /simulation/simulate-all) — was missing entirely.
 * Fixed: getUserSimulations guards against null/non-array response.
 * Fixed: import path aligned to simulationAPI.js file name.
 */

import { useState, useCallback } from 'react';
import simulationAPI from '../api/simulationAPI';

export const useSimulation = () => {
  const [simulations, setSimulations] = useState([]);    // SimulationResponse[]
  const [currentSim, setCurrentSim]   = useState(null);  // SimulationResponse | null
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  /**
   * POST /simulation/simulate-attack
   * data: SimulationCreate { user_id, generated_text }
   * Fixed: was createSimulation — renamed to match the actual route.
   */
  const simulateAttack = useCallback(async (simData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await simulationAPI.simulateAttack(simData);
      setSimulations((prev) => [result, ...prev]);
      setCurrentSim(result);
      return result;
    } catch (err) {
      setError(err.message || 'Simulation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * POST /simulation/simulate-all
   * data: { user_id }
   * Fixed: was missing entirely — Simulation page uses this for "Run All".
   */
  const simulateAll = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await simulationAPI.simulateAll(userId);
      // simulateAll may return a list or a single object depending on backend
      if (Array.isArray(result)) {
        setSimulations((prev) => [...result, ...prev]);
      } else if (result) {
        setSimulations((prev) => [result, ...prev]);
        setCurrentSim(result);
      }
      return result;
    } catch (err) {
      setError(err.message || 'Bulk simulation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET /simulation/simulation/{simulation_id}
   */
  const getSimulation = useCallback(async (simulationId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await simulationAPI.getSimulation(simulationId);
      setCurrentSim(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch simulation');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET /simulation/simulations/{user_id}
   * Fixed: guarded against null/non-array response.
   */
  const getUserSimulations = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await simulationAPI.getUserSimulations(userId);
      setSimulations(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setSimulations([]);
      } else {
        setError(err.message || 'Failed to fetch simulations');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    simulations,
    currentSim,
    loading,
    error,
    simulateAttack,       // replaces createSimulation
    simulateAll,          // new
    getSimulation,
    getUserSimulations,
  };
};

export default useSimulation;