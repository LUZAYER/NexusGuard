'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Cpu,
  Layers,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Terminal,
} from 'lucide-react';
import { mockSessions, mockTraces } from '@/lib/mock-data';
import { WaterfallTimeline } from '@/components/sessions/WaterfallTimeline';

export default function SessionDetailPage({ params }: { params?: Promise<{ id: string }> }) {
  const session = mockSessions[0];
  const [selectedEvent, setSelectedEvent] = useState<number>(0);

  const events = [
    { name: 'POST /v1/ingest', type: 'Ingress', duration: '2.1ms', status: 'ok', tokens: 420 },
    { name: 'PromptGuard.sanitize', type: 'Security', duration: '1.4ms', status: 'ok', tokens: 0 },
    { name: 'FeatureStore.query_velocity', type: 'Lookup', duration: '4.8ms', status: 'ok', tokens: 0 },
    { name: 'GraphEngine.get_syndicate_hops', type: 'Graph', duration: '18.2ms', status: 'ok', tokens: 1200 },
    { name: 'LightGBM.score_ensemble', type: 'Inference', duration: '11.5ms', status: 'ok', tokens: 0 },
    { name: 'LLMReasonAgent.generate_explanation', type: 'LLM Call', duration: '412.0ms', status: 'ok', tokens: 1840 },
    { name: 'Ledger.sign_sha256', type: 'Audit', duration: '0.8ms', status: 'ok', tokens: 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div>
        <Link
          href="/sessions"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sessions</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Session {session.id}</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {session.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Agent: {session.agentName} • Framework: {session.framework} • Duration: {session.duration}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Time-Travel Replay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Total Duration</span>
          <p className="text-xl font-bold text-white mt-1">{session.duration}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Tokens Ingested</span>
          <p className="text-xl font-bold text-indigo-400 mt-1">{session.tokens.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Estimated Cost</span>
          <p className="text-xl font-bold text-amber-400 mt-1">${session.cost.toFixed(4)}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400">Recorded Spans</span>
          <p className="text-xl font-bold text-cyan-400 mt-1">{events.length} Spans</p>
        </div>
      </div>

      {/* Waterfall & Trace Inspection View */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
            <h3 className="text-sm font-bold text-white mb-4">Chronological Waterfall Timeline</h3>
            <div className="space-y-2">
              {events.map((evt, idx) => (
                <div
                  key={evt.name}
                  onClick={() => setSelectedEvent(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                    selectedEvent === idx
                      ? 'border-indigo-500 bg-indigo-950/40'
                      : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">0{idx + 1}</span>
                    <span className="text-white font-semibold">{evt.name}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                      {evt.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>{evt.duration}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Span Detail Inspector */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            Span Attributes & State
          </h3>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-slate-300 space-y-3 overflow-x-auto">
            <div>
              <span className="text-slate-500 block text-[10px]">SPAN_NAME</span>
              <span className="text-indigo-400">{events[selectedEvent]?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">EXECUTION_TIME</span>
              <span>{events[selectedEvent]?.duration}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TOKENS_CONSUMED</span>
              <span>{events[selectedEvent]?.tokens}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">STATUS</span>
              <span className="text-emerald-400">STATUS_OK</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-500 block text-[10px]">CHECKPOINT_DIGEST</span>
              <span className="text-slate-400 text-[10px] break-all">
                sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
