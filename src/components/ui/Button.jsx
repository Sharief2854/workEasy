import React from 'react';

const VARIANT_CLASSES = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white font-semibold',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold',
  danger: 'bg-rose-600 hover:bg-rose-500 text-white font-semibold',
  dangerSubtle: 'bg-rose-500/10 hover:bg-rose-500/15 text-rose-400 border border-rose-500/25 font-medium',
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-xs sm:text-sm',
};

export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'sm',
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary
      } ${SIZE_CLASSES[size] || SIZE_CLASSES.sm} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
