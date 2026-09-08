import React, { useState } from 'react';
import {
  Play,
  Edit3,
  Copy,
  Trash2,
  Star,
  Clock,
  Laptop,
  Folder,
  Globe,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { DynamicIcon } from '../utils/icons';

export default function TemplateCard({
  template,
  onLaunch,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onLaunchSingleItem,
  isLaunching,
}) {
  const [expanded, setExpanded] = useState(false);
  const items = template.items || [];
  const enabledItems = items.filter((i) => i.enabled !== false);

  const apps = items.filter((i) => i.type === 'app');
  const folders = items.filter((i) => i.type === 'folder');
  const urls = items.filter((i) => i.type === 'url');
  const commands = items.filter((i) => i.type === 'command');

  const accentColor = template.color || '#ea580c';

  return (
    <div
      className="pro-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all"
      style={{
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
              style={{
                backgroundColor: `${accentColor}18`,
                color: accentColor,
              }}
            >
              <DynamicIcon name={template.icon || 'Rocket'} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 dark:text-slate-100 light:text-slate-800 flex items-center gap-1.5">
                {template.name}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 line-clamp-1 mt-0.5">
                {template.description || 'Workspace Configuration'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-0.5">
            <button
              onClick={() => onToggleFavorite(template.id)}
              title={template.favorite ? 'Unstar' : 'Pin to favorites'}
              className={`p-1.5 rounded-lg transition-colors ${
                template.favorite
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-slate-500 dark:text-slate-500 light:text-slate-400 hover:text-slate-300 dark:hover:text-slate-300 light:hover:text-slate-700 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${template.favorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => onEdit(template)}
              title="Edit Workspace"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-slate-700 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDuplicate(template)}
              title="Duplicate / Clone"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-slate-700 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(template.id)}
              title="Delete Workspace"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Type Counters */}
        <div className="flex flex-wrap items-center gap-1.5 my-3">
          {apps.length > 0 && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[11px] font-semibold">
              <Laptop className="w-3 h-3" />
              <span>{apps.length} {apps.length === 1 ? 'App' : 'Apps'}</span>
            </span>
          )}

          {folders.length > 0 && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-semibold">
              <Folder className="w-3 h-3" />
              <span>{folders.length} {folders.length === 1 ? 'Folder' : 'Folders'}</span>
            </span>
          )}

          {urls.length > 0 && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-semibold">
              <Globe className="w-3 h-3" />
              <span>{urls.length} {urls.length === 1 ? 'URL' : 'URLs'}</span>
            </span>
          )}

          {commands.length > 0 && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[11px] font-semibold">
              <Terminal className="w-3 h-3" />
              <span>{commands.length} {commands.length === 1 ? 'Script' : 'Scripts'}</span>
            </span>
          )}

          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-400 dark:text-slate-400 light:text-slate-600 text-[10px] font-mono font-medium ml-auto border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300">
            <Clock className="w-2.5 h-2.5" />
            <span>{template.staggerDelayMs ? `${template.staggerDelayMs}ms` : 'Instant'}</span>
          </span>
        </div>

        {/* Item List Accordion */}
        <div className="border-t border-slate-800 dark:border-slate-800 light:border-slate-200 pt-2.5 mt-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-400 light:text-slate-500 hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-slate-800 py-1 transition-colors"
          >
            <span>
              Configured Tools ({enabledItems.length} active)
            </span>
            <div className="flex items-center space-x-1">
              <span>{expanded ? 'Collapse' : 'Expand'}</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
          </button>

          {/* Expanded Tools List */}
          {expanded && (
            <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const getIcon = () => {
                  switch (item.type) {
                    case 'app': return <Laptop className="w-3 h-3 text-blue-500" />;
                    case 'folder': return <Folder className="w-3 h-3 text-amber-500" />;
                    case 'url': return <Globe className="w-3 h-3 text-emerald-500" />;
                    case 'command': return <Terminal className="w-3 h-3 text-purple-500" />;
                    default: return <Sparkles className="w-3 h-3 text-orange-500" />;
                  }
                };

                return (
                  <div
                    key={item.id || idx}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 transition-colors ${
                      item.enabled === false ? 'opacity-35 line-through' : 'hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate flex-1 mr-2">
                      {getIcon()}
                      <span className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs truncate">{item.name}</span>
                      <span className="text-slate-500 text-[10px] font-mono truncate">
                        {item.type === 'folder' && item.openWith === 'vscode' ? '➜ VS Code' : item.path}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchSingleItem(item);
                      }}
                      title="Test launch this specific item"
                      className="text-slate-400 hover:text-orange-500 p-1 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 rounded transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 1-Click Launch Button (Solid Orange) */}
      <div className="mt-4 pt-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
        <button
          onClick={() => onLaunch(template)}
          disabled={isLaunching || enabledItems.length === 0}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 text-white bg-orange-600 hover:bg-orange-500 transition-all transform active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {isLaunching ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Launching & Closing...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch All ({enabledItems.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
