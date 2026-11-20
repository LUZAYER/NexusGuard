'use client';

import React, { useState } from 'react';
import { Key, Plus, Copy, Check, Trash2, ShieldCheck } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([
    { id: '1', name: 'Production OTel Ingress Key', prefix: 'nxo_live_77f8...', created: '2026-10-14', lastUsed: 'Just now' },
    { id: '2', name: 'Sandbox Simulator Key', prefix: 'nxo_test_12a9...', created: '2026-11-01', lastUsed: '5m ago' },
    { id: '3', name: 'Evaluation Runner CI/CD', prefix: 'nxo_eval_99b4...', created: '2026-11-12', lastUsed: '1h ago' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">API Keys & Ingestion Tokens</h1>
          <p className="text-xs text-slate-400 mt-1">Authenticate OpenTelemetry collectors and Agent SDK telemetry streams.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>Generate New Key</span>
        </button>
      </div>

      <div className="space-y-4">
        {keys.map((k) => (
          <div key={k.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">{k.name}</h4>
              <span className="text-xs font-mono text-indigo-400 mt-1 block">{k.prefix}</span>
              <span className="text-[10px] text-slate-500">Created: {k.created} • Last active: {k.lastUsed}</span>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-xs text-slate-300">
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
