/**
 * Utility / Helper Functions
 * Aligned to backend schema types and the page components above.
 */

import { RISK_LEVELS, getRiskLevelConfig, getRiskLevelConfigByLabel } from './constants';

// ── Date formatting ───────────────────────────────────────────────────────────

/**
 * Format an ISO datetime string (or Date) to a human-readable string.
 * Backend DateTime columns are UTC; we display in local time.
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
};

/**
 * Relative time label ("2 hours ago", "just now", etc.)
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  const diffMs  = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs  / 60_000);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);
  if (diffMin < 1)  return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr  < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(date);
};

// ── Risk helpers ──────────────────────────────────────────────────────────────

/**
 * Returns a hex color string for a 0–100 risk float.
 * Used for inline backgroundColor on score cards.
 * Matches the RISK_LEVELS thresholds in constants.js.
 */
export const getRiskColor = (score) => {
  return getRiskLevelConfig(score).color;
};

/**
 * Returns the risk level label string for a 0–100 float.
 * Matches RiskScoreResponse.risk_level values from the backend.
 */
export const getRiskLevel = (score) => {
  return getRiskLevelConfig(score).label;
};

/**
 * Returns Tailwind class strings { text, bg, border } for a risk level label
 * string (as returned by backend: "low", "medium", "high", "critical", "minimal").
 */
export const getRiskTailwindClasses = (riskLevelLabel) => {
  const config = getRiskLevelConfigByLabel(riskLevelLabel);
  return {
    text:   config.tailwind,
    bg:     config.bg,
    border: config.border,
  };
};

/**
 * Formats a 0–100 float risk score for display.
 * Returns "—" for null/undefined, "85.3" for a number.
 */
export const formatRiskScore = (score, decimals = 1) => {
  if (score == null || isNaN(score)) return '—';
  return Number(score).toFixed(decimals);
};

/**
 * Returns a background color string (hex) for an inline score card.
 * Darker than getRiskColor — intended for card backgrounds.
 */
export const getScoreCardBg = (score) => {
  if (score == null) return '#1f2937'; // gray-800
  if (score >= 80) return '#7f1d1d';   // red-900
  if (score >= 60) return '#78350f';   // orange-900
  if (score >= 40) return '#713f12';   // yellow-900
  if (score >= 20) return '#365314';   // lime-900
  return '#064e3b';                    // emerald-900
};

// ── Number formatting ─────────────────────────────────────────────────────────

/**
 * Format large integers: 1200 → "1.2K", 1_500_000 → "1.5M"
 */
export const formatNumber = (num) => {
  if (num == null || isNaN(num)) return '—';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000)     return (num / 1_000).toFixed(1) + 'K';
  return String(num);
};

/**
 * Format a float in [0, 1] as a percentage string: 0.753 → "75.3%"
 * Used for confidence_score, similarity_score, persuasion_index, etc.
 */
export const formatPercent = (value, decimals = 1) => {
  if (value == null || isNaN(value)) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
};

// ── Text helpers ──────────────────────────────────────────────────────────────

/**
 * Truncate long strings — used for generated_text preview in simulation rows.
 */
export const truncateText = (text, length = 80) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '…' : text;
};

/**
 * Convert a snake_case key to a Title Case label.
 * e.g. "osint_component" → "Osint Component"
 */
export const snakeToTitle = (str) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

// ── URL / domain helpers ──────────────────────────────────────────────────────

/**
 * Extract hostname from a URL string.
 * Handles missing protocol gracefully.
 * Used for OSINTData.profile_url display.
 */
export const extractDomain = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Basic email format check.
 * The backend uses Pydantic EmailStr — this client-side check reduces
 * unnecessary round trips but is not a substitute for server validation.
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Returns true if a URL string is a valid http/https URL.
 * Used to validate ProfileScanCreate fields: github, reddit, twitter.
 */
export const validateUrl = (url) => {
  if (!url) return false;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

// ── Async helpers ─────────────────────────────────────────────────────────────

/**
 * Debounce — delays invoking func until after `wait` ms have passed since
 * the last call. Used for search inputs on large lists.
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ── OSINT helpers ─────────────────────────────────────────────────────────────

/**
 * Aggregate normalized_risk across a list of OSINTData records.
 * Returns the average as a 0–100 float.
 */
export const aggregateOsintRisk = (osintRecords = []) => {
  if (!osintRecords.length) return 0;
  const sum = osintRecords.reduce((acc, r) => acc + (r.normalized_risk ?? 0), 0);
  return (sum / osintRecords.length) * 100;
};

/**
 * Returns total breach count across all OSINT records for a user.
 */
export const totalBreachCount = (osintRecords = []) =>
  osintRecords.reduce((acc, r) => acc + (r.breach_count ?? 0), 0);

// ── Simulation helpers ────────────────────────────────────────────────────────

/**
 * Compute an aggregate danger score from a SimulationResponse.
 * Weighted average of all four score fields.
 */
export const computeSimulationDanger = (sim) => {
  if (!sim) return 0;
  const { similarity_score = 0, psychological_score = 0, persuasion_index = 0, contextual_risk_weight = 0 } = sim;
  return (
    similarity_score       * 0.3 +
    psychological_score    * 0.3 +
    persuasion_index       * 0.25 +
    contextual_risk_weight * 0.15
  );
};

export default {
  formatDate,
  formatRelativeTime,
  getRiskColor,
  getRiskLevel,
  getRiskTailwindClasses,
  formatRiskScore,
  getScoreCardBg,
  formatNumber,
  formatPercent,
  truncateText,
  snakeToTitle,
  extractDomain,
  validateEmail,
  validateUrl,
  debounce,
  aggregateOsintRisk,
  totalBreachCount,
  computeSimulationDanger,
};