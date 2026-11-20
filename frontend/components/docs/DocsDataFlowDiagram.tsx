'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Database,
  Cpu,
  GitBranch,
  FileCheck,
  ShieldAlert,
  Lock,
  CheckCircle,
} from 'lucide-react';

interface Stage {
  step: string;
  title: string;
  engine: string;
  latency: string;
  detail: string;
}

const STAGES: Stage[] = [
  {
    step: '01',
    title: 'Streaming Ingestion',
    engine: 'FastAPI + Pydantic v2',
    latency: '1.2ms',
    detail: 'Incoming MFS transaction payload arrives via REST or WebSocket. Pydantic v2 enforces ISO currency, device ID hashes, and exact Decimal monetary precision.',
  },
  {
    step: '02',
    title: 'Sliding-Window Baseline',
    engine: 'Redis Pipelined Sets',
    latency: '0.8ms',
    detail: 'Fetches sender and recipient 60s, 5m, 1h, and 24h rolling velocity counters. Computes z-score divergence against 90-day historical customer profiles.',
  },
  {
    step: '03',
    title: 'Dual ML Ensemble Inference',
    engine: 'LightGBM + Isolation Forest',
    latency: '11.2ms',
    detail: 'Simultaneously generates supervised fraud probability and unsupervised anomaly scores. Computes TreeSHAP relative gains to formulate Reason Codes (RC-01 to RC-12).',
  },
  {
    step: '04',
    title: 'Graph Link & Cycle Scan',
    engine: 'NetworkX BFS Algorithm',
    latency: '6.4ms',
    detail: 'Traverses 4-hop counterparty filaments to detect circular wash loops (A → B → C → D → A), rapid fund consolidation, and money mule aggregation hubs.',
  },
  {
    step: '05',
    title: 'Autonomous SAR Synthesis',
    engine: 'LangGraph + Ollama / Claude',
    latency: '1.8s (Async)',
    detail: 'If risk exceeds critical threshold (>80.0), LangGraph launches multi-agent investigation, scans pgvector statutory guidance, and compiles formal SAR narrative.',
  },
  {
    step: '06',
    title: 'HITL Clearance & Ledger Seal',
    engine: 'SHA-256 Hash Chaining',
    latency: 'Instant',
    detail: 'Compliance officer approves or rejects automated intervention (wallet freeze, transfer block). Cryptographic block seals the evidence trail for central bank audits.',
  },
];

export function DocsDataFlowDiagram() {
  const [activeStep, setActiveStep] = useState(2);

  return (
    <div className="rounded-2xl border border-[var(--card-border)] obsidian-card p-6 md:p-8 space-y-6">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-primary)] font-bold">
          Data Lifecycle & Pipeline Flow
        </span>
        <h3 className="text-lg font-bold text-[var(--foreground)] mt-0.5">
          Sub-25ms Real-Time Ingestion to Ledger Seal
        </h3>
        <p className="text-xs text-[var(--foreground-muted)]">
          Follow the transaction lifecycle from raw edge arrival through dual inference, graph analysis, and immutable audit chaining.
        </p>
      </div>

      {/* Stage Stepper Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {STAGES.map((s, idx) => (
          <button
            key={s.step}
            onClick={() => setActiveStep(idx)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeStep === idx
                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--foreground)] ring-1 ring-[var(--accent-primary)]/40 shadow-xs'
                : 'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:border-[var(--card-border-hover)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[var(--accent-primary)]">
                {s.step}
              </span>
              <span className="text-[9px] font-mono opacity-60">
                {s.latency}
              </span>
            </div>
            <div className="font-bold text-xs text-[var(--foreground)] mt-1 truncate">
              {s.title}
            </div>
          </button>
        ))}
      </div>

      {/* Active Stage Callout Box */}
      <div className="p-5 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] text-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--card-border)] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[var(--accent-primary)] text-white font-mono text-[10px] font-bold">
              STAGE {STAGES[activeStep].step}
            </span>
            <span className="font-bold text-sm text-[var(--foreground)]">
              {STAGES[activeStep].title}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-[var(--foreground-muted)]">Engine: <strong className="text-[var(--foreground)]">{STAGES[activeStep].engine}</strong></span>
            <span className="text-emerald-400 font-bold">Latency: {STAGES[activeStep].latency}</span>
          </div>
        </div>

        <p className="text-xs text-[var(--foreground)] leading-relaxed bg-[var(--card-bg)] p-3.5 rounded-xl border border-[var(--card-border)]">
          {STAGES[activeStep].detail}
        </p>
      </div>
    </div>
  );
}
