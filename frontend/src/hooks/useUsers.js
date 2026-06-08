/**
 * useUsers Hook
 * Fixed: getProfile() called userAPI.getProfile() (no such route) → getUser(userId).
 * Fixed: deleteAccount() called userAPI.deleteAccount() (no args) → deleteUser(userId).
 * Fixed: profile state renamed to selectedUser for clarity (it's a UserResponse,
 *   not a "profile" in the OAuth sense).
 * Fixed: import path aligned to userAPI.js file name.
 * Added: deleteUser(userId) as the primary delete method.
 */

import { useState, useCallback } from 'react';
import userAPI from '../api/userAPI';

export const useUsers = () => {
  const [users, setUsers]               = useState([]);   // UserResponse[]
  const [selectedUser, setSelectedUser] = useState(null); // UserResponse | null
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  /**
   * GET /users/
   * Returns all UserResponse objects.
   */
  const getAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userAPI.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * POST /users/
   * data: UserCreate { name, email }
   * Returns UserResponse.
   */
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userAPI.createUser(userData);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET /users/{user_id}
   * Fixed: was getProfile() calling a non-existent /profile route.
   */
  const getUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userAPI.getUser(userId);
      setSelectedUser(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * DELETE /users/{user_id}
   * Fixed: was deleteAccount() with no userId — backend requires it in the path.
   * Removes the user from local state on success.
   */
  const deleteUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      await userAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  const clearError = useCallback(() => setError(null), []);

  return {
    users,
    selectedUser,    // replaces `profile`
    loading,
    error,
    getAllUsers,
    createUser,
    getUser,         // replaces getProfile()
    deleteUser,      // replaces deleteAccount()
    clearError,
  };
};

export default useUsers;