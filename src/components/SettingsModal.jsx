import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Power,
  Video,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowDownCircle,
} from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExport,
  onImport,
  onResetDefaults,
}) {
  const [appVersion, setAppVersion] = useState('1.3.0');
  const [updaterStatus, setUpdaterStatus] = useState({ status: 'idle', message: '' });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    window.workEasyApi?.getAppVersion?.().then((v) => {
      if (v) setAppVersion(v);
    }).catch(() => {});

    window.workEasyApi?.getUpdaterStatus?.().then((s) => {
      if (s && s.status !== 'idle') setUpdaterStatus(s);
    }).catch(() => {});

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
    setUpdaterStatus({ status: 'checking', message: 'Checking for updates...' });
    try {
      const res = await window.workEasyApi?.checkForUpdates();
      if (res?.status) {
        setUpdaterStatus(res);
      }
    } catch (err) {
      setUpdaterStatus({ status: 'error', message: err.message || 'Failed to check updates.' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownloadUpdate = async () => {
    try {
      await window.workEasyApi?.downloadUpdate();
    } catch (err) {
      setUpdaterStatus({ status: 'error', message: err.message || 'Download failed.' });
    }
  };

  const handleInstallUpdate = () => {
    window.workEasyApi?.quitAndInstallUpdate?.();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      subtitle={`WorkEasy v${appVersion} — Preferences & Backups`}
      maxWidth="max-w-lg"
      icon={
        <div className="w-9 h-9 rounded-lg bg-brand-600/15 text-brand-400 border border-brand-500/20 flex items-center justify-center">
          <Sliders className="w-4 h-4" aria-hidden="true" />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">Developed by Sharief</span>
          <Button variant="primary" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="p-5 space-y-6">
        {/* Launch Behavior */}
        <section className="space-y-2.5">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Launch Behavior
          </h3>
          <label
            htmlFor="we-close-on-launch"
            className="flex items-center justify-between gap-4 p-3.5 bg-surface-subtle rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
          >
            <div>
              <span className="text-xs sm:text-sm font-medium text-slate-100 flex items-center gap-2">
                <Power className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
                <span>Close WorkEasy after launch</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically exit once all configured tools and tabs are opened.
              </p>
            </div>
            <input
              id="we-close-on-launch"
              type="checkbox"
              checked={settings.closeOnLaunch !== false}
              onChange={(e) => onSaveSettings({ ...settings, closeOnLaunch: e.target.checked })}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-900 border-slate-700 cursor-pointer flex-shrink-0"
            />
          </label>
        </section>

        {/* Backup & Restore */}
        <section className="space-y-2.5">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace Data
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onExport}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-subtle hover:bg-surface-elevated border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <Download className="w-4 h-4 text-brand-400" aria-hidden="true" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={onImport}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-subtle hover:bg-surface-elevated border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <Upload className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Import JSON</span>
            </button>
          </div>

          <Button
            variant="dangerSubtle"
            size="md"
            className="w-full py-2.5"
            onClick={onResetDefaults}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset to Default Workspaces</span>
          </Button>
        </section>

        {/* Browser Integrations */}
        <section className="space-y-2.5">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Browser Integrations
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-surface-subtle rounded-xl border border-slate-800">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-100 flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" aria-hidden="true" />
                <span>Google Meet Extension</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Enables 1-click auto-join and mic/camera preset on Meet URLs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.workEasyApi?.openExtensionFolder?.()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium whitespace-nowrap transition-colors"
            >
              Open Folder
            </button>
          </div>
        </section>

        {/* Software Updates */}
        <section className="space-y-2.5">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Software Updates
          </h3>
          <div className="p-3.5 bg-surface-subtle rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-100">
                  Version v{appVersion}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Updates from GitHub Releases (Sharief2854/workEasy)
                </p>
              </div>

              {updaterStatus.status === 'downloaded' ? (
                <Button variant="success" size="sm" onClick={handleInstallUpdate}>
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Restart &amp; Install</span>
                </Button>
              ) : updaterStatus.status === 'available' ? (
                <Button variant="primary" size="sm" onClick={handleDownloadUpdate}>
                  <ArrowDownCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Download v{updaterStatus.version}</span>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isChecking}
                  onClick={handleCheckForUpdates}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <span>{isChecking ? 'Checking...' : 'Check for Updates'}</span>
                </Button>
              )}
            </div>

            {updaterStatus.status === 'downloading' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Downloading update...</span>
                  <span className="font-mono text-brand-400 font-semibold">
                    {updaterStatus.percent || 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all duration-300 rounded-full"
                    style={{ width: `${updaterStatus.percent || 0}%` }}
                  />
                </div>
              </div>
            )}

            {updaterStatus.message && updaterStatus.status !== 'downloading' && (
              <div
                className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${
                  updaterStatus.status === 'available'
                    ? 'bg-brand-950/30 text-brand-300 border-brand-500/30'
                    : updaterStatus.status === 'downloaded'
                    ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                    : updaterStatus.status === 'error'
                    ? 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {updaterStatus.status === 'error' && (
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" aria-hidden="true" />
                )}
                {updaterStatus.status === 'downloaded' && (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
                )}
                <span className="truncate">{updaterStatus.message}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}
