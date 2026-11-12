import React from 'react';

const VARIANT_CLASSES = {
  neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  brand: 'bg-brand-500/15 text-brand-300 border-brand-500/25',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const SIZE_CLASSES = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
};

export default function Badge({
  variant = 'neutral',
  size = 'xs',
  icon,
  className = '',
  children,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral
      } ${SIZE_CLASSES[size] || SIZE_CLASSES.xs} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
