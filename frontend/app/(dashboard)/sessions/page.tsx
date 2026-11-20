import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { StatusBadge, FrameworkBadge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/ui/MetricCard';
import { mockSessions } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Sessions — NexusGuard',
  description: 'Browse and filter all agent sessions',
};

const FRAMEWORKS = ['All', 'LangChain', 'LangGraph', 'CrewAI', 'AutoGen', 'LlamaIndex', 'OpenAI'];
const STATUSES = ['All', 'Running', 'Completed', 'Failed', 'Pending'];
const PAGE_SIZE = 15;

export default function SessionsPage({
  searchParams,
}: {
  searchParams?: { page?: string; framework?: string; status?: string; q?: string };
}) {
  const page = Number(searchParams?.page ?? 1);
  const framework = searchParams?.framework ?? 'All';
  const status = searchParams?.status ?? 'All';
  const q = searchParams?.q ?? '';

  // Filter
  let filtered = mockSessions;
  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.id.includes(q) ||
        s.agentName.toLowerCase().includes(q.toLowerCase())
    );
  }
  if (framework !== 'All') {
    filtered = filtered.filter(
      (s) => s.framework.toLowerCase() === framework.toLowerCase()
    );
  }
  if (status !== 'All') {
    filtered = filtered.filter(
      (s) => s.status.toLowerCase() === status.toLowerCase()
    );
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSessions = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Quick stats
  const running = mockSessions.filter((s) => s.status === 'running').length;
  const failed = mockSessions.filter((s) => s.status === 'failed').length;
  const totalTokens = mockSessions.reduce((acc, s) => acc + s.tokens, 0);
  const totalCost = mockSessions.reduce((acc, s) => acc + s.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sessions</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {mockSessions.length.toLocaleString()} total sessions
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard title="Active" value={running} accentColor="emerald" />
        <MetricCard title="Failed (24h)" value={failed} accentColor="rose" upIsGood={false} />
        <MetricCard
          title="Total Tokens (24h)"
          value={(totalTokens / 1_000_000).toFixed(2)}
          unit="M"
          accentColor="indigo"
        />
        <MetricCard
          title="Total Cost (24h)"
          value={`$${totalCost.toFixed(2)}`}
          accentColor="amber"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 min-w-[200px]">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            defaultValue={q}
            placeholder="Search session ID or agent…"
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
          />
        </div>

        {/* Framework filter */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <select
            defaultValue={framework}
            className="bg-transparent text-sm text-slate-300 outline-none cursor-pointer"
          >
            {FRAMEWORKS.map((f) => (
              <option key={f} value={f} className="bg-slate-900">
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
          <select
            defaultValue={status}
            className="bg-transparent text-sm text-slate-300 outline-none cursor-pointer"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-slate-900">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
          <input
            type="date"
            className="bg-transparent text-sm text-slate-400 outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {[
                  'Session ID',
                  'Agent Name',
                  'Framework',
                  'Status',
                  'Events',
                  'Tokens',
                  'Cost',
                  'Duration',
                  'Started',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {pageSessions.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-800/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/sessions/${s.id}`}
                      className="font-mono text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      {s.id.slice(0, 12)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">{s.agentName}</td>
                  <td className="px-4 py-3">
                    <FrameworkBadge framework={s.framework} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {s.events.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {s.tokens.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    ${s.cost.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{s.duration}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(s.startedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/sessions?page=${page - 1}`}
              className={
                page <= 1
                  ? 'pointer-events-none text-slate-700'
                  : 'rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors'
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="text-xs text-slate-400">
              {page} / {totalPages}
            </span>
            <Link
              href={`/sessions?page=${page + 1}`}
              className={
                page >= totalPages
                  ? 'pointer-events-none text-slate-700'
                  : 'rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors'
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
