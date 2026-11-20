"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Briefcase,
  CheckCircle,
  Download,
  Fingerprint,
  Layers,
  MapPin,
  RefreshCw,
  Share2,
  ShieldAlert,
  Smartphone,
  User,
  Wallet,
} from "lucide-react";
import {
  createCase,
  downloadReportPDF,
  getTransaction,
} from "@/lib/api";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { RiskBreakdown } from "@/components/ui/RiskBreakdown";
import { EvidenceCard } from "@/components/ui/EvidenceCard";
import { BehaviorComparison } from "@/components/ui/BehaviorComparison";
import { InvestigationReportView } from "@/components/ui/InvestigationReportView";
import { formatBDT, formatDate } from "@/lib/utils";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const identifier = (params?.id as string) || "TXN-982173";

  const [tx, setTx] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [caseModalOpen, setCaseModalOpen] = useState<boolean>(false);
  const [caseCreating, setCaseCreating] = useState<boolean>(false);
  const [caseCreatedCode, setCaseCreatedCode] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);

  const loadTransaction = () => {
    setLoading(true);
    setError(null);
    getTransaction(identifier)
      .then((data) => setTx(data))
      .catch((err) => setError(err.message || "Failed to load transaction"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTransaction();
  }, [identifier]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await downloadReportPDF(identifier);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Incident-Report-${identifier}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF report.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCreateCase = async () => {
    if (!tx) return;
    setCaseCreating(true);
    try {
      const res = await createCase({
        title: `Account Takeover & High-Risk Cashout (${tx.code})`,
        priority: tx.risk_level === "critical" ? "critical" : "high",
        customer_id: tx.customer_id,
        wallet_id: tx.wallet_id,
        transaction_id: tx.id,
        initial_note: `Automated case triggered from forensic incident inspection. Risk Score: ${tx.overall_risk} (${tx.risk_level}). Primary signal: ${tx.primary_signal || "ATO"}.`,
      });
      setCaseCreatedCode(res.code);
    } catch (err: any) {
      console.error("Case creation failed:", err);
      alert(`Case creation failed: ${err.message}`);
    } finally {
      setCaseCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 max-w-5xl mx-auto">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-400" />
        <p className="font-semibold text-slate-700">Loading Forensic Evidence Dossier...</p>
        <p className="text-xs text-slate-400 mt-1">Retrieving point-in-time features and model artifacts</p>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="p-8 obsidian-card rounded-2xl border border-red-500/30 text-center max-w-2xl mx-auto my-12">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[var(--foreground)]">Incident Not Found</h2>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">{error || "Unable to locate transaction record."}</p>
        <Link
          href="/monitoring/transactions"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Surveillance Stream
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--card-border)] pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/monitoring/transactions"
            className="p-1 rounded-lg hover:bg-white/10 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[var(--foreground-muted)]">
                INCIDENT DOSSIER /
              </span>
              <h1 className="text-xl font-extrabold text-[var(--foreground)] font-mono tracking-tight">
                {tx.code}
              </h1>
              <RiskBadge level={tx.risk_level} score={tx.overall_risk} />
            </div>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
              Executed {formatDate(tx.occurred_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold obsidian-card border border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--card-border-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>{downloading ? "Generating PDF..." : "Export PDF Report"}</span>
          </button>

          {caseCreatedCode ? (
            <Link
              href={`/investigations/cases/${caseCreatedCode}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Case Opened: {caseCreatedCode}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleCreateCase}
              disabled={caseCreating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-white hover:opacity-90 shadow-xs transition-opacity cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{caseCreating ? "Opening Case..." : "Escalate to SOC Case"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Incident Metric Banner */}
      <div className="obsidian-card text-[var(--foreground)] rounded-2xl p-5 border border-[var(--card-border)] shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--foreground-muted)] block">
            Transaction Volume
          </span>
          <span className="font-mono text-3xl font-extrabold text-[var(--foreground)] mt-1 block">
            {formatBDT(tx.amount)}
          </span>
          <span className="text-[11px] text-red-400 font-bold mt-1 block">
            13.8x Customer 30-day Median
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--foreground-muted)] block">
            Victim Customer
          </span>
          <span className="text-sm font-bold text-[var(--foreground)] mt-1 block">
            {tx.customer_name}
          </span>
          <span className="font-mono text-[11px] text-[var(--foreground-muted)] block">
            {tx.customer_code} • Wallet {tx.wallet_code}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--foreground-muted)] block">
            Originating Hardware
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <Smartphone className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="font-mono text-xs font-bold text-red-300">
              {tx.device_code}
            </span>
          </div>
          <span className="text-[11px] text-[var(--foreground-muted)] block">
            {tx.device_is_new ? "Unfamiliar Device (Attacker Pool)" : "Registered Device"}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--foreground-muted)] block">
            Designated Destination
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono text-xs font-bold text-amber-300">
              {tx.recipient_wallet_code}
            </span>
          </div>
          <span className="text-[11px] text-[var(--foreground-muted)] block">
            Identified Mule Funnel Hub (WAL-5512)
          </span>
        </div>
      </div>

      {/* Ensemble Multi-Engine Score Breakdown */}
      <RiskBreakdown
        overallScore={tx.overall_risk}
        overallLevel={tx.risk_level}
        transactionRisk={tx.transaction_risk}
        behaviorRisk={tx.behavior_risk}
        atoRisk={tx.ato_risk}
        networkRisk={tx.network_risk}
      />

      {/* Side-by-side Behavioral Profile Comparison */}
      {tx.behavior_comparisons && tx.behavior_comparisons.length > 0 && (
        <BehaviorComparison
          comparisons={tx.behavior_comparisons}
          customerName={tx.customer_name}
        />
      )}

      {/* Structured Forensic Evidence Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Forensic Evidence Dossier
            </h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Deterministic, explainable signals feeding ensemble scoring &amp; LLM synthesis
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--card-border)] text-[var(--foreground)]">
            {tx.evidence?.length || 0} Evidence Artifacts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tx.evidence?.map((ev: any) => (
            <EvidenceCard key={ev.code || ev.id} evidence={ev} />
          ))}
        </div>
      </div>

      {/* AI Advisory Investigation Report (Ollama Local) */}
      <InvestigationReportView
        report={null}
        transactionCode={tx.code}
        onRefresh={loadTransaction}
      />
    </div>
  );
}
