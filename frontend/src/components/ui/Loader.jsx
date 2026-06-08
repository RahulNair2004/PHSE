/**
 * Loader Component
 * Display loading spinner
 */

import React from 'react';

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-9 w-9 border-[3px]',
  lg: 'h-14 w-14 border-4',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const Loader = ({ size = 'md', text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10">
      <div
        className={`
          rounded-full
          border-gray-200 border-t-blue-600
          animate-spin
          ${sizeClasses[size] ?? sizeClasses.md}
        `.trim()}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className={`text-gray-400 font-medium ${textSizeClasses[size] ?? textSizeClasses.md}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;