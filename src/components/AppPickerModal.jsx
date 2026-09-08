import React, { useState, useEffect } from 'react';
import { X, Search, Check, FolderOpen, Laptop } from 'lucide-react';
import { DynamicIcon } from '../utils/icons';

export default function AppPickerModal({
  isOpen,
  onClose,
  onSelectApp,
  onBrowseCustomExe,
}) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (isOpen && window.workEasyApi) {
      setLoading(true);
      window.workEasyApi.detectInstalledApps().then((detected) => {
        setApps(detected || []);
        setLoading(false);
      }).catch((err) => {
        console.error('Failed to detect apps:', err);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['All', ...new Set(apps.map((a) => a.category))];

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                          app.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0f172a] dark:bg-[#0f172a] light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 bg-[#0c1017] dark:bg-[#0c1017] light:bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900">Select Application</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">Choose from detected development software or browse any executable</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Action Bar */}
        <div className="p-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-3 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search detected applications..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl text-xs text-slate-200 dark:text-slate-200 light:text-slate-800 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={onBrowseCustomExe}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 font-semibold text-xs rounded-xl transition-all whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-orange-500" />
              <span>Browse .exe...</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Software Grid */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 bg-[#0f172a] dark:bg-[#0f172a] light:bg-white">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-2" />
              <p className="text-xs">Scanning Windows programs...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching applications found. Click "Browse .exe" to select any application executable on your disk.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    app.installed
                      ? 'bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50 hover:border-orange-500 border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-800 shadow-sm'
                      : 'bg-[#090d16]/30 dark:bg-[#090d16]/30 light:bg-slate-100 border-slate-800/40 text-slate-400 dark:text-slate-400 light:text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-800 light:bg-slate-200 flex items-center justify-center text-orange-500">
                      <DynamicIcon name={app.icon || 'Laptop'} className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-slate-200 dark:text-slate-200 light:text-slate-900 truncate">{app.name}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500">{app.category}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    app.installed
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-500'
                  }`}>
                    {app.installed ? 'Detected' : 'Custom'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 bg-[#0c1017] dark:bg-[#0c1017] light:bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Supports `.exe`, `.lnk`, `.bat`, and `.ps1` files.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 text-slate-200 dark:text-slate-200 light:text-slate-800 font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
