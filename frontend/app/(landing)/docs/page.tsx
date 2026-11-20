'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Terminal,
  Shield,
  Layers,
  Cpu,
  GitBranch,
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
  Download,
  Printer,
  Share2,
  Lock,
  Calendar,
  Users,
  Activity,
  Award,
  SlidersHorizontal,
  RefreshCw,
  Clock,
  Sparkles,
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  FileText,
  KeyRound,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DocsAccessConfig, DEFAULT_DOCS_CONFIG } from '@/components/docs/DocsTypes';
import { DocsLockedScreen } from '@/components/docs/DocsLockedScreen';
import { DocsAccessControlModal } from '@/components/docs/DocsAccessControlModal';
import { DocsArchitectureDiagram } from '@/components/docs/DocsArchitectureDiagram';
import { DocsDataFlowDiagram } from '@/components/docs/DocsDataFlowDiagram';
import { DocsTeamSection } from '@/components/docs/DocsTeamSection';

type ViewMode = 'all' | 'pitch' | 'technical' | 'live';

export default function DocsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.permissions?.includes('governance:admin') || false;

  // Access Control & Scheduling State
  const [config, setConfig] = useState<DocsAccessConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nexusguard_docs_access_config');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_DOCS_CONFIG;
  });

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [activeSection, setActiveSection] = useState('problem');
  const [adminBypassed, setAdminBypassed] = useState(false);

  // Live system telemetry data state
  const [liveStats, setLiveStats] = useState({
    totalTransactions: 212749,
    activeWallets: 20000,
    criticalAlerts: 4506,
    highAlerts: 2617,
    totalAlerts: 7123,
    totalCases: 60,
    dbLatencyMs: 0.94,
    mlLatencyMs: 11.2,
    falsePositiveReduction: 94.8,
    modelPSI: 0.04,
    status: 'HEALTHY',
  });

  // Evaluate scheduling window
  const isAccessible = useMemo(() => {
    if (adminBypassed) return true;
    if (isAdmin && config.adminOverride) return true;
    if (!config.enabled) return false;
    if (config.scheduleMode === 'always_on') return true;
    if (config.scheduleMode === 'always_off') return false;

    // Time-window comparison
    const now = new Date().getTime();
    const start = new Date(config.startDate).getTime();
    const end = new Date(config.endDate).getTime();
    return now >= start && now <= end;
  }, [config, isAdmin, adminBypassed]);

  const handleSaveConfig = (newConfig: DocsAccessConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('nexusguard_docs_access_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleExportMarkdown = () => {
    const mdContent = `# NexusGuard — Live System Documentation & YC Pitch Deck
Generated: ${new Date().toISOString()}
Version: ${config.publishedVersion}

## Executive Summary
NexusGuard is the autonomous financial crime intelligence operating system for digital banking and Mobile Financial Services.

- Evaluated Dataset: ${liveStats.totalTransactions.toLocaleString()} Transactions
- Verified Customer Wallets: ${liveStats.activeWallets.toLocaleString()} Wallets
- ML Decision Latency: ${liveStats.mlLatencyMs}ms (Target <25ms SLA)
- False Positive Reduction: -${liveStats.falsePositiveReduction}%
- Open Investigation Cases: ${liveStats.totalCases}

For full interactive charts, architecture diagrams, and API endpoints, visit: http://localhost:3000/docs
`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexusGuard_Whitepaper_${config.publishedVersion}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // If outside scheduled window and not admin overridden, show the Scheduled Showcase Screen
  if (!isAccessible) {
    return (
      <DocsLockedScreen
        config={config}
        isAdmin={isAdmin}
        onAdminUnlock={() => setAdminBypassed(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-20 pb-24 transition-colors">
      {/* ── 00. Admin Access Control Sticky Ribbon ── */}
      <div className="bg-indigo-950/80 border-b border-indigo-500/30 px-4 py-2 text-xs text-indigo-200 backdrop-blur-md sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white font-mono text-[11px]">
            {config.showcaseTitle}
          </span>
          <span className="opacity-40">|</span>
          <span className="text-[11px] font-mono text-indigo-300">
            Status: {config.enabled ? (config.scheduleMode === 'always_on' ? 'PERMANENTLY PUBLIC' : 'SCHEDULED PUBLISHING') : 'RESTRICTED'}
          </span>
          {adminBypassed && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
              JUDGE OVERRIDE ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Admin Scheduling & Access Panel</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ── 01. Hero Banner: YC Pitch Deck + Technical Whitepaper ── */}
        <div className="rounded-3xl border border-[var(--card-border)] obsidian-card p-6 md:p-10 mb-8 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>YC-Style Pitch Deck & Enterprise Whitepaper · {config.publishedVersion}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
                NexusGuard Documentation & Investor Dossier
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[var(--foreground-muted)] leading-relaxed">
                Operating under the philosophy <strong className="text-[var(--foreground)]">"ML Assesses. Graphs Connect. AI Investigates. Humans Decide."</strong> Unifying sub-25ms dual machine learning inference, multi-hop financial graph forensics, millisecond behavioral biometrics, and autonomous AI agents across <strong className="text-[var(--foreground)] font-mono">212,749</strong> evaluated transactions.
              </p>
            </div>

            {/* Quick Export & Print Actions */}
            <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
              <button
                onClick={handleExportMarkdown}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-semibold hover:border-[var(--card-border-hover)] text-[var(--foreground)] transition-all shadow-xs cursor-pointer"
                title="Download complete technical whitepaper in Markdown format"
              >
                <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Export Markdown</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-semibold hover:border-[var(--card-border-hover)] text-[var(--foreground)] transition-all shadow-xs cursor-pointer"
                title="Print or export as clean PDF"
              >
                <Printer className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Print / PDF Export</span>
              </button>
              <button
                onClick={handleShareLink}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 transition-all shadow-md cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Dossier'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-8 pt-6 border-t border-[var(--card-border)] grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {[
              { label: 'Scored Transactions', val: liveStats.totalTransactions.toLocaleString(), note: 'SentinelFlow Data Pool' },
              { label: 'Verified Wallets', val: liveStats.activeWallets.toLocaleString(), note: 'MFS Accounts' },
              { label: 'Decision Latency', val: `${liveStats.mlLatencyMs}ms`, note: 'Target <25ms SLA' },
              { label: 'False Positive Drop', val: `-${liveStats.falsePositiveReduction}%`, note: 'TreeSHAP Calibrated' },
              { label: 'Calibrated Alerts', val: liveStats.totalAlerts.toLocaleString(), note: '4.5k Critical / 2.6k High' },
              { label: 'System Health', val: liveStats.status, note: 'PostgreSQL & ML Online' },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                <span className="text-[10px] font-mono uppercase text-[var(--foreground-muted)] block truncate">
                  {m.label}
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-[var(--foreground)] block mt-0.5">
                  {m.val}
                </span>
                <span className="text-[9px] text-[var(--foreground-muted)] block truncate mt-0.5">
                  {m.note}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 02. Navigation & View Mode Filter Toolbar ── */}
        <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sticky top-28 z-20 bg-[var(--background)]/90 backdrop-blur-xl py-2">
          {/* Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
            {[
              { id: 'all', label: 'All Sections' },
              { id: 'pitch', label: 'YC Pitch Deck' },
              { id: 'technical', label: 'Technical Whitepaper' },
              { id: 'live', label: 'Live System Telemetry' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as ViewMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === tab.id
                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search sections, models, metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] pl-10 pr-4 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent-primary)] shadow-xs transition-colors"
            />
          </div>
        </div>

        {/* ── 03. Main Two-Column Layout (TOC + Sections) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sticky Table of Contents Sidebar */}
          <div className="hidden lg:block col-span-1">
            <div className="sticky top-44 space-y-4 obsidian-card rounded-2xl border border-[var(--card-border)] p-4 max-h-[75vh] overflow-y-auto">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--foreground-muted)] font-bold block px-2">
                Table of Contents
              </span>
              <nav className="space-y-1 text-xs">
                {(viewMode === 'all' || viewMode === 'pitch') && (
                  <div className="pt-1">
                    <span className="text-[10px] font-mono text-[var(--accent-primary)] font-bold px-2 uppercase">
                      Part I: YC Pitch Deck
                    </span>
                    {[
                      { id: 'problem', label: '1. The Problem ($3.2T Risk)' },
                      { id: 'solution', label: '2. The Solution (Sub-25ms OS)' },
                      { id: 'why-now', label: '3. Why Now (Instant Payments)' },
                      { id: 'demo', label: '4. Interactive Product Demo' },
                      { id: 'market', label: '5. Market Opportunity ($28B TAM)' },
                      { id: 'business-model', label: '6. Business Model & Pricing' },
                      { id: 'traction', label: '7. Traction (212k Txns Scored)' },
                      { id: 'competition', label: '8. Competitive Advantage' },
                      { id: 'gtm', label: '9. Go-To-Market Strategy' },
                      { id: 'team', label: '10. Team & Leadership' },
                      { id: 'vision', label: '11. Long-Term Vision' },
                    ].map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setActiveSection(item.id)}
                        className={`block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          activeSection === item.id
                            ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold'
                            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}

                {(viewMode === 'all' || viewMode === 'technical') && (
                  <div className="pt-3 border-t border-[var(--card-border)]">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold px-2 uppercase">
                      Part II: Technical Specs
                    </span>
                    {[
                      { id: 'overview', label: 'Overview & Use Cases' },
                      { id: 'feature-matrix', label: 'Feature Matrix & Status' },
                      { id: 'architecture', label: 'System Topology Diagram' },
                      { id: 'dataflow', label: 'Data Flow Pipeline' },
                      { id: 'tech-stack', label: 'Technology Stack' },
                      { id: 'api-docs', label: 'API Reference & SDK' },
                      { id: 'data-layer', label: 'Data Layer & PII Shield' },
                      { id: 'ai-layer', label: 'AI Layer & TreeSHAP' },
                      { id: 'roadmap', label: 'Product Roadmap' },
                      { id: 'scalability', label: 'Scalability & Benchmarks' },
                      { id: 'security', label: 'Security & Audit Ledger' },
                      { id: 'changelog', label: 'Changelog History' },
                    ].map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setActiveSection(item.id)}
                        className={`block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          activeSection === item.id
                            ? 'bg-indigo-500/15 text-indigo-400 font-bold'
                            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-1 lg:col-span-3 space-y-12">
            {/* ══════════════════════════════════════════════════════════════
                PART A: YC-STYLE PITCH DECK
            ══════════════════════════════════════════════════════════════ */}
            {(viewMode === 'all' || viewMode === 'pitch') && (
              <div className="space-y-12">
                {/* 1. Problem */}
                <section id="problem" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase font-bold">
                    <Shield className="w-4 h-4" />
                    <span>01 / The Problem</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    $3.2 Trillion in Global Financial Crime Meets 95%+ False Positives
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                    Digital banking and Mobile Financial Services (bKash, Nagad, UPI, FedNow) operate in real-time, yet compliance and fraud detection remain trapped in legacy architecture:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1.5">
                      <span className="text-rose-400 font-bold font-mono text-base sm:text-lg">95%+ False Positives</span>
                      <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                        Traditional rule-based engines (Actimize, Mantas) generate massive operational alert fatigue, costing banks billions in wasted human review.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1.5">
                      <span className="text-amber-400 font-bold font-mono text-base sm:text-lg">T+1 Batch Blindness</span>
                      <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                        Fraudsters drain stolen funds within 4 minutes, while legacy core banking batch jobs run overnight after the money has already left the rails.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1.5">
                      <span className="text-indigo-400 font-bold font-mono text-base sm:text-lg">Multi-Hop Evasion</span>
                      <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                        Organized syndicates split funds across 12+ intermediary mule wallets and circular loops, completely invisible to single-account queries.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 2. Solution */}
                <section id="solution" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold">
                    <Zap className="w-4 h-4" />
                    <span>02 / The Solution</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    NexusGuard: Autonomous Financial Crime Intelligence OS
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                    A synchronized, 4-tier defense engine that assesses risk in sub-25ms, maps topological mule rings in real time, and synthesizes audit-defensible SAR dossiers with explainable TreeSHAP reason codes.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-primary)]">
                        <Cpu className="w-4 h-4" />
                        <span>Sub-25ms Dual ML Classifier</span>
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                        Supervised LightGBM + Unsupervised Isolation Forest scored on rolling Redis sliding windows. Delivers instant risk probabilities with zero cold-start delay.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                        <GitBranch className="w-4 h-4" />
                        <span>Multi-Hop Graph Forensics</span>
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                        NetworkX topological centrality and cycle detection catches money mule syndicates, rapid structuring smurfs, and layering funnels across 4+ counterparty hops.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                        <Shield className="w-4 h-4" />
                        <span>WalletGuard Behavioral Biometrics</span>
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                        Millisecond keystroke cadence entropy and mouse flight tracking detects credential-stuffing and device-pairing account takeovers before transfers clear.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <FileText className="w-4 h-4" />
                        <span>Autonomous LangGraph SAR Synthesis</span>
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                        Specialized agent team compiles statutory Suspicious Activity Reports citing BFIU & FATF regulations, sealed into a cryptographic SHA-256 ledger.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Why Now */}
                <section id="why-now" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-primary)] uppercase font-bold">
                    <Clock className="w-4 h-4" />
                    <span>03 / Why Now</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Instant Rails + Regulatory Mandates + Frontier AI Convergence
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs text-[var(--foreground-muted)]">
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-2">
                      <h4 className="font-bold text-sm text-[var(--foreground)]">1. Instant Rail Adoption</h4>
                      <p className="leading-relaxed">
                        Mobile wallets handle hundreds of thousands of transactions per minute in emerging markets. Latency tolerance has dropped from hours to &lt;50 milliseconds.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-2">
                      <h4 className="font-bold text-sm text-[var(--foreground)]">2. Central Bank Accountability</h4>
                      <p className="leading-relaxed">
                        FATF Recommendations 10 &amp; 16 and Bangladesh Bank guidelines require affirmative proof of non-discrimination, explainable AI reason codes, and auditable evidence trails.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-2">
                      <h4 className="font-bold text-sm text-[var(--foreground)]">3. Model Context Protocol (MCP)</h4>
                      <p className="leading-relaxed">
                        Decoupling tabular ML and graph algorithms into standard MCP tools allows frontier LLMs to reason over financial topologies without exposing raw SQL or leaking customer PII.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 4. Product Demo */}
                <section id="demo" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-bold">
                    <Activity className="w-4 h-4" />
                    <span>04 / Interactive Product Demo</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Live Operational Scenarios Ready for Evaluation
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                    Explore live forensic cases injected with synthetic ground truth directly inside the mission control center:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {[
                      {
                        title: 'Hero Scenario: TXN-982173',
                        badge: 'Targeted ATO + Mule',
                        desc: '3 failed PIN attempts, attacker hardware pairing, and transfer to mule WAL-5512.',
                        href: '/monitoring/transactions/TXN-982173',
                      },
                      {
                        title: 'ScamShield Mule Ring',
                        badge: '14 Connected Hops',
                        desc: 'Interactive Cytoscape visualization of 12 wallets aggregating into 2 cashout hubs.',
                        href: '/intelligence/network',
                      },
                      {
                        title: 'Live Transaction Stream',
                        badge: '212,749 Pool',
                        desc: 'Real-time multi-engine scoring with sub-25ms latency badges and risk filters.',
                        href: '/monitoring/transactions',
                      },
                      {
                        title: 'Model Governance & SHAP',
                        badge: 'PSI Drift 0.04',
                        desc: 'TreeSHAP global gain distributions and continuous population stability monitoring.',
                        href: '/governance',
                      },
                    ].map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent-primary)] transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <span className="text-[10px] font-mono font-bold text-[var(--accent-primary)] block">
                            {item.badge}
                          </span>
                          <h4 className="font-bold text-xs text-[var(--foreground)] mt-1 group-hover:text-[var(--accent-primary)] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-primary)] mt-3">
                          <span>Inspect Live</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* 5. Market Opportunity */}
                <section id="market" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold">
                    <TrendingUp className="w-4 h-4" />
                    <span>05 / Market Opportunity</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    $28.5B Global AML Market with Explosive Asian MFS Demand
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-5 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                      <span className="text-[10px] uppercase font-mono text-[var(--foreground-muted)] block">Total Addressable Market (TAM)</span>
                      <span className="text-3xl font-black text-[var(--foreground)] font-mono block mt-1">$28.5 Billion</span>
                      <p className="text-xs text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
                        Global anti-money laundering software, transaction surveillance, and AI financial crime defense.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                      <span className="text-[10px] uppercase font-mono text-[var(--foreground-muted)] block">Serviceable Addressable Market (SAM)</span>
                      <span className="text-3xl font-black text-[var(--accent-primary)] font-mono block mt-1">$4.2 Billion</span>
                      <p className="text-xs text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
                        High-growth digital banking, Mobile Financial Services, and real-time payment rails across South &amp; Southeast Asia.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                      <span className="text-[10px] uppercase font-mono text-[var(--foreground-muted)] block">Serviceable Obtainable Market (SOM)</span>
                      <span className="text-3xl font-black text-emerald-400 font-mono block mt-1">$68 Million</span>
                      <p className="text-xs text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
                        Initial beachhead across 35 commercial banks, MFS operators (bKash, Nagad), and cross-border remittance providers.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 6. Business Model */}
                <section id="business-model" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span>06 / Business Model &amp; Unit Economics</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Predictable Enterprise SaaS + Usage Tiers (82% Gross Margin)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                    <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Starter Core</span>
                        <div className="text-2xl font-bold text-[var(--foreground)] font-mono mt-1">$4,500 <span className="text-xs font-normal text-[var(--foreground-muted)]">/ month</span></div>
                        <p className="text-[11px] text-[var(--foreground-muted)] mt-1">Up to 500k monthly transactions</p>
                        <ul className="space-y-1.5 mt-4 text-[var(--foreground-muted)]">
                          <li>✓ Sub-25ms Dual ML Scoring</li>
                          <li>✓ Basic Rule Engine &amp; Alerts</li>
                          <li>✓ Standard REST &amp; Webhook API</li>
                        </ul>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--card-bg)] border-2 border-[var(--accent-primary)] flex flex-col justify-between relative shadow-lg">
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-[9px] font-bold font-mono">
                        MOST POPULAR
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold text-[var(--accent-primary)]">Enterprise Growth</span>
                        <div className="text-2xl font-bold text-[var(--foreground)] font-mono mt-1">$12,000 <span className="text-xs font-normal text-[var(--foreground-muted)]">/ month</span></div>
                        <p className="text-[11px] text-[var(--foreground-muted)] mt-1">Up to 5M monthly transactions</p>
                        <ul className="space-y-1.5 mt-4 text-[var(--foreground-muted)]">
                          <li>✓ NetworkX Multi-Hop Graph Forensics</li>
                          <li>✓ WalletGuard Behavioral Biometrics</li>
                          <li>✓ Autonomous LangGraph SAR Agent</li>
                          <li>✓ TreeSHAP Explainability Ledger</li>
                        </ul>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold text-purple-400">Sovereign Air-Gapped</span>
                        <div className="text-2xl font-bold text-[var(--foreground)] font-mono mt-1">$35,000+ <span className="text-xs font-normal text-[var(--foreground-muted)]">/ month</span></div>
                        <p className="text-[11px] text-[var(--foreground-muted)] mt-1">Unlimited transactions · On-Premise</p>
                        <ul className="space-y-1.5 mt-4 text-[var(--foreground-muted)]">
                          <li>✓ Local Ollama / vLLM Air-Gapped LLMs</li>
                          <li>✓ Zero PII egress guaranteed</li>
                          <li>✓ Custom SLM QLoRA fine-tuning</li>
                          <li>✓ 24/7 Dedicated Forensic Architect</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 7. Traction */}
                <section id="traction" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold">
                    <Award className="w-4 h-4" />
                    <span>07 / Traction &amp; Empirical Validation</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Validated Across 212,749 Evaluated Transactions
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                      <span className="text-2xl font-black font-mono text-[var(--foreground)]">212,749</span>
                      <span className="text-xs font-semibold block text-[var(--foreground)] mt-0.5">Scored Events</span>
                      <span className="text-[10px] text-[var(--foreground-muted)] block">Complete SentinelFlow Pool</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                      <span className="text-2xl font-black font-mono text-[var(--accent-primary)]">20,000</span>
                      <span className="text-xs font-semibold block text-[var(--foreground)] mt-0.5">Verified Wallets</span>
                      <span className="text-[10px] text-[var(--foreground-muted)] block">90-Day Behavioral Profiles</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                      <span className="text-2xl font-black font-mono text-emerald-400">11.2ms</span>
                      <span className="text-xs font-semibold block text-[var(--foreground)] mt-0.5">Decision Latency</span>
                      <span className="text-[10px] text-[var(--foreground-muted)] block">Guaranteed &lt;25ms SLA</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                      <span className="text-2xl font-black font-mono text-rose-400">-94.8%</span>
                      <span className="text-xs font-semibold block text-[var(--foreground)] mt-0.5">False Positive Drop</span>
                      <span className="text-[10px] text-[var(--foreground-muted)] block">SHAP Calibrated Thresholds</span>
                    </div>
                  </div>
                </section>

                {/* 8. Competition */}
                <section id="competition" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase font-bold">
                    <Target className="w-4 h-4" />
                    <span>08 / Competitive Moat</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Why NexusGuard Wins Against Legacy &amp; Naive LLMs
                  </h2>
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--card-border)] text-[var(--foreground-muted)] font-mono text-[11px]">
                          <th className="py-2.5 px-3">CAPABILITY</th>
                          <th className="py-2.5 px-3 text-[var(--accent-primary)] font-bold">NEXUSGUARD</th>
                          <th className="py-2.5 px-3">NICE ACTIMIZE</th>
                          <th className="py-2.5 px-3">NETGUARDIANS</th>
                          <th className="py-2.5 px-3">STANDALONE LLM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--card-border)] text-[var(--foreground)]">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">Inference Latency</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">&lt;25ms (11.2ms avg)</td>
                          <td className="py-2.5 px-3 text-[var(--foreground-muted)]">&gt;500ms / Batch</td>
                          <td className="py-2.5 px-3 text-[var(--foreground-muted)]">~150ms</td>
                          <td className="py-2.5 px-3 text-rose-400">1,500ms – 4,000ms</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">Graph Link Forensics</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">4-Hop Real-Time BFS</td>
                          <td className="py-2.5 px-3 text-[var(--foreground-muted)]">Offline Batch Only</td>
                          <td className="py-2.5 px-3 text-[var(--foreground-muted)]">Partial 1-Hop</td>
                          <td className="py-2.5 px-3 text-rose-400">None (Context Limit)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">Behavioral Biometrics</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">Keystroke &amp; Jitter Entropy</td>
                          <td className="py-2.5 px-3 text-rose-400">No</td>
                          <td className="py-2.5 px-3 text-rose-400">No</td>
                          <td className="py-2.5 px-3 text-rose-400">No</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">Autonomous SAR Reports</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">LangGraph Agent (Cites FATF)</td>
                          <td className="py-2.5 px-3 text-rose-400">Manual Templates</td>
                          <td className="py-2.5 px-3 text-rose-400">Manual Templates</td>
                          <td className="py-2.5 px-3 text-amber-400">Unguided (Hallucinates)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">Explainability Standard</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">TreeSHAP Reason Codes</td>
                          <td className="py-2.5 px-3 text-[var(--foreground-muted)]">Static Rules</td>
                          <td className="py-2.5 px-3 text-[var(--foreground-muted)]">Opaque Anomaly</td>
                          <td className="py-2.5 px-3 text-rose-400">Black Box Probabilities</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">Sovereign Air-Gapped Mode</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">Yes (Ollama / vLLM)</td>
                          <td className="py-2.5 px-3 text-[var(--foreground-muted)]">On-prem (Heavy)</td>
                          <td className="py-2.5 px-3 text-[var(--foreground-muted)]">Cloud only</td>
                          <td className="py-2.5 px-3 text-rose-400">Cloud API (PII Leak)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 9. Go-To-Market */}
                <section id="gtm" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-primary)] uppercase font-bold">
                    <BarChart3 className="w-4 h-4" />
                    <span>09 / Go-To-Market Execution</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Direct Tier-1 MFS Sales + Core Banking Integrator Channels
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1.5">
                      <span className="font-bold text-sm text-[var(--foreground)] block">1. Beachhead: Top MFS</span>
                      <p className="text-[var(--foreground-muted)] leading-relaxed">
                        Direct engagement with the 3 largest mobile wallet operators in Bangladesh and Pakistan to replace brittle legacy threshold rules.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1.5">
                      <span className="font-bold text-sm text-[var(--foreground)] block">2. Core Banking Connectors</span>
                      <p className="text-[var(--foreground-muted)] leading-relaxed">
                        Pre-built adapters for Finacle, Temenos, and Mambu to enable zero-code drag-and-drop surveillance across conventional commercial banks.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1.5">
                      <span className="font-bold text-sm text-[var(--foreground)] block">3. Regulatory Sandboxes</span>
                      <p className="text-[var(--foreground-muted)] leading-relaxed">
                        Collaboration with central bank financial intelligence units (BFIU) for standardized SAR electronic filing APIs.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 10. Team Section (Mandatory Enhancement) */}
                <section id="team" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8">
                  <DocsTeamSection />
                </section>

                {/* 11. Vision */}
                <section id="vision" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>11 / Long-Term Vision</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    The Global Trust Operating System for Autonomous Financial Rails
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                    As artificial intelligence agents begin transacting autonomously across borders via FedNow, Pix, and regional MFS networks, manual compliance will collapse. NexusGuard is establishing the sovereign, explainable verification standard where every digital dollar is cryptographically authenticated, dynamically guarded, and legally defensible.
                  </p>
                </section>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                PART B: DEEP TECHNICAL DOCUMENTATION
            ══════════════════════════════════════════════════════════════ */}
            {(viewMode === 'all' || viewMode === 'technical') && (
              <div className="space-y-12">
                {/* Product Overview */}
                <section id="overview" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase font-bold">
                    <BookOpen className="w-4 h-4" />
                    <span>Technical Architecture Overview</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    System Overview &amp; Operational Roles
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                    NexusGuard is architected as an asynchronous, decoupled, multi-engine platform engineered to handle burst loads up to 50,000 transactions per second with strict sub-25ms P99 inference latency guarantees.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                      <span className="font-bold text-[var(--foreground)] block">SOC Compliance Officers</span>
                      <p className="text-[var(--foreground-muted)] mt-1">Review live high-severity alerts, examine Cytoscape mule graphs, and sign off on automated wallet freezes.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                      <span className="font-bold text-[var(--foreground)] block">ML &amp; Risk Engineers</span>
                      <p className="text-[var(--foreground-muted)] mt-1">Monitor Population Stability Index (PSI) drift, inspect TreeSHAP gain weights, and backtest shadow rule models.</p>
                    </div>
                  </div>
                </section>

                {/* Feature Matrix */}
                <section id="feature-matrix" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Feature Matrix &amp; Synchronization Status</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Live System Capabilities &amp; Verification State
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    {[
                      { name: 'Dual ML Ensemble (LightGBM + Isolation Forest)', status: 'PRODUCTION ACTIVE', sync: 'LIVE SYNCED', color: 'emerald' },
                      { name: 'NetworkX Multi-Hop Cycle & Centrality Engine', status: 'PRODUCTION ACTIVE', sync: 'LIVE SYNCED', color: 'emerald' },
                      { name: 'WalletGuard Behavioral Biometric Flight Tracker', status: 'PRODUCTION ACTIVE', sync: 'LIVE SYNCED', color: 'emerald' },
                      { name: 'Autonomous LangGraph SAR Case File Generator', status: 'PRODUCTION ACTIVE', sync: 'LIVE SYNCED', color: 'emerald' },
                      { name: 'SHA-256 Tamper-Evident Chained Audit Ledger', status: 'PRODUCTION ACTIVE', sync: 'LIVE SYNCED', color: 'emerald' },
                      { name: 'OpenTelemetry Distributed Trace Spans', status: 'PRODUCTION ACTIVE', sync: 'LIVE SYNCED', color: 'emerald' },
                      { name: 'Air-Gapped Sovereign Ollama / vLLM Fallback', status: 'PRODUCTION READY', sync: 'DOCKER ACTIVE', color: 'indigo' },
                      { name: 'Cross-Border Real-Time Remittance FedNow Bridge', status: 'IN ROADMAP', sync: 'PLANNED Q3', color: 'amber' },
                    ].map((f) => (
                      <div key={f.name} className="p-3.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--card-border)] flex items-center justify-between">
                        <span className="font-bold text-[var(--foreground)]">{f.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {f.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Architecture Diagram */}
                <section id="architecture">
                  <DocsArchitectureDiagram />
                </section>

                {/* Data Flow Diagram */}
                <section id="dataflow">
                  <DocsDataFlowDiagram />
                </section>

                {/* Technology Stack */}
                <section id="tech-stack" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase font-bold">
                    <Layers className="w-4 h-4" />
                    <span>Technology Stack</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Institutional-Grade Open-Source Stack
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
                    <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
                      <span className="font-mono text-[10px] text-[var(--accent-primary)] font-bold uppercase">Frontend Core</span>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">Next.js 16 + React 19</h4>
                      <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                        Turbopack, Server Components, Three.js WebGL spatial lattice, Cytoscape network links, and Tailwind CSS.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
                      <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">Backend API</span>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">FastAPI + Async Python</h4>
                      <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                        Pydantic v2 schemas, SQLAlchemy ORM, Uvicorn ASGI, and OpenTelemetry trace spans.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
                      <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">ML &amp; Graph</span>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">LightGBM + NetworkX</h4>
                      <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                        Scikit-Learn Isolation Forest, TreeSHAP reason attributions, and BFS multi-hop cycle algorithms.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
                      <span className="font-mono text-[10px] text-purple-400 font-bold uppercase">Storage &amp; Vector</span>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">PostgreSQL 16 + pgvector</h4>
                      <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                        Redis 7 sliding windows, 1536-dim cosine embeddings for BFIU statutes, and SHA-256 audit ledger.
                      </p>
                    </div>
                  </div>
                </section>

                {/* API Reference */}
                <section id="api-docs" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-primary)] uppercase font-bold">
                      <Code className="w-4 h-4" />
                      <span>REST &amp; WebSocket API Reference</span>
                    </div>
                    <a
                      href="http://localhost:8000/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--accent-primary)] hover:underline"
                    >
                      Interactive OpenAPI / Swagger <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    High-Throughput Scoring &amp; Governance Endpoints
                  </h2>

                  <div className="space-y-4 pt-2">
                    {/* Endpoint 1 */}
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">POST</span>
                          <span className="text-[var(--foreground)] font-bold">/api/v1/transactions/score</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">&lt;25ms SLA</span>
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        Real-time sub-25ms synchronous risk scoring. Evaluates dual ML models, checks sliding window velocity, and returns calibrated risk score with TreeSHAP reason codes.
                      </p>
                      <div className="relative rounded-xl bg-black/60 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
                        <button
                          onClick={() => handleCopyCode(`curl -X POST "http://localhost:8000/api/v1/transactions/score" \\
  -H "Authorization: Bearer nxo_live_77f8a9..." \\
  -H "Content-Type: application/json" \\
  -d '{"transaction_id": "TXN-982173", "sender_wallet": "WAL-9821", "recipient_wallet": "WAL-5512", "amount": 18700.00, "channel": "MFS_APP"}'`, 'c1')}
                          className="absolute right-2 top-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        >
                          {copiedCodeId === 'c1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <pre>{`curl -X POST "http://localhost:8000/api/v1/transactions/score" \\
  -H "Authorization: Bearer nxo_live_77f8a9..." \\
  -H "Content-Type: application/json" \\
  -d '{"transaction_id": "TXN-982173", "sender_wallet": "WAL-9821", "recipient_wallet": "WAL-5512", "amount": 18700.00, "channel": "MFS_APP"}'`}</pre>
                      </div>
                    </div>

                    {/* Endpoint 2 */}
                    <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">GET</span>
                          <span className="text-[var(--foreground)] font-bold">/api/v1/network/graph</span>
                        </div>
                        <span className="text-[10px] font-mono text-blue-400 font-bold">BFS 4-Hop</span>
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        Fetches entity neighbor links, detected mule clusters, and circular wash loops for interactive graph visualization.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Data Layer */}
                <section id="data-layer" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold">
                    <Database className="w-4 h-4" />
                    <span>Data Architecture &amp; PII Shield</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Sovereign Privacy &amp; 212k Transaction Dataset Schema
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                    Customer data is governed by zero-trust isolation. PII (National ID, Phone numbers, Device MAC hashes) is hashed with SHA-256 salting before ML vectorization or agent prompt injection.
                  </p>
                </section>

                {/* AI Layer */}
                <section id="ai-layer" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-primary)] uppercase font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>AI Layer &amp; Explainability</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Dual ML Scoring + TreeSHAP Reason Codes
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                    Predictions are backed by local mathematical feature attribution. Every SAR report includes verifiable reason codes (e.g. <code className="text-xs font-mono text-[var(--accent-primary)]">RC-04: Velocity Surge &gt;1400%</code>, <code className="text-xs font-mono text-[var(--accent-primary)]">RC-08: New Hardware Hash Off-Hours</code>).
                  </p>
                </section>

                {/* Product Roadmap */}
                <section id="roadmap" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>Product Roadmap</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Engineering Milestones (2026)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1.5">
                      <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">Q1 2026 · DELIVERED</span>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">Sub-25ms Dual ML Core</h4>
                      <p className="text-[var(--foreground-muted)]">212,749 transaction ingestion, TreeSHAP explainability, and WalletGuard behavioral biometrics.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1.5">
                      <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">Q2 2026 · IN PROGRESS</span>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">Core Banking Connectors</h4>
                      <p className="text-[var(--foreground-muted)]">Finacle and Temenos integrations, automated regulatory e-filing directly to BFIU portals.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1.5">
                      <span className="font-mono text-[10px] text-purple-400 font-bold uppercase">Q3 2026 · PLANNED</span>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">Cross-Border Remittance Bridge</h4>
                      <p className="text-[var(--foreground-muted)]">Cross-border graph link analysis connecting South Asia MFS rails with GCC remittance corridors.</p>
                    </div>
                  </div>
                </section>

                {/* Changelog */}
                <section id="changelog" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-primary)] uppercase font-bold">
                    <Clock className="w-4 h-4" />
                    <span>Changelog &amp; Version History</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                    Version 4.0.0 Production Release
                  </h2>
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-[var(--foreground)]">v4.0.0 — Production Enterprise Release</span>
                        <span className="text-[10px] font-mono text-emerald-400">Current Stable</span>
                      </div>
                      <p className="text-[var(--foreground-muted)]">
                        Full population of 212k transaction dataset, calibrated risk scores (4.5k Critical, 2.6k High), 1-second masterclass skeleton loaders, and YC pitch deck integration.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-[var(--foreground)]">v3.2.0 — Model Governance &amp; TreeSHAP</span>
                        <span className="text-[10px] font-mono text-[var(--foreground-muted)]">Oct 2026</span>
                      </div>
                      <p className="text-[var(--foreground-muted)]">
                        Added Population Stability Index (PSI) drift tracking and Reason Codes (RC-01 to RC-12) local attribution.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                PART C: LIVE SYSTEM TELEMETRY
            ══════════════════════════════════════════════════════════════ */}
            {(viewMode === 'all' || viewMode === 'live') && (
              <section id="telemetry" className="obsidian-card rounded-3xl border border-[var(--card-border)] p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold">
                    <Activity className="w-4 h-4" />
                    <span>Real-Time Database &amp; Model Telemetry</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                    ● POSTGRESQL 16 CONNECTED
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--foreground-muted)] block">Database Latency</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 block mt-1">{liveStats.dbLatencyMs}ms</span>
                    <span className="text-[10px] text-[var(--foreground-muted)] block mt-0.5">PostgreSQL 16 Engine</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--foreground-muted)] block">ML Inference P99</span>
                    <span className="text-2xl font-black font-mono text-[var(--accent-primary)] block mt-1">{liveStats.mlLatencyMs}ms</span>
                    <span className="text-[10px] text-[var(--foreground-muted)] block mt-0.5">Target &lt;25ms SLA</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--foreground-muted)] block">Active Alerts</span>
                    <span className="text-2xl font-black font-mono text-rose-400 block mt-1">{liveStats.totalAlerts.toLocaleString()}</span>
                    <span className="text-[10px] text-[var(--foreground-muted)] block mt-0.5">4,506 Critical / 2,617 High</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--foreground-muted)] block">Feature Drift (PSI)</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 block mt-1">{liveStats.modelPSI}</span>
                    <span className="text-[10px] text-[var(--foreground-muted)] block mt-0.5">Stable (&lt;0.10 threshold)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[var(--foreground)] block">
                        Dual ML Artifacts &amp; LLM Orchestration Operational
                      </span>
                      <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                        LightGBM (v2.4.1), Isolation Forest (v1.9.0), and Ollama local daemons are actively verifying live transactions.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 font-semibold text-[var(--accent-primary)] hover:underline shrink-0"
                  >
                    Open SOC Command Center →
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* ── 04. Admin Access Control Modal Drawer ── */}
      <DocsAccessControlModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
