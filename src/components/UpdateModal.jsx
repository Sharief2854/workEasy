import React from 'react';
import { Sparkles, Download, RefreshCw, CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function UpdateModal({
  isOpen,
  onClose,
  updaterStatus,
  onDownload,
  onInstall,
}) {
  if (!isOpen || !updaterStatus) return null;

  const isAvailable = updaterStatus.status === 'available';
  const isDownloading = updaterStatus.status === 'downloading';
  const isDownloaded = updaterStatus.status === 'downloaded';
  const isError = updaterStatus.status === 'error';

  // Only show for active update states
  if (!isAvailable && !isDownloading && !isDownloaded && !isError) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0c1017] border border-orange-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Heading */}
        <div className="flex items-center space-x-3.5 pt-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 text-orange-400 shadow-inner">
            {isDownloaded ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : isDownloading ? (
              <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
            ) : isError ? (
              <AlertCircle className="w-6 h-6 text-rose-400" />
            ) : (
              <Sparkles className="w-6 h-6 text-orange-400 animate-pulse" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                {isDownloaded
                  ? 'Update Ready to Install!'
                  : isDownloading
                  ? 'Downloading WorkEasy Update...'
                  : isError
                  ? 'Update Error'
                  : 'New Update Available!'}
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v{updaterStatus.version || 'Latest'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isDownloaded
                ? 'The new version is ready. Restart WorkEasy to apply.'
                : isDownloading
                ? 'Please wait while the update downloads in the background.'
                : isError
                ? updaterStatus.message || 'Could not complete the update.'
                : 'A newer, faster version of WorkEasy Pro is ready for you.'}
            </p>
          </div>
        </div>

        {/* Downloading Progress Bar */}
        {isDownloading && (
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-medium">Progress</span>
              <span className="font-mono text-orange-400 font-bold">{updaterStatus.percent || 0}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${updaterStatus.percent || 0}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 text-right">
              {updaterStatus.message || 'Downloading update package...'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end space-x-2.5">
          {isDownloaded ? (
            <button
              type="button"
              onClick={onInstall}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Restart & Install Now</span>
            </button>
          ) : isDownloading ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
            >
              Hide & Continue Working
            </button>
          ) : isError ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
            >
              Dismiss
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
              >
                Later
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center space-x-2 transform active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Update</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
