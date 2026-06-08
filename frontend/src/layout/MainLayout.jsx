/**
 * Main Layout Component
 * Tailwind rewrite — sticky sidebar + scrollable main content area.
 * Fixed: background aligned to the dark theme used across all pages.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar — sticky, full height */}
      <Sidebar />

      {/* Main content — scrollable */}
      <main className="flex-1 overflow-y-auto bg-gray-950">
        <div className="max-w-350 mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;