import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ dialog, onCancel }) {
  if (!dialog) return null;

  return (
    <Modal
      isOpen={!!dialog}
      onClose={onCancel}
      title={dialog.title}
      maxWidth="max-w-sm"
      icon={
        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={dialog.onConfirm}>
            {dialog.confirmLabel || 'Confirm'}
          </Button>
        </div>
      }
    >
      <div className="p-5">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{dialog.message}</p>
      </div>
    </Modal>
  );
}
