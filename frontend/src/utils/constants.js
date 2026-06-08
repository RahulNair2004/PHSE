/**
 * Constants
 * Aligned to backend schema field values and enums.
 */

// ── Risk ──────────────────────────────────────────────────────────────────────
// risk_level strings returned by RiskScoreResponse
// weighted_total is a 0–100 float; these thresholds match getRiskLevel() in helpers.js
export const RISK_LEVELS = {
  MINIMAL:  { label: 'Minimal',  minScore: 0,  maxScore: 19,  color: '#22c55e', tailwind: 'text-emerald-400', bg: 'bg-emerald-900/40', border: 'border-emerald-700' },
  LOW:      { label: 'Low',      minScore: 20, maxScore: 39,  color: '#84cc16', tailwind: 'text-lime-400',    bg: 'bg-lime-900/40',    border: 'border-lime-700'    },
  MEDIUM:   { label: 'Medium',   minScore: 40, maxScore: 59,  color: '#facc15', tailwind: 'text-yellow-400',  bg: 'bg-yellow-900/40',  border: 'border-yellow-700'  },
  HIGH:     { label: 'High',     minScore: 60, maxScore: 79,  color: '#ea580c', tailwind: 'text-orange-400',  bg: 'bg-orange-900/40',  border: 'border-orange-700'  },
  CRITICAL: { label: 'Critical', minScore: 80, maxScore: 100, color: '#dc2626', tailwind: 'text-red-400',     bg: 'bg-red-900/40',     border: 'border-red-700'     },
};

// Lookup a RISK_LEVELS entry from a weighted_total float (0–100)
export const getRiskLevelConfig = (score) => {
  if (score == null) return RISK_LEVELS.MINIMAL;
  if (score >= 80) return RISK_LEVELS.CRITICAL;
  if (score >= 60) return RISK_LEVELS.HIGH;
  if (score >= 40) return RISK_LEVELS.MEDIUM;
  if (score >= 20) return RISK_LEVELS.LOW;
  return RISK_LEVELS.MINIMAL;
};

// Lookup a RISK_LEVELS entry from a risk_level string (as returned by backend)
export const getRiskLevelConfigByLabel = (label = '') => {
  const key = label.toUpperCase();
  return RISK_LEVELS[key] ?? RISK_LEVELS.MINIMAL;
};

// ── OSINT ─────────────────────────────────────────────────────────────────────
// OSINTData.scan_type values (backend default: "profile")
export const SCAN_TYPES = {
  PROFILE: 'profile',
  EMAIL:   'email',
  DOMAIN:  'domain',
  BREACH:  'breach',
};

// OSINTData.source values — social + generic
export const OSINT_SOURCES = {
  GITHUB:  'github',
  REDDIT:  'reddit',
  TWITTER: 'twitter',
  GENERIC: 'generic',
};

// OSINTData.data_type values
export const OSINT_DATA_TYPES = {
  SOCIAL_PROFILE: 'social_profile',
  EMAIL:          'email',
  DOMAIN:         'domain',
  BREACH:         'breach',
  RAW:            'raw',
};

// ── Simulations ───────────────────────────────────────────────────────────────
// NOTE: The Simulation model has no status or attack_type column.
// These are UI-only labels for the persuasion/risk score ranges shown in the table.
export const SIMULATION_RISK_BANDS = {
  LOW:      { label: 'Low',      min: 0,    max: 0.33 },
  MEDIUM:   { label: 'Medium',   min: 0.34, max: 0.66 },
  HIGH:     { label: 'High',     min: 0.67, max: 1.0  },
};

// Score fields returned by SimulationResponse
export const SIMULATION_SCORE_FIELDS = [
  { key: 'similarity_score',       label: 'Similarity'         },
  { key: 'psychological_score',    label: 'Psychological'       },
  { key: 'persuasion_index',       label: 'Persuasion Index'    },
  { key: 'contextual_risk_weight', label: 'Contextual Weight'   },
];

// ── Persona ───────────────────────────────────────────────────────────────────
// Keys available inside PersonaProfile.topic_distribution (JSONB — these are
// examples; actual keys come from the backend NLP pipeline).
export const KNOWN_TOPIC_KEYS = [
  'technology',
  'security',
  'finance',
  'social',
  'politics',
  'entertainment',
  'science',
  'other',
];

// style_vector dimension labels (order matches the backend embedding)
export const STYLE_VECTOR_LABELS = [
  'Technical Skill',
  'Social Presence',
  'Communication Style',
  'Security Awareness',
  'Risk Taking',
  'Digital Footprint',
];

// ── Risk score components ─────────────────────────────────────────────────────
// Maps RiskScoreResponse field names → display labels
export const RISK_COMPONENTS = [
  { key: 'weighted_total',       label: 'Overall Risk'  },
  { key: 'osint_component',      label: 'OSINT'         },
  { key: 'persona_component',    label: 'Persona'       },
  { key: 'stylometry_component', label: 'Stylometry'    },
  { key: 'simulation_component', label: 'Simulation'    },
];

// ── Reports ───────────────────────────────────────────────────────────────────
// MitigationReport JSONB key conventions (UI-only; actual keys come from backend)
export const REPORT_SECTION_LABELS = {
  summary:              'Executive Summary',
  recommendations:      'Recommendations',
  risk_breakdown:       'Risk Breakdown',
  priority_actions:     'Priority Actions',
  expected_risk_reduction: 'Expected Risk Reduction',
};

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGE_SIZES = {
  SMALL:  10,
  MEDIUM: 20,
  LARGE:  50,
};

// ── Navigation ────────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { path: '/',            label: 'Dashboard',   icon: '⬡' },
  { path: '/osint',       label: 'OSINT',       icon: '◎' },
  { path: '/persona',     label: 'Persona',     icon: '◈' },
  { path: '/simulation',  label: 'Simulations', icon: '◇' },
  { path: '/risk',        label: 'Risk',        icon: '△' },
  { path: '/reports',     label: 'Reports',     icon: '▤' },
  { path: '/users',       label: 'Users',       icon: '○' },
];

export default {
  RISK_LEVELS,
  RISK_COMPONENTS,
  SCAN_TYPES,
  OSINT_SOURCES,
  OSINT_DATA_TYPES,
  SIMULATION_RISK_BANDS,
  SIMULATION_SCORE_FIELDS,
  KNOWN_TOPIC_KEYS,
  STYLE_VECTOR_LABELS,
  REPORT_SECTION_LABELS,
  PAGE_SIZES,
  NAV_ITEMS,
};