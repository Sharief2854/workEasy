import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TemplateCard from './components/TemplateCard';
import TemplateModal from './components/TemplateModal';
import SettingsModal from './components/SettingsModal';
import LaunchToast from './components/LaunchToast';
import {
  Plus,
  Star,
  Layers,
  LayoutGrid,
  Sparkles,
  X,
} from 'lucide-react';

export default function App() {
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState({
    theme: 'dark',
    closeOnLaunch: true,
    minimizeOnLaunch: false,
    globalStaggerMs: 500,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(true);

  const [launchingTemplateId, setLaunchingTemplateId] = useState(null);
  const [launchStatus, setLaunchStatus] = useState(null);

  // Enforce dark mode permanently
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  // Keyboard shortcut for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load data on startup
  useEffect(() => {
    if (window.workEasyApi) {
      window.workEasyApi.getData().then((data) => {
        if (data) {
          if (data.templates) setTemplates(data.templates);
          if (data.settings) setSettings(data.settings);
        }
      });

      // Register real-time launch progress listener
      const unsubscribe = window.workEasyApi.onLaunchProgress((progress) => {
        setLaunchStatus((prev) => ({
          ...prev,
          active: true,
          current: progress.currentIndex,
          total: progress.total,
          currentItem: progress.item?.name,
          isComplete: false,
        }));
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, []);

  // Save changes helper
  const persistChanges = async (newTemplates, newSettings = settings) => {
    setTemplates(newTemplates);
    setSettings(newSettings);
    if (window.workEasyApi) {
      await window.workEasyApi.saveData({
        templates: newTemplates,
        settings: newSettings,
      });
    }
  };

  // Launch entire template
  const handleLaunch = async (template) => {
    if (!template || launchingTemplateId) return;

    const willClose = settings.closeOnLaunch !== false;
    setLaunchingTemplateId(template.id);
    setLaunchStatus({
      active: true,
      templateName: template.name,
      current: 0,
      total: (template.items || []).filter((i) => i.enabled !== false).length,
      currentItem: 'Opening tools...',
      isComplete: false,
      hasErrors: false,
      errorCount: 0,
      willClose,
    });

    try {
      if (window.workEasyApi) {
        const result = await window.workEasyApi.launchTemplate(template, {
          minimizeOnLaunch: settings.minimizeOnLaunch,
          staggerDelayMs: template.staggerDelayMs,
        });

        const errors = (result.results || []).filter((r) => !r.success && !r.skipped);

        setLaunchStatus((prev) => ({
          ...prev,
          isComplete: true,
          hasErrors: errors.length > 0,
          errorCount: errors.length,
          willClose,
        }));

        // If Close on Launch is enabled, exit WorkEasy after launching
        if (willClose) {
          setTimeout(async () => {
            if (window.workEasyApi.quitApp) {
              await window.workEasyApi.quitApp();
            } else {
              await window.workEasyApi.closeWindow();
            }
          }, 800);
        }
      }
    } catch (err) {
      console.error('Workspace launch error:', err);
      setLaunchStatus((prev) => ({
        ...prev,
        isComplete: true,
        hasErrors: true,
        errorCount: 1,
        willClose: false,
      }));
    } finally {
      setLaunchingTemplateId(null);
      if (!willClose) {
        setTimeout(() => {
          setLaunchStatus(null);
        }, 4000);
      }
    }
  };

  // Launch single individual item
  const handleLaunchSingleItem = async (item) => {
    if (window.workEasyApi) {
      await window.workEasyApi.launchSingleItem(item);
    }
  };

  // Save or update template
  const handleSaveTemplate = (templateData) => {
    let updated;
    const exists = templates.some((t) => t.id === templateData.id);
    if (exists) {
      updated = templates.map((t) => (t.id === templateData.id ? templateData : t));
    } else {
      updated = [templateData, ...templates];
    }
    persistChanges(updated);
  };

  // Duplicate template
  const handleDuplicateTemplate = (template) => {
    const clone = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      favorite: false,
    };
    persistChanges([clone, ...templates]);
  };

  // Delete template
  const handleDeleteTemplate = (id) => {
    if (confirm('Delete this workspace template?')) {
      const updated = templates.filter((t) => t.id !== id);
      persistChanges(updated);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (id) => {
    const updated = templates.map((t) =>
      t.id === id ? { ...t, favorite: !t.favorite } : t
    );
    persistChanges(updated);
  };

  // Export
  const handleExport = async () => {
    if (window.workEasyApi) {
      const res = await window.workEasyApi.exportTemplates();
      if (res.success) {
        alert('Workspace templates exported successfully!');
      }
    }
  };

  // Import
  const handleImport = async () => {
    if (window.workEasyApi) {
      const res = await window.workEasyApi.importTemplates();
      if (res.success) {
        setTemplates(res.templates);
        alert(`Successfully imported ${res.count} workspace templates!`);
      }
    }
  };

  // Reset defaults
  const handleResetDefaults = () => {
    if (confirm('Reset to default templates?')) {
      if (window.workEasyApi) {
        window.workEasyApi.getData().then((data) => {
          persistChanges(data.templates);
        });
      }
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const q = searchQuery.toLowerCase();
    const matchesName = tpl.name?.toLowerCase().includes(q);
    const matchesDesc = tpl.description?.toLowerCase().includes(q);
    const matchesItem = (tpl.items || []).some(
      (item) => item.name?.toLowerCase().includes(q) || item.path?.toLowerCase().includes(q)
    );
    return matchesName || matchesDesc || matchesItem;
  });

  const favoriteTemplates = filteredTemplates.filter((t) => t.favorite);
  const regularTemplates = filteredTemplates.filter((t) => !t.favorite);

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateNew={() => {
          setEditingTemplate(null);
          setIsTemplateModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        templateCount={templates.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-7">

        {/* v1.2.0 Update Announcement Banner */}
        {showUpdateBanner && (
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-950/40 via-[#151c28] to-slate-900 border border-orange-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 transition-all">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>WorkEasy Pro v1.2.0 is Live!</span>
                  </h4>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Auto-Updated</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Refreshed UI theme with top gradient highlights, ThunderBoard v3 classroom batch selector, and 1-click GitHub auto-updates.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowUpdateBanner(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16 px-4 bg-[#111722]/50 border border-dashed border-slate-800 rounded-3xl">
            <Layers className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No Workspaces Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No templates matching "${searchQuery}".`
                : 'Click "New Workspace" to configure your first development setup.'}
            </p>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setIsTemplateModalOpen(true);
              }}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Workspace</span>
            </button>
          </div>
        )}

        {/* Starred Workspaces */}
        {favoriteTemplates.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-500 uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>Pinned Workspaces ({favoriteTemplates.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {favoriteTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isLaunching={launchingTemplateId === template.id}
                  onLaunch={handleLaunch}
                  onEdit={(t) => {
                    setEditingTemplate(t);
                    setIsTemplateModalOpen(true);
                  }}
                  onDuplicate={handleDuplicateTemplate}
                  onDelete={handleDeleteTemplate}
                  onToggleFavorite={handleToggleFavorite}
                  onLaunchSingleItem={handleLaunchSingleItem}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Workspaces */}
        {regularTemplates.length > 0 && (
          <section className="space-y-3">
            {favoriteTemplates.length > 0 && (
              <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Templates ({regularTemplates.length})</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {regularTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isLaunching={launchingTemplateId === template.id}
                  onLaunch={handleLaunch}
                  onEdit={(t) => {
                    setEditingTemplate(t);
                    setIsTemplateModalOpen(true);
                  }}
                  onDuplicate={handleDuplicateTemplate}
                  onDelete={handleDeleteTemplate}
                  onToggleFavorite={handleToggleFavorite}
                  onLaunchSingleItem={handleLaunchSingleItem}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Solid Clean Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#080c14] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">WorkEasy Pro</span>
            <span>•</span>
            <span>Developed by <strong className="text-orange-500 font-semibold">Sharief</strong></span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Windows Native Process Bridge Active
            </span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        initialTemplate={editingTemplate}
        onSave={handleSaveTemplate}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => persistChanges(templates, newSettings)}
        onExport={handleExport}
        onImport={handleImport}
        onResetDefaults={handleResetDefaults}
      />

      {/* Floating HUD Launch Toast */}
      <LaunchToast
        launchStatus={launchStatus}
        onClose={() => setLaunchStatus(null)}
      />
    </div>
  );
}
