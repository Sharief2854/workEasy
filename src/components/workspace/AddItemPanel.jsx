import React from 'react';
import { Code2, FolderOpen, Video, HelpCircle, Zap, MicOff, CameraOff } from 'lucide-react';
import Button from '../ui/Button';

export default function AddItemPanel({
  activeAddTab,
  onCloseTab,
  onBrowseFolder,
  // URL state
  newUrl,
  onNewUrlChange,
  newUrlName,
  onNewUrlNameChange,
  newUrlProfileId,
  onNewUrlProfileIdChange,
  browserProfiles,
  meetAutoJoin,
  onMeetAutoJoinChange,
  meetMuteMic,
  onMeetMuteMicChange,
  meetMuteCam,
  onMeetMuteCamChange,
  onOpenExtensionGuide,
  onAddUrl,
  // Command state
  newCommand,
  onNewCommandChange,
  newCommandName,
  onNewCommandNameChange,
  newCommandCwd,
  onNewCommandCwdChange,
  onAddCommand,
}) {
  if (!activeAddTab) return null;

  if (activeAddTab === 'folder') {
    return (
      <div className="p-4 mb-3 bg-surface-subtle border border-amber-500/30 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Select Project Directory
          </h4>
          <button
            type="button"
            onClick={onCloseTab}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Button variant="primary" size="md" onClick={() => onBrowseFolder('vscode')}>
            <Code2 className="w-4 h-4" aria-hidden="true" />
            <span>Open in VS Code</span>
          </Button>
          <Button variant="secondary" size="md" onClick={() => onBrowseFolder('explorer')}>
            <FolderOpen className="w-4 h-4" aria-hidden="true" />
            <span>Open in File Explorer</span>
          </Button>
        </div>
      </div>
    );
  }

  if (activeAddTab === 'url') {
    const isMeetUrl = newUrl.toLowerCase().includes('meet.google.com');

    return (
      <form
        onSubmit={onAddUrl}
        className="p-4 mb-3 bg-surface-subtle border border-emerald-500/30 rounded-xl space-y-3"
      >
        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          Add Web URL
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="we-new-url" className="sr-only">
              Website URL
            </label>
            <input
              id="we-new-url"
              type="text"
              value={newUrl}
              onChange={(e) => onNewUrlChange(e.target.value)}
              placeholder="URL (e.g. https://meet.google.com/... or localhost:3000)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="we-new-url-name" className="sr-only">
              URL Label
            </label>
            <input
              id="we-new-url-name"
              type="text"
              value={newUrlName}
              onChange={(e) => onNewUrlNameChange(e.target.value)}
              placeholder="Label (e.g. Daily Standup, Docs)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {browserProfiles.length > 0 && (
          <div>
            <label
              htmlFor="we-url-profile"
              className="block text-[11px] font-medium text-slate-400 mb-1"
            >
              Browser Account / Profile (Optional)
            </label>
            <select
              id="we-url-profile"
              value={newUrlProfileId}
              onChange={(e) => onNewUrlProfileIdChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="">System Default Browser</option>
              {browserProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {isMeetUrl && (
          <div className="p-3 bg-surface-panel border border-brand-500/30 rounded-lg space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-brand-400 font-semibold text-xs">
                <Video className="w-4 h-4" aria-hidden="true" />
                <span>Google Meet Options</span>
              </div>
              <button
                type="button"
                onClick={onOpenExtensionGuide}
                className="text-xs text-slate-300 hover:text-brand-400 underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Extension Setup</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-surface-subtle border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={meetAutoJoin}
                  onChange={(e) => onMeetAutoJoinChange(e.target.checked)}
                  className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-slate-800"
                />
                <Zap className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-slate-200 text-xs font-medium">Auto-Join</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-surface-subtle border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={meetMuteMic}
                  onChange={(e) => onMeetMuteMicChange(e.target.checked)}
                  className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-slate-800"
                />
                <MicOff className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-slate-300 text-xs">Mute Mic</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-surface-subtle border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={meetMuteCam}
                  onChange={(e) => onMeetMuteCamChange(e.target.checked)}
                  className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-slate-800"
                />
                <CameraOff className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-slate-300 text-xs">Camera Off</span>
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCloseTab}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!newUrl.trim()}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
          >
            Add URL
          </button>
        </div>
      </form>
    );
  }

  if (activeAddTab === 'command') {
    return (
      <form
        onSubmit={onAddCommand}
        className="p-4 mb-3 bg-surface-subtle border border-purple-500/30 rounded-xl space-y-3"
      >
        <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
          Add Terminal Script
        </h4>
        <div className="space-y-2.5">
          <div>
            <label htmlFor="we-new-cmd" className="sr-only">
              Terminal Command
            </label>
            <input
              id="we-new-cmd"
              type="text"
              value={newCommand}
              onChange={(e) => onNewCommandChange(e.target.value)}
              placeholder="Command (e.g. npm run dev, docker compose up)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="we-new-cmd-name" className="sr-only">
                Script Label
              </label>
              <input
                id="we-new-cmd-name"
                type="text"
                value={newCommandName}
                onChange={(e) => onNewCommandNameChange(e.target.value)}
                placeholder="Label (e.g. Start Dev Server)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label htmlFor="we-new-cmd-cwd" className="sr-only">
                Working Directory
              </label>
              <input
                id="we-new-cmd-cwd"
                type="text"
                value={newCommandCwd}
                onChange={(e) => onNewCommandCwdChange(e.target.value)}
                placeholder="Working Directory (optional)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCloseTab}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!newCommand.trim()}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
          >
            Add Script
          </button>
        </div>
      </form>
    );
  }

  return null;
}
