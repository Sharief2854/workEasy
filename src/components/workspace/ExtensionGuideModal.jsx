import React from 'react';
import { Video, FolderOpen } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ExtensionGuideModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Meet Chrome Extension"
      subtitle="Optional one-time setup for hands-free joining"
      maxWidth="max-w-lg"
      icon={
        <div className="w-8 h-8 rounded-lg bg-brand-600/15 text-brand-400 border border-brand-500/20 flex items-center justify-center">
          <Video className="w-4 h-4" aria-hidden="true" />
        </div>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.workEasyApi?.openExtensionFolder?.()}
          >
            <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Open Extension Folder</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="p-5 space-y-4">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          To let WorkEasy automatically mute your devices and click{' '}
          <strong className="text-white font-semibold">Join now</strong> in Google Meet, load the local helper extension in Chrome:
        </p>

        <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside bg-surface-subtle p-4 rounded-lg border border-slate-800">
          <li>
            Open{' '}
            <code className="text-brand-400 font-mono font-semibold select-all bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
              chrome://extensions
            </code>{' '}
            in Google Chrome.
          </li>
          <li>
            Enable <strong className="text-white">Developer mode</strong> in the top-right corner.
          </li>
          <li>
            Click <strong className="text-white">Load unpacked</strong> and select the{' '}
            <code className="text-slate-200 font-mono">workeasy-meet-helper</code> folder.
          </li>
        </ol>
      </div>
    </Modal>
  );
}
