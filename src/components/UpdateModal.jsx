import React from 'react';
import { Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';

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

  if (!isAvailable && !isDownloading && !isDownloaded && !isError) return null;

  const title = isDownloaded
    ? 'Update Ready to Install'
    : isDownloading
    ? 'Downloading Update'
    : isError
    ? 'Update Error'
    : 'Update Available';

  const subtitle = isDownloaded
    ? 'Restart WorkEasy to apply the new version.'
    : isDownloading
    ? 'Downloading in the background...'
    : isError
    ? updaterStatus.message || 'Could not complete the update.'
    : `WorkEasy v${updaterStatus.version || 'latest'} is ready to download.`;

  const statusIcon = (
    <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-slate-700 flex items-center justify-center">
      {isDownloaded ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
      ) : isDownloading ? (
        <RefreshCw className="w-5 h-5 text-brand-400 animate-spin" aria-hidden="true" />
      ) : isError ? (
        <AlertCircle className="w-5 h-5 text-rose-400" aria-hidden="true" />
      ) : (
        <Download className="w-5 h-5 text-brand-400" aria-hidden="true" />
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={statusIcon}
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          {isDownloaded ? (
            <Button variant="success" size="sm" className="w-full py-2" onClick={onInstall}>
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Restart &amp; Install Now</span>
            </Button>
          ) : isDownloading ? (
            <Button variant="secondary" size="sm" onClick={onClose}>
              Hide
            </Button>
          ) : isError ? (
            <Button variant="secondary" size="sm" onClick={onClose}>
              Dismiss
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Later
              </Button>
              <Button variant="primary" size="sm" onClick={onDownload}>
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Download v{updaterStatus.version || 'Latest'}</span>
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="p-5 space-y-3">
        {isDownloading ? (
          <div className="p-3.5 bg-surface-subtle rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Progress</span>
              <span className="font-mono text-brand-400 font-semibold">
                {updaterStatus.percent || 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-300 rounded-full"
                style={{ width: `${updaterStatus.percent || 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {updaterStatus.message || 'Downloading installer...'}
            </p>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isDownloaded
              ? 'The installer has finished downloading. Restart WorkEasy now to complete the update.'
              : isError
              ? 'Check your internet connection or verify that the release assets are published on GitHub.'
              : 'A newer release is available on GitHub Releases. Download it now or update later from Settings.'}
          </p>
        )}
      </div>
    </Modal>
  );
}
