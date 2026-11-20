'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Terminal,
  Shield,
  Layers,
  Cpu,
  Network,
  Zap,
  Code,
  Copy,
  Check,
  CheckCircle,
  ExternalLink,
  Search,
  ChevronRight,
  Database,
  ArrowRight,
  Flame,
} from 'lucide-react';

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quickstart' | 'architecture' | 'mcp' | 'governance'>('quickstart');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const pythonSnippet = `import nexusguard
from nexusguard.guard import CircuitBreaker, PromptGuard

# 1. Initialize NexusGuard SDK (< 1.8ms telemetry overhead)
nexusguard.init(
    api_key="nxo_live_77f8a9...",
    project="mfs-fraud-shield",
    enable_circuit_breaker=True,
    max_loops=15,
    budget_cap_usd=25.0,
)

# 2. Decorate autonomous agents or tool-calling loops
@nexusguard.trace(name="MuleDetectionAgent", framework="LangGraph")
async def run_investigation(transaction_id: str):
    # Built-in guard scans inputs for prompt injection & data exfiltration
    clean_memo = PromptGuard.sanitize(input_payload.memo)
    
    # Execution trajectory is tracked in real-time with OTel spans
    subgraph = await graph_engine.get_hops(transaction_id, depth=3)
    score = await ensemble_scorer.predict(subgraph)
    
    return {"risk_score": score, "status": "HOLD_REVIEW"}`;

  const otelConfig = `# /etc/otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 500ms
  memory_limiter:
    check_interval: 1s
    limit_mib: 512

