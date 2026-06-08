/**
 * Button Component
 * Reusable button with different variants and states
 */

import React from 'react';

const variantClasses = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700 focus-visible:ring-gray-400',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
  success:   'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 focus-visible:ring-emerald-400',
  outline:   'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-400',
  ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2.5',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-150 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        select-none
        ${variantClasses[variant] ?? variantClasses.primary}
        ${sizeClasses[size] ?? sizeClasses.md}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `.trim()}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;