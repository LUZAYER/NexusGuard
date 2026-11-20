import type { Metadata } from 'next'
import Link from 'next/link'
import HeroSection from '@/components/landing/HeroSection'
import PricingCards from '@/components/landing/PricingCards'
import {
  ShieldAlert,
  GitBranch,
  ShieldCheck,
  FileCheck,
  Cpu,
  Lock,
  Activity,
  ArrowRight,
  Scale,
  CheckCircle2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'NexusGuard — Autonomous Financial Crime Intelligence & Real-Time AML Defense',
  description:
    'The autonomous financial crime intelligence platform for Mobile Financial Services. Unifying sub-25ms LightGBM detection, multi-hop graph link forensics, and autonomous AI evidence dossiers across 212,749 transactions.',
  openGraph: {
    title: 'NexusGuard — Financial Crime Intelligence Platform',
    description: 'ML Assesses. Graphs Connect. AI Investigates. Humans Decide.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

const institutions = [
  { name: 'bKash MFS', tag: 'Mobile Wallet' },
  { name: 'Nagad Digital', tag: 'Postal MFS' },
  { name: 'Bangladesh Bank BFIU', tag: 'Regulatory' },
  { name: 'BRAC Bank', tag: 'Commercial' },
  { name: 'City Bank', tag: 'Digital Banking' },
  { name: 'Upay MFS', tag: 'FinTech' },
]

export default function LandingPage() {
  return (
    <div className="relative z-10 bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent-primary)] selection:text-white">
      {/* 1. Minimal Luxury Hero Section */}
      <HeroSection />

      {/* 2. Institutional Trust Logos Bar (Obsidian Minimal Style) */}
      <section className="relative z-10 border-y border-[var(--card-border)] py-8 px-4 bg-[var(--background-secondary)]/40">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--foreground-muted)] mb-5">
            Engineered for High-Throughput Digital Banking &amp; MFS Rails
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-70 hover:opacity-100 transition-opacity">
            {institutions.map((inst) => (
              <div key={inst.name} className="flex items-center gap-2 font-mono text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                <span>{inst.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Section: Sub-25ms Precision & Deep AML Forensics (Matching Obsidian "Save Time & Grow AUM") */}
      <section className="relative z-10 px-4 py-24 border-b border-[var(--card-border)]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
              Real-Time Interception
            </span>
            <h2 className="mt-2 text-3xl sm:text-5xl font-serif-luxury font-normal text-[var(--foreground)] tracking-tight">
              Sub-25ms Precision &amp; Deep Forensics
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--foreground-muted)] max-w-2xl leading-relaxed">
              Dual-engine machine learning marries supervised gradient boosting with unsupervised anomaly isolation, 
              detecting synthetic smurfing, account takeover, and money mule cascades in real time.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Card 1: Dual-Engine ML */}
            <div className="group rounded-2xl border border-[var(--card-border)] obsidian-card p-8 flex flex-col justify-between hover:border-[var(--card-border-hover)] transition-all">
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="inline-flex rounded-xl p-3 bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--card-border)]">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono text-[var(--accent-primary)] bg-[var(--badge-bg)] px-2.5 py-1 rounded-full border border-[var(--badge-border)]">
                    &lt; 25ms Execution
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 font-sans">
                  Dual-Engine ML Ensemble
                </h3>
                <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed mb-6">
                  Combines calibrated LightGBM classification for known MFS attack patterns with Isolation Forest 
                  outlier detection on millisecond sliding windows across 212,749 transactions.
                </p>
              </div>

              {/* Minimalist Data Widget Preview */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2 mb-3 text-[11px] text-[var(--foreground-muted)]">
                  <span>MODEL LATENCY</span>
                  <span>ROC-AUC SCORE</span>
                  <span>STATUS</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                  <span className="text-[var(--accent-primary)]">14.8 ms</span>
                  <span>99.2%</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Topological Graph Link Forensics */}
            <div className="group rounded-2xl border border-[var(--card-border)] obsidian-card p-8 flex flex-col justify-between hover:border-[var(--card-border-hover)] transition-all">
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="inline-flex rounded-xl p-3 bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--card-border)]">
                    <GitBranch className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono text-[var(--accent-primary)] bg-[var(--badge-bg)] px-2.5 py-1 rounded-full border border-[var(--badge-border)]">
                    4-Hop Topology
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 font-sans">
                  Topological Graph Link Forensics
                </h3>
                <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed mb-6">
                  Discovers complex multi-hop mule networks, circular transaction wash loops, and shared hardware clusters 
                  using NetworkX graph centrality and cycle detection algorithms.
                </p>
              </div>

              {/* Minimalist Visual Preview */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2 mb-3 text-[11px] text-[var(--foreground-muted)]">
                  <span>MULE CLUSTER</span>
                  <span>BETWEENNESS</span>
                  <span>CYCLE HOPS</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                  <span className="text-rose-400">12 Wallets</span>
                  <span>0.842</span>
                  <span className="text-[var(--accent-primary)]">A → B → C → A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: The Platform that Scales Your Firm (Matching Obsidian Layout) */}
      <section className="relative z-10 px-4 py-24 border-b border-[var(--card-border)] bg-[var(--background-secondary)]/30">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
              Operational Command
            </span>
            <h2 className="mt-2 text-3xl sm:text-5xl font-serif-luxury font-normal text-[var(--foreground)] tracking-tight">
              The platform that scales your compliance team
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[var(--foreground-muted)] leading-relaxed">
              Built for high-volume digital banking and Mobile Financial Services. From raw transaction stream ingestion 
              to human-authorized freezing in an immutable audit trail.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { title: 'Zero-SQL Model Context Protocol (MCP)', desc: 'Safely exposes graph and risk intelligence to AI agents without direct SQL access.' },
                { title: 'Millisecond Behavioral Biometrics (ATO)', desc: 'Flags account takeovers through keystroke cadence deviations and hardware fingerprint shifts.' },
                { title: 'Visual Rules Engine with Shadow Mode', desc: 'Craft velocity rules and simulate false positive impact against 212,749 historical events.' },
                { title: 'Deterministic 1-Click SAR Dossiers', desc: 'Pre-compiles FATF and central bank compliant suspicious activity reports in seconds.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--card-border)] obsidian-card">
                  <CheckCircle2 className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">{item.title}</h4>
                    <p className="text-[11px] sm:text-xs text-[var(--foreground-muted)] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minimalist Console Mockup (Obsidian Rock Texture style) */}
          <div className="rounded-2xl border border-[var(--card-border)] obsidian-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-mono text-xs font-bold text-[var(--foreground)]">LIVE INCIDENT DOSSIER</span>
              </div>
              <span className="font-mono text-[11px] text-[var(--accent-primary)]">TXN-982173</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--card-border)]">
                <span className="text-[10px] text-[var(--foreground-muted)] block uppercase">PRIMARY SIGNAL</span>
                <span className="font-bold text-rose-400">UNUSUAL AMOUNT (+1408%) &amp; NEW DEVICE PAIRING</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--card-border)]">
                  <span className="text-[10px] text-[var(--foreground-muted)] block uppercase">HISTORICAL MEDIAN</span>
                  <span className="font-bold text-[var(--foreground)]">৳ 1,240</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--card-border)]">
                  <span className="text-[10px] text-[var(--foreground-muted)] block uppercase">EVALUATED AMOUNT</span>
                  <span className="font-bold text-rose-400">৳ 18,700</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--card-border)] text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                <strong className="text-[var(--foreground)] font-sans">AI Forensic Synthesis:</strong> Transaction originated from an unfamiliar hardware device in Sylhet at 02:13 AM. Connected graph analysis indicates recipient wallet routes funds to a rapid-liquidation mule syndicate.
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[var(--foreground-muted)]">Action: Step-Up Biometrics</span>
                <Link
                  href="/monitoring/transactions/TXN-982173"
                  className="px-3 py-1 rounded-lg bg-[var(--accent-primary)] text-white text-[11px] font-bold hover:opacity-90"
                >
                  Inspect Dossier →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Built for Regulated Environments (Matching Obsidian 3-Column Footer Layout) */}
      <section className="relative z-10 px-4 py-24 border-b border-[var(--card-border)]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
              Institutional Compliance
            </span>
            <h2 className="mt-2 text-3xl sm:text-5xl font-serif-luxury font-normal text-[var(--foreground)] tracking-tight">
              Built for regulated environments
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--foreground-muted)] max-w-xl mx-auto">
              Sovereign architecture designed to satisfy strict central bank privacy guidelines and international AML-CFT standards.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--card-border)] obsidian-card p-6">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center mb-4">
                <Scale className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-2">Deterministic SAR Synthesis</h3>
              <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                Zero hallucination policy. Every claim in generated Suspicious Activity Reports cites a verifiable SHAP feature attribution or graph link edge.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--card-border)] obsidian-card p-6">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center mb-4">
                <Lock className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-2">Security by Default</h3>
              <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                Air-gapped on-premise execution with local LLMs (Ollama / vLLM / Qwen 2.5) ensuring sensitive banking PII never leaves your sovereign infrastructure.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--card-border)] obsidian-card p-6">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center mb-4">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-2">Human-in-the-Loop Authority</h3>
              <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                ML assesses, graphs connect, AI investigates, humans decide. Critical freeze decisions require compliance officer authorization recorded to an immutable ledger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Cards Section */}
      <section className="relative z-10 px-4 py-24 border-b border-[var(--card-border)] bg-[var(--background-secondary)]/20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
              Transparent Deployment
            </span>
            <h2 className="mt-2 text-3xl sm:text-5xl font-serif-luxury font-normal text-[var(--foreground)] tracking-tight">
              Evaluation sandbox to sovereign enterprise
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--foreground-muted)] max-w-xl mx-auto">
              Test with 212,749 synthetic transactions in sandbox or deploy full-throughput on sovereign banking clusters.
            </p>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* 7. Final Executive CTA */}
      <section className="relative z-10 px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl sm:text-5xl font-serif-luxury font-normal text-[var(--foreground)]">
            Protect your financial rails with connected intelligence
          </h2>
          <p className="mb-8 text-xs sm:text-sm md:text-base text-[var(--foreground-muted)] max-w-xl mx-auto leading-relaxed">
            Experience the complete mission control with pre-seeded SentinelFlow dataset: 212,749 transactions, 20,000 verified accounts, and sub-25ms dual ML scoring.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-7 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all"
            >
              <span>Open SOC Command Center</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/monitoring/transactions"
              className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] obsidian-card px-6 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--card-border-hover)] transition-all"
            >
              <span>Live Surveillance Radar</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}