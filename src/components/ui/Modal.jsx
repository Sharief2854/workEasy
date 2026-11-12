import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

// Tracks stacked open modals so Escape and Tab trapping apply only to the topmost dialog.
const openModalStack = [];

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible, consistent dialog shell shared across all modals.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth = 'max-w-lg',
  accentColor,
  footer,
  children,
}) {
  const titleId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement;
    openModalStack.push(titleId);

    const handleKeyDown = (e) => {
      if (openModalStack[openModalStack.length - 1] !== titleId) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      const idx = openModalStack.lastIndexOf(titleId);
      if (idx !== -1) openModalStack.splice(idx, 1);

      if (previouslyFocused && typeof previouslyFocused.focus === 'function' && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose, titleId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={`relative w-full ${maxWidth} bg-surface-panel border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-modalIn`}
        style={accentColor ? { borderTop: `3px solid ${accentColor}` } : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-surface-subtle">
          <div className="flex items-center gap-3 min-w-0">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-sm sm:text-base font-semibold text-white truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-slate-800 bg-surface-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
