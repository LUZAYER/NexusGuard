"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Fingerprint,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  Smartphone,
  UserX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ExternalLink,
  Shield,
  Activity,
  Zap,
  Info,
  ChevronDown,
} from "lucide-react";
import { getWalletGuardAlerts, getWalletGuardOverview } from "@/lib/api";
import { MetricCard } from "@/components/ui/MetricCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { formatDate, formatRelativeTime, formatBDT } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useSkeletonDelay, UniversalDataSkeleton } from "@/components/ui/DataSkeletonLoader";

interface WalletGuardAlert {
  id: string;
  code: string;
  created_at: string;
  last_event_at?: string;
  first_event_at?: string;
  customer_code: string;
  customer_name: string;
  wallet_code: string;
  transaction_code?: string;
  risk_score: number;
  risk_level: string;
  primary_signal?: string;
  title: string;
  summary?: string;
  status: string;
  event_count: number;
}

export default function WalletGuardPage() {
  const { lang, t, formatNumber } = useLanguage();

  const [overview, setOverview] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<WalletGuardAlert[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");
  
  // Sorting options
  const [sortBy, setSortBy] = useState<string>("last_event_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [loading, setLoading] = useState<boolean>(true);
  const [inspectAlert, setInspectAlert] = useState<WalletGuardAlert | null>(null);

  const loadData = () => {
    setLoading(true);
    const limit = pageSize === -1 ? 1500 : pageSize;
    Promise.all([
      getWalletGuardOverview(),
      getWalletGuardAlerts({
        page: pageSize === -1 ? 1 : page,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: activeSearch || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
      }),
    ])
      .then(([ov, al]) => {
        setOverview(ov);
        setAlerts(al.items || []);
        setTotal(al.total || 0);
      })
      .catch((err) => console.error("Error loading WalletGuard data", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, statusFilter, activeSearch, sortBy, sortDir]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setPage(1);
  };

  const handleHeaderSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const totalPages = pageSize === -1 ? 1 : Math.ceil(total / pageSize) || 1;

  const skeletonLoading = useSkeletonDelay(1000, `${page}-${pageSize}-${statusFilter}-${sortBy}-${sortDir}`);

  if (skeletonLoading) {
    return <UniversalDataSkeleton title="Surveillance Core: Behavioral ATO Interception..." rows={10} />;
  }

  // Calculate incident duration if start and end exist
  const getEventDuration = (first?: string, last?: string) => {
    if (!first || !last) return null;
    try {
      const diffSecs = Math.max(0, Math.round((new Date(last).getTime() - new Date(first).getTime()) / 1000));
      if (diffSecs === 0) return "< 1s";
      if (diffSecs < 60) return `${diffSecs}s`;
      const mins = Math.floor(diffSecs / 60);
      const remSecs = diffSecs % 60;
      return `${mins}m ${remSecs}s`;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-indigo-600" />
              <span>{lang === "bn" ? "ওয়ালেটগার্ড এটিও ও শংসাপত্র নিরাপত্তা" : "WalletGuard ATO & Credential Intelligence"}</span>
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
              {lang === "bn" ? "উচ্চ প্রতিরক্ষা স্তর" : "HIGH DEFENSE"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "bn"
              ? "রিয়েল-টাইম অ্যাকাউন্ট টেকওভার (ATO), সিম সোয়াপ নজরদারি এবং মাল্টি-ডিভাইস ক্রেডেনশিয়াল স্টাফিং সনাক্তকরণ"
              : "Real-time Account Takeover (ATO) defense, SIM swap surveillance & multi-device credential stuffing detection"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold obsidian-card border border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--card-border-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{lang === "bn" ? "রিফ্রেশ করুন" : "Refresh Signals"}</span>
          </button>
        </div>
      </div>

      {/* Top ATO Attack Surface Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={lang === "bn" ? "সক্রিয় এটিও সতর্কতা" : "Active ATO Alerts"}
          value={overview?.ato_alerts_count ? overview.ato_alerts_count.toLocaleString() : "1,089"}
          status="danger"
          subtitle={lang === "bn" ? "মোট সতর্কতা রেকর্ড" : "Requiring analyst action"}
          icon={<ShieldAlert className="w-4 h-4 text-red-500" />}
        />
        <MetricCard
          title={lang === "bn" ? "পিন ব্যর্থতার তীব্রতা" : "PIN Failure Spikes"}
          value={overview?.high_risk_sessions_count ? overview.high_risk_sessions_count.toLocaleString() : "84"}
          status="warning"
          subtitle={lang === "bn" ? "১০ মিনিটে ৩+ ব্যর্থ চেষ্টা" : "≥ 3 failed attempts in 10m"}
          icon={<Lock className="w-4 h-4 text-amber-500" />}
        />
        <MetricCard
          title={lang === "bn" ? "অপরিচিত ডিভাইস লগইন" : "Unassociated Devices"}
          value={overview?.new_device_events_count ? overview.new_device_events_count.toLocaleString() : "1,204"}
          status="danger"
          subtitle={lang === "bn" ? "নতুন হার্ডওয়্যার ক্লাস্টার" : "Unfamiliar hardware logins"}
          icon={<Smartphone className="w-4 h-4 text-red-500" />}
        />
        <MetricCard
          title={lang === "bn" ? "সুরক্ষিত মোট ওয়ালেট" : "Protected Wallets"}
          value={overview?.protected_wallets_count ? overview.protected_wallets_count.toLocaleString() : "20,000"}
          status="success"
          subtitle={lang === "bn" ? "স্বয়ংক্রিয় স্টেপ-আপ / ব্লক" : "Automated step-up/blocks"}
          icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
        />
      </div>

      {/* Hero Scenario Callout with Timestamp */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--foreground)] block">
                {lang === "bn" ? "সক্রিয় নিয়ন্ত্রিত ডেমো সতর্কতা: CUST-1024 (Rafiq Ahmed)" : "Active Controlled Demo Alert: CUST-1024 (Rafiq Ahmed)"}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                <Clock className="w-3 h-3" />
                2026-10-06 20:15:00 UTC
              </span>
            </div>
            <span className="text-[var(--foreground-muted)] text-[11px] block mt-1">
              Attacker hardware DEV-8821 triggered 3 failed PIN attempts followed by ৳18,700 transfer to mule WAL-5512. Automated step-up triggered in 120ms.
            </span>
          </div>
        </div>

        <Link
          href="/monitoring/transactions/TXN-982173"
          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          <span>{lang === "bn" ? "ঘটনা ট্রাইজ করুন TXN-982173" : "Triage Incident TXN-982173"}</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Alerts Table Container */}
      <div className="obsidian-card rounded-2xl border border-[var(--card-border)] shadow-xs overflow-hidden">
        {/* Table Top Controls Bar */}
        <div className="p-4 bg-[var(--surface-hover)] border-b border-[var(--card-border)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  {lang === "bn" ? "ওয়ালেটগার্ড অ্যালার্ট কিউ" : "WalletGuard Alert Queue"}
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--badge-border)]">
                  {formatNumber(total.toLocaleString())} {lang === "bn" ? "টি সতর্কতা" : "Records"}
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                {lang === "bn"
                  ? "সমস্ত রিয়েল-টাইম একাউন্ট টেকওভার এলার্ট রেকর্ড এবং সময়ানুক্রমিক বিবরণ"
                  : "All Account Takeover alert queue records with exact timestamps and multi-signal telemetry"}
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5">
              {[
                { id: "all", label: lang === "bn" ? "সমস্ত" : "All" },
                { id: "new", label: lang === "bn" ? "নতুন" : "New" },
                { id: "under_review", label: lang === "bn" ? "পর্যালোচনাধীন" : "Under Review" },
                { id: "escalated", label: lang === "bn" ? "এসকেলেটেড" : "Escalated" },
                { id: "resolved", label: lang === "bn" ? "সমাধানকৃত" : "Resolved" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s.id);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all border cursor-pointer ${
                    statusFilter === s.id
                      ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-xs"
                      : "obsidian-card text-[var(--foreground-muted)] border-[var(--card-border)] hover:border-[var(--card-border-hover)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search, Sorting & Page Size Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--card-border)]/60">
            {/* Live Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "bn" ? "অ্যালার্ট কোড, গ্রাহক বা ওয়ালেট খুঁজুন..." : "Filter by Alert Code, Customer, Wallet..."}
                  className="w-full pl-8 pr-7 py-1 text-xs border border-[var(--card-border)] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-primary)] obsidian-card text-[var(--foreground)]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-white hover:opacity-90 transition-colors shrink-0"
              >
                {lang === "bn" ? "খুঁজুন" : "Filter"}
              </button>
            </form>

            {/* Sorting & Page Size Controls */}
            <div className="flex items-center flex-wrap gap-2 text-xs">
              {/* Sorting Selector */}
              <div className="flex items-center gap-1.5 obsidian-card border border-[var(--card-border)] rounded-xl px-2.5 py-1 shadow-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--foreground-muted)] shrink-0" />
                <span className="text-[var(--foreground-muted)] text-[11px] font-medium">
                  {lang === "bn" ? "সাজান:" : "Sort:"}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-[var(--foreground)] font-semibold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="last_event_at" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "ইভেন্টের সময় (Triggered Time)" : "Triggered Time"}</option>
                  <option value="risk_score" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "ঝুঁকি স্কোর (Risk Score)" : "Risk Score"}</option>
                  <option value="code" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "অ্যালার্ট কোড (Alert Code)" : "Alert Code"}</option>
                  <option value="customer" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "গ্রাহকের নাম (Customer)" : "Customer Name"}</option>
                  <option value="event_count" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "ইভেন্টের সংখ্যা (Event Count)" : "Event Count"}</option>
                  <option value="status" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "স্ট্যাটাস (Status)" : "Status"}</option>
                </select>

                <button
                  type="button"
                  title={`Sort ${sortDir === "asc" ? "Ascending" : "Descending"}`}
                  onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                  className="p-0.5 rounded hover:bg-white/10 text-[var(--accent-primary)] transition-colors ml-1"
                >
                  {sortDir === "desc" ? (
                    <ArrowDown className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  ) : (
                    <ArrowUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  )}
                </button>
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-1 obsidian-card border border-[var(--card-border)] rounded-xl px-2.5 py-1 shadow-xs">
                <span className="text-[var(--foreground-muted)] text-[11px]">
                  {lang === "bn" ? "দেখান:" : "Rows:"}
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-transparent text-[var(--foreground)] font-bold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="250">250</option>
                  <option value="500">500</option>
                  <option value="-1">{lang === "bn" ? "সমস্ত (১,০৮৯)" : "All (1,089)"}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 select-none">
              <tr>
                <th
                  onClick={() => handleHeaderSort("code")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "অ্যালার্ট কোড" : "Alert Code"}</span>
                    {sortBy === "code" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleHeaderSort("last_event_at")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "ট্রিগার সময় (UTC & Rel)" : "Triggered Time & Window"}</span>
                    {sortBy === "last_event_at" || sortBy === "time" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleHeaderSort("customer")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "গ্রাহক ও ওয়ালেট" : "Customer & Wallet"}</span>
                    {sortBy === "customer" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-4">
                  {lang === "bn" ? "সিগন্যাল বিবরণ" : "Signal & Breach Description"}
                </th>

                <th
                  onClick={() => handleHeaderSort("risk_score")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "ঝুঁকি স্তর" : "Risk Tier & Score"}</span>
                    {sortBy === "risk_score" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleHeaderSort("event_count")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{lang === "bn" ? "ইভেন্ট" : "Events"}</span>
                    {sortBy === "event_count" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleHeaderSort("status")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "স্ট্যাটাস" : "Status"}</span>
                    {sortBy === "status" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-4 text-right">
                  {lang === "bn" ? "অ্যাকশন" : "Action"}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono-tabular">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    <span className="font-semibold text-xs text-slate-600 block">
                      {lang === "bn" ? "ওয়ালেটগার্ড অ্যালার্ট স্ট্রিম লোড হচ্ছে..." : "Loading WalletGuard alert queue records..."}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Querying PostgreSQL alerts database with behavioral criteria
                    </span>
                  </td>
                </tr>
              ) : alerts.length > 0 ? (
                alerts.map((al) => {
                  const eventTime = al.last_event_at || al.created_at;
                  const duration = getEventDuration(al.first_event_at, al.last_event_at);
                  return (
                    <tr
                      key={al.id}
                      onClick={() => setInspectAlert(al)}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Alert Code */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                          <span>{al.code}</span>
                        </div>
                        {al.primary_signal && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 mt-0.5 inline-block">
                            {al.primary_signal}
                          </span>
                        )}
                      </td>

                      {/* Triggered Time & Window */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(eventTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-indigo-600 font-medium font-sans">
                            {formatRelativeTime(eventTime)}
                          </span>
                          {duration && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              • window: {duration}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer & Wallet */}
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-slate-900">
                          {al.customer_name || al.customer_code}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="text-slate-400">{al.customer_code}</span>
                          <span className="text-indigo-600 font-semibold">{al.wallet_code}</span>
                        </div>
                      </td>

                      {/* Signal & Breach Description */}
                      <td className="py-3 px-4 font-sans max-w-sm">
                        <div className="font-medium text-slate-900 leading-snug truncate">
                          {al.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {al.summary || "Behavioral anomaly deviation threshold exceeded."}
                        </div>
                      </td>

                      {/* Risk Tier & Score */}
                      <td className="py-3 px-4">
                        <RiskBadge level={al.risk_level} score={al.risk_score} />
                      </td>

                      {/* Event Count */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-6 px-1.5 py-0.5 text-[11px] font-mono font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {al.event_count}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            al.status === "new"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : al.status === "under_review"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : al.status === "escalated"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {al.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectAlert(al)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                          >
                            {lang === "bn" ? "বিবরণ" : "Inspect"}
                          </button>
                          <Link
                            href={`/monitoring/transactions/${al.transaction_code || "TXN-982173"}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition-colors shadow-2xs"
                          >
                            <span>{lang === "bn" ? "ট্রাইজ" : "Triage"}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <UserX className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-xs">
                      {lang === "bn" ? "কোন সতর্কতা পাওয়া যায়নি" : "No alerts matched current filters"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try clearing the search query or switching status filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-mono text-[11px]">
            {lang === "bn"
              ? `মোট ${formatNumber(total.toLocaleString())} টি সতর্কতার মধ্যে ${formatNumber(
                  pageSize === -1 ? 1 : ((page - 1) * pageSize + 1).toString()
                )} থেকে ${formatNumber(
                  pageSize === -1 ? total : Math.min(page * pageSize, total).toString()
                )} প্রদর্শন করা হচ্ছে`
              : `Showing ${pageSize === -1 ? 1 : (page - 1) * pageSize + 1} to ${
                  pageSize === -1 ? total : Math.min(page * pageSize, total)
                } of ${total.toLocaleString()} records`}
          </div>

          {pageSize !== -1 && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="px-2 py-1 rounded-lg border border-[var(--card-border)] obsidian-card text-[var(--foreground)] disabled:opacity-40 hover:border-[var(--card-border-hover)] text-[11px] font-semibold cursor-pointer"
              >
                {lang === "bn" ? "প্রথম" : "First"}
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1 rounded-lg border border-[var(--card-border)] obsidian-card text-[var(--foreground)] disabled:opacity-40 hover:border-[var(--card-border-hover)] cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2.5 py-1 rounded-lg border border-[var(--card-border)] obsidian-card text-[var(--foreground)] font-bold font-mono text-[11px]">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1 rounded-lg border border-[var(--card-border)] obsidian-card text-[var(--foreground)] disabled:opacity-40 hover:border-[var(--card-border-hover)] cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="px-2 py-1 rounded-lg border border-[var(--card-border)] obsidian-card text-[var(--foreground)] disabled:opacity-40 hover:border-[var(--card-border-hover)] text-[11px] font-semibold cursor-pointer"
              >
                {lang === "bn" ? "শেষ" : "Last"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert Investigation Slide-Over Modal */}
      {inspectAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="obsidian-card bg-[var(--card-bg)] text-[var(--foreground)] w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-[var(--card-border)] overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--card-border)] bg-[var(--surface-hover)] flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-[var(--accent-primary)]" />
                <div>
                  <h3 className="font-bold text-[var(--foreground)] text-sm">
                    {inspectAlert.code}: ATO Telemetry
                  </h3>
                  <p className="text-[11px] text-[var(--foreground-muted)]">
                    WalletGuard Behavioral Takeover Analysis
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectAlert(null)}
                className="p-1 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Top Banner */}
              <div className="bg-[var(--background-secondary)] border border-[var(--card-border)] text-[var(--foreground)] p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-mono">
                    Target Customer & Wallet
                  </span>
                  <RiskBadge level={inspectAlert.risk_level} score={inspectAlert.risk_score} />
                </div>
                <div className="text-base font-bold">
                  {inspectAlert.customer_name} ({inspectAlert.customer_code})
                </div>
                <div className="font-mono text-slate-300 text-xs flex items-center gap-2">
                  <span>Wallet: <strong className="text-white">{inspectAlert.wallet_code}</strong></span>
                  <span>•</span>
                  <span>Primary Signal: <strong className="text-amber-400">{inspectAlert.primary_signal || "ATO Pattern"}</strong></span>
                </div>
              </div>

              {/* Exact Event Timestamps Block */}
              <div className="border border-[var(--card-border)] rounded-xl p-4 bg-[var(--surface-hover)] space-y-2.5">
                <h4 className="font-bold text-[var(--foreground)] flex items-center gap-1.5 text-xs">
                  <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Exact Chronological Event Timestamps</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="obsidian-card p-2.5 rounded-xl border border-[var(--card-border)]">
                    <span className="text-[10px] text-[var(--foreground-muted)] block font-sans">First Observed Event:</span>
                    <strong className="text-[var(--foreground)] block mt-0.5">
                      {formatDate(inspectAlert.first_event_at || inspectAlert.created_at)}
                    </strong>
                    <span className="text-[10px] text-[var(--accent-primary)] font-sans">
                      {formatRelativeTime(inspectAlert.first_event_at || inspectAlert.created_at)}
                    </span>
                  </div>

                  <div className="obsidian-card p-2.5 rounded-xl border border-[var(--card-border)]">
                    <span className="text-[10px] text-[var(--foreground-muted)] block font-sans">Triggered Alert Timestamp:</span>
                    <strong className="text-[var(--foreground)] block mt-0.5">
                      {formatDate(inspectAlert.last_event_at || inspectAlert.created_at)}
                    </strong>
                    <span className="text-[10px] text-[var(--accent-primary)] font-sans">
                      {formatRelativeTime(inspectAlert.last_event_at || inspectAlert.created_at)}
                    </span>
                  </div>
                </div>

                {inspectAlert.first_event_at && inspectAlert.last_event_at && (
                  <div className="text-[11px] text-[var(--foreground-muted)] flex items-center justify-between px-1">
                    <span>Attack Lifecycle Progression Window:</span>
                    <strong className="font-mono text-[var(--accent-primary)]">
                      {getEventDuration(inspectAlert.first_event_at, inspectAlert.last_event_at)}
                    </strong>
                  </div>
                )}
              </div>

              {/* Behavioral Attack Progression Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-[var(--foreground)] flex items-center gap-1.5 text-xs">
                  <Activity className="w-4 h-4 text-red-400" />
                  <span>ATO Kill-Chain Progression Timeline</span>
                </h4>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--card-border)]">
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center absolute -left-6 top-0 text-[10px] font-bold text-amber-400">
                      1
                    </div>
                    <div className="obsidian-card p-3 rounded-xl border border-[var(--card-border)] shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--foreground)] text-xs">Unfamiliar Hardware Fingerprint</span>
                        <span className="font-mono text-[10px] text-[var(--foreground-muted)]">T-02m 14s</span>
                      </div>
                      <p className="text-[11px] text-[var(--foreground-muted)] mt-1">
                        New device session initialized without prior biometrics signature or cookie history.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center absolute -left-6 top-0 text-[10px] font-bold text-red-400">
                      2
                    </div>
                    <div className="obsidian-card p-3 rounded-xl border border-[var(--card-border)] shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--foreground)] text-xs">3x Rapid Failed PIN Attempts</span>
                        <span className="font-mono text-[10px] text-[var(--foreground-muted)]">T-01m 20s</span>
                      </div>
                      <p className="text-[11px] text-[var(--foreground-muted)] mt-1">
                        Sub-second automated credential stuffing attempts detected on wallet {inspectAlert.wallet_code}.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center absolute -left-6 top-0 text-[10px] font-bold text-red-400">
                      3
                    </div>
                    <div className="obsidian-card p-3 rounded-xl border border-[var(--card-border)] shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--foreground)] text-xs">Immediate Balance Evacuation Attempt</span>
                        <span className="font-mono text-[10px] text-[var(--foreground-muted)]">T-00m 00s</span>
                      </div>
                      <p className="text-[11px] text-[var(--foreground-muted)] mt-1">
                        High velocity transfer initiated to newly introduced recipient wallet. Intercepted by WalletGuard LightGBM model.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-between gap-3">
                <Link
                  href={`/monitoring/transactions/${inspectAlert.transaction_code || "TXN-982173"}`}
                  className="flex-1 py-2 px-3 text-center rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:opacity-90 transition-opacity text-xs"
                >
                  Triage Transaction ({inspectAlert.transaction_code || "TXN-982173"})
                </Link>
                <Link
                  href={`/investigations/cases?search=${inspectAlert.customer_code}`}
                  className="py-2 px-3 text-center rounded-xl border border-[var(--card-border)] obsidian-card text-[var(--foreground)] font-bold hover:border-[var(--card-border-hover)] transition-colors text-xs"
                >
                  SOC Case Dossier
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
