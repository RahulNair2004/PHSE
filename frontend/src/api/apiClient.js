/**
 * API Client
 * Centralized HTTP client for all backend API calls
 */

import { API_CONFIG, API_ENDPOINTS } from './config';

class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }


  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Bug fix: was API_CONFIG.HEADERS (undefined). Must be API_CONFIG.DEFAULT_HEADERS.
    const config = {
      ...options,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
  const errorData = await response.json().catch(() => ({
    detail: "Unknown error"
  }));

  console.error("BACKEND ERROR:", errorData);

  throw new Error(
    typeof errorData.detail === "string"
      ? errorData.detail
      : JSON.stringify(errorData.detail, null, 2)
  );
}
      // 204 No Content (e.g. DELETE) has no body — guard against parsing it.
      const contentType = response.headers.get('content-type') || '';
      if (response.status === 204 || !contentType.includes('application/json')) {
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out: ${endpoint}`);
      }
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ── Convenience wrappers ──────────────────────────────────────────────────


  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // ── Domain-specific helpers ───────────────────────────────────────────────
  //
  // These mirror every FastAPI route so callers never construct URLs by hand.

  // --- Users ---

  getUsers() {
    return this.get(API_ENDPOINTS.USERS);
  }

  createUser(data) {
    // data: { name: string, email: string }
    return this.post(API_ENDPOINTS.USER_CREATE, data);
  }

  getUser(userId) {
    return this.get(API_ENDPOINTS.USER_GET(userId));
  }

  deleteUser(userId) {
    return this.delete(API_ENDPOINTS.USER_DELETE(userId));
  }

  // --- OSINT ---

  /**
   * POST /osint/scan
   * Generic scan — body shape depends on your OSINTDataCreate schema.
   */
  triggerScan(data) {
    return this.post(API_ENDPOINTS.OSINT_SCAN, data);
  }

  /**
   * POST /osint/scan/profile
   * data: ProfileScanCreate { user_id, github?, reddit?, twitter?, targets? }
   */
  scanProfile(data) {
    return this.post(API_ENDPOINTS.OSINT_SCAN_PROFILE, data);
  }

  getScan(scanId) {
    return this.get(API_ENDPOINTS.OSINT_GET_SCAN(scanId));
  }

  getUserScans(userId) {
    return this.get(API_ENDPOINTS.OSINT_USER_SCANS(userId));
  }

  // --- Persona ---

  generatePersona(userId) {
    return this.post(API_ENDPOINTS.PERSONA_GENERATE(userId), {});
  }

  getPersona(userId) {
    return this.get(API_ENDPOINTS.PERSONA_GET(userId));
  }

  deletePersona(userId) {
    return this.delete(API_ENDPOINTS.PERSONA_DELETE(userId));
  }

  rebuildPersona(userId) {
    return this.post(API_ENDPOINTS.PERSONA_REBUILD(userId), {});
  }

  // --- Simulations ---

  /**
   * POST /simulation/simulate-attack
   * data: SimulationCreate { user_id, generated_text }
   */
  simulateAttack(data) {
    return this.post(API_ENDPOINTS.SIMULATION_ATTACK, data);
  }

  /**
   * POST /simulation/simulate-all
   * data: { user_id }
   */
  simulateAllAttacks(data) {
    return this.post(API_ENDPOINTS.SIMULATION_ALL, data);
  }

  getSimulation(simulationId) {
    return this.get(API_ENDPOINTS.SIMULATION_GET(simulationId));
  }

  getUserSimulations(userId) {
    return this.get(API_ENDPOINTS.SIMULATION_USER(userId));
  }

  // --- Risk Intelligence ---

  calculateRiskScore(userId) {
    return this.get(API_ENDPOINTS.RISK_CALCULATE(userId));
  }

  getCurrentRisk(userId) {
    return this.get(API_ENDPOINTS.RISK_CURRENT(userId));
  }

  getRiskHistory(userId) {
    return this.get(API_ENDPOINTS.RISK_HISTORY(userId));
  }

  // --- Security Reports ---1

  getSecurityReport(userId) {
    return this.get(API_ENDPOINTS.REPORTS_GET(userId));
  }

  /**
   * POST /reports/export-pdf
   * data: { user_id }
   */
  exportPDF(data) {
    return this.post(API_ENDPOINTS.REPORTS_EXPORT_PDF, data);
  }

  // --- Health ---

  healthCheck() {
    return this.get(API_ENDPOINTS.HEALTH);
  }
}

export const apiClient = new APIClient();
export default apiClient;