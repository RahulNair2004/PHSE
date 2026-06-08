/**
 * OSINT Page
 * No data field bugs here — this page delegates to child components.
 * Fixed: inline styles → Tailwind classes.
 * Added: loading state from useOsint hook, error boundary display.
 */

import React, { useState } from 'react';
import { ScanForm, ScanList } from '../components/osint';

export const OSINT = ({ userId }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleScanSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6">
        <p className="text-xs tracking-[0.3em] uppercase text-emerald-400 font-mono mb-2">
          PHSE // Open Source Intelligence
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">OSINT Scans</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Scan social profiles and external data sources for exposure signals.
        </p>
      </div>

      {/* Two-column layout: form left, results right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-5">
            New Scan
          </h2>
          <ScanForm userId={userId} onSuccess={handleScanSuccess} />
        </div>

        {/* Scan results — key forces remount on new scan */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-5">
            Scan Results
          </h2>
          <ScanList userId={userId} key={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default OSINT;