exporters:
  nexusguard:
    endpoint: "https://ingest.nexusguard.ai:443"
    api_key: "\${NEXUSOPS_API_KEY}"
    encryption: "tls"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [nexusguard]`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pt-24 pb-20">
      {/* Top Banner / Pitch Deck Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/60 p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Live Pitch Deck & Technical Whitepaper
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                NexusGuard System Whitepaper
              </h1>
              <p className="mt-2 text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
                Mission control for autonomous AI agents at production scale. Standardized OpenTelemetry tracing,
                deterministic circuit breakers, evidence-grounded evaluation suites, and cryptographic audit ledgers.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all text-sm"
              >
                <span>Launch Live Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#mcp-inventory"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold transition-all text-sm"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>MCP Protocol Specs</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mt-8 gap-8 text-sm font-medium">
          {[
            { id: 'quickstart' as const, label: '1. Quickstart & Telemetry' },
            { id: 'architecture' as const, label: '2. Deep System Architecture' },
            { id: 'mcp' as const, label: '3. MCP Servers & Protocols' },
            { id: 'governance' as const, label: '4. Governance & Circuit Breakers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section 1: Quickstart */}
        {activeTab === 'quickstart' && (
          <div className="space-y-10 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  Two-Line Python SDK Integration
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Instrument any agentic framework (LangGraph, CrewAI, AutoGen, OpenAI Agents SDK) with sub-2ms overhead.
                  NexusGuard captures prompt iterations, tool argument serialization, token expenditure, and state checkpoints.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-300">Automatic context compression & prompt deduplication</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-300">Continuous recursion & loop detection circuit breakers</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-300">Full OpenTelemetry (OTel v1.28) semantic conventions</span>
                  </div>
                </div>
              </div>

              {/* Code Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">agent_sample.py</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(pythonSnippet, 'py')}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {copiedSection === 'py' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-indigo-200/90 overflow-x-auto leading-relaxed">
                  <code>{pythonSnippet}</code>
                </pre>
              </div>
            </div>

            {/* OTel Configuration */}
            <div className="mt-8 border-t border-slate-800/80 pt-8">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Enterprise OpenTelemetry Daemon Collector
              </h3>
              <p className="text-slate-400 text-xs mb-4">
                For Kubernetes and containerized microservice architectures, stream directly to NexusGuard via OTLP gRPC.
              </p>
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-400 font-mono">
                  <span>otel-collector-config.yaml</span>
                  <button
                    onClick={() => copyToClipboard(otelConfig, 'otel')}
                    className="hover:text-white"
                  >
                    {copiedSection === 'otel' ? 'Copied!' : 'Copy YAML'}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-cyan-200/90 overflow-x-auto">
                  <code>{otelConfig}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Architecture */}
        {activeTab === 'architecture' && (
          <div className="space-y-12 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">High-Throughput Multi-Tier Architecture</h2>
              <p className="text-slate-400 text-sm">
                How NexusGuard ingests millions of telemetry events, performs sub-millisecond policy arbitration, and seals immutable records.
              </p>
            </div>

            {/* Architecture Diagram in Card Grids */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-indigo-500/30 bg-slate-900/60 backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold mb-3">
                  1
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Ingress & OTel Layer</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  gRPC/HTTP streaming ingestion with adaptive backpressure, token counting, and memory-safe batching.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-indigo-300">
                  Throughput: 50k events/sec
                </div>
              </div>

              <div className="p-5 rounded-xl border border-cyan-500/30 bg-slate-900/60 backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold mb-3">
                  2
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Circuit Breaker Arbiter</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In-memory recursive loop detector, budget threshold watcher, and adversarial injection sanitizer.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-cyan-300">
                  Latency: P99 &lt; 0.9ms
                </div>
              </div>

              <div className="p-5 rounded-xl border border-purple-500/30 bg-slate-900/60 backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold mb-3">
                  3
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Eval & Synthesis Engine</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  LLM-as-judge scoring pipeline, RAGAS retrieval evaluation, and bilingual English/Bangla faithfulness checks.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-purple-300">
                  Precision: 96.4% on FinTech evals
                </div>
              </div>

              <div className="p-5 rounded-xl border border-emerald-500/30 bg-slate-900/60 backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold mb-3">
                  4
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Immutable Ledger</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographically chained SHA-256 state blocks for non-repudiation, regulator auditing, and compliance.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-300">
                  Integrity: Tamper-evident hash chain
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: MCP Protocol Specs */}
        {activeTab === 'mcp' && (
          <div id="mcp-inventory" className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Model Context Protocol (MCP) Usage</h2>
              <p className="text-slate-400 text-sm">
                Complete inventory of Model Context Protocol (MCP) servers and clients implemented in NexusGuard for institutional financial crime surveillance and audit isolation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
                    mcp-agentops-telemetry
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">BUILT SERVER</span>
                </div>
                <h3 className="font-bold text-white mb-1">Agent Telemetry Ingestion MCP</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Exposes endpoints for external agents to publish state transitions, tool call outputs, and token counts via standard MCP SSE transport.
                </p>
                <ul className="text-xs space-y-1.5 text-slate-300 font-mono">
                  <li>• <span className="text-cyan-400">Endpoints:</span> 6 tools + 2 resources</li>
                  <li>• <span className="text-cyan-400">Transport:</span> stdio and SSE (Server-Sent Events)</li>
                  <li>• <span className="text-cyan-400">Reuse:</span> Shared across local development and cloud gateways</li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
                    mcp-circuit-breaker-control
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">BUILT SERVER</span>
                </div>
                <h3 className="font-bold text-white mb-1">Circuit Breaker & Command Control MCP</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Allows human operators to inject runtime overrides, halt runaway loops, or modify working agent memory mid-execution.
                </p>
                <ul className="text-xs space-y-1.5 text-slate-300 font-mono">
                  <li>• <span className="text-cyan-400">Endpoints:</span> 4 tools (`halt_session`, `modify_memory`, `override_tool`, `set_budget`)</li>
                  <li>• <span className="text-cyan-400">Transport:</span> JSON-RPC 2.0 over SSE</li>
                  <li>• <span className="text-cyan-400">Security:</span> HMAC-authenticated request signing</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Governance */}
        {activeTab === 'governance' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Automated Governance & Guardrails</h2>
              <p className="text-slate-400 text-sm">
                Enforcing budget caps, prompt sanitization, and human-in-the-loop workflows across all agent tasks.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
                <Shield className="w-6 h-6 text-indigo-400 mb-3" />
                <h4 className="font-bold text-white text-sm mb-1">Adversarial Input Quarantining</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pre-execution tokenizer sanitizes all attacker-controlled fields (e.g. transaction memos, user notes)
                  to completely prevent prompt injection and tool hijacking.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
                <Cpu className="w-6 h-6 text-amber-400 mb-3" />
                <h4 className="font-bold text-white text-sm mb-1">Deterministic Loop Detection</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tracks semantic similarity across agent action sequences. If identical tool calls exceed 3 iterations
                  without new state discovery, execution is automatically suspended.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
                <Database className="w-6 h-6 text-emerald-400 mb-3" />
                <h4 className="font-bold text-white text-sm mb-1">Signed Audit Trail</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every decision, approval, and threshold adjustment is appended to a SHA-256 hash-chained ledger,
                  ensuring zero retrospective tampering for regulatory compliance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
