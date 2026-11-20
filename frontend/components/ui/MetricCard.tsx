'use client';

import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  status?: 'danger' | 'warning' | 'success' | 'info' | string;
  trend?: {
    direction: TrendDirection;
    value: string;
    label?: string;
  };
  icon?: React.ReactNode;
  accentColor?: 'indigo' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'orange';
  className?: string;
  isLoading?: boolean;
  /** If true, "up" trend = good (green), "down" = bad. Default true. */
  upIsGood?: boolean;
}

const accentMap = {
  indigo: {
    icon: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20',
    glow: 'hover:shadow-indigo-500/10',
    bar: 'bg-indigo-500',
  },
  cyan: {
    icon: 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20',
    glow: 'hover:shadow-cyan-500/10',
    bar: 'bg-cyan-500',
  },
  violet: {
    icon: 'text-violet-400 bg-violet-500/10 border border-violet-500/20',
    glow: 'hover:shadow-violet-500/10',
    bar: 'bg-violet-500',
  },
  emerald: {
    icon: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
    glow: 'hover:shadow-emerald-500/10',
    bar: 'bg-emerald-500',
  },
  amber: {
    icon: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
    glow: 'hover:shadow-amber-500/10',
    bar: 'bg-amber-500',
  },
  orange: {
    icon: 'text-orange-400 bg-orange-500/10 border border-orange-500/20',
    glow: 'hover:shadow-orange-500/10',
    bar: 'bg-orange-500',
  },
  rose: {
    icon: 'text-rose-400 bg-rose-500/10 border border-rose-500/20',
    glow: 'hover:shadow-rose-500/10',
    bar: 'bg-rose-500',
  },
};

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  status,
  trend,
  icon,
  accentColor = 'indigo',
  className,
  isLoading = false,
  upIsGood = true,
}: MetricCardProps) {
  // Resolve effective accent color from status or accentColor
  const effectiveAccent: keyof typeof accentMap = React.useMemo(() => {
    if (status === 'danger') return 'rose';
    if (status === 'warning') return 'amber';
    if (status === 'success') return 'emerald';
    if (status === 'info') return 'cyan';
    return (accentColor as keyof typeof accentMap) || 'indigo';
  }, [status, accentColor]);

  const accent = accentMap[effectiveAccent] || accentMap.indigo;

  const trendColor = React.useMemo(() => {
    if (!trend) return '';
    if (trend.direction === 'neutral') return 'text-[var(--foreground-muted)]';
    const isPositive =
      (trend.direction === 'up' && upIsGood) ||
      (trend.direction === 'down' && !upIsGood);
    return isPositive ? 'text-emerald-400' : 'text-rose-400';
  }, [trend, upIsGood]);

  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
        ? TrendingDown
        : Minus;

  return (
    <div
      className={clsx(
        'obsidian-card group relative overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-300',
        accent.glow,
        className
      )}
    >
      {/* Specular Edge Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          {title}
        </span>
        {icon && (
          <span
            className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-105',
              accent.icon
            )}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mt-2.5">
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded-md bg-white/10" />
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)] font-mono-code">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-[var(--foreground-muted)] uppercase font-mono">
                {unit}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-1 text-xs text-[var(--foreground-muted)] truncate">{subtitle}</p>
      )}

      {/* Trend */}
      {trend && (
        <div className={clsx('mt-2.5 flex items-center gap-1.5 text-xs font-medium', trendColor)}>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">
            <TrendIcon className="h-3 w-3" />
            <span className="font-semibold text-[11px]">{trend.value}</span>
          </div>
          {trend.label && (
            <span className="text-[11px] text-[var(--foreground-muted)]">{trend.label}</span>
          )}
        </div>
      )}

      {/* Bottom accent glow bar */}
      <div
        className={clsx(
          'absolute bottom-0 inset-x-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity',
          accent.bar
        )}
      />
    </div>
  );
}
