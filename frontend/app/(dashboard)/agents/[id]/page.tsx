'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bot,
  ArrowLeft,
  Cpu,
  Clock,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  GitBranch,
  Terminal,
  Settings,
  Flame,
} from 'lucide-react';
import { mockAgents } from '@/lib/mock-data';

export default function AgentDetailPage({ params }: { params?: Promise<{ id: string }> }) {
  const agent = mockAgents[0]; // Active demo agent

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Back button & Header */}
      <div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Agent Registry</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{agent.name}</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {agent.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">ID: {agent.id} • Registered on {agent.createdAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors">
              Configure Circuit Breaker
            </button>
            <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all">
              Run Evaluation Suite
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Total Invocations</span>
          <p className="text-2xl font-black text-white mt-1">{agent.stats.totalRuns.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400">+14% vs last week</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Precision / Success Rate</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{agent.stats.successRate}%</p>
          <span className="text-[10px] text-slate-400">Target &gt; 95%</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">P95 Latency</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">{agent.stats.avgLatency}ms</p>
          <span className="text-[10px] text-cyan-400">Sub-50ms SLA met</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Total Cost (USD)</span>
          <p className="text-2xl font-black text-amber-400 mt-1">${agent.stats.totalCost.toFixed(2)}</p>
          <span className="text-[10px] text-slate-400">Optimized via caching</span>
        </div>
      </div>

      {/* Lineage Tree & Architecture View */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          Agent Execution Graph & Subgraph Lineage
        </h3>
        <p className="text-xs text-slate-400">
          The recursive state graph orchestrating this agent’s tool transitions and circuit-breaker checkpoints.
        </p>

        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/80 font-mono text-xs text-indigo-300 space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <span>[START] Ingest Transaction Event</span>
            <span className="text-slate-600">→</span>
            <span className="text-cyan-400">PromptGuard Tokenizer</span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-400">Feature Store Cache</span>
          </div>
          <div className="flex items-center gap-2 pl-8 border-l border-indigo-500/40">
            <span className="text-indigo-400">↳ Graph Engine (3-hop neighbor sampling)</span>
            <span className="text-slate-600">→</span>
            <span className="text-purple-400">CircuitBreaker Watcher (max 10 loops)</span>
          </div>
          <div className="flex items-center gap-2 pl-16 border-l border-indigo-500/40">
            <span className="text-amber-400">↳ LightGBM + TreeSHAP Reasoning</span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-400">[END] Append SHA-256 Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
