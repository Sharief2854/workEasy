import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Power,
  Code,
  Video,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowDownCircle,
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExport,
  onImport,
  onResetDefaults,
}) {
  const [appVersion, setAppVersion] = useState('1.2.0');
  const [updaterStatus, setUpdaterStatus] = useState({ status: 'idle', message: '' });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (window.workEasyApi?.getAppVersion) {
      window.workEasyApi.getAppVersion().then((v) => {
        if (v) setAppVersion(v);
      }).catch(() => {});
    }

    if (window.workEasyApi?.getUpdaterStatus) {
      window.workEasyApi.getUpdaterStatus().then((s) => {
        if (s && s.status !== 'idle') setUpdaterStatus(s);
      }).catch(() => {});
    }

    if (window.workEasyApi?.onUpdaterStatus) {
      const unsubscribe = window.workEasyApi.onUpdaterStatus((statusObj) => {
        setUpdaterStatus(statusObj);
        if (statusObj.status !== 'checking') {
          setIsChecking(false);
        }
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    setUpdaterStatus({ status: 'checking', message: 'Checking for updates on GitHub...' });
    try {
      const res = await window.workEasyApi?.checkForUpdates();
      if (res && res.status) {
        setUpdaterStatus(res);
      }
    } catch (err) {
      setUpdaterStatus({ status: 'error', message: err.message || 'Failed to check updates' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownloadUpdate = async () => {
    try {
      await window.workEasyApi?.downloadUpdate();
    } catch (err) {
      setUpdaterStatus({ status: 'error', message: err.message || 'Download failed' });
    }
  };

  const handleInstallUpdate = () => {
    if (window.workEasyApi?.quitAndInstallUpdate) {
      window.workEasyApi.quitAndInstallUpdate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c1017]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Application Settings</h2>
              <p className="text-[11px] text-slate-400">Manage launch behavior and workspace backups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5 bg-[#0f172a]">
          
          {/* Launch Behavior */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Launch Behavior
            </h3>

            {/* Auto Close Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-[#090d16] rounded-xl border border-slate-800">
              <div className="mr-3">
                <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Power className="w-3.5 h-3.5 text-orange-500" />
                  <span>Close WorkEasy After Launch</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically exit WorkEasy once all applications, folders, and web tabs are opened
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.closeOnLaunch !== false}
                onChange={(e) =>
                  onSaveSettings({ ...settings, closeOnLaunch: e.target.checked })
                }
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Workspace Persistence
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExport}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-[#090d16] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-orange-500" />
                <span>Export to JSON</span>
              </button>

              <button
                onClick={onImport}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-[#090d16] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>Import from JSON</span>
              </button>
            </div>

            <button
              onClick={onResetDefaults}
              className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-500 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Workspaces</span>
            </button>
          </div>

          {/* Browser Integrations */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Browser Integrations
            </h3>
            <div className="flex items-center justify-between p-3.5 bg-[#090d16] rounded-xl border border-slate-800">
              <div className="mr-3">
                <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-orange-500" />
                  <span>Google Meet Automation Extension</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enables 1-click auto-join for Google Meet calls
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.workEasyApi?.openExtensionFolder) {
                    window.workEasyApi.openExtensionFolder();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-semibold whitespace-nowrap transition-colors"
              >
                Open Folder
              </button>
            </div>
          </div>

          {/* Software Updates (GitHub Releases) */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Software Updates
            </h3>
            <div className="p-3.5 bg-[#090d16] rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="mr-3">
                  <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <RefreshCw className={`w-3.5 h-3.5 text-orange-500 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>GitHub Releases Auto-Update</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Installed: <strong className="text-slate-300 font-mono">v{appVersion}</strong> • Channel: <span className="text-orange-400 font-semibold">Sharief2854/workEasy</span>
                  </p>
                </div>

                {updaterStatus.status === 'downloaded' ? (
                  <button
                    type="button"
                    onClick={handleInstallUpdate}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Restart & Install</span>
                  </button>
                ) : updaterStatus.status === 'available' ? (
                  <button
                    type="button"
                    onClick={handleDownloadUpdate}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5" />
                    <span>Download v{updaterStatus.version}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isChecking}
                    onClick={handleCheckForUpdates}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>{isChecking ? 'Checking...' : 'Check Updates'}</span>
                  </button>
                )}
              </div>

              {/* Progress bar when downloading */}
              {updaterStatus.status === 'downloading' && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Downloading update...</span>
                    <span className="font-mono text-orange-400 font-bold">{updaterStatus.percent || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all duration-300 rounded-full"
                      style={{ width: `${updaterStatus.percent || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {updaterStatus.message && updaterStatus.status !== 'downloading' && (
                <div className={`text-[11px] px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                  updaterStatus.status === 'available' ? 'bg-orange-950/20 text-orange-400 border-orange-500/30 font-semibold' :
                  updaterStatus.status === 'downloaded' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30 font-semibold' :
                  updaterStatus.status === 'error' ? 'bg-rose-950/20 text-rose-400 border-rose-500/30' :
                  'bg-slate-900/60 text-slate-400 border-slate-800'
                }`}>
                  {updaterStatus.status === 'error' && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />}
                  {updaterStatus.status === 'downloaded' && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />}
                  <span className="truncate">{updaterStatus.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Developer Attribution Card (Solid, No Gradients) */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-orange-500/30 text-slate-300 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Code className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white">WorkEasy Pro Edition</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 font-semibold border border-orange-500/20">
                v{appVersion}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Developed by <strong className="text-orange-500 font-semibold">Sharief</strong>. Fast, one-click Windows developer workspace dispatcher.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0c1017] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
