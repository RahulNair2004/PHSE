/**
 * Persona API Calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';

export const personaAPI = {
  /**
   * POST /persona/generate/{user_id}
   * Bug fix: was PERSONA_CREATE (undefined) → PERSONA_GENERATE(userId)
   * The backend generates a persona from existing OSINT data for a user;
   * there is no separate body payload required.
   */
  generatePersona: (userId) => {
    return apiClient.post(API_ENDPOINTS.PERSONA_GENERATE(userId), {});
  },

  /**
   * GET /persona/{user_id}
   */
  getPersona: (userId) => {
    return apiClient.get(API_ENDPOINTS.PERSONA_GET(userId));
  },

  /**
   * DELETE /persona/{user_id}
   * Bug fix: was PERSONA_LIST (undefined) — no list-all-personas route exists.
   * Added the actual delete endpoint instead.
   */
  deletePersona: (userId) => {
    return apiClient.delete(API_ENDPOINTS.PERSONA_DELETE(userId));
  },

  /**
   * POST /persona/rebuild/{user_id}
   * Added: missing rebuild route that exists in the backend.
   */
  rebuildPersona: (userId) => {
    return apiClient.post(API_ENDPOINTS.PERSONA_REBUILD(userId), {});
  },
};

export default personaAPI;