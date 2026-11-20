"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
} from "lucide-react";
import { getTransactions } from "@/lib/api";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { formatBDT, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useSkeletonDelay, TransactionsTableSkeleton } from "@/components/ui/DataSkeletonLoader";

function TransactionsMonitoringContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, t, formatNumber } = useLanguage();

  const querySearch = searchParams.get("search") || "";
  const queryCustomer = searchParams.get("customer_code") || "";
  const queryRisk = searchParams.get("risk_level") || "all";
  const querySortBy = searchParams.get("sort_by") || "occurred_at";
  const querySortDir = (searchParams.get("sort_dir") as "asc" | "desc") || "desc";

  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [riskLevel, setRiskLevel] = useState<string>(queryRisk);
  const [searchInput, setSearchInput] = useState<string>(querySearch || queryCustomer);
  const [activeSearch, setActiveSearch] = useState<string>(querySearch || queryCustomer);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>(querySortBy);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(querySortDir);

  const [loading, setLoading] = useState<boolean>(true);
  const initialSkeleton = useSkeletonDelay(1000);

  // Sync state if URL query params change
  useEffect(() => {
    const s = querySearch || queryCustomer;
    setSearchInput(s);
    setActiveSearch(s);
    setRiskLevel(queryRisk);
    if (querySortBy) setSortBy(querySortBy);
    if (querySortDir) setSortDir(querySortDir);
    setPage(1);
  }, [querySearch, queryCustomer, queryRisk, querySortBy, querySortDir]);

  // Load transactions data whenever dependencies change
  useEffect(() => {
    setLoading(true);
    getTransactions({
      page,
      page_size: pageSize,
      risk_level: riskLevel === "all" ? undefined : riskLevel,
      search: activeSearch || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
    })
      .then((data) => {
        setTransactions(data.items || []);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        console.error("Error loading transactions", err);
      })
      .finally(() => setLoading(false));
  }, [page, riskLevel, activeSearch, pageSize, sortBy, sortDir]);

  const updateUrl = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (activeSearch) params.set("search", activeSearch);
    if (riskLevel && riskLevel !== "all") params.set("risk_level", riskLevel);
    if (sortBy && sortBy !== "occurred_at") params.set("sort_by", sortBy);
    if (sortDir && sortDir !== "desc") params.set("sort_dir", sortDir);

    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === "all") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });

    const qs = params.toString();
    router.push(`/monitoring/transactions${qs ? `?${qs}` : ""}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setPage(1);
    updateUrl({ search: searchInput || undefined });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
    setPage(1);
    updateUrl({ search: undefined, customer_code: undefined });
  };

  const handleRiskChange = (tier: string) => {
    setRiskLevel(tier);
    setPage(1);
    updateUrl({ risk_level: tier === "all" ? undefined : tier });
  };

  const handleHeaderSort = (colKey: string) => {
    let nextDir: "asc" | "desc" = "desc";
    if (sortBy === colKey) {
      nextDir = sortDir === "desc" ? "asc" : "desc";
    } else {
      nextDir = colKey === "customer" || colKey === "code" || colKey === "txn_type" ? "asc" : "desc";
    }
    setSortBy(colKey);
    setSortDir(nextDir);
    setPage(1);
    updateUrl({ sort_by: colKey, sort_dir: nextDir });
  };

  const handlePresetSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let newCol = "occurred_at";
    let newDir: "asc" | "desc" = "desc";

    switch (val) {
      case "newest":
        newCol = "occurred_at";
        newDir = "desc";
        break;
      case "oldest":
        newCol = "occurred_at";
        newDir = "asc";
        break;
      case "risk_desc":
        newCol = "risk_score";
        newDir = "desc";
        break;
      case "risk_asc":
        newCol = "risk_score";
        newDir = "asc";
        break;
      case "amount_desc":
        newCol = "amount";
        newDir = "desc";
        break;
      case "amount_asc":
        newCol = "amount";
        newDir = "asc";
        break;
      case "code_asc":
        newCol = "code";
        newDir = "asc";
        break;
    }

    setSortBy(newCol);
    setSortDir(newDir);
    setPage(1);
    updateUrl({ sort_by: newCol, sort_dir: newDir });
  };

  const currentPreset = () => {
    if (sortBy === "occurred_at" && sortDir === "desc") return "newest";
    if (sortBy === "occurred_at" && sortDir === "asc") return "oldest";
    if ((sortBy === "risk_score" || sortBy === "risk") && sortDir === "desc") return "risk_desc";
    if ((sortBy === "risk_score" || sortBy === "risk") && sortDir === "asc") return "risk_asc";
    if (sortBy === "amount" && sortDir === "desc") return "amount_desc";
    if (sortBy === "amount" && sortDir === "asc") return "amount_asc";
    if (sortBy === "code" && sortDir === "asc") return "code_asc";
    return "custom";
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  if (initialSkeleton) {
    return <TransactionsTableSkeleton />;
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--foreground)]">
              {t("txnStreamTitle")}
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] font-bold">
              {formatNumber(total > 0 ? total.toLocaleString() : "212,749")} Events
            </span>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            {t("txnStreamSubtitle")}
          </p>
        </div>

        <Link
          href="/monitoring/transactions/TXN-982173"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/30 text-rose-300 shadow-sm transition-colors"
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>{lang === "bn" ? "নিয়ন্ত্রিত এটিও ডেমো (TXN-982173)" : "Controlled ATO Demo (TXN-982173)"}</span>
        </Link>
      </div>

      {/* Control Bar: Risk Filter, Search & Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 obsidian-card p-3.5 rounded-2xl border border-[var(--card-border)]">
        {/* Risk Level Tiers */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[var(--foreground-muted)] font-semibold uppercase text-[10px] tracking-wider mr-1">
            {lang === "bn" ? "ঝুঁকি স্তর:" : "Risk Tier:"}
          </span>
          {[
            { label: t("allTiers"), val: "all" },
            { label: t("criticalTier"), val: "critical" },
            { label: t("highTier"), val: "high" },
            { label: t("moderateTier"), val: "moderate" },
            { label: t("lowTier"), val: "low" },
          ].map((tier) => {
            const isActive = riskLevel === tier.val;
            return (
              <button
                key={tier.val}
                type="button"
                onClick={() => handleRiskChange(tier.val)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  isActive
                    ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-xs ring-1 ring-[var(--accent-primary)]/30"
                    : "obsidian-card text-[var(--foreground-muted)] hover:text-[var(--foreground)] border-[var(--card-border)] hover:border-[var(--card-border-hover)]"
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>

        {/* Right side controls: Sorting Dropdown, Rows Selector & Search Input */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Sorting Options Selector */}
          <div className="flex items-center gap-2 obsidian-card border border-[var(--card-border)] rounded-xl px-3.5 h-10 text-xs shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--foreground-muted)] shrink-0" />
            <span className="text-[var(--foreground-muted)] text-[11px] font-medium">
              {lang === "bn" ? "সাজান:" : "Sort:"}
            </span>
            <select
              value={currentPreset()}
              onChange={handlePresetSortChange}
              className="bg-transparent text-[var(--foreground)] font-semibold text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="newest" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "নতুন আগে (Newest)" : "Newest First"}</option>
              <option value="oldest" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "পুরানো আগে (Oldest)" : "Oldest First"}</option>
              <option value="risk_desc" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "সর্বোচ্চ ঝুঁকি (Risk High)" : "Highest Risk Score"}</option>
              <option value="risk_asc" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "সর্বনিম্ন ঝুঁকি (Risk Low)" : "Lowest Risk Score"}</option>
              <option value="amount_desc" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "সর্বোচ্চ পরিমাণ (৳ High)" : "Highest Amount (৳)"}</option>
              <option value="amount_asc" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "সর্বনিম্ন পরিমাণ (৳ Low)" : "Lowest Amount (৳)"}</option>
              <option value="code_asc" className="bg-[var(--background-secondary)] text-[var(--foreground)]">{lang === "bn" ? "কোড অনুসারে (Code A-Z)" : "Txn Code (A-Z)"}</option>
              {currentPreset() === "custom" && (
                <option value="custom" className="bg-[var(--background-secondary)] text-[var(--foreground)]">Custom ({sortBy} {sortDir})</option>
              )}
            </select>

            <button
              type="button"
              title={`Sort ${sortDir === "asc" ? "Ascending" : "Descending"}`}
              onClick={() => {
                const nextDir = sortDir === "asc" ? "desc" : "asc";
                setSortDir(nextDir);
                updateUrl({ sort_dir: nextDir });
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-[var(--accent-primary)] transition-colors ml-0.5 cursor-pointer"
            >
              {sortDir === "desc" ? (
                <ArrowDown className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              )}
            </button>
          </div>

          {/* Rows Per Page */}
          <div className="flex items-center gap-1.5 obsidian-card border border-[var(--card-border)] rounded-xl px-3 h-10 text-xs shadow-xs">
            <span className="text-[var(--foreground-muted)] text-[11px]">
              {lang === "bn" ? "সারি:" : "Rows:"}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-transparent text-[var(--foreground)] font-bold text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="20" className="bg-[var(--background-secondary)] text-[var(--foreground)]">20</option>
              <option value="50" className="bg-[var(--background-secondary)] text-[var(--foreground)]">50</option>
              <option value="100" className="bg-[var(--background-secondary)] text-[var(--foreground)]">100</option>
            </select>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3.5 text-[var(--foreground-muted)]" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-8 h-10 rounded-xl obsidian-card border border-[var(--card-border)] text-xs w-48 sm:w-56 md:w-60 focus:outline-hidden focus:border-[var(--accent-primary)] font-mono text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] shadow-xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-3 text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-[var(--accent-primary)] text-white font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              {t("searchBtn")}
            </button>
          </form>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {(activeSearch || riskLevel !== "all" || sortBy !== "occurred_at" || sortDir !== "desc") && (
        <div className="flex items-center gap-2 flex-wrap text-xs obsidian-card p-2.5 rounded-xl border border-[var(--card-border)]">
          <span className="font-semibold text-[var(--foreground)]">
            {lang === "bn" ? "সক্রিয় ফিল্টার ও বাছাই:" : "Active Filters & Sort:"}
          </span>
          {activeSearch && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-lg obsidian-card border border-[var(--card-border)] text-[var(--foreground)] font-bold">
              {lang === "bn" ? "অনুসন্ধান:" : "Search:"} &quot;{activeSearch}&quot;
              <button
                type="button"
                onClick={handleClearSearch}
                className="hover:text-red-400 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {riskLevel !== "all" && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg obsidian-card border border-[var(--card-border)] text-[var(--foreground)] font-bold uppercase">
              {lang === "bn" ? "স্তর:" : "Tier:"} {riskLevel}
              <button
                type="button"
                onClick={() => handleRiskChange("all")}
                className="hover:text-red-400 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(sortBy !== "occurred_at" || sortDir !== "desc") && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] font-bold">
              Sort: {sortBy} ({sortDir.toUpperCase()})
              <button
                type="button"
                onClick={() => {
                  setSortBy("occurred_at");
                  setSortDir("desc");
                  updateUrl({ sort_by: undefined, sort_dir: undefined });
                }}
                className="hover:text-red-400 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setActiveSearch("");
              setRiskLevel("all");
              setSortBy("occurred_at");
              setSortDir("desc");
              setPage(1);
              router.push("/monitoring/transactions");
            }}
            className="ml-auto text-[11px] font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
          >
            {t("resetFilters")}
          </button>
        </div>
      )}

      {/* Main Table with Interactive Sorting Headers */}
      <div className="obsidian-card rounded-2xl border border-[var(--card-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-hover)] text-[var(--foreground-muted)] uppercase font-semibold text-[10px] tracking-wider border-b border-[var(--card-border)] select-none">
              <tr>
                {/* Txn Code */}
                <th
                  onClick={() => handleHeaderSort("code")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--foreground)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "লেনদেন কোড" : "Txn Code"}</span>
                    {sortBy === "code" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-[var(--accent-primary)]" /> : <ArrowDown className="w-3 h-3 text-[var(--accent-primary)]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[var(--foreground-muted)]" />
                    )}
                  </div>
                </th>

                {/* Timestamp */}
                <th
                  onClick={() => handleHeaderSort("occurred_at")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--foreground)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "সময় (ইউটিসি)" : "Timestamp (UTC)"}</span>
                    {sortBy === "occurred_at" || sortBy === "time" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-[var(--accent-primary)]" /> : <ArrowDown className="w-3 h-3 text-[var(--accent-primary)]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[var(--foreground-muted)]" />
                    )}
                  </div>
                </th>

                {/* Customer */}
                <th
                  onClick={() => handleHeaderSort("customer")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--foreground)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "গ্রাহক" : "Customer"}</span>
                    {sortBy === "customer" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-[var(--accent-primary)]" /> : <ArrowDown className="w-3 h-3 text-[var(--accent-primary)]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[var(--foreground-muted)]" />
                    )}
                  </div>
                </th>

                {/* Type */}
                <th
                  onClick={() => handleHeaderSort("txn_type")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--foreground)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "ধরন" : "Type"}</span>
                    {sortBy === "txn_type" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-[var(--accent-primary)]" /> : <ArrowDown className="w-3 h-3 text-[var(--accent-primary)]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[var(--foreground-muted)]" />
                    )}
                  </div>
                </th>

                {/* Amount */}
                <th
                  onClick={() => handleHeaderSort("amount")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--foreground)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "পরিমাণ" : "Amount"}</span>
                    {sortBy === "amount" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-[var(--accent-primary)]" /> : <ArrowDown className="w-3 h-3 text-[var(--accent-primary)]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[var(--foreground-muted)]" />
                    )}
                  </div>
                </th>

                {/* Sender / Recipient */}
                <th className="py-3 px-4">{lang === "bn" ? "প্রেরক / প্রাপক" : "Sender / Recipient"}</th>

                {/* Primary Signal */}
                <th className="py-3 px-4">{lang === "bn" ? "প্রধান সংকেত" : "Primary Signal"}</th>

                {/* Risk Tier */}
                <th
                  onClick={() => handleHeaderSort("risk_score")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--foreground)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === "bn" ? "ঝুঁকি স্তর" : "Risk Tier & Score"}</span>
                    {sortBy === "risk_score" || sortBy === "risk" ? (
                      sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-[var(--accent-primary)]" /> : <ArrowDown className="w-3 h-3 text-[var(--accent-primary)]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[var(--foreground-muted)]" />
                    )}
                  </div>
                </th>

                {/* Action */}
                <th className="py-3 px-4 text-right">{lang === "bn" ? "পদক্ষেপ" : "Action"}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--card-border)]/50 font-mono-tabular">
              {loading ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-24 rounded-md masterclass-shimmer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-32 rounded-md masterclass-shimmer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="h-4 w-28 rounded-md masterclass-shimmer" />
                        <div className="h-2.5 w-16 rounded-sm masterclass-shimmer" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-20 rounded-md masterclass-shimmer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-20 rounded-md masterclass-shimmer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-24 rounded-md masterclass-shimmer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-24 rounded-md masterclass-shimmer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-6 w-24 rounded-xl masterclass-shimmer" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-7 w-16 rounded-lg ml-auto masterclass-shimmer" />
                    </td>
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr
                    key={tx.id || tx.code || tx.transaction_code}
                    className="hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-[var(--accent-primary)]">
                      <Link
                        href={`/monitoring/transactions/${tx.code || tx.transaction_code || tx.id}`}
                        className="hover:underline flex items-center gap-1.5"
                      >
                        <span>{tx.code || tx.transaction_code || tx.id}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 text-[var(--foreground-muted)] font-mono text-[11px]">
                      {formatDate(tx.occurred_at)}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-medium text-[var(--foreground)]">
                      <div>{tx.customer_name || "Customer"}</div>
                      <div className="text-[10px] text-[var(--foreground-muted)] font-mono">
                        {tx.customer_code}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-[var(--foreground-muted)] font-sans uppercase text-[11px]">
                      {(tx.txn_type || tx.payment_type || "")?.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[var(--foreground)] font-mono">
                      {formatBDT(tx.amount || tx.amount_bdt || 0)}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--foreground-muted)] font-mono text-[11px]">
                      {tx.wallet_code || tx.sender_wallet || "-"} → {tx.recipient_wallet_code || tx.recipient_wallet || "-"}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--foreground-muted)] font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded-md bg-[var(--surface-hover)] border border-[var(--card-border)]">
                        {tx.primary_signal || "baseline_normal"}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <RiskBadge level={tx.risk_level || "low"} score={tx.risk_score} />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link
                        href={`/monitoring/transactions/${tx.code || tx.transaction_code || tx.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg obsidian-card border border-[var(--card-border)] hover:border-[var(--card-border-hover)] text-[var(--foreground)] font-semibold text-[11px] transition-colors"
                      >
                        {t("inspect")}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[var(--foreground-muted)]">
                    <p className="font-semibold text-xs text-[var(--foreground)]">
                      {lang === "bn" ? "বর্তমান ফিল্টারের সাথে কোনো লেনদেন মেলেনি।" : "No transactions match current filters."}
                    </p>
                    <p className="text-[11px] text-[var(--foreground-muted)] mt-1">
                      Try resetting filters or sorting order.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-3.5 obsidian-card border-t border-[var(--card-border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--foreground-muted)] font-medium">
          <div>
            {lang === "bn" ? "প্রদর্শিত হচ্ছে" : "Showing"}{" "}
            <span className="font-bold text-[var(--foreground)] font-mono">
              {formatNumber(total > 0 ? (page - 1) * pageSize + 1 : 0)}
            </span>{" "}
            {lang === "bn" ? "থেকে" : "to"}{" "}
            <span className="font-bold text-[var(--foreground)] font-mono">
              {formatNumber(Math.min(page * pageSize, total))}
            </span>{" "}
            {lang === "bn" ? "মোট" : "of"}{" "}
            <span className="font-bold text-[var(--foreground)] font-mono">
              {formatNumber(total > 0 ? total.toLocaleString() : "212,749")}
            </span>{" "}
            {lang === "bn" ? "লেনদেন" : "transactions"}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
              }}
              className="px-2.5 py-1 rounded-lg obsidian-card border border-[var(--card-border)] text-xs disabled:opacity-30 disabled:pointer-events-none hover:border-[var(--card-border-hover)] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" />
              Prev
            </button>
            <span className="px-2 font-mono text-[11px] text-[var(--foreground)]">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              className="px-2.5 py-1 rounded-lg obsidian-card border border-[var(--card-border)] text-xs disabled:opacity-30 disabled:pointer-events-none hover:border-[var(--card-border-hover)] cursor-pointer"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsMonitoringPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Surveillance Stream...</div>}>
      <TransactionsMonitoringContent />
    </Suspense>
  );
}
