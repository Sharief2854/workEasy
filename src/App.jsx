import React, { useState, useEffect } from 'react';
import { Plus, Star, Layers, LayoutGrid } from 'lucide-react';
import Header from './components/Header';
import TemplateCard from './components/TemplateCard';
import TemplateModal from './components/TemplateModal';
import SettingsModal from './components/SettingsModal';
import LaunchToast from './components/LaunchToast';
import UpdateModal from './components/UpdateModal';
import ConfirmDialog from './components/ui/ConfirmDialog';
import NoticeToast from './components/ui/NoticeToast';
import Button from './components/ui/Button';

export default function App() {
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState({
    theme: 'dark',
    closeOnLaunch: true,
    minimizeOnLaunch: false,
    globalStaggerMs: 500,
  });
  const [appVersion, setAppVersion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [updaterStatus, setUpdaterStatus] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState(null);
  const [noticeMessage, setNoticeMessage] = useState(null);

  const [launchingTemplateId, setLaunchingTemplateId] = useState(null);
  const [launchStatus, setLaunchStatus] = useState(null);

  const showNotice = (msg) => {
    setNoticeMessage(msg);
    setTimeout(() => {
      setNoticeMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Ctrl+K focuses search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('we-workspace-search');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial load and IPC listeners
  useEffect(() => {
    const api = window.workEasyApi;
    if (!api) return;

    api.getData?.().then((data) => {
      if (data?.templates) setTemplates(data.templates);
      if (data?.settings) setSettings(data.settings);
    }).catch(() => {});

    api.getAppVersion?.().then((v) => {
      if (v) setAppVersion(v);
    }).catch(() => {});

    const unsubscribeLaunch = api.onLaunchProgress?.((progress) => {
      setLaunchStatus((prev) => ({
        ...prev,
        active: true,
        current: progress.currentIndex,
        total: progress.total,
        currentItem: progress.item?.name,
        isComplete: false,
      }));
    });

    const unsubscribeUpdater = api.onUpdaterStatus?.((statusObj) => {
      setUpdaterStatus(statusObj);
      if (
        statusObj.status === 'available' ||
        statusObj.status === 'downloaded' ||
        statusObj.status === 'downloading'
      ) {
        setIsUpdateModalOpen(true);
      }
    });

    return () => {
      unsubscribeLaunch?.();
      unsubscribeUpdater?.();
    };
  }, []);

  const persistChanges = async (newTemplates, newSettings = settings) => {
    setTemplates(newTemplates);
    setSettings(newSettings);
    if (window.workEasyApi?.saveData) {
      await window.workEasyApi.saveData({
        templates: newTemplates,
        settings: newSettings,
      });
    }
  };

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
    } catch {
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
        setTimeout(() => setLaunchStatus(null), 4000);
      }
    }
  };

  const handleLaunchSingleItem = async (item) => {
    if (window.workEasyApi?.launchSingleItem) {
      await window.workEasyApi.launchSingleItem(item);
    }
  };

  const handleSaveTemplate = (templateData) => {
    const exists = templates.some((t) => t.id === templateData.id);
    const updated = exists
      ? templates.map((t) => (t.id === templateData.id ? templateData : t))
      : [templateData, ...templates];
    persistChanges(updated);
    showNotice(exists ? 'Workspace updated.' : 'Workspace created.');
  };

  const handleDuplicateTemplate = (template) => {
    const clone = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      favorite: false,
    };
    persistChanges([clone, ...templates]);
    showNotice('Workspace duplicated.');
  };

  const handleDeleteTemplate = (id) => {
    setConfirmDialog({
      title: 'Delete Workspace?',
      message: 'This workspace template will be permanently removed.',
      confirmLabel: 'Delete',
      onConfirm: () => {
        persistChanges(templates.filter((t) => t.id !== id));
        setConfirmDialog(null);
        showNotice('Workspace deleted.');
      },
    });
  };

  const handleToggleFavorite = (id) => {
    persistChanges(
      templates.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t))
    );
  };

  const handleExport = async () => {
    if (!window.workEasyApi?.exportTemplates) return;
    const res = await window.workEasyApi.exportTemplates();
    if (res.success) showNotice('Workspaces exported to JSON.');
  };

  const handleImport = async () => {
    if (!window.workEasyApi?.importTemplates) return;
    const res = await window.workEasyApi.importTemplates();
    if (res.success) {
      setTemplates(res.templates);
      showNotice(`Imported ${res.count} workspace(s).`);
    }
  };

  const handleResetDefaults = () => {
    setConfirmDialog({
      title: 'Reset to Default Workspaces?',
      message: 'This replaces your current list with the default workspace templates.',
      confirmLabel: 'Reset Defaults',
      onConfirm: () => {
        window.workEasyApi?.getData?.().then((data) => {
          if (data?.templates) persistChanges(data.templates);
        });
        setConfirmDialog(null);
        showNotice('Workspaces reset to defaults.');
      },
    });
  };

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
    <div className="min-h-screen bg-surface-canvas text-slate-100 flex flex-col">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateNew={() => {
          setEditingTemplate(null);
          setIsTemplateModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        appVersion={appVersion}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-7">
        <div className="flex items-baseline justify-between gap-4 border-b border-slate-800/80 pb-3">
          <h1 className="text-base sm:text-lg font-semibold text-white">Workspaces</h1>
          <span className="text-xs text-slate-400">
            {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
          </span>
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-14 px-4 bg-surface-panel border border-dashed border-slate-800 rounded-xl">
            <Layers className="w-9 h-9 text-slate-500 mx-auto mb-3" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-white">No Workspaces Found</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No templates matching "${searchQuery}".`
                : 'Create a workspace template to launch your apps, folders, and links together.'}
            </p>
            <Button
              variant="primary"
              size="md"
              className="mt-4"
              onClick={() => {
                setEditingTemplate(null);
                setIsTemplateModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Create Workspace</span>
            </Button>
          </div>
        )}

        {/* Pinned Workspaces */}
        {favoriteTemplates.length > 0 && (
          <section className="space-y-3" aria-label="Pinned workspaces">
            <h2 className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400" aria-hidden="true" />
              <span>Pinned ({favoriteTemplates.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
          <section className="space-y-3" aria-label="All workspaces">
            {favoriteTemplates.length > 0 && (
              <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                <span>All Templates ({regularTemplates.length})</span>
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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

      <footer className="mt-auto border-t border-slate-800/80 bg-surface-subtle px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            WorkEasy &middot; Developed by <strong className="text-slate-200 font-medium">Sharief</strong>
          </span>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="hover:text-white transition-colors"
          >
            Settings &amp; Updates
          </button>
        </div>
      </footer>

      {isTemplateModalOpen && (
        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          initialTemplate={editingTemplate}
          onSave={handleSaveTemplate}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onSaveSettings={(newSettings) => persistChanges(templates, newSettings)}
          onExport={handleExport}
          onImport={handleImport}
          onResetDefaults={handleResetDefaults}
        />
      )}

      <ConfirmDialog dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
      <NoticeToast message={noticeMessage} onClose={() => setNoticeMessage(null)} />
      <LaunchToast launchStatus={launchStatus} onClose={() => setLaunchStatus(null)} />

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updaterStatus={updaterStatus}
        onDownload={async () => {
          await window.workEasyApi?.downloadUpdate?.();
        }}
        onInstall={() => {
          window.workEasyApi?.quitAndInstallUpdate?.();
        }}
      />
    </div>
  );
}
