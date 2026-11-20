'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Zap,
  Clock,
  DollarSign,
  Bot,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Minus,
  Shield,
  ShieldAlert,
  GitBranch,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Cpu,
  Fingerprint,
  Radio,
  FileText,
  Users,
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { TokenUsageChart } from '@/components/charts/TokenUsageChart';
import { CostTrendLine } from '@/components/charts/CostTrendLine';
import { StatusBadge, SeverityBadge, FrameworkBadge } from '@/components/ui/Badge';
import { DemoScenarioSwitcher } from '@/components/ui/DemoScenarioSwitcher';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { RiskScoreBar } from '@/components/ui/RiskScoreBar';
import { formatBDT, formatDate } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  mockSessions,
  mockTokenUsage,
  mockCostTrend,
  mockTopAgents,
  mockFrameworkDistribution,
  mockAlerts,
  mockSystemHealth,
} from '@/lib/mock-data';
import { getTransactions, getWalletGuardOverview } from '@/lib/api';
import { useSkeletonDelay, DashboardSkeleton } from '@/components/ui/DataSkeletonLoader';

const PIE_COLORS = ['#f97316', '#ef4444', '#10b981', '#06b6d4', '#8b5cf6'];

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export default function DashboardPage() {
  const { lang, t, formatNumber } = useLanguage();
  const { isDark } = useTheme();
  const [liveTransactions, setLiveTransactions] = useState<any[]>([]);
  const [totalTxnCount, setTotalTxnCount] = useState<number>(212749);
  const [atoOverview, setAtoOverview] = useState<any>(null);
  const skeletonLoading = useSkeletonDelay(1000);

  useEffect(() => {
    getTransactions({ limit: 5 })
      .then((res) => {
        setLiveTransactions(res.items || []);
        if (res.total && res.total > 0) {
          setTotalTxnCount(res.total);
        }
      })
      .catch((err) => console.error('Failed to load dashboard transactions', err));

    getWalletGuardOverview()
      .then((data) => setAtoOverview(data))
      .catch((err) => console.error('Failed to load ATO overview', err));
  }, []);

  if (skeletonLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── 01. Minimal Executive Command Header ── */}
      <div className="rounded-2xl obsidian-card p-6 md:p-7 border border-[var(--card-border)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2.5 max-w-3xl">
            {/* Live Operational Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-bold tracking-normal bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--badge-border)]">
                <Radio className="w-3 h-3 text-[var(--accent-primary)] animate-pulse" />
                NexusGuard SOC v4.0
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                All 4 ML Engines Operational
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--foreground-muted)]">
                <Clock className="w-3 h-3 opacity-60" />
                Sub-25ms Execution
              </span>
            </div>

            {/* Editorial Luxury Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif-luxury font-normal tracking-tight text-[var(--foreground)] leading-tight">
              Autonomous Agent Operations & FinTech Trust Command
            </h1>

            {/* Minimal Subtitle */}
            <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
              Unified surveillance combining real-time machine learning (LightGBM & Isolation Forest) with multi-hop graph link forensics and autonomous agent investigations across{' '}
              <strong className="text-[var(--foreground)] font-semibold font-mono">212,749</strong> historical & live transactions.
            </p>
          </div>

          {/* Quick evaluation shortcuts */}
          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-stretch gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/monitoring/transactions/TXN-982173"
              className="flex items-center justify-between gap-3 rounded-xl bg-rose-500/15 border border-rose-500/35 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition-all shadow-xs group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Hero Incident TXN-982173</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/governance"
              className="flex items-center justify-between gap-3 rounded-xl bg-indigo-500/15 border border-indigo-500/35 px-4 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/25 transition-all shadow-xs group"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Model Governance & SHAP</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-indigo-400 opacity-70 group-hover:opacity-100" />
            </Link>

            <Link
              href="/docs"
              className="flex items-center justify-between gap-3 rounded-xl obsidian-card border border-[var(--card-border)] px-4 py-2.5 text-xs font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--card-border-hover)] transition-all shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-3.5 w-3.5 opacity-60" />
                <span>Architecture Whitepaper</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 02. Controlled Demo Scenario Switcher ── */}
      <div className="obsidian-card rounded-2xl border border-[var(--card-border)] p-4 md:p-5">
        <DemoScenarioSwitcher />
      </div>

      {/* ── 03. High-Scale FinTech Trust + AgentOps KPI Metrics Grid ── */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Transactions"
          value={totalTxnCount.toLocaleString()}
          subtitle="SentinelFlow Data Pool"
          trend={{ direction: 'up', value: '212.7K', label: 'analyzed' }}
          icon={<Activity className="h-4 w-4" />}
          accentColor="orange"
        />
        <MetricCard
          title="MFS Customers"
          value="20,000"
          subtitle="Active Wallets: 20K"
          trend={{ direction: 'up', value: '100%', label: 'verified' }}
          icon={<Users className="h-4 w-4" />}
          accentColor="cyan"
        />
        <MetricCard
          title="Avg Latency (ML)"
          value="11.2"
          unit="ms"
          subtitle="Target <25ms SLA"
          trend={{ direction: 'down', value: '-5%', label: 'vs baseline' }}
          icon={<Clock className="h-4 w-4" />}
          accentColor="violet"
          upIsGood={false}
        />
        <MetricCard
          title="Protected Volume"
          value="৳ 48.2M"
          subtitle="68.4% cached tokens"
          trend={{ direction: 'up', value: 'Live', label: 'interbank' }}
          icon={<DollarSign className="h-4 w-4" />}
          accentColor="amber"
          upIsGood={false}
        />
        <MetricCard
          title="Active ATO Intercepts"
          value={atoOverview?.ato_alerts_count || 1089}
          subtitle="Protected: ৳ 48.2M"
          trend={{ direction: 'neutral', value: 'Live' }}
          icon={<ShieldAlert className="h-4 w-4 text-rose-400" />}
          accentColor="rose"
        />
        <MetricCard
          title="Agent Sessions"
          value="208,090"
          subtitle="Error Rate: 1.8%"
          trend={{ direction: 'up', value: 'Active', label: 'OTel traced' }}
          icon={<Bot className="h-4 w-4" />}
          accentColor="emerald"
        />
      </div>

      {/* ── 04. Four Intelligence Engines Monolithic Pipeline ── */}
      <div className="obsidian-card rounded-2xl p-5 md:p-6 border border-[var(--card-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--badge-bg)] text-[var(--accent-primary)]">
                <Cpu className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                Four Intelligence Engines · Real-Time Pipeline
              </h2>
            </div>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              <span className="font-serif-luxury italic text-sm text-[var(--foreground)]">
                &ldquo;ML makes the sub-25ms security decision; the LLM explains the evidence dossier.&rdquo;
              </span>
            </p>
          </div>
          <Link
            href="/analytics/models"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:underline self-start sm:self-auto"
          >
            Model drift & metrics
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Engine 01 */}
          <div className="obsidian-card group rounded-xl p-4 border border-[var(--card-border)] hover:border-[var(--card-border-hover)]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                Engine 01
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Transaction Risk
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
              LightGBM + XGBoost ensemble scoring 48 engineered behavioral features.
            </p>
            <div className="mt-3 pt-2.5 border-t border-[var(--card-border)] flex justify-between text-[11px] font-mono text-[var(--foreground-muted)]">
              <span>PR-AUC: <strong className="text-[var(--foreground)] font-bold">0.942</strong></span>
              <span>ROC: <strong className="text-[var(--foreground)] font-bold">0.981</strong></span>
            </div>
          </div>

          {/* Engine 02 */}
          <div className="obsidian-card group rounded-xl p-4 border border-[var(--card-border)] hover:border-[var(--card-border-hover)]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                Engine 02
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Behavioral Anomaly
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
              Isolation Forest quantifying historical baseline deviations (velocity, timing, amount).
            </p>
            <div className="mt-3 pt-2.5 border-t border-[var(--card-border)] flex justify-between text-[11px] font-mono text-[var(--foreground-muted)]">
              <span>Features: <strong className="text-[var(--foreground)] font-bold">32</strong></span>
              <span>Dev: <strong className="text-rose-400 font-bold">+1408%</strong></span>
            </div>
          </div>

          {/* Engine 03 */}
          <div className="obsidian-card group rounded-xl p-4 border border-[var(--card-border)] hover:border-[var(--card-border-hover)]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Engine 03
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              WalletGuard ATO
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
              Account takeover fingerprinting tracking new hardware pairings & SIM-swap leads.
            </p>
            <div className="mt-3 pt-2.5 border-t border-[var(--card-border)] flex justify-between text-[11px] font-mono text-[var(--foreground-muted)]">
              <span>SIM Lead: <strong className="text-[var(--foreground)] font-bold">6.2h</strong></span>
              <span>Check: <strong className="text-amber-400 font-bold">DEV-8821</strong></span>
            </div>
          </div>

          {/* Engine 04 */}
          <div className="obsidian-card group rounded-xl p-4 border border-[var(--card-border)] hover:border-[var(--card-border-hover)]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                Engine 04
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              ScamShield Network
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
              Graph intelligence computing degree, betweenness centrality, and mule rings.
            </p>
            <div className="mt-3 pt-2.5 border-t border-[var(--card-border)] flex justify-between text-[11px] font-mono text-[var(--foreground-muted)]">
              <span>Hub: <strong className="text-rose-400 font-bold">WALLET-X</strong></span>
              <span>Fan-out: <strong className="text-[var(--foreground)] font-bold">3 Mules</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 05. Live Streams Split: Left High-Risk Transactions, Right Agent Replays ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* FinTech Transactions Stream */}
        <div className="obsidian-card rounded-2xl p-5 md:p-6 border border-[var(--card-border)]">
          <SectionHeader
            title="Live MFS Risk Transactions"
            subtitle="Real-time transaction surveillance pipeline (212,749 pool)"
            action={
              <Link
                href="/monitoring/transactions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
              >
                <span>View all 212K+</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          />

          <div className="space-y-3">
            {liveTransactions.map((tx) => (
              <div
                key={tx.id || tx.code || tx.transaction_code}
                className="obsidian-card rounded-xl p-3.5 border border-[var(--card-border)] hover:border-[var(--card-border-hover)] flex items-center justify-between gap-3 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/monitoring/transactions/${tx.code || tx.transaction_code || tx.id}`}
                      className="text-xs font-bold font-mono text-[var(--accent-primary)] hover:underline"
                    >
                      {tx.code || tx.transaction_code}
                    </Link>
                    <RiskBadge level={tx.risk_level || 'low'} score={tx.risk_score} showDot />
                    {(tx.is_hero || tx.code === 'TXN-982173') && (
                      <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-black text-rose-400 border border-rose-500/30">
                        HERO ATO
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-[var(--foreground)] mt-1 truncate">
                    {tx.customer_name || 'Customer'} ·{' '}
                    <span className="font-bold text-[var(--foreground)]">
                      {formatBDT(tx.amount || tx.amount_bdt || 0)}
                    </span>
                  </p>
                  <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5 truncate font-mono">
                    {tx.wallet_code || tx.sender_wallet || '-'} → {tx.recipient_wallet_code || tx.receiver_wallet || '-'} · {formatDate(tx.occurred_at || new Date().toISOString())}
                  </p>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className="text-xs font-mono font-bold text-[var(--foreground)]">
                    {typeof tx.risk_score === 'number' ? tx.risk_score.toFixed(1) : (tx.risk_level === 'critical' ? '86.0' : '15.0')} <span className="text-[10px] text-[var(--foreground-muted)]">/100</span>
                  </span>
                  <div className="w-20 mt-1">
                    <RiskScoreBar score={tx.risk_score || 15} showLabels={false} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Sessions Feed */}
        <div className="obsidian-card rounded-2xl p-5 md:p-6 border border-[var(--card-border)]">
          <SectionHeader
            title="Real-Time Agent Sessions"
            subtitle="Autonomous AI execution timeline"
            action={
              <Link
                href="/sessions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
              >
                <span>Waterfall view</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          />

          <div className="space-y-3">
            {mockSessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="obsidian-card rounded-xl p-3.5 border border-[var(--card-border)] hover:border-[var(--card-border-hover)] flex items-center justify-between gap-3 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/sessions/${s.id}`}
                      className="text-xs font-bold font-mono text-[var(--accent-primary)] hover:underline"
                    >
                      {s.id.slice(0, 10)}…
                    </Link>
                    <FrameworkBadge framework={s.framework} />
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-xs font-semibold text-[var(--foreground)] mt-1">{s.agentName}</p>
                  <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5 font-mono">
                    {s.events} events · ${s.cost.toFixed(4)} cost · {s.duration}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--foreground-muted)] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 06. Analytics Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Token usage area chart */}
        <div className="col-span-2 obsidian-card rounded-2xl p-5 md:p-6 border border-[var(--card-border)]">
          <SectionHeader
            title="Token Usage (24h)"
            subtitle="Prompt vs Completion token consumption"
            action={<span className="text-xs font-mono text-[var(--foreground-muted)]">Cached: 68.4%</span>}
          />
          <TokenUsageChart data={mockTokenUsage} height={220} />
        </div>

        {/* Framework distribution pie */}
        <div className="obsidian-card rounded-2xl p-5 md:p-6 border border-[var(--card-border)]">
          <SectionHeader
            title="Framework Distribution"
            subtitle="Orchestrator market share"
          />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={mockFrameworkDistribution}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {mockFrameworkDistribution.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                    stroke="var(--background)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  borderRadius: 12,
                  fontSize: 12,
                  color: 'var(--foreground)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: 'var(--foreground-muted)', paddingTop: 4 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 07. Second Row: Agents Bar + Cost Trend ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top agents */}
        <div className="obsidian-card rounded-2xl p-5 md:p-6 border border-[var(--card-border)]">
          <SectionHeader
            title="Top Agents by Activity"
            subtitle="Sessions dispatched per autonomous agent"
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={mockTopAgents}
              layout="vertical"
              margin={{ left: 0, right: 10, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fill: 'var(--foreground)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  borderRadius: 12,
                  fontSize: 12,
                  color: 'var(--foreground)',
                }}
              />
              <Bar dataKey="sessions" fill="var(--accent-primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost trend */}
        <div className="obsidian-card rounded-2xl p-5 md:p-6 border border-[var(--card-border)]">
          <SectionHeader
            title="Cost Trend"
            subtitle="Hourly AI inference expenditure"
            action={<span className="text-xs font-mono text-[var(--foreground-muted)]">Avg $3.51/hr</span>}
          />
          <CostTrendLine data={mockCostTrend} height={200} />
        </div>
      </div>

      {/* ── 08. Subtle Serif Watermark Footer ── */}
      <div className="pt-8 pb-2 text-center obsidian-watermark select-none pointer-events-none">
        <span className="text-5xl sm:text-7xl md:text-8xl font-serif-luxury font-normal tracking-tight">
          NexusGuard
        </span>
      </div>
    </div>
  );
}
