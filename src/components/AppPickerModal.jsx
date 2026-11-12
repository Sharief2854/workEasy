import React, { useState, useEffect } from 'react';
import {
  Search,
  FolderOpen,
  Laptop,
  User,
  Globe,
  Mail,
  ChevronRight,
  Layout,
  BookOpen,
  FileText,
  Clock,
} from 'lucide-react';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { DynamicIcon } from '../utils/icons';

function OptionSubPicker({ isOpen, onClose, title, subtitle, icon, children }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      maxWidth="max-w-lg"
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Back to Apps
          </Button>
        </div>
      }
    >
      <div className="p-4 space-y-2">{children}</div>
    </Modal>
  );
}

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
  const [accountPickerApp, setAccountPickerApp] = useState(null);
  const [batchPickerApp, setBatchPickerApp] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setSearch('');
    setSelectedCategory('All');
    setAccountPickerApp(null);
    setBatchPickerApp(null);

    if (window.workEasyApi) {
      setLoading(true);
      Promise.all([
        window.workEasyApi.detectInstalledApps().catch(() => []),
        window.workEasyApi.getBrowserProfiles
          ? window.workEasyApi.getBrowserProfiles().catch(() => [])
          : Promise.resolve([]),
        window.workEasyApi.getThunderboardInfo
          ? window.workEasyApi.getThunderboardInfo().catch(() => null)
          : Promise.resolve(null),
      ])
        .then(([detected, profiles, tbInfo]) => {
          setApps(detected || []);
          setBrowserProfiles(profiles || []);
          setThunderboardInfo(tbInfo);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getProfilesForApp = (appName) => {
    const n = appName.toLowerCase();
    if (n.includes('chrome')) return browserProfiles.filter((p) => p.browser === 'chrome');
    if (n.includes('edge')) return browserProfiles.filter((p) => p.browser === 'edge');
    if (n.includes('brave')) return browserProfiles.filter((p) => p.browser === 'brave');
    return [];
  };

  const handleAppCardClick = (app) => {
    const isTb = app.isThunderboard || app.name?.toLowerCase().includes('thunderboard');
    if (isTb && thunderboardInfo?.batches?.length > 0) {
      setBatchPickerApp({ app, batches: thunderboardInfo.batches });
      return;
    }

    const profiles = getProfilesForApp(app.name);
    if (profiles.length > 0) {
      setAccountPickerApp({ app, profiles });
    } else {
      onSelectApp(app);
    }
  };

  const handleSelectProfile = (profile) => {
    if (!accountPickerApp) return;
    const { app } = accountPickerApp;

    if (!profile) {
      onSelectApp(app);
    } else {
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

  const handleSelectBatch = (batch) => {
    if (!batchPickerApp) return;
    const { app } = batchPickerApp;
    setBatchPickerApp(null);

    if (!batch) {
      onSelectApp({ ...app, isThunderboard: true });
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

  const hasDesktopApps = apps.some((a) => a.isDesktopApp);
  const categories = [
    'All',
    ...(hasDesktopApps ? ['Desktop Apps'] : []),
    ...new Set(apps.map((a) => a.category).filter(Boolean)),
  ];

  const filteredApps = apps.filter((app) => {
    const q = search.toLowerCase();
    const matchesSearch =
      app.name.toLowerCase().includes(q) ||
      (app.category && app.category.toLowerCase().includes(q));
    const matchesCat =
      selectedCategory === 'All' ||
      (selectedCategory === 'Desktop Apps' && app.isDesktopApp) ||
      app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Select Installed Application"
        subtitle={
          loading
            ? 'Scanning Desktop and Windows Start Menu apps...'
            : `${apps.length} applications detected on this PC`
        }
        maxWidth="max-w-3xl"
        icon={
          <div className="w-9 h-9 rounded-lg bg-brand-600/15 text-brand-400 border border-brand-500/20 flex items-center justify-center">
            <Laptop className="w-4 h-4" aria-hidden="true" />
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
            <span>{filteredApps.length} shown</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        }
      >
        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-surface-subtle sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <label htmlFor="we-app-search" className="sr-only">
                Search installed applications
              </label>
              <input
                id="we-app-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search apps (e.g. Chrome, VS Code, Eclipse, ThunderBoard)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={onBrowseCustomExe}
              className="flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-lg transition-colors whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
              <span>Browse File...</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="p-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              <p className="text-xs font-medium">Scanning installed applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching applications found for &ldquo;{search}&rdquo;. Use &ldquo;Browse File...&rdquo; to select an executable directly.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredApps.map((app) => {
                const profiles = getProfilesForApp(app.name);
                const hasProfiles = profiles.length > 0;

                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleAppCardClick(app)}
                    className="p-3 rounded-xl border bg-surface-subtle hover:border-brand-500/70 hover:bg-surface-elevated border-slate-800 text-left transition-colors flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-brand-400 flex-shrink-0">
                        <DynamicIcon name={app.icon || 'Laptop'} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-slate-100 group-hover:text-brand-300 truncate">
                          {app.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-400 truncate">{app.category}</span>
                          {app.isDesktopApp && <Badge variant="blue">Desktop</Badge>}
                          {hasProfiles && (
                            <Badge variant="emerald">{profiles.length} Profiles</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 group-hover:bg-brand-600 group-hover:text-white transition-colors flex-shrink-0">
                      {hasProfiles ? 'Select' : 'Add'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Browser Account Sub-Picker */}
      <OptionSubPicker
        isOpen={!!accountPickerApp}
        onClose={() => setAccountPickerApp(null)}
        title={`Select ${accountPickerApp?.app?.name || 'Browser'} Profile`}
        subtitle="Choose which browser account opens with this workspace"
        icon={
          <div className="w-8 h-8 rounded-lg bg-brand-600/15 text-brand-400 border border-brand-500/20 flex items-center justify-center">
            <Globe className="w-4 h-4" aria-hidden="true" />
          </div>
        }
      >
        <button
          type="button"
          onClick={() => handleSelectProfile(null)}
          className="w-full text-left p-3 rounded-xl border border-slate-800 bg-surface-subtle hover:border-brand-500/70 hover:bg-surface-elevated transition-colors flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-100 group-hover:text-brand-300">
                Default (Last Active Profile)
              </h4>
              <p className="text-xs text-slate-400 truncate">
                Uses whichever account was active most recently
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 flex-shrink-0" aria-hidden="true" />
        </button>

        {accountPickerApp?.profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            onClick={() => handleSelectProfile(profile)}
            className="w-full text-left p-3 rounded-xl border border-slate-800 bg-surface-subtle hover:border-brand-500/70 hover:bg-surface-elevated transition-colors flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                {profile.email ? <Mail className="w-4 h-4" aria-hidden="true" /> : <User className="w-4 h-4" aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-brand-300 truncate">
                  {profile.email || profile.name}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  Profile: {profile.name} ({profile.directory})
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-brand-600/20 text-brand-300 border border-brand-500/30 group-hover:bg-brand-600 group-hover:text-white transition-colors flex-shrink-0">
              Select
            </span>
          </button>
        ))}
      </OptionSubPicker>

      {/* ThunderBoard Batch Sub-Picker */}
      <OptionSubPicker
        isOpen={!!batchPickerApp}
        onClose={() => setBatchPickerApp(null)}
        title="Select ThunderBoard Batch"
        subtitle="Choose which classroom batch opens on launch"
        icon={
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Layout className="w-4 h-4" aria-hidden="true" />
          </div>
        }
      >
        <button
          type="button"
          onClick={() => handleSelectBatch(null)}
          className="w-full text-left p-3 rounded-xl border border-slate-800 bg-surface-subtle hover:border-brand-500/70 hover:bg-surface-elevated transition-colors flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-100 group-hover:text-brand-300">
                Default (Last Active Batch)
              </h4>
              <p className="text-xs text-slate-400 truncate">
                Opens the most recently active ThunderBoard batch
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 flex-shrink-0" aria-hidden="true" />
        </button>

        {batchPickerApp?.batches.map((batch) => (
          <button
            key={batch.id}
            type="button"
            onClick={() => handleSelectBatch(batch)}
            className="w-full text-left p-3 rounded-xl border border-slate-800 bg-surface-subtle hover:border-brand-500/70 hover:bg-surface-elevated transition-colors flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-white group-hover:text-brand-300 truncate">
                    {batch.name}
                  </h4>
                  {batch.isCurrentActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/25">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <FileText className="w-3 h-3" aria-hidden="true" />
                  <span>
                    {batch.pageCount} {batch.pageCount === 1 ? 'page' : 'pages'}
                  </span>
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-brand-600/20 text-brand-300 border border-brand-500/30 group-hover:bg-brand-600 group-hover:text-white transition-colors flex-shrink-0">
              Select
            </span>
          </button>
        ))}
      </OptionSubPicker>
    </>
  );
}
