import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

export default function LaunchToast({ launchStatus, onClose }) {
  if (!launchStatus) return null;

  const { templateName, currentItem, total, current, isComplete, hasErrors, errorCount, willClose } =
    launchStatus;

  const progressPercent = total > 0 ? Math.min(100, Math.round(((current + 1) / total) * 100)) : 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 sm:w-96 animate-toastIn"
    >
      <div className="bg-surface-panel border border-slate-700 shadow-2xl rounded-xl p-4 text-slate-100">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {isComplete ? (
              hasErrors ? (
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
              )
            ) : (
              <Loader2 className="w-4 h-4 text-brand-400 animate-spin flex-shrink-0" aria-hidden="true" />
            )}
            <h4 className="text-xs font-semibold text-white truncate">
              {isComplete
                ? hasErrors
                  ? `Completed with ${errorCount} warning(s)`
                  : willClose
                  ? 'Workspace launched — exiting...'
                  : 'Workspace ready'
                : `Dispatching: ${templateName}`}
            </h4>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close launch status"
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden mb-2 border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              isComplete ? (hasErrors ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-brand-500'
            }`}
            style={{ width: `${isComplete ? 100 : progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
          <span className="truncate">
            {isComplete
              ? willClose
                ? 'Closing WorkEasy...'
                : 'All configured items opened.'
              : `Opening: ${currentItem || 'Initializing...'}`}
          </span>
          <span className="font-mono text-[11px] text-slate-300 font-semibold bg-slate-800 px-1.5 py-0.5 rounded flex-shrink-0">
            {isComplete ? `${total}/${total}` : `${Math.min(current + 1, total)}/${total}`}
          </span>
        </div>
      </div>
    </div>
  );
}
