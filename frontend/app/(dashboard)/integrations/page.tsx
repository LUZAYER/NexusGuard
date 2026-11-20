'use client';

import React from 'react';
import {
  Plug,
  CheckCircle,
  ExternalLink,
  Plus,
  Shield,
  Layers,
} from 'lucide-react';
import { mockIntegrations } from '@/lib/mock-data';

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Ecosystem & Framework Integrations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect autonomous agent runtimes, OpenTelemetry collectors, local LLM daemons, and financial simulators.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>Add Custom Connector</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockIntegrations.map((item) => (
          <div
            key={item.name}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{item.icon}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    item.status === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm">{item.name}</h3>
              <span className="text-[10px] text-indigo-400 font-mono block mb-2">{item.category}</span>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px]">Configuration verified</span>
              <button className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px]">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
