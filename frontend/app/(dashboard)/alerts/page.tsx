'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle,
  XCircle,
  Bell,
  Sliders,
  RotateCcw,
  Clock,
  Filter,
} from 'lucide-react';
import { mockAlerts } from '@/lib/mock-data';
import { SeverityBadge } from '@/components/ui/Badge';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filterSeverity, setFilterSeverity] = useState('All');

  const resolveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const filtered = alerts.filter(
    (a) => filterSeverity === 'All' || a.severity.toLowerCase() === filterSeverity.toLowerCase()
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Circuit Breakers & Alerts</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
              {alerts.length} Triggered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time anomaly traps: infinite reasoning loops, cost spike breakers, and adversarial prompt injections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors">
            Configure Thresholds
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterSeverity === sev
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.time}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  {alert.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                onClick={() => resolveAlert(alert.id)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Acknowledge
              </button>
              <button
                onClick={() => resolveAlert(alert.id)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-xs font-semibold text-white transition-colors"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="font-bold text-white text-sm">All clear!</h4>
            <p className="text-xs text-slate-500">No active alerts match the selected severity filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
