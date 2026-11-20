"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  FileCheck2,
  Filter,
  RefreshCw,
  Search,
  Shield,
  User,
} from "lucide-react";
import { getAuditLogs } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = () => {
    setLoading(true);
    getAuditLogs({
      page,
      limit: 25,
      action: actionFilter || undefined,
    })
      .then((data) => {
        setLogs(data.items || []);
        setTotal(data.total || 0);
      })
      .catch((err) => console.error("Error loading audit logs", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, actionFilter]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-600" />
            <span>Immutable Audit Trail & Regulatory Compliance</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              {total} Records
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident log of all SOC analyst dispositions, automated escalations, and executive PDF report exports
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>SHA-256 Tamper Protection Active</span>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
            Filter by Action:
          </span>
          {[
            { label: "All Events", val: "" },
            { label: "Export Report", val: "export_investigation_report" },
            { label: "Create Case", val: "create_case" },
            { label: "Add Note", val: "add_case_note" },
            { label: "Update Status", val: "update_case_status" },
          ].map((act) => (
            <button
              key={act.val}
              type="button"
              onClick={() => {
                setActionFilter(act.val);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all border ${
                actionFilter === act.val
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource Type</th>
                <th className="py-3 px-4">Resource ID</th>
                <th className="py-3 px-4">Audit Metadata</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-tabular">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-300" />
                    Querying immutable audit database...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                      {formatDate(log.occurred_at)}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                      {log.actor_email}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans uppercase text-[10px] font-bold text-slate-500">
                      {log.resource_type}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">
                      {log.resource_id}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-500">
                      {log.ip_address || "127.0.0.1"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No audit records found matching criteria.
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
