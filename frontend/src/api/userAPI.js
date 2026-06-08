/**
 * User API Calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';

export const userAPI = {
  /**
   * POST /users/
   * data: UserCreate { name, email }
   */
  createUser: (userData) => {
    return apiClient.post(API_ENDPOINTS.USER_CREATE, userData);
  },

  /**
   * GET /users/{user_id}
   * Bug fix: was USER_PROFILE (undefined, no such route).
   * The backend exposes a per-ID lookup, not a generic /profile endpoint.
   */
  getUser: (userId) => {
    return apiClient.get(API_ENDPOINTS.USER_GET(userId));
  },

  /**
   * GET /users/
   */
  getAllUsers: () => {
    return apiClient.get(API_ENDPOINTS.USERS);
  },

  /**
   * DELETE /users/{user_id}
   * Bug fix: was USER_DELETE with no userId argument (undefined call).
   * userId is required.
   */
  deleteUser: (userId) => {
    return apiClient.delete(API_ENDPOINTS.USER_DELETE(userId));
  },
};

export default userAPI;