/**
 * ScanForm Component
 * Fixed: OSINTDataCreate requires { user_id, source, data_type, content }.
 *   The old form only collected "content" — source and data_type were missing,
 *   which would cause a 422 Unprocessable Entity from FastAPI.
 * Added: scanProfile mode for social URLs (ProfileScanCreate).
 * Fixed: <form onSubmit> replaced with onClick handler per project rules.
 */

import React, { useState } from 'react';
import { useOSINT } from '../../hooks';
import { validateUrl } from '../../utils/helpers';
import { OSINT_SOURCES, OSINT_DATA_TYPES, SCAN_TYPES } from '../../utils/constants';

const MODES = {
  GENERIC: 'generic',
  PROFILE: 'profile',
};

const initialGeneric = {
  source:    OSINT_SOURCES.GENERIC,
  data_type: OSINT_DATA_TYPES.RAW,
  content:   '',
};

const initialProfile = {
  github:  '',
  reddit:  '',
  twitter: '',
};

export const ScanForm = ({ userId, onSuccess }) => {
  const [mode, setMode]             = useState(MODES.GENERIC);
  const [genericForm, setGeneric]   = useState(initialGeneric);
  const [profileForm, setProfile]   = useState(initialProfile);
  const [formError, setFormError]   = useState('');
  const { triggerScan, scanProfile, loading } = useOSINT();

  const handleGenericSubmit = async () => {
    if (!userId) {
    setFormError('No user ID found. Please login/register first.');
    return;
  }

    if (!genericForm.content.trim()) {
      setFormError('Content is required.');
      return;
    }
    setFormError('');
    try {
      const result = await triggerScan({
        user_id:   userId,
        source:    genericForm.source,
        data_type: genericForm.data_type,
        content:   genericForm.content.trim(),
      });
      onSuccess?.(result);
      setGeneric(initialGeneric);
    } catch (err) {
      setFormError(err.message || 'Scan failed.');
    }
  };

  const handleProfileSubmit = async () => {
    if (!userId) {
    setFormError('No user ID found. Please login/register first.');
    return;
  }
    const { github, reddit, twitter } = profileForm;
    if (!github && !reddit && !twitter) {
      setFormError('Enter at least one social profile URL.');
      return;
    }
    const invalid = [github, reddit, twitter].filter((u) => u && !validateUrl(u));
    if (invalid.length) {
      setFormError('One or more URLs are invalid.');
      return;
    }
    setFormError('');
    try {
       const payload = {
    user_id: Number(userId),
  };

  if (github) payload.github = github;
  if (reddit) payload.reddit = reddit;
  if (twitter) payload.twitter = twitter;

  console.log('PROFILE SCAN PAYLOAD:', payload);

  const result = await scanProfile(payload);

  onSuccess?.(result);
  setProfile(initialProfile);
} catch (err) {
  setFormError(err.message || 'Profile scan failed.');
}
  };

  const handleSubmit = () => {
    mode === MODES.PROFILE ? handleProfileSubmit() : handleGenericSubmit();
  };

  const inputClass =
    'w-full bg-gray-800 border border-gray-700 text-white text-sm font-mono rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-600 disabled:opacity-50';
  const labelClass = 'block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1.5';
  const selectClass =
    'bg-gray-800 border border-gray-700 text-white text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors';

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-gray-800 rounded-lg w-fit">
        {[
          { key: MODES.GENERIC,  label: 'Generic Scan' },
          { key: MODES.PROFILE,  label: 'Profile Scan' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setMode(key); setFormError(''); }}
            className={`px-4 py-1.5 text-xs font-mono rounded-md transition-colors ${
              mode === key
                ? 'bg-emerald-700 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Generic scan form */}
      {mode === MODES.GENERIC && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Source</label>
              <select
                value={genericForm.source}
                onChange={(e) => setGeneric({ ...genericForm, source: e.target.value })}
                className={selectClass}
                disabled={loading}
              >
                {Object.entries(OSINT_SOURCES).map(([k, v]) => (
                  <option key={k} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Data Type</label>
              <select
                value={genericForm.data_type}
                onChange={(e) => setGeneric({ ...genericForm, data_type: e.target.value })}
                className={selectClass}
                disabled={loading}
              >
                {Object.entries(OSINT_DATA_TYPES).map(([k, v]) => (
                  <option key={k} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Content / URL</label>
            <textarea
              rows={3}
              value={genericForm.content}
              onChange={(e) => setGeneric({ ...genericForm, content: e.target.value })}
              placeholder="Paste a URL, email, or raw text to scan…"
              className={`${inputClass} resize-none`}
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Profile scan form */}
      {mode === MODES.PROFILE && (
        <div className="space-y-4">
          {[
            { key: 'github',  label: 'GitHub URL',  placeholder: 'https://github.com/username' },
            { key: 'reddit',  label: 'Reddit URL',  placeholder: 'https://reddit.com/user/username' },
            { key: 'twitter', label: 'Twitter URL', placeholder: 'https://twitter.com/username' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                type="url"
                value={profileForm[key]}
                onChange={(e) => setProfile({ ...profileForm, [key]: e.target.value })}
                placeholder={placeholder}
                className={inputClass}
                disabled={loading}
              />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {formError && (
        <p className="text-red-400 text-xs font-mono">{formError}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-mono rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
          )}
          {loading ? 'Scanning…' : '▶ Run Scan'}
        </button>
        <button
          onClick={() => {
            setGeneric(initialGeneric);
            setProfile(initialProfile);
            setFormError('');
          }}
          disabled={loading}
          className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm font-mono rounded-lg border border-gray-700 transition-colors disabled:opacity-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default ScanForm;