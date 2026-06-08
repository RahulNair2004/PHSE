/**
 * API Configuration
 * Centralized configuration for backend API connection
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',

  TIMEOUT: 30000,

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

/**
 * All Backend API Endpoints
 * Must match FastAPI backend routes exactly
 */

export const API_ENDPOINTS = {

  // ============================================
  // USERS
  // ============================================

  /** GET /users/ — list all users */
  USERS: '/users/',

  /** POST /users/ — create a new user */
  USER_CREATE: '/users/',

  /** GET /users/{user_id} */
  USER_GET: (userId) => `/users/${userId}`,

  /** DELETE /users/{user_id} */
  USER_DELETE: (userId) => `/users/${userId}`,


  // ============================================
  // OSINT
  // ============================================

  /** POST /osint/scan — trigger a generic OSINT scan */
  OSINT_SCAN: '/osint/scan',

  /**
   * POST /osint/scan/profile — scan social profiles
   * Body: ProfileScanCreate { user_id, github?, reddit?, twitter?, targets? }
   *
   * NOTE: FastAPI resolves /osint/scan/profile BEFORE /osint/scan/{scan_id}
   * because it is registered first, so the literal segment "profile" wins.
   */
  OSINT_SCAN_PROFILE: '/osint/scan/profile',

  /** GET /osint/scan/{scan_id} */
  OSINT_GET_SCAN: (scanId) => `/osint/scan/${scanId}`,

  /** GET /osint/user/{user_id} */
  OSINT_USER_SCANS: (userId) => `/osint/user/${userId}`,


  // ============================================
  // PERSONA
  // ============================================

  /** POST /persona/generate/{user_id} */
  PERSONA_GENERATE: (userId) => `/persona/generate/${userId}`,

  /** GET /persona/{user_id} */
  PERSONA_GET: (userId) => `/persona/${userId}`,

  /** DELETE /persona/{user_id} */
  PERSONA_DELETE: (userId) => `/persona/${userId}`,

  /** POST /persona/rebuild/{user_id} */
  PERSONA_REBUILD: (userId) => `/persona/rebuild/${userId}`,


  // ============================================
  // SIMULATIONS
  // ============================================

  /** POST /simulation/simulate-attack */
  SIMULATION_ATTACK: '/simulation/simulate-attack',

  /** POST /simulation/simulate-all */
  SIMULATION_ALL: '/simulation/simulate-all',

  /** GET /simulation/simulation/{simulation_id} */
  SIMULATION_GET: (simulationId) => `/simulation/simulation/${simulationId}`,

  /** GET /simulation/simulations/{user_id} */
  SIMULATION_USER: (userId) => `/simulation/simulations/${userId}`,


  // ============================================
  // RISK INTELLIGENCE
  // ============================================

  /**
   * GET /risk-score/{user_id} — calculate (or recalculate) the risk score.
   *
   * NOTE: FastAPI resolves /risk-score/current/{user_id} and
   * /risk-score/history/{user_id} before /risk-score/{user_id} because
   * those literal-segment routes are registered first.  Always use the
   * dedicated helpers below instead of calling RISK_CALCULATE with the
   * strings "current" or "history" as the userId.
   */
  RISK_CALCULATE: (userId) => `/risk-score/${userId}`,

  /** GET /risk-score/current/{user_id} */
  RISK_CURRENT: (userId) => `/risk-score/current/${userId}`,

  /** GET /risk-score/history/{user_id} */
  RISK_HISTORY: (userId) => `/risk-score/history/${userId}`,


  // ============================================
  // SECURITY REPORTS
  // ============================================

  /** GET /reports/{user_id} */
  REPORTS_GET: (userId) => `/reports/${userId}`,

  /** POST /reports/export-pdf */
  REPORTS_EXPORT_PDF: '/reports/export-pdf',


  // ============================================
  // HEALTH CHECK
  // ============================================

  /** GET /health */
  HEALTH: '/health',
};

export default API_CONFIG;