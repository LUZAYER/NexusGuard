'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Plus,
  Search,
  Filter,
  Activity,
  Zap,
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { mockAgents } from '@/lib/mock-data';
import { FrameworkBadge } from '@/components/ui/Badge';

export default function AgentsPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filtered = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.model.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'All' || agent.type.includes(filterType);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Agent Registry</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {mockAgents.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered autonomous agents, decision loops, and tool-calling models running across your ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Agent</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search agents by name, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['All', 'Graph', 'Behavioral', 'Streaming'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {filtered.map((agent) => (
          <Link
            key={agent.id}
            href={`/agents/${agent.id}`}
            className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all group relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {agent.status}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{agent.type}</p>

              {/* Framework & Model Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {agent.model}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                  v{agent.version}
                </span>
              </div>
            </div>

            {/* Metrics Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Runs</span>
                <span className="text-xs font-bold text-slate-200">
                  {agent.stats.totalRuns.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Success</span>
                <span className="text-xs font-bold text-emerald-400">
                  {agent.stats.successRate}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Avg Latency</span>
                <span className="text-xs font-bold text-cyan-400">
                  {agent.stats.avgLatency}ms
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
