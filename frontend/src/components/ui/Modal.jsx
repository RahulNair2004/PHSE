/**
 * Modal Component
 * Display modal dialog
 */

import React, { useEffect } from 'react';

const sizeClasses = {
  sm: 'w-[320px]',
  md: 'w-[520px]',
  lg: 'w-[820px]',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl
          max-w-[90vw] max-h-[90vh] overflow-auto
          flex flex-col
          ${sizeClasses[size] ?? sizeClasses.md}
        `.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 leading-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="
              ml-4 p-1.5 rounded-lg text-gray-400
              hover:text-gray-600 hover:bg-gray-100
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 text-sm text-gray-700 leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;