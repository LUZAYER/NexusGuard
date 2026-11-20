'use client';

import React, { useEffect, useState } from 'react';

/**
 * Custom hook to simulate or hold a high-fidelity skeleton for a specified delay (default 1000ms = 1s).
 * Re-triggers whenever triggerKey changes (e.g. tab, scenario, page).
 */
export function useSkeletonDelay(delayMs: number = 1000, triggerKey?: any): boolean {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [triggerKey, delayMs]);

  return loading;
}

/**
 * Base Shimmer Bar component
 */
export function SkeletonBlock({
  className = '',
  rounded = 'rounded-lg',
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`masterclass-shimmer bg-[var(--surface-hover)] border border-[var(--card-border)]/40 ${rounded} ${className}`}
    />
  );
}

/**
 * ── 1. Executive Dashboard Skeleton ─────────────────────────────────────────
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Executive Command Header */}
      <div className="rounded-2xl obsidian-card p-6 md:p-7 border border-[var(--card-border)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-3 max-w-3xl flex-1">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-6 w-36 rounded-md" />
              <SkeletonBlock className="h-6 w-44 rounded-md" />
              <SkeletonBlock className="h-6 w-32 rounded-md" />
            </div>
            <SkeletonBlock className="h-9 w-3/4 max-w-lg rounded-lg" />
            <SkeletonBlock className="h-4 w-full max-w-2xl rounded-md" />
            <SkeletonBlock className="h-4 w-4/5 max-w-xl rounded-md" />
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <SkeletonBlock className="h-10 w-48 rounded-xl" />
            <SkeletonBlock className="h-10 w-48 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Controlled Demo Scenarios Card Skeleton */}
      <div className="obsidian-card rounded-2xl border border-[var(--card-border)] overflow-hidden">
        <div className="bg-[var(--background-secondary)] px-5 py-3.5 border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SkeletonBlock className="h-4 w-4 rounded-full" />
            <SkeletonBlock className="h-4 w-60 rounded-md" />
          </div>
          <SkeletonBlock className="h-3 w-40 rounded-md" />
        </div>
        <div className="p-4 border-b border-[var(--card-border)] bg-[var(--background-secondary)]/30 flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonBlock key={i} className="h-9 w-36 rounded-xl" />
          ))}
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <SkeletonBlock className="h-5 w-64 rounded-md" />
              <SkeletonBlock className="h-4 w-96 rounded-md" />
            </div>
            <div className="flex gap-3">
              <SkeletonBlock className="h-9 w-32 rounded-xl" />
              <SkeletonBlock className="h-9 w-36 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 6 Metric Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="obsidian-card rounded-2xl p-4 border border-[var(--card-border)] flex flex-col justify-between h-32 space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3 w-20 rounded-md" />
              <SkeletonBlock className="h-7 w-7 rounded-xl" />
            </div>
            <div className="space-y-1">
              <SkeletonBlock className="h-7 w-24 rounded-lg" />
              <SkeletonBlock className="h-3 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Dual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="obsidian-card rounded-2xl p-5 border border-[var(--card-border)] space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-40 rounded-md" />
            <SkeletonBlock className="h-6 w-24 rounded-lg" />
          </div>
          <div className="h-56 w-full flex items-end justify-between gap-2 pt-6 px-4">
            {[40, 65, 80, 50, 90, 75, 60, 85, 95, 70, 60, 80].map((h, idx) => (
              <div
                key={idx}
                className="w-full rounded-t-md bg-[var(--surface-hover)] border-t border-[var(--card-border)]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="obsidian-card rounded-2xl p-5 border border-[var(--card-border)] space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-40 rounded-md" />
            <SkeletonBlock className="h-6 w-24 rounded-lg" />
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-dashed border-[var(--card-border)] animate-spin" />
          </div>
        </div>
      </div>

      {/* Live Transaction Stream Table Skeleton */}
      <div className="obsidian-card rounded-2xl border border-[var(--card-border)] overflow-hidden">
        <div className="p-4 bg-[var(--background-secondary)] border-b border-[var(--card-border)] flex items-center justify-between">
          <SkeletonBlock className="h-4 w-48 rounded-md" />
          <SkeletonBlock className="h-7 w-32 rounded-lg" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between gap-4 py-2 border-b border-[var(--card-border)]/40">
              <SkeletonBlock className="h-4 w-28 rounded-md" />
              <SkeletonBlock className="h-4 w-36 rounded-md" />
              <SkeletonBlock className="h-4 w-32 rounded-md" />
              <SkeletonBlock className="h-5 w-24 rounded-md" />
              <SkeletonBlock className="h-6 w-20 rounded-xl" />
              <SkeletonBlock className="h-7 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ── 2. Transactions Surveillance Table Skeleton ──────────────────────────────
 */
export function TransactionsTableSkeleton() {
  return (
    <div className="space-y-5 pb-12 animate-pulse">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-7 w-64 rounded-lg" />
            <SkeletonBlock className="h-5 w-20 rounded-md" />
          </div>
          <SkeletonBlock className="h-3.5 w-80 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <SkeletonBlock className="h-9 w-48 rounded-xl" />
          <SkeletonBlock className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Control Bar: Risk Pills, Sort, PageSize, Search */}
      <div className="obsidian-card p-3 rounded-2xl border border-[var(--card-border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SkeletonBlock className="h-4 w-14 rounded-md" />
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBlock key={i} className="h-8 w-20 rounded-xl" />
          ))}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <SkeletonBlock className="h-9 w-36 rounded-xl" />
          <SkeletonBlock className="h-9 w-24 rounded-xl" />
          <SkeletonBlock className="h-9 w-48 rounded-xl" />
        </div>
      </div>

      {/* Table Rows Skeleton */}
      <div className="obsidian-card rounded-2xl border border-[var(--card-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--card-border)]">
              <tr>
                {['TXN CODE', 'TIMESTAMP', 'CUSTOMER', 'TYPE', 'AMOUNT', 'SENDER / RECIPIENT', 'PRIMARY SIGNAL', 'RISK TIER', 'ACTION'].map(
                  (header, idx) => (
                    <th key={idx} className="py-3 px-4">
                      <SkeletonBlock className="h-3 w-16 rounded-md" />
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]/40">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                <tr key={row} className="py-2.5">
                  <td className="py-3 px-4">
                    <SkeletonBlock className="h-4 w-24 rounded-md font-mono" />
                  </td>
                  <td className="py-3 px-4">
                    <SkeletonBlock className="h-3.5 w-32 rounded-md" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <SkeletonBlock className="h-4 w-28 rounded-md" />
                      <SkeletonBlock className="h-2.5 w-16 rounded-sm" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <SkeletonBlock className="h-3.5 w-20 rounded-md" />
                  </td>
                  <td className="py-3 px-4">
                    <SkeletonBlock className="h-4 w-20 rounded-md" />
                  </td>
                  <td className="py-3 px-4">
                    <SkeletonBlock className="h-3.5 w-24 rounded-md" />
                  </td>
                  <td className="py-3 px-4">
                    <SkeletonBlock className="h-5 w-24 rounded-md" />
                  </td>
                  <td className="py-3 px-4">
                    <SkeletonBlock className="h-6 w-24 rounded-xl" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <SkeletonBlock className="h-7 w-16 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * ── 3. ScamShield Network Graph Skeleton ────────────────────────────────────
 */
export function NetworkGraphSkeleton() {
  return (
    <div className="space-y-5 pb-12 animate-pulse">
      {/* Scenario Tabs Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="obsidian-card p-3 rounded-2xl border border-[var(--card-border)] space-y-2">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-4 w-32 rounded-md" />
              <SkeletonBlock className="h-4 w-12 rounded-md" />
            </div>
            <SkeletonBlock className="h-3 w-44 rounded-sm" />
          </div>
        ))}
      </div>

      {/* Main Canvas & Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Radar Canvas with sweeping scanner effect */}
        <div className="lg:col-span-8 xl:col-span-9 obsidian-card rounded-2xl border border-[var(--card-border)] h-[580px] relative overflow-hidden flex items-center justify-center bg-[var(--background-secondary)]/50">
          {/* Concentric Radar Rings */}
          <div className="absolute w-[440px] h-[440px] rounded-full border border-[var(--card-border)]/40 flex items-center justify-center">
            <div className="w-[320px] h-[320px] rounded-full border border-[var(--card-border)]/50 flex items-center justify-center">
              <div className="w-[180px] h-[180px] rounded-full border border-[var(--card-border)]/60 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)]/80 shadow-md shadow-[var(--accent-primary)]" />
              </div>
            </div>
          </div>

          {/* Sweeping Radar Filament */}
          <div className="absolute w-[440px] h-[440px] rounded-full overflow-hidden pointer-events-none radar-sweep-beam">
            <div className="w-1/2 h-1/2 origin-bottom-right bg-gradient-to-tr from-[var(--accent-primary)]/20 to-transparent" />
          </div>

          {/* Ghost Cyber Nodes */}
          <div className="absolute top-24 left-32">
            <SkeletonBlock className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)]/40" />
          </div>
          <div className="absolute bottom-28 left-48">
            <SkeletonBlock className="w-10 h-10 rounded-full border border-emerald-400/40" />
          </div>
          <div className="absolute top-36 right-40">
            <SkeletonBlock className="w-11 h-11 rounded-full border border-rose-500/40" />
          </div>
          <div className="absolute bottom-32 right-32">
            <SkeletonBlock className="w-12 h-12 rounded-full border border-cyan-400/40" />
          </div>

          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <SkeletonBlock className="h-4 w-40 rounded-md" />
            <SkeletonBlock className="h-4 w-48 rounded-md" />
          </div>
        </div>

        {/* Entity Dossier Drawer Skeleton */}
        <div className="lg:col-span-4 xl:col-span-3 obsidian-card rounded-2xl border border-[var(--card-border)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
            <SkeletonBlock className="h-4 w-28 rounded-md" />
            <SkeletonBlock className="h-6 w-20 rounded-xl" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-36 rounded-md" />
            <SkeletonBlock className="h-3.5 w-48 rounded-md" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--card-border)]/40">
                <SkeletonBlock className="h-3 w-20 rounded-md" />
                <SkeletonBlock className="h-4 w-24 rounded-md" />
              </div>
            ))}
          </div>
          <div className="pt-3 space-y-2">
            <SkeletonBlock className="h-4 w-32 rounded-md" />
            <SkeletonBlock className="h-16 w-full rounded-xl" />
            <SkeletonBlock className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ── 4. Model Governance & TreeSHAP Registry Skeleton ────────────────────────
 */
