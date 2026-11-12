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

export function DynamicIcon({ name, className = 'w-5 h-5', fallback = 'Rocket' }) {
  const IconComponent = ICON_MAP[name] || ICON_MAP[fallback] || Rocket;
  return <IconComponent className={className} aria-hidden="true" />;
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
