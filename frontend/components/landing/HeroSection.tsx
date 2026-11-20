'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldAlert,
  GitBranch,
  Cpu,
  Fingerprint,
  FileCheck,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';

const stats = [
  { label: 'Dataset Scale', value: '212,749', sub: 'MFS Transactions Evaluated' },
  { label: 'Client Accounts', value: '20,000', sub: 'Verified Mobile Wallets' },
  { label: 'Decision Latency', value: '<25ms', sub: 'Dual ML Ensemble Inference' },
  { label: 'False Positive Drop', value: '-94.8%', sub: 'SHAP & Calibrated Thresholds' },
];

const demoScenarios = [
  {
    id: 'mule_ring',
    name: 'Money Mule Network',
    icon: <GitBranch className="h-4 w-4 text-orange-400" />,
    badge: 'Syndicate',
    summary: '12 accounts funneling micro-transfers into 2 intermediary nodes before rapid outbound drain.',
    actionUrl: '/intelligence/network',
  },
  {
    id: 'circular',
    name: 'Circular Flow Laundering',
    icon: <Cpu className="h-4 w-4 text-amber-400" />,
    badge: 'AML Alert',
    summary: 'Cyclic transaction loop A → B → C → D → A masking beneficial ownership across 3 financial entities.',
    actionUrl: '/monitoring/transactions',
  },
  {
    id: 'ato_biometrics',
    name: 'Biometric Account Takeover',
    icon: <Fingerprint className="h-4 w-4 text-rose-400" />,
    badge: 'ATO Detected',
    summary: 'Sudden deviation in keystroke flight time and mouse jitter entropy combined with new hardware device hash.',
    actionUrl: '/monitoring/walletguard',
  },
  {
    id: 'ai_sar',
    name: 'Autonomous AI Case File',
    icon: <FileCheck className="h-4 w-4 text-emerald-400" />,
    badge: 'Audit Ready',
    summary: 'Autonomous agent synthesizes multi-tool graph evidence into a Bangladesh Bank compliant SAR dossier.',
    actionUrl: '/investigations/cases',
  },
];

export default function HeroSection() {
  const [selectedScenario, setSelectedScenario] = useState(0);

  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-12 bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Minimal Event Header Pill */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-3.5 py-1 text-xs font-medium text-[var(--foreground-muted)] shadow-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-[var(--foreground)]">NexusGuard SOC v4.0</span>
          <span className="opacity-40">|</span>
          <span>Financial Crime Intelligence & AML Defense</span>
        </div>

        {/* Minimal Authoritative Headline */}
        <h1 className="mb-5 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[var(--foreground)]">
          <span className="block tracking-wider font-serif-luxury font-normal text-5xl sm:text-7xl md:text-8xl">
            NexusGuard
          </span>
          <span className="mt-3 block text-lg sm:text-2xl md:text-3xl font-semibold tracking-normal text-[var(--foreground-muted)] font-sans">
            ML Assesses. Graphs Connect. AI Investigates. Humans Decide.
          </span>
        </h1>

        {/* Minimal Sub-headline */}
        <p className="mx-auto mb-9 max-w-2xl text-xs sm:text-sm md:text-base text-[var(--foreground-muted)] leading-relaxed">
          The autonomous financial crime intelligence platform for Mobile Financial Services.
          Unifying sub-25ms LightGBM detection, multi-hop graph topology forensics, and autonomous AI evidence dossiers across <strong className="text-[var(--foreground)] font-mono">212,749</strong> transactions.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mb-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-7 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all group"
          >
            <ShieldAlert className="h-4 w-4 text-white" />
            <span>Open SOC Command Center</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/docs"
            className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] obsidian-card px-6 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--card-border-hover)] transition-all"
          >
            <Zap className="h-4 w-4 text-[var(--accent-primary)]" />
            <span>Live System /docs</span>
          </Link>
          <Link
            href="/monitoring/transactions"
            className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] obsidian-card px-5 py-3 text-sm font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--card-border-hover)] transition-all"
          >
            <Activity className="h-4 w-4" />
            <span>Stream (212K Txns)</span>
          </Link>
        </div>

        {/* Minimal Stats Bar */}
        <div className="mx-auto mb-12 max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="obsidian-card rounded-xl p-3.5 border border-[var(--card-border)] text-left"
            >
              <div className="text-xl md:text-2xl font-bold font-mono text-[var(--foreground)]">
                {s.value}
              </div>
              <div className="text-xs font-semibold text-[var(--foreground)] mt-0.5">
                {s.label}
              </div>
              <div className="text-[10px] text-[var(--foreground-muted)] truncate mt-0.5">
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Clean Scenario Selector */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-[var(--card-border)] obsidian-card p-4">
          <div className="mb-3 flex items-center justify-between text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Real-Time Forensic Scenarios
            </span>
            <span className="text-[11px] font-mono text-[var(--accent-primary)]">
              Synthetic Ground Truth Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
            {demoScenarios.map((scenario, index) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(index)}
                className={`flex flex-col items-start gap-1 rounded-xl p-3 text-left transition-all cursor-pointer ${
                  selectedScenario === index
                    ? 'border border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--foreground)] shadow-xs'
                    : 'border border-[var(--card-border)] obsidian-card text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  {scenario.icon}
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-[var(--foreground-muted)]">
                    {scenario.badge}
                  </span>
                </div>
                <span className="text-xs font-bold mt-1 text-[var(--foreground)]">
                  {scenario.name}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--card-border)] text-left text-xs">
            <p className="text-[var(--foreground-muted)] max-w-2xl leading-relaxed">
              <strong className="text-[var(--foreground)]">Active Profile:</strong>{' '}
              {demoScenarios[selectedScenario].summary}
            </p>
            <Link
              href={demoScenarios[selectedScenario].actionUrl}
              className="inline-flex items-center gap-1 font-semibold text-[var(--accent-primary)] hover:underline shrink-0 text-xs"
            >
              Examine Forensic View →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
