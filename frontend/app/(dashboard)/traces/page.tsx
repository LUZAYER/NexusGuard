'use client';

import { useState } from 'react';
import { Search, Filter, ChevronRight, X, Clock, Layers, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { mockTraces } from '@/lib/mock-data';

const statusColors: Record<string, string> = {
  ok: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  timeout: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const spanColors = ['bg-indigo-500', 'bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500'];

function FlameGraph({ spans }: { spans: Array<{ name: string; start: number; duration: number; service: string }> }) {
  const totalDuration = Math.max(...spans.map((s) => s.start + s.duration));
  return (
    <div className="space-y-1">
      {spans.map((span, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-32 text-xs text-slate-400 truncate">{span.name}</span>
          <div className="flex-1 relative h-6 bg-slate-800 rounded">
            <div
              className={`absolute top-0.5 bottom-0.5 rounded ${spanColors[i % spanColors.length]} opacity-80`}
              style={{
                left: `${(span.start / totalDuration) * 100}%`,
                width: `${(span.duration / totalDuration) * 100}%`,
              }}
            />
          </div>
          <span className="w-16 text-xs text-slate-400 text-right">{span.duration}ms</span>
        </div>
      ))}
    </div>
  );
}

export default function TracesPage() {
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTrace, setSelectedTrace] = useState<(typeof mockTraces)[0] | null>(null);

  const services = ['All', ...Array.from(new Set(mockTraces.map((t) => t.service)))];
  const statuses = ['All', 'ok', 'error', 'timeout'];

  const filtered = mockTraces.filter((t) => {
    if (selectedService !== 'All' && t.service !== selectedService) return false;
    if (selectedStatus !== 'All' && t.status !== selectedStatus) return false;
    if (search && !t.traceId.toLowerCase().includes(search.toLowerCase()) && !t.operation.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Distributed Traces</h1>
            <p className="text-slate-400 mt-1">OpenTelemetry-compatible trace explorer</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              placeholder="Search trace ID or operation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            {services.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
            <option>Last 1 hour</option>
            <option>Last 6 hours</option>
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:text-white">
            <Filter className="w-4 h-4" /> More filters
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Traces', value: filtered.length.toString(), icon: Layers, color: 'text-indigo-400' },
            { label: 'Error Rate', value: `${((filtered.filter(t => t.status === 'error').length / (filtered.length || 1)) * 100).toFixed(1)}%`, icon: AlertCircle, color: 'text-red-400' },
            { label: 'Avg Duration', value: `${Math.round(filtered.reduce((a, t) => a + t.duration, 0) / (filtered.length || 1))}ms`, icon: Clock, color: 'text-cyan-400' },
            { label: 'Success Rate', value: `${((filtered.filter(t => t.status === 'ok').length / (filtered.length || 1)) * 100).toFixed(1)}%`, icon: CheckCircle, color: 'text-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Trace table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Trace ID</th>
                <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Service</th>
                <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Operation</th>
                <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Spans</th>
                <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Duration</th>
                <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Time</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trace) => (
                <tr
                  key={trace.traceId}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedTrace(trace)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-indigo-400">{trace.traceId}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{trace.service}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{trace.operation}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{trace.spanCount}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{trace.duration}ms</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[trace.status]}`}>
                      {trace.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{trace.timestamp}</td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Span detail drawer */}
      {selectedTrace && (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 overflow-y-auto">
          <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Trace Details</h2>
              <p className="text-xs font-mono text-indigo-400 mt-0.5">{selectedTrace.traceId}</p>
            </div>
            <button onClick={() => setSelectedTrace(null)} className="p-1.5 hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Service', value: selectedTrace.service },
                { label: 'Operation', value: selectedTrace.operation },
                { label: 'Duration', value: `${selectedTrace.duration}ms` },
                { label: 'Spans', value: selectedTrace.spanCount.toString() },
                { label: 'Status', value: selectedTrace.status },
                { label: 'Timestamp', value: selectedTrace.timestamp },
              ].map((item) => (
                <div key={item.label} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                  <div className="text-sm text-white font-medium">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Flame graph */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Flame Graph</h3>
              <FlameGraph spans={selectedTrace.spans} />
            </div>

            {/* Span attributes */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Span Attributes</h3>
              <div className="space-y-2">
                {selectedTrace.spans.map((span, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{span.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${spanColors[i % spanColors.length]} bg-opacity-20 text-white`}>
                        {span.service}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(span.attributes || {}).map(([k, v]) => (
                        <div key={k} className="text-xs">
                          <span className="text-slate-400">{k}: </span>
                          <span className="text-slate-200 font-mono">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
