import React from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Power,
  Code,
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
                v1.1.0
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
