/**
 * Badge Component
 * Display status, tags, or labels
 */

import React from 'react';

const variantClasses = {
  default: 'bg-gray-100 text-gray-700 ring-gray-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
};

export const Badge = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2.5 py-0.5 rounded-full
        text-xs font-semibold tracking-wide
        ring-1 ring-inset
        ${variantClasses[variant] ?? variantClasses.default}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;