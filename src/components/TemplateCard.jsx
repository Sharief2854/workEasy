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
  Mail,
  Video,
  Layout,
} from 'lucide-react';
import { DynamicIcon } from '../utils/icons';
import Badge from './ui/Badge';
import Button from './ui/Button';

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

  const getItemIcon = (item) => {
    if (item.isMeet || item.path?.includes('meet.google.com')) {
      return <Video className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" aria-hidden="true" />;
    }
    switch (item.type) {
      case 'app':
        return <Laptop className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" aria-hidden="true" />;
      case 'folder':
        return <Folder className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden="true" />;
      case 'url':
        return <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" aria-hidden="true" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <article
      className="workspace-card rounded-xl p-5 flex flex-col justify-between"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${accentColor}1a`,
                color: accentColor,
              }}
            >
              <DynamicIcon name={template.icon || 'Rocket'} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-white truncate">{template.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                {template.description || 'Workspace configuration'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(template.id)}
              aria-label={template.favorite ? `Unpin ${template.name}` : `Pin ${template.name}`}
              title={template.favorite ? 'Unpin' : 'Pin to top'}
              className={`p-1.5 rounded-md transition-colors ${
                template.favorite
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${template.favorite ? 'fill-amber-400' : ''}`} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onEdit(template)}
              aria-label={`Edit ${template.name}`}
              title="Edit workspace"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onDuplicate(template)}
              aria-label={`Duplicate ${template.name}`}
              title="Duplicate"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(template.id)}
              aria-label={`Delete ${template.name}`}
              title="Delete"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Summary Counters */}
        <div className="flex flex-wrap items-center gap-1.5 my-3">
          {apps.length > 0 && (
            <Badge variant="blue" size="sm" icon={<Laptop className="w-3 h-3" aria-hidden="true" />}>
              {apps.length} {apps.length === 1 ? 'App' : 'Apps'}
            </Badge>
          )}

          {folders.length > 0 && (
            <Badge variant="amber" size="sm" icon={<Folder className="w-3 h-3" aria-hidden="true" />}>
              {folders.length} {folders.length === 1 ? 'Folder' : 'Folders'}
            </Badge>
          )}

          {urls.length > 0 && (
            <Badge variant="emerald" size="sm" icon={<Globe className="w-3 h-3" aria-hidden="true" />}>
              {urls.length} {urls.length === 1 ? 'URL' : 'URLs'}
            </Badge>
          )}

          {commands.length > 0 && (
            <Badge variant="purple" size="sm" icon={<Terminal className="w-3 h-3" aria-hidden="true" />}>
              {commands.length} {commands.length === 1 ? 'Script' : 'Scripts'}
            </Badge>
          )}

          <Badge
            variant="neutral"
            size="xs"
            className="font-mono ml-auto"
            icon={<Clock className="w-3 h-3" aria-hidden="true" />}
          >
            {template.staggerDelayMs ? `${template.staggerDelayMs}ms` : 'Instant'}
          </Badge>
        </div>

        {/* Configured Items Accordion */}
        <div className="border-t border-slate-800 pt-2.5 mt-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className="w-full flex items-center justify-between text-xs font-medium text-slate-400 hover:text-slate-200 py-1 transition-colors"
          >
            <span>Configured tools ({enabledItems.length} active)</span>
            <span className="flex items-center gap-1">
              <span>{expanded ? 'Hide' : 'Show'}</span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </span>
          </button>

          {expanded && (
            <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const isThunderboard =
                  item.isThunderboard ||
                  item.thunderboardBatchName ||
                  item.name?.toLowerCase().includes('thunderboard');

                return (
                  <div
                    key={item.id || idx}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs bg-surface-subtle border border-slate-800 ${
                      item.enabled === false ? 'opacity-40 line-through' : 'hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getItemIcon(item)}
                      <span className="font-medium text-slate-200 truncate">{item.name}</span>

                      {item.isMeet && <Badge variant="blue">Meet</Badge>}

                      {isThunderboard && (
                        <Badge
                          variant="amber"
                          className="flex-shrink-0"
                          icon={<Layout className="w-2.5 h-2.5" aria-hidden="true" />}
                        >
                          {item.thunderboardBatchName || 'ThunderBoard'}
                        </Badge>
                      )}

                      {(item.profileEmail || item.profileName) && (
                        <Badge
                          variant="brand"
                          className="truncate max-w-[140px] flex-shrink-0"
                          icon={<Mail className="w-2.5 h-2.5 flex-shrink-0" aria-hidden="true" />}
                        >
                          <span className="truncate">{item.profileEmail || item.profileName}</span>
                        </Badge>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onLaunchSingleItem(item)}
                      aria-label={`Launch ${item.name} individually`}
                      title="Launch this item"
                      className="text-slate-400 hover:text-brand-400 p-1 hover:bg-slate-800 rounded transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Launch Button */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <Button
          variant="primary"
          size="md"
          className="w-full py-2.5"
          onClick={() => onLaunch(template)}
          disabled={isLaunching || enabledItems.length === 0}
        >
          {isLaunching ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Launching...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" aria-hidden="true" />
              <span>Launch All ({enabledItems.length})</span>
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
