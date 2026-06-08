/**
 * Auth Context
 * Manages user session state.
 *
 * Since the backend has no JWT / session tokens, identity is simply a
 * { id, name, email } object returned by the Users endpoints.
 * The resolved user is persisted in localStorage so the session survives
 * a page refresh.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userAPI } from '../api/userAPI';

const AuthContext = createContext();

const STORAGE_KEY = 'osint_user';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // true while an async operation (register / lookup) is in flight
  const [loading, setLoading] = useState(false);

  // non-null string when an operation fails
  const [error, setError] = useState(null);

  // ── Rehydrate from localStorage on first mount ──────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAuthenticated(true);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const _persist = (userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setError(null);
  };

  const _clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Register a new user.
   * Calls POST /users/ with { name, email }.
   * Returns the created UserResponse on success, null on failure.
   */
  const register = useCallback(async ({ name, email }) => {
    setLoading(true);
    setError(null);
    try {
      const created = await userAPI.createUser({ name, email });
      _persist(created);
      return created;
    } catch (err) {
      setError(err.message || 'Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log in by fetching an existing user by ID.
   * Calls GET /users/{user_id}.
   * Returns the UserResponse on success, null on failure.
   */
  const login = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await userAPI.getUser(userId);
      _persist(fetched);
      return fetched;
    } catch (err) {
      setError(err.message || 'Login failed — user not found');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log out — clears local state and localStorage.
   */
  const logout = useCallback(() => {
    _clear();
  }, []);

  /**
   * Delete the current user's account.
   * Calls DELETE /users/{user_id}, then clears local state.
   * Returns true on success, false on failure.
   */
  const deleteAccount = useCallback(async () => {
    if (!user?.id) return false;
    setLoading(true);
    setError(null);
    try {
      await userAPI.deleteUser(user.id);
      _clear();
      return true;
    } catch (err) {
      setError(err.message || 'Account deletion failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Refresh the in-memory user object from the backend.
   * Useful after profile updates.
   */
  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const fresh = await userAPI.getUser(user.id);
      _persist(fresh);
    } catch (err) {
      setError(err.message || 'Failed to refresh user');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Context value ────────────────────────────────────────────────────────

  const value = {
    // State
    user,               // UserResponse | null  — { id, name, email, created_at }
    isAuthenticated,    // boolean
    loading,            // boolean — true during async calls
    error,              // string | null — last error message

    // Actions
    register,           // ({ name, email }) => Promise<UserResponse | null>
    login,              // (userId: number)  => Promise<UserResponse | null>
    logout,             // () => void
    deleteAccount,      // () => Promise<boolean>
    refreshUser,        // () => Promise<void>
  };

  return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);
};

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}

export { AuthContext, useAuth };
export default AuthProvider;