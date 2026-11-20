"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Database,
  Table,
  HardDrive,
  Layers,
  Search,
  RefreshCw,
  Play,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Server,
  Key,
  Shield,
  Clock,
  Terminal,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { getDatabaseOverview, getTableData, runDatabaseQuery } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useSkeletonDelay, UniversalDataSkeleton } from "@/components/ui/DataSkeletonLoader";

interface TableMeta {
  name: string;
  row_count: number;
  size_bytes: number;
  size_pretty: string;
  column_count: number;
}

interface ColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
}

export default function DatabaseExplorerPage() {
  const { t, formatNumber, lang } = useLanguage();

  const [overview, setOverview] = useState<any>(null);
  const [tables, setTables] = useState<TableMeta[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("transactions");
  const [searchTable, setSearchTable] = useState<string>("");
  const [loadingOverview, setLoadingOverview] = useState<boolean>(true);

  // Table Data State
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // SQL Query Runner State
  const [activeTab, setActiveTab] = useState<"data" | "sql" | "connection">("data");
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT code, amount, txn_type, created_at FROM transactions ORDER BY created_at DESC LIMIT 20;"
  );
  const [queryColumns, setQueryColumns] = useState<string[]>([]);
  const [queryRows, setQueryRows] = useState<any[]>([]);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number | null>(null);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string>("");

  const [copied, setCopied] = useState<string>("");

  // Load Database Overview
  const loadOverview = () => {
    setLoadingOverview(true);
    getDatabaseOverview()
      .then((data) => {
        setOverview(data);
        setTables(data.tables || []);
        if (data.tables && data.tables.length > 0 && !selectedTable) {
          setSelectedTable(data.tables[0].name);
        }
      })
      .catch((err) => console.error("Failed to load DB overview", err))
      .finally(() => setLoadingOverview(false));
  };

  // Load specific table data
  const loadTableData = (tableName: string, p: number) => {
    setLoadingData(true);
    getTableData(tableName, p, pageSize)
      .then((res) => {
        setColumns(res.columns || []);
        setRows(res.rows || []);
        setTotalRows(res.total || 0);
        setTotalPages(res.total_pages || 1);
        setPage(res.page || 1);
      })
      .catch((err) => console.error("Failed to load table data", err))
      .finally(() => setLoadingData(false));
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      setPage(1);
      loadTableData(selectedTable, 1);
    }
  }, [selectedTable]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      loadTableData(selectedTable, newPage);
    }
  };

  const handleExecuteQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    setQueryError("");
    setQueryLoading(true);
    try {
      const res = await runDatabaseQuery(q);
      setQueryColumns(res.columns || []);
      setQueryRows(res.rows || []);
      setQueryExecutionTime(res.execution_time_ms || 0);
    } catch (err: any) {
      setQueryError(err.message || "Query execution failed.");
      setQueryColumns([]);
      setQueryRows([]);
    } finally {
      setQueryLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(searchTable.toLowerCase())
  );

  const skeletonLoading = useSkeletonDelay(1000, selectedTable);

  if (skeletonLoading) {
    return <UniversalDataSkeleton title="Connecting to PostgreSQL Database Pool (212,749 rows)..." rows={8} />;
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Header & Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-2xs">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{lang === "bn" ? "ডেটাবেস এক্সপ্লোরার ও স্কিমা ভিউ" : "Database Explorer & Schema Browser"}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                PostgreSQL 16
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === "bn"
                ? "সেন্টিনেলফ্লো এর কেন্দ্রীয় ট্রানজ্যাকশন, ওয়ালেট, ব্যবহারকারী ও ঝুঁকি স্কোরের লাইভ ডেটাবেস ভিউ।"
                : "Real-time schema and data inspector for SentinelFlow transactions, wallets, devices, and risk scores."}
            </p>
          </div>
        </div>

        {/* Action Button: Launch Adminer */}
        <div className="flex items-center gap-2">
          <a
            href="http://localhost:8090"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "অ্যাডমিনার ওয়েব জিইউআই খুলুন" : "Launch Adminer Web GUI"}</span>
          </a>
          <button
            type="button"
            onClick={() => {
              loadOverview();
              loadTableData(selectedTable, page);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors"
            title="Refresh database metadata"
          >
            <RefreshCw className={`w-4 h-4 ${loadingOverview || loadingData ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {lang === "bn" ? "মোট টেবিল" : "Total Tables"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatNumber(overview?.total_tables || 28)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Public Schema</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {lang === "bn" ? "মোট ডেটা রেকর্ড" : "Total Database Records"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatNumber(overview?.total_rows || "542,535")}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            <span>212k+ Financial Txns</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {lang === "bn" ? "ডিস্কের আকার" : "Total Disk Size"}
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">
            {overview?.total_size_mb ? `${overview.total_size_mb} MB` : "217.6 MB"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            <span>Volume: sentinelflow_pgdata</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {lang === "bn" ? "কানেকশন পোর্ট" : "Connection Port"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            5433
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            <span>localhost:5433 (Postgres)</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Sidebar for Tables, Right Panel for View/Query */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Panel: Table List */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col h-[700px]">
          <div className="p-3 border-b border-slate-200 bg-slate-50 rounded-t-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-indigo-600" />
                <span>{lang === "bn" ? "টেবিলসমূহ" : "Database Tables"}</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                {formatNumber(filteredTables.length)}
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                placeholder={lang === "bn" ? "টেবিল খুঁজুন..." : "Filter tables..."}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
            {filteredTables.map((t) => {
              const isSelected = selectedTable === t.name;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setSelectedTable(t.name);
                    setActiveTab("data");
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-indigo-50/90 text-indigo-900 font-bold border-l-3 border-l-indigo-600"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-xs block truncate">{t.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {t.size_pretty} • {t.column_count} cols
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      isSelected
                        ? "bg-indigo-200/80 text-indigo-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {formatNumber(t.row_count)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Data Browser / SQL Console / Connection Info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("data")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "data"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "টেবিল ভিউয়ার" : "Table Data Browser"}</span>
                {selectedTable && (
                  <span className="font-mono font-normal opacity-90 text-[11px]">
                    ({selectedTable})
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sql")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "sql"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "এসকিউএল কোয়েরি কনসোল" : "SQL Query Console"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("connection")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "connection"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200"
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "কানেকশন ও তথ্য" : "Connection Details"}</span>
              </button>
            </div>

            {activeTab === "data" && (
              <div className="text-xs text-slate-500 font-mono">
                {lang === "bn" ? "মোট রেকর্ড: " : "Total: "}
                <span className="font-bold text-slate-800">{formatNumber(totalRows)}</span>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* TAB 1: TABLE DATA BROWSER                                         */}
          {/* ================================================================= */}
          {activeTab === "data" && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[630px]">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.name}
                          className="py-2.5 px-3 font-mono font-bold text-slate-700 uppercase text-[10px] tracking-wider whitespace-nowrap border-r border-slate-200/60 last:border-r-0"
                        >
                          <div>{col.name}</div>
                          <div className="text-[9px] text-slate-400 font-normal lowercase">
                            {col.type}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {loadingData ? (
                      <tr>
                        <td colSpan={columns.length || 1} className="py-16 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                          <span className="font-sans text-xs">
                            {lang === "bn" ? "ডেটা লোড হচ্ছে..." : "Loading table rows..."}
                          </span>
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length || 1} className="py-16 text-center text-slate-400 font-sans">
                          {lang === "bn" ? "এই টেবিলে কোন রেকর্ড নেই।" : "No records found in this table."}
                        </td>
                      </tr>
                    ) : (
                      rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          {columns.map((col) => {
                            const val = row[col.name];
                            return (
                              <td
                                key={col.name}
                                className="py-2 px-3 text-[11px] text-slate-700 whitespace-nowrap max-w-xs truncate border-r border-slate-100 last:border-r-0"
                                title={String(val)}
                              >
                                {val === null || val === undefined ? (
                                  <span className="text-slate-300 italic">null</span>
                                ) : typeof val === "boolean" ? (
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                      val ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {String(val)}
                                  </span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 font-medium">
                  {lang === "bn" ? "পৃষ্ঠা" : "Page"}{" "}
                  <span className="font-bold text-slate-800">{formatNumber(page)}</span>{" "}
                  {lang === "bn" ? "এর মধ্যে" : "of"}{" "}
                  <span className="font-bold text-slate-800">{formatNumber(totalPages)}</span> (
                  {formatNumber(totalRows)} {lang === "bn" ? "রেকর্ড" : "rows"})
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || loadingData}
                    onClick={() => handlePageChange(page - 1)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{lang === "bn" ? "পূর্ববর্তী" : "Previous"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages || loadingData}
                    onClick={() => handlePageChange(page + 1)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs"
                  >
                    <span>{lang === "bn" ? "পরবর্তী" : "Next"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: SQL QUERY CONSOLE                                          */}
          {/* ================================================================= */}
          {activeTab === "sql" && (
            <div className="space-y-4">
              {/* Presets and Editor */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase">
                    <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Quick SQL Presets:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      {
                        label: "All Users (5)",
                        query: "SELECT id, full_name, email, role, is_active FROM users;",
                      },
                      {
                        label: "Recent Txns (20)",
                        query:
                          "SELECT code, amount, txn_type, created_at FROM transactions ORDER BY created_at DESC LIMIT 20;",
                      },
                      {
                        label: "Top Risk Txns",
                        query:
                          "SELECT t.code, rs.overall_risk, rs.risk_level, t.amount FROM transactions t JOIN risk_scores rs ON t.id = rs.transaction_id ORDER BY rs.overall_risk DESC LIMIT 15;",
                      },
                      {
                        label: "Customer Personas",
                        query:
                          "SELECT persona, count(*) as count, round(avg(risk_score)::numeric, 1) as avg_risk FROM customers GROUP BY persona ORDER BY count DESC;",
                      },
                    ].map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSqlQuery(p.query);
                          handleExecuteQuery(p.query);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-lg border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    placeholder="SELECT * FROM users LIMIT 10;"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-indigo-500" />
                    <span>Read-only queries enforced (SELECT / EXPLAIN). Maximum 200 rows.</span>
                  </div>

                  <button
                    type="button"
                    disabled={queryLoading}
                    onClick={() => handleExecuteQuery()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {queryLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white" />
                    )}
                    <span>{lang === "bn" ? "কোয়েরি চালান" : "Run Query"}</span>
                  </button>
                </div>
              </div>

              {/* Query Error */}
              {queryError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{queryError}</span>
                </div>
              )}

              {/* Query Results */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Query Results ({queryRows.length} rows)
                  </span>
                  {queryExecutionTime !== null && (
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{queryExecutionTime} ms</span>
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200">
                      <tr>
                        {queryColumns.map((col) => (
                          <th key={col} className="py-2 px-3 font-bold text-slate-700 text-[10px] uppercase">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queryRows.length === 0 ? (
                        <tr>
                          <td colSpan={queryColumns.length || 1} className="py-8 text-center text-slate-400 font-sans text-xs">
                            No query results to display. Click &ldquo;Run Query&rdquo; or select a preset above.
                          </td>
                        </tr>
                      ) : (
                        queryRows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            {queryColumns.map((col) => (
                              <td key={col} className="py-1.5 px-3 text-[11px] text-slate-700 whitespace-nowrap">
                                {String(row[col] ?? "null")}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: CONNECTION CREDENTIALS & PSQL INFO                          */}
          {/* ================================================================= */}
          {activeTab === "connection" && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  PostgreSQL Direct Connection Credentials
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect using any external database IDE (DBeaver, TablePlus, DataGrip, pgAdmin) or CLI.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  { label: "Host", val: "localhost (127.0.0.1)" },
                  { label: "Port", val: "5433 (mapped from container 5432)" },
                  { label: "Database Name", val: "sentinelflow" },
                  { label: "Username", val: "sentinelflow" },
                  { label: "Password", val: "sentinelflow_dev" },
                  { label: "Container Name", val: "sentinelflow-pg" },
                  { label: "Volume Mount", val: "/var/lib/docker/volumes/sentinelflow_pgdata/_data" },
                  { label: "Adminer Web URL", val: "http://localhost:8090" },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.label}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-1 block">
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Copyable CLI Commands */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Quick Terminal Commands:
                </span>

                <div className="space-y-2">
                  {[
                    {
                      title: "Open psql CLI via Docker",
                      cmd: "docker exec -it sentinelflow-pg psql -U sentinelflow -d sentinelflow",
                      id: "docker-cli",
                    },
                    {
                      title: "Direct psql connection string",
                      cmd: "psql -h localhost -p 5433 -U sentinelflow -d sentinelflow",
                      id: "psql-str",
                    },
                    {
                      title: "Database URI for Python / SQLAlchemy",
                      cmd: "postgresql+psycopg://sentinelflow:sentinelflow_dev@localhost:5433/sentinelflow",
                      id: "py-uri",
                    },
                  ].map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="truncate">
                        <span className="text-slate-500 text-[10px] block font-sans font-semibold">
                          {c.title}:
                        </span>
                        <span className="text-emerald-400 truncate block mt-0.5">{c.cmd}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(c.cmd, c.id)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                        title="Copy command"
                      >
                        {copied === c.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
