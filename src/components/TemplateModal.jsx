import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  FolderOpen,
  Laptop,
  Folder,
  Globe,
  Terminal,
  Clock,
  Palette,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Code2,
  Mail,
  User,
  Video,
  Radio,
  MicOff,
  CameraOff,
  HelpCircle,
  Layout,
  BookOpen,
} from 'lucide-react';
import { AVAILABLE_ICONS, DynamicIcon } from '../utils/icons';
import AppPickerModal from './AppPickerModal';

const PRESET_COLORS = [
  '#ea580c', // Orange (Primary)
  '#f97316', // Light Orange
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#ec4899', // Pink
  '#a855f7', // Purple
];

export default function TemplateModal({
  isOpen,
  onClose,
  onSave,
  initialTemplate = null,
}) {
  if (!isOpen) return null;

  const isEditing = !!initialTemplate?.id;

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

  const [showAppPicker, setShowAppPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Active form section
  const [activeAddTab, setActiveAddTab] = useState(null); // 'url' | 'folder' | 'command'
  const [newUrl, setNewUrl] = useState('');
  const [newUrlName, setNewUrlName] = useState('');
  const [newUrlProfileId, setNewUrlProfileId] = useState('');
  const [newCommand, setNewCommand] = useState('');
  const [newCommandName, setNewCommandName] = useState('');
  const [newCommandCwd, setNewCommandCwd] = useState('');

  // Google Meet Automation state
  const [meetAutoJoin, setMeetAutoJoin] = useState(true);
  const [meetMuteMic, setMeetMuteMic] = useState(false);
  const [meetMuteCam, setMeetMuteCam] = useState(false);
  const [showExtensionGuide, setShowExtensionGuide] = useState(false);

  useEffect(() => {
    if (window.workEasyApi?.getBrowserProfiles) {
      window.workEasyApi.getBrowserProfiles().then((p) => {
        setBrowserProfiles(p || []);
      }).catch((err) => console.error(err));
    }
    if (window.workEasyApi?.getThunderboardInfo) {
      window.workEasyApi.getThunderboardInfo().then((tb) => {
        setThunderboardInfo(tb);
      }).catch((err) => console.error(err));
    }
  }, []);

  // Auto-detect Meet URL and suggest Host account (e.g. codegnan / sharief)
  useEffect(() => {
    if (newUrl.toLowerCase().includes('meet.google.com')) {
      if (!newUrlName) setNewUrlName('Google Meet Session');
      if (!newUrlProfileId && browserProfiles.length > 0) {
        const hostProfile = browserProfiles.find((p) =>
          p.email?.toLowerCase().includes('codegnan') ||
          p.email?.toLowerCase().includes('sharief') ||
          p.browser === 'chrome'
        );
        if (hostProfile) setNewUrlProfileId(hostProfile.id);
      }
    }
  }, [newUrl, browserProfiles, newUrlProfileId, newUrlName]);

  // Move item up/down
  const moveItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setItems(updated);
  };

  // Toggle item enable
  const toggleItem = (index) => {
    const updated = [...items];
    updated[index].enabled = updated[index].enabled === false ? true : false;
    setItems(updated);
  };

  // Remove item
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Select App from AppPicker
  const handleSelectApp = (app) => {
    const isTb = app.isThunderboard || app.name?.toLowerCase().includes('thunderboard') || app.path?.toLowerCase().includes('thunderboard');
    setItems([
      ...items,
      {
        id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'app',
        name: app.name,
        path: app.path,
        args: app.args || '',
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

  // Browse custom .exe
  const handleBrowseCustomExe = async () => {
    if (window.workEasyApi) {
      const filePath = await window.workEasyApi.selectFile({
        title: 'Select Application Executable (.exe, .lnk, .bat)',
      });
      if (filePath) {
        const baseName = filePath.split('\\').pop().replace(/\.[^/.]+$/, '');
        const isTb = baseName.toLowerCase().includes('thunderboard') || filePath.toLowerCase().includes('thunderboard');
        setItems([
          ...items,
          {
            id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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
      }
    }
  };

  // Add Folder
  const handleBrowseFolder = async (openWith = 'vscode') => {
    if (window.workEasyApi) {
      const folderPath = await window.workEasyApi.selectFolder();
      if (folderPath) {
        const folderName = folderPath.split('\\').pop() || 'Project Folder';
        setItems([
          ...items,
          {
            id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'folder',
            name: `${folderName} (${openWith === 'vscode' ? 'VS Code' : 'Explorer'})`,
            path: folderPath,
            openWith,
            enabled: true,
          },
        ]);
        setActiveAddTab(null);
      }
    }
  };

  // Add URL
  const handleAddUrl = (e) => {
    e?.preventDefault();
    if (!newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    const isMeet = url.toLowerCase().includes('meet.google.com');
    const name = newUrlName.trim() || (isMeet ? 'Google Meet Session' : new URL(url).hostname.replace('www.', ''));
    const profile = browserProfiles.find((p) => p.id === newUrlProfileId);

    setItems([
      ...items,
      {
        id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'url',
        name,
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
    setNewUrlProfileId('');
    setMeetAutoJoin(true);
    setMeetMuteMic(false);
    setMeetMuteCam(false);
    setActiveAddTab(null);
  };

  // Add Command
  const handleAddCommand = (e) => {
    e?.preventDefault();
    if (!newCommand.trim()) return;
    setItems([
      ...items,
      {
        id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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
      alert('Please enter a name for this workspace');
      return;
    }

    const templateData = {
      id: initialTemplate?.id || `tpl-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      favorite: initialTemplate?.favorite || false,
      staggerDelayMs: Number(staggerDelayMs) || 0,
      items,
    };

    onSave(templateData);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-3xl bg-[#0f172a] dark:bg-[#0f172a] light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 bg-[#0c1017] dark:bg-[#0c1017] light:bg-slate-50"
            style={{ borderTop: `4px solid ${color}` }}
          >
            <div className="flex items-center space-x-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all font-bold"
                style={{ backgroundColor: `${color}20`, color }}
                onClick={() => setShowIconPicker(!showIconPicker)}
                title="Click to select icon"
              >
                <DynamicIcon name={icon} className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                  {isEditing ? 'Configure Workspace Template' : 'Create New Workspace Template'}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium">
                  Group applications, project folders, web tabs, and backend scripts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Icon Selector */}
          {showIconPicker && (
            <div className="bg-[#090d16] dark:bg-[#090d16] light:bg-slate-100 p-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-300 grid grid-cols-8 gap-2">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => {
                    setIcon(ic);
                    setShowIconPicker(false);
                  }}
                  className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                    icon === ic
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                  }`}
                >
                  <DynamicIcon name={ic} className="w-5 h-5" />
                </button>
              ))}
            </div>
          )}

          {/* Form Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#0f172a] dark:bg-[#0f172a] light:bg-white">
            
            {/* Template Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5">
                  Workspace Title *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Full-Stack App Dev"
                  className="w-full px-3.5 py-2 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Opens VS Code, MongoDB Compass, and Web Tabs"
                  className="w-full px-3.5 py-2 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Colors & Stagger Selection */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200">
              <div className="flex items-center space-x-2">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">Accent Color:</span>
                <div className="flex items-center space-x-1.5 ml-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white dark:ring-white light:ring-slate-900 ring-offset-2 ring-offset-[#090d16]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">Launch Interval:</span>
                <select
                  value={staggerDelayMs}
                  onChange={(e) => setStaggerDelayMs(Number(e.target.value))}
                  className="bg-slate-800 dark:bg-slate-800 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-500 font-medium"
                >
                  <option value={0}>Instant (0ms)</option>
                  <option value={300}>Fast (300ms)</option>
                  <option value={500}>Normal (500ms)</option>
                  <option value={1000}>Safe (1.0s)</option>
                  <option value={2000}>Relaxed (2.0s)</option>
                </select>
              </div>
            </div>

            {/* Action Items List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Configured Tools & Launch Actions</span>
                  <span className="text-slate-400 dark:text-slate-400 light:text-slate-500 font-normal">({items.length})</span>
                </h3>

                {/* Add Tool Buttons (Solid) */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAppPicker(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>+ App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAddTab(activeAddTab === 'folder' ? null : 'folder')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>+ Folder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAddTab(activeAddTab === 'url' ? null : 'url')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>+ Web URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAddTab(activeAddTab === 'command' ? null : 'command')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/30 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>+ Script</span>
                  </button>
                </div>
              </div>

              {/* Sub Forms */}
              {activeAddTab === 'folder' && (
                <div className="p-4 mb-3 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50 border border-amber-500/30 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Select Project Workspace Folder</h4>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleBrowseFolder('vscode')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Code2 className="w-4 h-4" />
                      <span>Select Folder ➜ Open in VS Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBrowseFolder('explorer')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>Select Folder ➜ Open in Explorer</span>
                    </button>
                  </div>
                </div>
              )}

              {activeAddTab === 'url' && (
                <form onSubmit={handleAddUrl} className="p-4 mb-3 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50 border border-emerald-500/30 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Add Browser Web Tab</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="URL (e.g. https://chatgpt.com or localhost:3000)"
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newUrlName}
                      onChange={(e) => setNewUrlName(e.target.value)}
                      placeholder="Label (e.g. ChatGPT, Claude, MongoDB Atlas)"
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {browserProfiles.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider mb-1">
                        Open with Specific Google / Browser Account (Optional)
                      </label>
                      <select
                        value={newUrlProfileId}
                        onChange={(e) => setNewUrlProfileId(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs text-slate-200 dark:text-slate-200 light:text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="">🌐 System Default Browser</option>
                        {browserProfiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Google Meet Automation Suite */}
                  {newUrl.toLowerCase().includes('meet.google.com') && (
                    <div className="p-3 bg-orange-950/20 border border-orange-500/40 rounded-xl space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-orange-400 font-bold text-xs">
                          <Video className="w-4 h-4 text-orange-500" />
                          <span>Google Meet Automation Suite</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowExtensionGuide(true)}
                          className="text-[10px] text-orange-400 hover:text-orange-300 underline flex items-center gap-1 font-semibold"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Chrome Extension Setup</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={meetAutoJoin}
                            onChange={(e) => setMeetAutoJoin(e.target.checked)}
                            className="rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-800"
                          />
                          <span className="text-slate-200 text-[11px] font-semibold">⚡ Auto-Join Call</span>
                        </label>

                        <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={meetMuteMic}
                            onChange={(e) => setMeetMuteMic(e.target.checked)}
                            className="rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-800"
                          />
                          <span className="text-slate-300 text-[11px]">🎙️ Mute Mic before joining</span>
                        </label>

                        <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={meetMuteCam}
                            onChange={(e) => setMeetMuteCam(e.target.checked)}
                            className="rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-800"
                          />
                          <span className="text-slate-300 text-[11px]">📷 Turn off Camera before joining</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveAddTab(null)}
                      className="px-3 py-1 rounded bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-700 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newUrl.trim()}
                      className="px-4 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      Add URL
                    </button>
                  </div>
                </form>
              )}

              {activeAddTab === 'command' && (
                <form onSubmit={handleAddCommand} className="p-4 mb-3 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50 border border-purple-500/30 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-purple-500 uppercase tracking-wider">Add Terminal Command</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCommand}
                      onChange={(e) => setNewCommand(e.target.value)}
                      placeholder="Command (e.g. npm run dev, docker compose up)"
                      className="w-full px-3 py-1.5 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs font-mono text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newCommandName}
                        onChange={(e) => setNewCommandName(e.target.value)}
                        placeholder="Label (e.g. Start Dev Server)"
                        className="px-3 py-1.5 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder-slate-500"
                      />
                      <input
                        type="text"
                        value={newCommandCwd}
                        onChange={(e) => setNewCommandCwd(e.target.value)}
                        placeholder="Working Directory (optional path)"
                        className="px-3 py-1.5 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg text-xs font-mono text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder-slate-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveAddTab(null)}
                      className="px-3 py-1 rounded bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-700 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newCommand.trim()}
                      className="px-4 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      Add Script
                    </button>
                  </div>
                </form>
              )}

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-8 px-4 text-center border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50">
                  <Laptop className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">No tools configured yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click the buttons above to add applications, folders, web URLs, or scripts.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const isApp = item.type === 'app';
                    const isFolder = item.type === 'folder';
                    const isUrl = item.type === 'url';
                    const isCmd = item.type === 'command';

                    return (
                      <div
                        key={item.id || index}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          item.enabled === false
                            ? 'bg-[#090d16]/30 dark:bg-[#090d16]/30 light:bg-slate-100 opacity-40 border-slate-800'
                            : 'bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50 border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0 mr-3">
                          <input
                            type="checkbox"
                            checked={item.enabled !== false}
                            onChange={() => toggleItem(index)}
                            className="rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-900"
                            title="Toggle active"
                          />

                          <div className={`p-2 rounded-lg ${
                            isApp ? 'bg-blue-500/10 text-blue-500' :
                            isFolder ? 'bg-amber-500/10 text-amber-500' :
                            isUrl ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-purple-500/10 text-purple-500'
                          }`}>
                            {isApp && <Laptop className="w-3.5 h-3.5" />}
                            {isFolder && <Folder className="w-3.5 h-3.5" />}
                            {isUrl && <Globe className="w-3.5 h-3.5" />}
                            {isCmd && <Terminal className="w-3.5 h-3.5" />}
                          </div>

                          <div className="truncate flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white dark:text-white light:text-slate-900 truncate">{item.name}</span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-700">
                                {item.type}
                              </span>
                              {item.isMeet && (
                                <span className="inline-flex items-center space-x-1 text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold">
                                  <Video className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span>Meet</span>
                                </span>
                              )}
                              {(item.isThunderboard || item.name?.toLowerCase().includes('thunderboard')) && (
                                <span className="inline-flex items-center space-x-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                                  <Layout className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span>{item.thunderboardBatchName ? `Batch: ${item.thunderboardBatchName}` : 'Last Active Batch'}</span>
                                </span>
                              )}
                              {(item.profileEmail || item.profileName) && (
                                <span className="inline-flex items-center space-x-1 text-[9px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30 font-medium truncate max-w-[220px]">
                                  <Mail className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span className="truncate">{item.profileEmail || item.profileName}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500 truncate mt-0.5">
                              {isFolder && item.openWith === 'vscode' ? `(VS Code) ${item.path}` : item.path}
                            </p>

                            {/* ThunderBoard Batch Selector */}
                            {(item.isThunderboard || item.name?.toLowerCase().includes('thunderboard')) && thunderboardInfo?.batches?.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] font-bold text-amber-400/90">📚 Classroom Batch:</span>
                                <select
                                  value={item.thunderboardBatchId || ''}
                                  onChange={(e) => {
                                    const bId = e.target.value;
                                    const b = thunderboardInfo.batches.find((x) => x.id === bId);
                                    const updated = [...items];
                                    updated[index] = {
                                      ...updated[index],
                                      isThunderboard: true,
                                      thunderboardBatchId: bId,
                                      thunderboardBatchName: b ? b.name : '',
                                      name: b ? `ThunderBoard (${b.name})` : 'ThunderBoard v3',
                                    };
                                    setItems(updated);
                                  }}
                                  className="px-2 py-0.5 text-[10px] rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                                >
                                  <option value="">⚡ Last Active Batch</option>
                                  {thunderboardInfo.batches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                      {b.name} ({b.pageCount} {b.pageCount === 1 ? 'page' : 'pages'})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveItem(index, -1)}
                            className="p-1 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 disabled:opacity-20 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 rounded"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === items.length - 1}
                            onClick={() => moveItem(index, 1)}
                            className="p-1 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 disabled:opacity-20 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 rounded"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded ml-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 bg-[#0c1017] dark:bg-[#0c1017] light:bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all transform active:scale-95 shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Create Workspace'}
            </button>
          </div>
        </div>
      </div>

      {/* App Picker Dialog */}
      <AppPickerModal
        isOpen={showAppPicker}
        onClose={() => setShowAppPicker(false)}
        onSelectApp={handleSelectApp}
        onBrowseCustomExe={handleBrowseCustomExe}
      />

      {/* Google Meet Extension Setup Guide Dialog */}
      {showExtensionGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0f172a] border border-orange-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5 text-white font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Meet Chrome Extension Setup</h3>
                  <p className="text-[11px] text-slate-400 font-normal">One-time setup (takes 15 seconds)</p>
                </div>
              </div>
              <button
                onClick={() => setShowExtensionGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To allow WorkEasy to automatically mute devices and click <strong>"Join now"</strong> inside your Google Workspace account, load our local helper extension into Chrome:
            </p>

            <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside bg-[#090d16] p-4 rounded-xl border border-slate-800">
              <li>
                In Google Chrome, open: <code className="text-orange-400 font-mono font-bold select-all bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">chrome://extensions</code>
              </li>
              <li>
                Turn ON <strong>"Developer mode"</strong> (toggle switch in the top-right corner of Chrome).
              </li>
              <li>
                Click <strong>"Load unpacked"</strong> at the top-left, and select the folder opened below:
              </li>
            </ol>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400 truncate">
              📂 D:\sharief\workEasy\extensions\workeasy-meet-helper
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  if (window.workEasyApi?.openExtensionFolder) {
                    window.workEasyApi.openExtensionFolder();
                  }
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shadow-sm transform active:scale-95"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Open Extension Folder in Explorer</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExtensionGuide(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Got It, Done!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