export function ModelGovernanceSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <SkeletonBlock className="h-7 w-72 rounded-lg" />
          <SkeletonBlock className="h-3.5 w-96 rounded-md" />
        </div>
        <SkeletonBlock className="h-8 w-60 rounded-xl" />
      </div>

      {/* 4 Model Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="obsidian-card p-4 rounded-2xl border border-[var(--card-border)] space-y-3">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-5 w-16 rounded-md" />
              <SkeletonBlock className="h-5 w-24 rounded-md" />
            </div>
            <SkeletonBlock className="h-5 w-44 rounded-md" />
            <div className="pt-2 flex justify-between border-t border-[var(--card-border)]/40">
              <SkeletonBlock className="h-3 w-16 rounded-md" />
              <SkeletonBlock className="h-3 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Grid: TreeSHAP Bar Chart + Continuous Drift Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 obsidian-card p-5 rounded-2xl border border-[var(--card-border)] space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-48 rounded-md" />
            <SkeletonBlock className="h-4 w-32 rounded-md font-mono" />
          </div>
          {/* 10 horizontal bars */}
          <div className="space-y-3 pt-2">
            {[88, 76, 64, 55, 48, 42, 36, 28, 22, 16].map((w, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <SkeletonBlock className="h-3 w-28 rounded-md" />
                <div
                  className="h-5 rounded-md bg-[var(--surface-hover)] border border-[var(--card-border)] masterclass-shimmer"
                  style={{ width: `${w}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 obsidian-card p-5 rounded-2xl border border-[var(--card-border)] space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-52 rounded-md" />
            <SkeletonBlock className="h-6 w-28 rounded-lg" />
          </div>
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((row) => (
              <div key={row} className="flex items-center justify-between py-2 border-b border-[var(--card-border)]/40">
                <SkeletonBlock className="h-3.5 w-32 rounded-md" />
                <SkeletonBlock className="h-3.5 w-16 rounded-md font-mono" />
                <SkeletonBlock className="h-3.5 w-16 rounded-md font-mono" />
                <SkeletonBlock className="h-3.5 w-14 rounded-md font-mono" />
                <SkeletonBlock className="h-5 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ── 5. Universal SOC Data Grid Skeleton ──────────────────────────────────────
 */
export function UniversalDataSkeleton({
  title = 'Accessing Cryptographic Financial Ledger...',
  rows = 8,
}: {
  title?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-5 pb-12 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <SkeletonBlock className="h-7 w-64 rounded-lg" />
          <SkeletonBlock className="h-3.5 w-80 rounded-md" />
        </div>
        <div className="flex gap-2.5">
          <SkeletonBlock className="h-9 w-32 rounded-xl" />
          <SkeletonBlock className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="obsidian-card p-4 rounded-2xl border border-[var(--card-border)] space-y-2">
            <SkeletonBlock className="h-3 w-20 rounded-md" />
            <SkeletonBlock className="h-7 w-28 rounded-lg" />
            <SkeletonBlock className="h-2.5 w-36 rounded-sm" />
          </div>
        ))}
      </div>

      <div className="obsidian-card rounded-2xl border border-[var(--card-border)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
          <SkeletonBlock className="h-4 w-48 rounded-md" />
          <SkeletonBlock className="h-8 w-36 rounded-xl" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center justify-between py-2.5 border-b border-[var(--card-border)]/40 gap-4">
              <SkeletonBlock className="h-4 w-28 rounded-md" />
              <SkeletonBlock className="h-4 w-40 rounded-md" />
              <SkeletonBlock className="h-4 w-32 rounded-md" />
              <SkeletonBlock className="h-4 w-24 rounded-md" />
              <SkeletonBlock className="h-6 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
