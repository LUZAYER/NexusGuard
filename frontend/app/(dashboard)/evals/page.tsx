'use client';

import { useState } from 'react';
import { Plus, Search, Filter, ChevronDown, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { mockEvals } from '@/lib/mock-data';

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  running: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 animate-pulse',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  queued: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

function ScoreBar({ score }: { score: number }) {
  const pct = score * 100;
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-slate-300">{pct.toFixed(1)}%</span>
    </div>
  );
}

export default function EvalsPage() {
  const [search, setSearch] = useState('');
  const [modelFilter, setModelFilter] = useState('All');
  const [datasetFilter, setDatasetFilter] = useState('All');
  const [showNewEval, setShowNewEval] = useState(false);

  const models = ['All', ...Array.from(new Set(mockEvals.map(e => e.model)))];
  const datasets = ['All', ...Array.from(new Set(mockEvals.map(e => e.dataset)))];

  const filtered = mockEvals.filter(e => {
    if (modelFilter !== 'All' && e.model !== modelFilter) return false;
    if (datasetFilter !== 'All' && e.dataset !== datasetFilter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const avgScore = filtered.reduce((a, e) => a + e.score, 0) / (filtered.length || 1);
  const avgPassRate = filtered.reduce((a, e) => a + e.passRate, 0) / (filtered.length || 1);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Evaluation Runs</h1>
            <p className="text-slate-400 mt-1">Track model quality and performance benchmarks</p>
          </div>
          <button
            onClick={() => setShowNewEval(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> New Eval
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Evals', value: filtered.length.toString(), icon: TrendingUp, color: 'text-indigo-400' },
            { label: 'Avg Score', value: `${(avgScore * 100).toFixed(1)}%`, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Avg Pass Rate', value: `${(avgPassRate * 100).toFixed(1)}%`, icon: CheckCircle, color: 'text-cyan-400' },
            { label: 'Failed Evals', value: filtered.filter(e => e.status === 'failed').length.toString(), icon: XCircle, color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              placeholder="Search evaluations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={modelFilter} onChange={e => setModelFilter(e.target.value)}
          >
            {models.map(m => <option key={m}>{m}</option>)}
          </select>
          <select
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={datasetFilter} onChange={e => setDatasetFilter(e.target.value)}
          >
            {datasets.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Eval Name', 'Dataset', 'Model', 'Score', 'Pass Rate', 'Created', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs text-slate-400 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(evalRun => (
                <tr key={evalRun.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <a href={`/evals/${evalRun.id}`} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">{evalRun.name}</a>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{evalRun.dataset}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300">{evalRun.model}</span>
                  </td>
                  <td className="px-4 py-3"><ScoreBar score={evalRun.score} /></td>
                  <td className="px-4 py-3 text-sm text-slate-300">{(evalRun.passRate * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{evalRun.createdAt}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[evalRun.status]}`}>{evalRun.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/evals/${evalRun.id}`} className="text-xs text-slate-400 hover:text-white px-2 py-1 hover:bg-slate-700 rounded transition-colors">View →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New eval modal */}
      {showNewEval && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">New Evaluation</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Eval Name</label>
                <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Customer Support Quality v2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Model</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                    <option>claude-3-5-sonnet</option><option>gpt-4o</option><option>gemini-1-5-pro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Dataset</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                    <option>Customer Q&A v3</option><option>Code Gen Suite</option><option>Reasoning Bench</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Evaluator</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option>LLM-as-judge (GPT-4)</option><option>Exact match</option><option>ROUGE-L</option><option>Human</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNewEval(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={() => setShowNewEval(false)} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">Run Eval</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
