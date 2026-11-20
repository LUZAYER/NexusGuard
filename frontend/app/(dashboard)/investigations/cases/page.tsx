"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
} from "lucide-react";
import { getCases } from "@/lib/api";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { formatDate } from "@/lib/utils";
import { useSkeletonDelay, UniversalDataSkeleton } from "@/components/ui/DataSkeletonLoader";

export default function CasesListPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = () => {
    setLoading(true);
    getCases({
      page,
      limit: 20,
      status: statusFilter === "all" ? undefined : statusFilter,
      priority: priorityFilter === "all" ? undefined : priorityFilter,
    })
      .then((data) => {
        setCases(data.items || []);
        setTotal(data.total || 0);
      })
      .catch((err) => console.error("Error loading cases", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter, priorityFilter]);

  const skeletonLoading = useSkeletonDelay(1000, `${page}-${statusFilter}-${priorityFilter}`);

  if (skeletonLoading) {
    return <UniversalDataSkeleton title="Retrieving Autonomous Case Files..." rows={6} />;
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--card-border)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[var(--accent-primary)]" />
            <span>SOC Incident Case Management</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--card-border)] text-[var(--foreground)]">
              {total} Cases
            </span>
          </h1>
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            Human-in-the-loop escalation workflows, evidence documentation &amp; resolution tracking
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold obsidian-card border border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--card-border-hover)] shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="obsidian-card rounded-2xl border border-[var(--card-border)] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[var(--foreground-muted)] font-semibold uppercase text-[10px] tracking-wider mr-1">
            Status:
          </span>
          {["all", "open", "in_progress", "resolved"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all border cursor-pointer ${
                statusFilter === s
                  ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-xs"
                  : "obsidian-card text-[var(--foreground-muted)] border-[var(--card-border)] hover:border-[var(--card-border-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--foreground-muted)] font-semibold uppercase text-[10px] tracking-wider mr-1">
            Priority:
          </span>
          {["all", "critical", "high", "medium", "low"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPriorityFilter(p);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all border cursor-pointer ${
                priorityFilter === p
                  ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-xs"
                  : "obsidian-card text-[var(--foreground-muted)] border-[var(--card-border)] hover:border-[var(--card-border-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <div className="obsidian-card rounded-2xl border border-[var(--card-border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-hover)] text-[var(--foreground-muted)] uppercase font-semibold text-[10px] tracking-wider border-b border-[var(--card-border)]">
              <tr>
                <th className="py-3 px-4">Case Code</th>
                <th className="py-3 px-4">Incident Title</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Customer &amp; Wallet</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Analyst</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]/50 font-mono-tabular">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[var(--foreground-muted)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[var(--accent-primary)]" />
                    Querying case repository...
                  </td>
                </tr>
              ) : cases.length > 0 ? (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-[var(--accent-primary)]">
                      <Link href={`/investigations/cases/${c.code}`} className="hover:underline">
                        {c.code}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-[var(--foreground)] max-w-sm">
                      <div className="truncate">{c.title}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <RiskBadge level={c.priority} />
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      <div className="font-medium text-[var(--foreground)]">
                        {c.customer_name || c.customer_code}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--foreground-muted)]">
                        {c.wallet_code}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[var(--foreground)]">
                      {c.risk_score?.toFixed(1) || "N/A"}
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      <span className="font-mono text-[11px] uppercase font-bold px-2 py-0.5 rounded-md bg-[var(--surface-hover)] border border-[var(--card-border)] text-[var(--foreground)]">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[var(--foreground-muted)] font-sans">
                      {c.assigned_to || "Unassigned"}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--foreground-muted)] font-mono text-[11px]">
                      {formatDate(c.created_at).split(" ")[0]}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link
                        href={`/investigations/cases/${c.code}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg obsidian-card border border-[var(--card-border)] hover:border-[var(--card-border-hover)] text-[var(--foreground)] font-semibold text-[11px] transition-colors"
                      >
                        Open Case
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[var(--foreground-muted)]">
                    No active cases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
