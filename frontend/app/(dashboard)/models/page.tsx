'use client';

import React from 'react';
import {
  Cpu,
  Layers,
  Zap,
  Gauge,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export default function ModelsPage() {
  const models = [
    {
      name: 'Gemini 2.0 Flash',
      provider: 'Google AI',
      context: '1,048,576 tokens',
      inputCost: '$0.10 / 1M',
      outputCost: '$0.40 / 1M',
      latency: '240ms',
      quality: '94.2%',
      tags: ['Multimodal', 'Reasoning', 'Fast Ingestion'],
    },
    {
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      context: '200,000 tokens',
      inputCost: '$3.00 / 1M',
      outputCost: '$15.00 / 1M',
      latency: '450ms',
      quality: '96.8%',
      tags: ['Tool Calling', 'Faithful Explanations'],
    },
    {
      name: 'Llama 3.1 70B (Ollama)',
      provider: 'Meta / Local',
      context: '128,000 tokens',
      inputCost: '$0.00 (Self-hosted)',
      outputCost: '$0.00 (Self-hosted)',
      latency: '310ms',
      quality: '91.4%',
      tags: ['Air-Gapped', 'Zero Cloud Egress'],
    },
    {
      name: 'DeepSeek V3',
      provider: 'DeepSeek',
      context: '64,000 tokens',
      inputCost: '$0.14 / 1M',
      outputCost: '$0.28 / 1M',
      latency: '280ms',
      quality: '92.6%',
      tags: ['Cost-Efficient', 'Code & Math'],
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight">Model Registry & Latency Benchmarks</h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalog of connected foundation models, prompt caching support, and evaluated empirical latency.
        </p>
      </div>

      {/* Models Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {models.map((m) => (
          <div
            key={m.name}
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {m.provider}
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5" />
                  P95: {m.latency}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{m.name}</h3>
              <p className="text-xs text-slate-400 mb-4">Context Window: {m.context}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {m.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                In: <span className="text-slate-200">{m.inputCost}</span>
              </span>
              <span className="text-slate-400">
                Out: <span className="text-slate-200">{m.outputCost}</span>
              </span>
              <span className="text-indigo-400 font-bold">Accuracy: {m.quality}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
