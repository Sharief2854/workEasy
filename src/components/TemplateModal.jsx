import React, { useState, useEffect, useRef } from 'react';
import { Laptop, Folder, Globe, Terminal, Clock, Palette } from 'lucide-react';
import { AVAILABLE_ICONS, DynamicIcon } from '../utils/icons';
import Modal from './ui/Modal';
import Button from './ui/Button';
import AppPickerModal from './AppPickerModal';
import AddItemPanel from './workspace/AddItemPanel';
import ConfiguredItemRow from './workspace/ConfiguredItemRow';
import ExtensionGuideModal from './workspace/ExtensionGuideModal';

const PRESET_COLORS = [
  '#ea580c',
  '#f97316',
  '#3b82f6',
  '#10b981',
  '#6366f1',
  '#84cc16',
  '#06b6d4',
  '#ef4444',
  '#ec4899',
  '#a855f7',
];

export default function TemplateModal({
  isOpen,
  onClose,
  onSave,
  initialTemplate = null,
}) {
  const isEditing = !!initialTemplate?.id;
  const titleInputRef = useRef(null);

  const [name, setName] = useState(initialTemplate?.name || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [icon, setIcon] = useState(initialTemplate?.icon || 'Code2');
  const [color, setColor] = useState(initialTemplate?.color || '#ea580c');
  const [staggerDelayMs, setStaggerDelayMs] = useState(
    initialTemplate?.staggerDelayMs !== undefined ? initialTemplate.staggerDelayMs : 500
  );
  const [items, setItems] = useState(initialTemplate?.items || []);
  const [browserProfiles, setBrowserProfiles] = useState([]);
  const [thunderboardInfo, setThunderboardInfo] = useState(null);
  const [validationError, setValidationError] = useState('');

  const [showAppPicker, setShowAppPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showExtensionGuide, setShowExtensionGuide] = useState(false);

  // Sub-form state
  const [activeAddTab, setActiveAddTab] = useState(null); // 'url' | 'folder' | 'command'
  const [newUrl, setNewUrl] = useState('');
  const [newUrlName, setNewUrlName] = useState('');
  const [hasCustomUrlName, setHasCustomUrlName] = useState(false);
  const [newUrlProfileId, setNewUrlProfileId] = useState('');
  const [newCommand, setNewCommand] = useState('');
  const [newCommandName, setNewCommandName] = useState('');
  const [newCommandCwd, setNewCommandCwd] = useState('');

  // Google Meet automation options
  const [meetAutoJoin, setMeetAutoJoin] = useState(true);
  const [meetMuteMic, setMeetMuteMic] = useState(false);
  const [meetMuteCam, setMeetMuteCam] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialTemplate?.name || '');
    setDescription(initialTemplate?.description || '');
    setIcon(initialTemplate?.icon || 'Code2');
    setColor(initialTemplate?.color || '#ea580c');
    setStaggerDelayMs(
      initialTemplate?.staggerDelayMs !== undefined ? initialTemplate.staggerDelayMs : 500
    );
    setItems(initialTemplate?.items ? [...initialTemplate.items] : []);
    setValidationError('');
    setActiveAddTab(null);
    setShowAppPicker(false);
    setShowIconPicker(false);
    setShowExtensionGuide(false);

    const timer = setTimeout(() => titleInputRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [isOpen, initialTemplate]);

  useEffect(() => {
    if (!isOpen) return;
    window.workEasyApi?.getBrowserProfiles?.().then((p) => {
      setBrowserProfiles(p || []);
    }).catch(() => {});
    window.workEasyApi?.getThunderboardInfo?.().then((tb) => {
      setThunderboardInfo(tb);
    }).catch(() => {});
  }, [isOpen]);

  const handleNewUrlChange = (val) => {
    setNewUrl(val);
    if (val.toLowerCase().includes('meet.google.com')) {
      if (!hasCustomUrlName && !newUrlName) {
        setNewUrlName('Google Meet Session');
      }
      if (!newUrlProfileId && browserProfiles.length > 0) {
        const hostProfile = browserProfiles.find(
          (p) =>
            p.email?.toLowerCase().includes('codegnan') ||
            p.email?.toLowerCase().includes('sharief') ||
            p.browser === 'chrome'
        );
        if (hostProfile) setNewUrlProfileId(hostProfile.id);
      }
    }
  };

  const moveItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setItems(updated);
  };

  const toggleItem = (index) => {
    const updated = [...items];
    updated[index] = { ...updated[index], enabled: updated[index].enabled === false };
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeBatch = (index, batchId) => {
    const b = thunderboardInfo?.batches?.find((x) => x.id === batchId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      isThunderboard: true,
      thunderboardBatchId: batchId,
      thunderboardBatchName: b ? b.name : '',
      name: b ? `ThunderBoard (${b.name})` : 'ThunderBoard',
    };
    setItems(updated);
  };

  const handleSelectApp = (app) => {
    const isTb =
      app.isThunderboard ||
      app.name?.toLowerCase().includes('thunderboard') ||
      app.path?.toLowerCase().includes('thunderboard');

    setItems([
      ...items,
      {
        id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'app',
        name: app.name,
        path: app.path,
        args: app.args || '',
        cwd: app.cwd || '',
        shortcutPath: app.shortcutPath || '',
        profileDirectory: app.profileDirectory,
        profileName: app.profileName,
        profileEmail: app.profileEmail,
        browser: app.browser,
        browserExe: app.browserExe,
        isUwp: app.isUwp,
        isThunderboard: isTb,
        thunderboardBatchId: app.thunderboardBatchId || '',
        thunderboardBatchName: app.thunderboardBatchName || '',
        enabled: true,
      },
    ]);
    setShowAppPicker(false);
  };

  const handleBrowseCustomExe = async () => {
    if (!window.workEasyApi?.selectFile) return;
    const filePath = await window.workEasyApi.selectFile({
      title: 'Select Application Executable (.exe, .lnk, .bat)',
    });
    if (!filePath) return;

    const baseName = filePath.split('\\').pop().replace(/\.[^/.]+$/, '');
    const isTb =
      baseName.toLowerCase().includes('thunderboard') ||
      filePath.toLowerCase().includes('thunderboard');

    setItems([
      ...items,
      {
        id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'app',
        name: baseName || 'Custom Executable',
        path: filePath,
        args: '',
        isThunderboard: isTb,
        thunderboardBatchId: '',
        thunderboardBatchName: '',
        enabled: true,
      },
    ]);
    setShowAppPicker(false);
  };

  const handleBrowseFolder = async (openWith = 'vscode') => {
    if (!window.workEasyApi?.selectFolder) return;
    const folderPath = await window.workEasyApi.selectFolder();
    if (!folderPath) return;

    const folderName = folderPath.split('\\').pop() || 'Project Folder';
    setItems([
      ...items,
      {
        id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'folder',
        name: `${folderName} (${openWith === 'vscode' ? 'VS Code' : 'Explorer'})`,
        path: folderPath,
        openWith,
        enabled: true,
      },
    ]);
    setActiveAddTab(null);
  };

  const handleAddUrl = (e) => {
    e?.preventDefault();
    if (!newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    let hostnameLabel = url;
    try {
      hostnameLabel = new URL(url).hostname.replace('www.', '');
    } catch {}

    const isMeet = url.toLowerCase().includes('meet.google.com');
    const label = newUrlName.trim() || (isMeet ? 'Google Meet Session' : hostnameLabel);
    const profile = browserProfiles.find((p) => p.id === newUrlProfileId);

    setItems([
      ...items,
      {
        id: `url-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'url',
        name: label,
        path: url,
        isMeet,
        meetAutoJoin: isMeet ? meetAutoJoin : false,
        meetMuteMic: isMeet ? meetMuteMic : false,
        meetMuteCam: isMeet ? meetMuteCam : false,
        profileDirectory: profile?.directory,
        profileName: profile?.name,
        profileEmail: profile?.email,
        browser: profile?.browser,
        browserExe: profile?.exePath,
        enabled: true,
      },
    ]);
    setNewUrl('');
    setNewUrlName('');
    setHasCustomUrlName(false);
    setNewUrlProfileId('');
    setMeetAutoJoin(true);
    setMeetMuteMic(false);
    setMeetMuteCam(false);
    setActiveAddTab(null);
  };

  const handleAddCommand = (e) => {
    e?.preventDefault();
    if (!newCommand.trim()) return;
    setItems([
      ...items,
      {
        id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'command',
        name: newCommandName.trim() || newCommand.trim(),
        path: newCommand.trim(),
        workingDir: newCommandCwd.trim() || '',
        enabled: true,
      },
    ]);
    setNewCommand('');
    setNewCommandName('');
    setNewCommandCwd('');
    setActiveAddTab(null);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setValidationError('Please enter a name for this workspace.');
      titleInputRef.current?.focus();
      return;
    }

    onSave({
      id: initialTemplate?.id || `tpl-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      favorite: initialTemplate?.favorite || false,
      staggerDelayMs: Number(staggerDelayMs) || 0,
      items,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? 'Configure Workspace' : 'Create Workspace'}
        subtitle="Group applications, project directories, URLs, and scripts"
        maxWidth="max-w-3xl"
        accentColor={color}
        icon={
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            title="Change workspace icon"
            aria-label="Change workspace icon"
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:ring-2 hover:ring-brand-400 transition-all"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <DynamicIcon name={icon} className="w-5 h-5" />
          </button>
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave}>
              {isEditing ? 'Save Changes' : 'Create Workspace'}
            </Button>
          </div>
        }
      >
        {/* Icon Selector Drawer */}
        {showIconPicker && (
          <div className="bg-surface-subtle p-4 border-b border-slate-800 grid grid-cols-6 sm:grid-cols-11 gap-2">
            {AVAILABLE_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                aria-label={`Select ${ic} icon`}
                onClick={() => {
                  setIcon(ic);
                  setShowIconPicker(false);
                }}
                className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                  icon === ic
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <DynamicIcon name={ic} className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}

        <div className="p-5 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="we-tpl-title"
                className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Workspace Title *
              </label>
              <input
                id="we-tpl-title"
                ref={titleInputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="e.g. Full-Stack App Dev"
                className={`w-full px-3.5 py-2 bg-surface-subtle border rounded-lg text-xs sm:text-sm font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 ${
                  validationError
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500'
                }`}
              />
              {validationError && (
                <p role="alert" className="text-xs text-rose-400 font-medium mt-1">
                  {validationError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="we-tpl-desc"
                className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Description
              </label>
              <input
                id="we-tpl-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. VS Code, MongoDB Compass, and local portal"
                className="w-full px-3.5 py-2 bg-surface-subtle border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Color & Timing Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-surface-subtle rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <Palette className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-300">Accent:</span>
              <div className="flex flex-wrap items-center gap-1.5 ml-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Select color ${c}`}
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      color === c
                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-surface-subtle'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="we-stagger-select" className="text-xs font-medium text-slate-300">
                Delay:
              </label>
              <select
                id="we-stagger-select"
                value={staggerDelayMs}
                onChange={(e) => setStaggerDelayMs(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 font-medium"
              >
                <option value={0}>Instant (0ms)</option>
                <option value={300}>Fast (300ms)</option>
                <option value={500}>Normal (500ms)</option>
                <option value={1000}>Safe (1.0s)</option>
                <option value={2000}>Relaxed (2.0s)</option>
              </select>
            </div>
          </div>

          {/* Tools Section */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Configured Actions</span>
                <span className="text-slate-400 font-normal">({items.length})</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAppPicker(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Laptop className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>+ App</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAddTab(activeAddTab === 'folder' ? null : 'folder')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Folder className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>+ Folder</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAddTab(activeAddTab === 'url' ? null : 'url')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>+ Web URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAddTab(activeAddTab === 'command' ? null : 'command')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/25 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>+ Script</span>
                </button>
              </div>
            </div>

            <AddItemPanel
              activeAddTab={activeAddTab}
              onCloseTab={() => setActiveAddTab(null)}
              onBrowseFolder={handleBrowseFolder}
              newUrl={newUrl}
              onNewUrlChange={handleNewUrlChange}
              newUrlName={newUrlName}
              onNewUrlNameChange={(val) => {
                setNewUrlName(val);
                setHasCustomUrlName(val.trim().length > 0);
              }}
              newUrlProfileId={newUrlProfileId}
              onNewUrlProfileIdChange={setNewUrlProfileId}
              browserProfiles={browserProfiles}
              meetAutoJoin={meetAutoJoin}
              onMeetAutoJoinChange={setMeetAutoJoin}
              meetMuteMic={meetMuteMic}
              onMeetMuteMicChange={setMeetMuteMic}
              meetMuteCam={meetMuteCam}
              onMeetMuteCamChange={setMeetMuteCam}
              onOpenExtensionGuide={() => setShowExtensionGuide(true)}
              onAddUrl={handleAddUrl}
              newCommand={newCommand}
              onNewCommandChange={setNewCommand}
              newCommandName={newCommandName}
              onNewCommandNameChange={setNewCommandName}
              newCommandCwd={newCommandCwd}
              onNewCommandCwdChange={setNewCommandCwd}
              onAddCommand={handleAddCommand}
            />

            {items.length === 0 ? (
              <div className="py-8 px-4 text-center border border-dashed border-slate-800 rounded-xl bg-surface-subtle">
                <Laptop className="w-7 h-7 text-slate-600 mx-auto mb-2" aria-hidden="true" />
                <p className="text-xs font-medium text-slate-300">No launch actions configured</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Use the buttons above to add applications, directories, URLs, or scripts.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <ConfiguredItemRow
                    key={item.id || index}
                    item={item}
                    index={index}
                    totalCount={items.length}
                    thunderboardInfo={thunderboardInfo}
                    onToggle={toggleItem}
                    onMove={moveItem}
                    onRemove={removeItem}
                    onChangeBatch={handleChangeBatch}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <AppPickerModal
        isOpen={showAppPicker}
        onClose={() => setShowAppPicker(false)}
        onSelectApp={handleSelectApp}
        onBrowseCustomExe={handleBrowseCustomExe}
      />

      <ExtensionGuideModal
        isOpen={showExtensionGuide}
        onClose={() => setShowExtensionGuide(false)}
      />
    </>
  );
}
