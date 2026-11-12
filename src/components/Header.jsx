import React from 'react';
import { Plus, Search, Settings, Layers } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';

export default function Header({
  searchQuery,
  setSearchQuery,
  onCreateNew,
  onOpenSettings,
  appVersion,
}) {
  return (
    <header className="sticky top-0 z-30 bg-surface-canvas/95 backdrop-blur-sm border-b border-slate-800 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
        {/* Brand */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-white" aria-hidden="true" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">WorkEasy</span>
                {appVersion && (
                  <Badge variant="neutral" className="font-mono">
                    v{appVersion}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">Workspace &amp; Tool Launcher</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open application settings"
            className="md:hidden p-2 bg-surface-panel hover:bg-surface-elevated border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Search & Primary Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto md:flex-1 md:max-w-lg md:justify-end">
          <div className="relative flex-1 min-w-0">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="we-workspace-search" className="sr-only">
              Search workspaces
            </label>
            <input
              id="we-workspace-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces..."
              className="w-full pl-9 pr-14 py-2 bg-surface-panel border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
            <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700 pointer-events-none">
              Ctrl K
            </kbd>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onCreateNew}
            className="whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>New Workspace</span>
          </Button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open application settings"
            title="Settings"
            className="hidden md:inline-flex p-2.5 bg-surface-panel hover:bg-surface-elevated border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex-shrink-0"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
