/**
 * Simulation API Calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';

export const simulationAPI = {
  /**
   * POST /simulation/simulate-attack
   * Bug fix: was SIMULATION_CREATE (undefined).
   * data: SimulationCreate { user_id, generated_text }
   */
  simulateAttack: (simData) => {
    return apiClient.post(API_ENDPOINTS.SIMULATION_ATTACK, simData);
  },

  /**
   * POST /simulation/simulate-all
   * Added: missing route. Runs all attack simulations for a user.
   * data: { user_id }
   */
  simulateAll: (userId) => {
    return apiClient.post(API_ENDPOINTS.SIMULATION_ALL, { user_id: userId });
  },

  /**
   * GET /simulation/simulation/{simulation_id}
   * No change needed here — endpoint key and call were already correct.
   */
  getSimulation: (simulationId) => {
    return apiClient.get(API_ENDPOINTS.SIMULATION_GET(simulationId));
  },

  /**
   * GET /simulation/simulations/{user_id}
   * Bug fix: was SIMULATION_LIST (undefined) → SIMULATION_USER
   */
  getUserSimulations: (userId) => {
    return apiClient.get(API_ENDPOINTS.SIMULATION_USER(userId));
  },
};

export default simulationAPI;