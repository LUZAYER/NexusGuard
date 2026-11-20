'use client';

import { use } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, TrendingUp, Download } from 'lucide-react';
import Link from 'next/link';
import { mockEvalDetails } from '@/lib/mock-data';
import EvalScoreRadar from '@/components/charts/EvalScoreRadar';
import LatencyHistogram from '@/components/charts/LatencyHistogram';

const scoreColor = (score: number) =>
  score >= 0.8 ? 'text-emerald-400' : score >= 0.6 ? 'text-amber-400' : 'text-red-400';

function ScoreDistribution({ data }: { data: { range: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => (
        <div key={d.range} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-indigo-500/60 rounded-t hover:bg-indigo-500 transition-colors"
            style={{ height: `${(d.count / max) * 100}%` }}
            title={`${d.range}: ${d.count}`}
          />
          <span className="text-xs text-slate-500">{d.range}</span>
        </div>
      ))}
    </div>
  );
}

export default function EvalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const eval_ = mockEvalDetails;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/evals" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{eval_.name}</h1>
            <p className="text-slate-400 mt-0.5 text-sm">Eval ID: {id}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm border border-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export Results
          </button>
        </div>

        {/* Config */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Run Configuration</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Model', value: eval_.config.model },
              { label: 'Dataset', value: eval_.config.dataset },
              { label: 'Evaluator', value: eval_.config.evaluator },
              { label: 'Metrics', value: eval_.config.metrics.join(', ') },
            ].map(item => (
              <div key={item.label}>
                <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                <div className="text-sm text-white font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Avg Score', value: `${(eval_.metrics.avgScore * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-indigo-400' },
            { label: 'Pass Rate', value: `${(eval_.metrics.passRate * 100).toFixed(1)}%`, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Fail Rate', value: `${(eval_.metrics.failRate * 100).toFixed(1)}%`, icon: XCircle, color: 'text-red-400' },
            { label: 'Avg Latency', value: `${eval_.metrics.avgLatency}ms`, icon: Clock, color: 'text-cyan-400' },
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

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Score Distribution</h3>
            <ScoreDistribution data={eval_.scoreDistribution} />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Multi-Metric Radar</h3>
            <EvalScoreRadar data={eval_.radarData} />
          </div>
        </div>

        {/* Latency histogram */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Latency Distribution</h3>
          <LatencyHistogram data={eval_.latencyHistogram} />
        </div>

        {/* Results table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300">Results ({eval_.results.length} samples)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['#', 'Input', 'Expected', 'Actual Output', 'Score', 'Pass/Fail'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-400 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eval_.results.map((r, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-slate-300 max-w-xs truncate">{r.input}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{r.expected}</td>
                    <td className="px-4 py-3 text-sm text-slate-300 max-w-xs truncate">{r.actual}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${scoreColor(r.score)}`}>{(r.score * 100).toFixed(0)}%</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.pass ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Pass
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <XCircle className="w-3.5 h-3.5" /> Fail
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
