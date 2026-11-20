'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Cpu,
} from 'lucide-react';
import { mockModelUsage, mockCostData } from '@/lib/mock-data';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function CostsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const totalCost = mockModelUsage.reduce((acc, m) => acc + m.cost, 0);
  const totalTokens = mockModelUsage.reduce((acc, m) => acc + m.tokens, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Token Cost & Billing Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-model spend monitoring, prompt caching savings, and budget forecasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Total Spend (Trailing 30d)</span>
          <p className="text-2xl font-black text-white mt-1">${totalCost.toFixed(2)}</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingDown className="w-3 h-3" />
            18% lower via context caching
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Tokens Processed</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">
            {(totalTokens / 1_000_000).toFixed(1)}M
          </p>
          <span className="text-[10px] text-slate-400">Ensemble across 5 models</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Budget Cap Utilization</span>
          <p className="text-2xl font-black text-amber-400 mt-1">29.6%</p>
          <span className="text-[10px] text-slate-400">$50.00 / hour threshold</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Local Free Inference (Ollama)</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">28.9M</p>
          <span className="text-[10px] text-emerald-400">Zero cloud API bill</span>
        </div>
      </div>

      {/* Historical Area Chart */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold text-white">Daily Cost Trend (USD)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockCostData}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: 8,
                }}
              />
              <Area type="monotone" dataKey="cost" stroke="#6366f1" fillOpacity={1} fill="url(#costGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-Model Breakdown Table */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold text-white">Per-Model Expenditure</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Total Requests</th>
                <th className="py-2.5 px-3">Tokens Consumed</th>
                <th className="py-2.5 px-3">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {mockModelUsage.map((m) => (
                <tr key={m.model} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-slate-200">{m.model}</td>
                  <td className="py-3 px-3 text-slate-400">{m.requests.toLocaleString()}</td>
                  <td className="py-3 px-3 text-indigo-400">{(m.tokens / 1_000_000).toFixed(2)}M</td>
                  <td className="py-3 px-3 text-amber-400 font-bold">${m.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
