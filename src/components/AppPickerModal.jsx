import React, { useState, useEffect } from 'react';
import { X, Search, FolderOpen, Laptop, Check, Sparkles, User, Globe, Mail, ChevronRight, Layout, BookOpen } from 'lucide-react';
import { DynamicIcon } from '../utils/icons';

export default function AppPickerModal({
  isOpen,
  onClose,
  onSelectApp,
  onBrowseCustomExe,
}) {
  const [apps, setApps] = useState([]);
  const [browserProfiles, setBrowserProfiles] = useState([]);
  const [thunderboardInfo, setThunderboardInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [accountPickerApp, setAccountPickerApp] = useState(null); // { app, profiles }
  const [batchPickerApp, setBatchPickerApp] = useState(null); // { app, batches }

  useEffect(() => {
    if (isOpen && window.workEasyApi) {
      setLoading(true);
      Promise.all([
        window.workEasyApi.detectInstalledApps().catch(() => []),
        window.workEasyApi.getBrowserProfiles ? window.workEasyApi.getBrowserProfiles().catch(() => []) : Promise.resolve([]),
        window.workEasyApi.getThunderboardInfo ? window.workEasyApi.getThunderboardInfo().catch(() => null) : Promise.resolve(null),
      ]).then(([detected, profiles, tbInfo]) => {
        setApps(detected || []);
        setBrowserProfiles(profiles || []);
        setThunderboardInfo(tbInfo);
        setLoading(false);
      }).catch((err) => {
        console.error('Failed to detect apps/profiles/thunderboard:', err);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get matching profiles for an app
  const getProfilesForApp = (appName) => {
    const n = appName.toLowerCase();
    if (n.includes('chrome')) {
      return browserProfiles.filter((p) => p.browser === 'chrome');
    }
    if (n.includes('edge')) {
      return browserProfiles.filter((p) => p.browser === 'edge');
    }
    if (n.includes('brave')) {
      return browserProfiles.filter((p) => p.browser === 'brave');
    }
    return [];
  };

  const handleAppCardClick = (app) => {
    // If ThunderBoard and batches exist, show Batch Picker
    const isTb = app.isThunderboard || app.name?.toLowerCase().includes('thunderboard');
    if (isTb && thunderboardInfo?.batches && thunderboardInfo.batches.length > 0) {
      setBatchPickerApp({ app, batches: thunderboardInfo.batches });
      return;
    }

    const profiles = getProfilesForApp(app.name);
    if (profiles && profiles.length > 0) {
      // Open account picker
      setAccountPickerApp({ app, profiles });
    } else {
      onSelectApp(app);
    }
  };

  const handleSelectBatch = (batch) => {
    if (!batchPickerApp) return;
    const { app } = batchPickerApp;
    setBatchPickerApp(null);

    if (!batch) {
      // Default / Last Active Batch
      onSelectApp({
        ...app,
        isThunderboard: true,
      });
    } else {
      onSelectApp({
        ...app,
        name: `ThunderBoard (${batch.name})`,
        isThunderboard: true,
        thunderboardBatchId: batch.id,
        thunderboardBatchName: batch.name,
      });
    }
  };

  const handleSelectProfile = (profile) => {
    if (!accountPickerApp) return;
    const { app } = accountPickerApp;

    if (!profile) {
      // Default profile
      onSelectApp(app);
    } else {
      // Specific Gmail / Profile account
      const displayName = profile.email 
        ? `${app.name} (${profile.email})` 
        : `${app.name} (${profile.name})`;

      onSelectApp({
        ...app,
        name: displayName,
        path: profile.exePath || app.path,
        profileDirectory: profile.directory,
        profileName: profile.name,
        profileEmail: profile.email,
        browser: profile.browser,
        browserExe: profile.exePath,
        args: `--profile-directory="${profile.directory}"`,
      });
    }

    setAccountPickerApp(null);
  };

  const categories = ['All', ...new Set(apps.map((a) => a.category).filter(Boolean))];

  const filteredApps = apps.filter((app) => {
    const q = search.toLowerCase();
    const matchesSearch = app.name.toLowerCase().includes(q) ||
                          (app.category && app.category.toLowerCase().includes(q));
    const matchesCat = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c1017]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Select Installed Application</h2>
                {!loading && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {apps.length} Apps Available
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">All Windows Store, Microsoft 365, Whiteboard, and desktop applications on your PC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Action Bar */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-[#090d16]">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search any app (e.g. Chrome, Whiteboard, VS Code, Compass, Teams)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                autoFocus
              />
            </div>

            <button
              onClick={onBrowseCustomExe}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-orange-500" />
              <span>Browse File...</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Software Grid */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 bg-[#0f172a]">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <div className="w-7 h-7 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-xs font-medium">Scanning all installed Windows apps...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching applications found for "{search}". Use "Browse File" to select any custom file or script on your disk.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredApps.map((app) => {
                const profiles = getProfilesForApp(app.name);
                const hasProfiles = profiles && profiles.length > 0;

                return (
                  <div
                    key={app.id}
                    onClick={() => handleAppCardClick(app)}
                    className="p-3 rounded-xl border bg-[#090d16] hover:border-orange-500 border-slate-800 text-slate-200 shadow-sm cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5 truncate flex-1 mr-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-orange-500 flex-shrink-0 group-hover:bg-orange-500/10 transition-colors">
                        <DynamicIcon name={app.icon || 'Laptop'} className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-slate-200 group-hover:text-orange-400 truncate transition-colors">
                          {app.name}
                        </h4>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <p className="text-[10px] text-slate-400 truncate">{app.category}</p>
                          {hasProfiles && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                              {profiles.length} Accounts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-800 text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      {hasProfiles ? 'Select' : 'Add'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0c1017] flex items-center justify-between text-[11px] text-slate-400">
          <span>{filteredApps.length} apps shown. Click any app to add it instantly to your workspace.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Account / Profile Selection Sub-Modal */}
        {accountPickerApp && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
            <div className="w-full max-w-lg bg-[#0c1017] border border-orange-500/30 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90%]">
              
              <div className="flex items-start justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-500" />
                    <span>Select {accountPickerApp.app.name} Account / Profile</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose which specific Google / browser account this workspace should open:
                  </p>
                </div>
                <button
                  onClick={() => setAccountPickerApp(null)}
                  className="p-1 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profiles List */}
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                {/* Default Option */}
                <div
                  onClick={() => handleSelectProfile(null)}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-orange-500 hover:bg-orange-500/5 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center group-hover:text-orange-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-orange-400">Default (Last Active Profile)</h4>
                      <p className="text-[11px] text-slate-400">Opens {accountPickerApp.app.name} in whatever account was last active</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-transform group-hover:translate-x-0.5" />
                </div>

                {/* Specific Accounts */}
                {accountPickerApp.profiles.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile)}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-orange-500 hover:bg-orange-500/5 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 truncate flex-1 mr-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                        {profile.email ? <Mail className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-white group-hover:text-orange-400 truncate">
                            {profile.email || profile.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          Profile: <strong className="text-slate-300 font-semibold">{profile.name}</strong> • Directory: <code className="text-slate-500 text-[10px]">{profile.directory}</code>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-1 rounded-lg font-bold bg-orange-600/20 text-orange-400 border border-orange-500/30 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      Use Account
                    </span>
                  </div>
                ))}
              </div>

              {/* Account Picker Footer */}
              <div className="pt-4 border-t border-slate-800 mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setAccountPickerApp(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Back to Apps
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ThunderBoard Classroom Batch Picker Submodal */}
        {batchPickerApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-[#0c1017] border border-orange-500/40 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
              
              <div className="flex items-start justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layout className="w-4 h-4 text-orange-500" />
                    <span>Select Classroom Batch for ThunderBoard v3</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose which classroom batch canvas & notes should open on launch:
                  </p>
                </div>
                <button
                  onClick={() => setBatchPickerApp(null)}
                  className="p-1 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Batches List */}
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                {/* Default Option */}
                <div
                  onClick={() => handleSelectBatch(null)}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-orange-500 hover:bg-orange-500/5 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center group-hover:text-orange-400">
                      <Layout className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-orange-400">Default (Last Active Batch)</h4>
                      <p className="text-[11px] text-slate-400">Opens ThunderBoard in whatever batch was last active</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-transform group-hover:translate-x-0.5" />
                </div>

                {/* Specific Batches */}
                {batchPickerApp.batches.map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => handleSelectBatch(batch)}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-orange-500 hover:bg-orange-500/5 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 truncate flex-1 mr-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-white group-hover:text-orange-400 truncate">
                            {batch.name}
                          </h4>
                          {batch.isCurrentActive && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          📄 <strong className="text-slate-300 font-semibold">{batch.pageCount} {batch.pageCount === 1 ? 'page' : 'pages'}</strong> of whiteboard notes
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-1 rounded-lg font-bold bg-orange-600/20 text-orange-400 border border-orange-500/30 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      Select Batch
                    </span>
                  </div>
                ))}
              </div>

              {/* Batch Picker Footer */}
              <div className="pt-4 border-t border-slate-800 mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setBatchPickerApp(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Back to Apps
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
