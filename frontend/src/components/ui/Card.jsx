/**
 * Card Component
 * Reusable card container
 */

import React from 'react';

export const Card = ({
  children,
  header,
  footer,
  className = '',
  onClick,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
        transition-shadow duration-200
        ${hoverable ? 'cursor-pointer hover:shadow-md active:shadow-sm' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-800 text-sm">
          {header}
        </div>
      )}

      <div className="px-5 py-4">
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;