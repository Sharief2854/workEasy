import React from 'react';
import {
  Code2,
  Database,
  Globe,
  Terminal,
  Folder,
  Sparkles,
  Coffee,
  Rocket,
  Laptop,
  Gamepad2,
  Send,
  Shield,
  Boxes,
  BookOpen,
  MessageSquare,
  Music,
  FileCode,
  Layout,
  Layers,
  Cpu,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Play,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  Download,
  Upload,
  Search,
  Star,
  RefreshCw,
  X,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';

const ICON_MAP = {
  Code2,
  Database,
  Globe,
  Terminal,
  Folder,
  Sparkles,
  Coffee,
  Rocket,
  Laptop,
  Gamepad2,
  Send,
  Shield,
  Boxes,
  BookOpen,
  MessageSquare,
  Music,
  FileCode,
  Layout,
  Layers,
  Cpu,
  Monitor,
  Zap,
};

export function DynamicIcon({ name, className = "w-5 h-5", fallback = "Rocket" }) {
  const IconComponent = ICON_MAP[name] || ICON_MAP[fallback] || Rocket;
  return <IconComponent className={className} />;
}

export function getItemIcon(type, customIcon) {
  if (customIcon && ICON_MAP[customIcon]) {
    return customIcon;
  }
  switch (type) {
    case 'app':
      return 'Laptop';
    case 'folder':
      return 'Folder';
    case 'url':
      return 'Globe';
    case 'command':
      return 'Terminal';
    default:
      return 'Sparkles';
  }
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
