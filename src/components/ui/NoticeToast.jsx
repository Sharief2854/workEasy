import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function NoticeToast({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-5 sm:right-5 z-50 sm:max-w-sm animate-toastIn"
    >
      <div className="px-4 py-3 rounded-xl bg-surface-panel border border-emerald-500/30 text-slate-100 text-xs font-medium shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{message}</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
