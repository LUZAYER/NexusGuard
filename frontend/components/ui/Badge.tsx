'use client';

import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'indigo'
  | 'cyan'
  | 'violet'
  | 'orange'
  | 'pink';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  error: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  warning: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  info: 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30',
  neutral: 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30',
  indigo: 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30',
  violet: 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30',
  orange: 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30',
  pink: 'bg-pink-500/15 text-pink-400 ring-1 ring-pink-500/30',
};

const dotClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400',
  error: 'bg-red-400',
  warning: 'bg-amber-400',
  info: 'bg-sky-400',
  neutral: 'bg-slate-400',
  indigo: 'bg-indigo-400',
  cyan: 'bg-cyan-400',
  violet: 'bg-violet-400',
  orange: 'bg-orange-400',
  pink: 'bg-pink-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px] font-medium',
  md: 'px-2 py-0.5 text-xs font-medium',
  lg: 'px-2.5 py-1 text-sm font-medium',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('h-1.5 w-1.5 rounded-full', dotClasses[variant])}
        />
      )}
      {children}
    </span>
  );
}

// Convenience helpers for common badge types
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    running: { variant: 'success', label: 'Running' },
    completed: { variant: 'info', label: 'Completed' },
    failed: { variant: 'error', label: 'Failed' },
    error: { variant: 'error', label: 'Error' },
    pending: { variant: 'warning', label: 'Pending' },
    idle: { variant: 'neutral', label: 'Idle' },
    paused: { variant: 'warning', label: 'Paused' },
    deprecated: { variant: 'orange', label: 'Deprecated' },
  };
  const cfg = map[status.toLowerCase()] ?? { variant: 'neutral' as BadgeVariant, label: status };
  return (
    <Badge variant={cfg.variant} dot>
      {cfg.label}
    </Badge>
  );
}

export function FrameworkBadge({ framework }: { framework: string }) {
  const map: Record<string, BadgeVariant> = {
    langchain: 'indigo',
    langgraph: 'violet',
    crewai: 'cyan',
    autogen: 'orange',
    llamaindex: 'pink',
    openai: 'info',
    custom: 'neutral',
  };
  const variant = map[framework.toLowerCase()] ?? 'neutral';
  return <Badge variant={variant}>{framework}</Badge>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, BadgeVariant> = {
    critical: 'error',
    high: 'error',
    medium: 'warning',
    low: 'info',
    info: 'neutral',
  };
  const variant = map[severity.toLowerCase()] ?? 'neutral';
  return <Badge variant={variant}>{severity}</Badge>;
}
