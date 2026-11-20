'use client';

import React from 'react';
import {
  Layers,
  Activity,
  CheckCircle,
  Network,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { mockSystemHealth } from '@/lib/mock-data';

export default function ObservabilityPage() {
  const redMetrics = [
    { service: 'fraud-scorer (LightGBM)', rate: '1,420 req/s', error: '0.02%', duration: '11.2ms' },
    { service: 'graph-intelligence (Network)', rate: '420 req/s', error: '0.00%', duration: '18.4ms' },
    { service: 'agent-investigator (LLM)', rate: '85 req/s', error: '1.24%', duration: '412.0ms' },
    { service: 'guard-sanitizer (Prompt)', rate: '1,420 req/s', error: '0.00%', duration: '1.4ms' },
    { service: 'ledger-sign (SHA-256)', rate: '1,420 req/s', error: '0.00%', duration: '0.8ms' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight">OpenTelemetry & Service Observability</h1>
        <p className="text-xs text-slate-400 mt-1">
          RED metrics (Rate, Errors, Duration), distributed span correlations, and system health status.
        </p>
      </div>

      {/* System Health Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {mockSystemHealth.map((item) => (
          <div key={item.name} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">{item.name}</h4>
              <span className="text-[10px] text-slate-500 font-mono">P95: {item.latency}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
              HEALTHY
            </span>
          </div>
        ))}
      </div>

      {/* RED Metrics Table */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          Service Map & RED Metrics
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Microservice</th>
                <th className="py-2.5 px-3">Throughput (Rate)</th>
                <th className="py-2.5 px-3">Error Rate</th>
                <th className="py-2.5 px-3">P95 Latency (Duration)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {redMetrics.map((r) => (
                <tr key={r.service} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-slate-200">{r.service}</td>
                  <td className="py-3 px-3 text-cyan-400">{r.rate}</td>
                  <td className="py-3 px-3 text-emerald-400">{r.error}</td>
                  <td className="py-3 px-3 text-indigo-400">{r.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
