import React from 'react';
import {
  Laptop,
  Folder,
  Globe,
  Terminal,
  Video,
  Layout,
  Mail,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';
import Badge from '../ui/Badge';

const TYPE_STYLES = {
  app: 'bg-blue-500/10 text-blue-400',
  folder: 'bg-amber-500/10 text-amber-400',
  url: 'bg-emerald-500/10 text-emerald-400',
  command: 'bg-purple-500/10 text-purple-400',
};

export default function ConfiguredItemRow({
  item,
  index,
  totalCount,
  thunderboardInfo,
  onToggle,
  onMove,
  onRemove,
  onChangeBatch,
}) {
  const isThunderboard =
    item.isThunderboard || item.name?.toLowerCase().includes('thunderboard');

  const renderTypeIcon = () => {
    switch (item.type) {
      case 'app':
        return <Laptop className="w-3.5 h-3.5" aria-hidden="true" />;
      case 'folder':
        return <Folder className="w-3.5 h-3.5" aria-hidden="true" />;
      case 'url':
        return <Globe className="w-3.5 h-3.5" aria-hidden="true" />;
      default:
        return <Terminal className="w-3.5 h-3.5" aria-hidden="true" />;
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition-colors ${
        item.enabled === false
          ? 'bg-surface-subtle/50 opacity-50 border-slate-800/70'
          : 'bg-surface-subtle border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={item.enabled !== false}
          onChange={() => onToggle(index)}
          aria-label={`Enable ${item.name}`}
          className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-slate-900 cursor-pointer flex-shrink-0"
        />

        <div className={`p-2 rounded-lg flex-shrink-0 ${TYPE_STYLES[item.type] || TYPE_STYLES.command}`}>
          {renderTypeIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-white truncate">{item.name}</span>
            <Badge variant="neutral" className="uppercase">
              {item.type}
            </Badge>
            {item.isMeet && (
              <Badge variant="blue" icon={<Video className="w-2.5 h-2.5" aria-hidden="true" />}>
                Meet
              </Badge>
            )}
            {isThunderboard && (
              <Badge variant="amber" icon={<Layout className="w-2.5 h-2.5" aria-hidden="true" />}>
                {item.thunderboardBatchName
                  ? `Batch: ${item.thunderboardBatchName}`
                  : 'Last Active Batch'}
              </Badge>
            )}
            {(item.profileEmail || item.profileName) && (
              <Badge
                variant="brand"
                className="truncate max-w-[200px]"
                icon={<Mail className="w-2.5 h-2.5 flex-shrink-0" aria-hidden="true" />}
              >
                <span className="truncate">{item.profileEmail || item.profileName}</span>
              </Badge>
            )}
          </div>

          <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
            {item.type === 'folder' && item.openWith === 'vscode'
              ? `VS Code: ${item.path}`
              : item.path}
          </p>

          {isThunderboard && thunderboardInfo?.batches?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <label
                htmlFor={`tb-batch-${item.id || index}`}
                className="text-[11px] font-medium text-amber-400 flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3" aria-hidden="true" />
                <span>Batch:</span>
              </label>
              <select
                id={`tb-batch-${item.id || index}`}
                value={item.thunderboardBatchId || ''}
                onChange={(e) => onChangeBatch(index, e.target.value)}
                className="px-2 py-1 text-xs rounded-md bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">Last Active Batch</option>
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

      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
          aria-label={`Move ${item.name} up`}
          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-25 hover:bg-slate-800 rounded-md transition-colors"
        >
          <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={index === totalCount - 1}
          onClick={() => onMove(index, 1)}
          aria-label={`Move ${item.name} down`}
          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-25 hover:bg-slate-800 rounded-md transition-colors"
        >
          <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${item.name}`}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md ml-0.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
