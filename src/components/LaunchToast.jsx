import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, X, Power } from 'lucide-react';

export default function LaunchToast({ launchStatus, onClose }) {
  if (!launchStatus) return null;

  const { active, templateName, currentItem, total, current, isComplete, hasErrors, errorCount, willClose } =
    launchStatus;

  const progressPercent = total > 0 ? Math.min(100, Math.round(((current + 1) / total) * 100)) : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slideUp">
      <div className="bg-[#0f172a] dark:bg-[#0f172a] light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 shadow-2xl rounded-2xl p-4 text-slate-100 dark:text-slate-100 light:text-slate-900 ring-1 ring-black/10">
        
        {/* Status Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            {isComplete ? (
              hasErrors ? (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )
            ) : (
              <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
            )}
            <h4 className="text-xs font-bold text-white dark:text-white light:text-slate-900 tracking-wide">
              {isComplete
                ? hasErrors
                  ? `Completed with ${errorCount} warning(s)`
                  : (willClose ? 'Workspace Launched! Closing WorkEasy...' : 'Workspace Ready!')
                : `Dispatching: ${templateName}`}
            </h4>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 p-1 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 dark:bg-slate-900 light:bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2 border border-slate-800 dark:border-slate-800 light:border-slate-300">
          <div
            className={`h-full transition-all duration-300 ${
              isComplete
                ? hasErrors
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${isComplete ? 100 : progressPercent}%` }}
          />
        </div>

        {/* Status Text */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium">
          <span className="truncate flex-1 mr-2">
            {isComplete
              ? (willClose ? 'Exiting application...' : 'All tools and web tabs opened.')
              : `Opening: ${currentItem || 'Initializing...'}`}
          </span>
          <span className="font-mono text-[10px] text-slate-300 dark:text-slate-300 light:text-slate-700 font-bold bg-slate-800 dark:bg-slate-800 light:bg-slate-200 px-1.5 py-0.5 rounded">
            {isComplete ? `${total}/${total}` : `${Math.min(current + 1, total)}/${total}`}
          </span>
        </div>
      </div>
    </div>
  );
}
