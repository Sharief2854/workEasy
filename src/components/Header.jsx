import React from 'react';
import { Plus, Search, Settings, Layers } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  onCreateNew,
  onOpenSettings,
  templateCount,
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#0c1017] border-b border-slate-800/90 px-6 py-3.5 relative">
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-400" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Developer Information */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-600/20 border border-orange-400/30">
            <Layers className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                WorkEasy <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">PRO</span>
              </span>

              {/* v1.2.0 Version Pill with Pulsing Live Dot */}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>v1.2.0</span>
              </span>
              
              {/* Developer Attribution Tag */}
              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-medium text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>By <strong className="text-orange-400 font-semibold">Sharief</strong></span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              1-Click Workspace & Tool Dispatcher
            </p>
          </div>
        </div>

        {/* Search & Action Controls */}
        <div className="flex items-center space-x-3 flex-1 max-w-lg md:justify-end">
          
          {/* Quick Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces... (Ctrl + K)"
              className="w-full pl-9 pr-12 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium transition-colors"
            />
            <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
              Ctrl K
            </kbd>
          </div>

          {/* New Workspace Button */}
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all transform active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workspace</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
