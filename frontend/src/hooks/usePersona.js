/**
 * usePersona Hook
 * Fixed: backend has ONE PersonaProfile per user (unique user_id constraint).
 *   — removed personas[] array state and getUserPersonas (no list route exists).
 *   — state is now a single `persona` object, matching PersonaProfileResponse.
 * Fixed: createPersona → generatePersona (POST /persona/generate/{user_id}).
 * Fixed: getUserPersonas → removed (no such route).
 * Added: deletePersona (DELETE /persona/{user_id}).
 * Added: rebuildPersona (POST /persona/rebuild/{user_id}).
 * Fixed: import path aligned to personaAPI.js file name.
 */

import { useState, useCallback } from 'react';
import personaAPI from '../api/personaAPI';

export const usePersona = () => {
  const [persona, setPersona]   = useState(null);   // PersonaProfileResponse | null
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  /**
   * POST /persona/generate/{user_id}
   * Generates a persona from existing OSINT data.
   * Fixed: was createPersona(personaData) — backend takes only userId in path.
   */
  const generatePersona = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await personaAPI.generatePersona(userId);
      setPersona(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to generate persona');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET /persona/{user_id}
   */
  const getPersona = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await personaAPI.getPersona(userId);
      setPersona(data);
      return data;
    } catch (err) {
      // 404 means no persona yet — treat as empty, not an error
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setPersona(null);
      } else {
        setError(err.message || 'Failed to fetch persona');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * DELETE /persona/{user_id}
   * Fixed: was missing entirely.
   */
  const deletePersona = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      await personaAPI.deletePersona(userId);
      setPersona(null);
    } catch (err) {
      setError(err.message || 'Failed to delete persona');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * POST /persona/rebuild/{user_id}
   * Fixed: was missing entirely.
   */
  const rebuildPersona = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await personaAPI.rebuildPersona(userId);
      setPersona(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to rebuild persona');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    persona,          // PersonaProfileResponse | null  (single object, not array)
    loading,
    error,
    generatePersona,  // (userId) → replaces createPersona
    getPersona,
    deletePersona,    // new
    rebuildPersona,   // new
  };
};

export default usePersona;