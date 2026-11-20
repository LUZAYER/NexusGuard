"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  Search,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wallet,
  Phone,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  UserCheck,
  ShieldAlert,
  KeyRound,
  FileCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { getCustomers, getSystemUsers, createSystemUser } from "@/lib/api";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate, getRiskLevel } from "@/lib/utils";

interface CustomerItem {
  id: string;
  code: string;
  display_name: string;
  persona: string;
  kyc_level: string;
  home_location: string;
  risk_score: number;
  risk_level?: string;
  wallet_code?: string;
  wallet_type?: string;
  wallet_status?: string;
  opened_at?: string;
  recent_alerts_count?: number;
}

interface SystemUserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  permissions: string[];
}

export default function RegisteredUsersPage() {
  const { t, formatNumber, lang } = useLanguage();

  // Active Tab: "mfs" (20,000 customers) or "soc" (platform analysts)
  const [activeTab, setActiveTab] = useState<"mfs" | "soc">("mfs");

  // MFS Customers State
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [custLoading, setCustLoading] = useState<boolean>(true);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("all");
  const [selectedKyc, setSelectedKyc] = useState<string>("all");

  // Selected Customer Modal / Drawer
  const [inspectCustomer, setInspectCustomer] = useState<CustomerItem | null>(null);

  // MFS Sorting State
  const [custSortBy, setCustSortBy] = useState<string>("opened_at");
  const [custSortDir, setCustSortDir] = useState<"asc" | "desc">("desc");

  // Platform SOC Users State
  const [socUsers, setSocUsers] = useState<SystemUserItem[]>([]);
  const [socLoading, setSocLoading] = useState<boolean>(true);
  const [socSortBy, setSocSortBy] = useState<string>("full_name");
  const [socSortDir, setSocSortDir] = useState<"asc" | "desc">("asc");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("fraud_analyst_l1");
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string>("");
  const [createSuccess, setCreateSuccess] = useState<string>("");

  // Fetch MFS Customers
  const loadCustomers = () => {
    setCustLoading(true);
    getCustomers({
      page,
      page_size: pageSize,
      search: appliedSearch || undefined,
      persona: selectedPersona !== "all" ? selectedPersona : undefined,
      kyc_level: selectedKyc !== "all" ? selectedKyc : undefined,
      sort_by: custSortBy,
      sort_dir: custSortDir,
    })
      .then((res) => {
        setCustomers(res.items || []);
        setTotalCustomers(res.total || 0);
        setTotalPages(res.total_pages || 1);
      })
      .catch((err) => {
        console.error("Failed to fetch customers:", err);
      })
      .finally(() => {
        setCustLoading(false);
      });
  };

  // Fetch Platform SOC Users
  const loadSocUsers = () => {
    setSocLoading(true);
    getSystemUsers({
      sort_by: socSortBy,
      sort_dir: socSortDir,
    })
      .then((users) => {
        setSocUsers(users || []);
      })
      .catch((err) => {
        console.error("Failed to fetch SOC users:", err);
      })
      .finally(() => {
        setSocLoading(false);
      });
  };

  useEffect(() => {
    loadCustomers();
  }, [page, appliedSearch, selectedPersona, selectedKyc, custSortBy, custSortDir]);

  useEffect(() => {
    loadSocUsers();
  }, [socSortBy, socSortDir]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchQuery);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setAppliedSearch("");
    setSelectedPersona("all");
    setSelectedKyc("all");
    setPage(1);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setCreateError(lang === "bn" ? "সকল ঘর পূরণ করা আবশ্যক।" : "All fields are required.");
      return;
    }
    setCreateSubmitting(true);
    try {
      await createSystemUser({
        full_name: newFullName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
      });
      setCreateSuccess(t("userCreatedSuccess"));
      setNewFullName("");
      setNewEmail("");
      setNewPassword("");
      loadSocUsers();
      setTimeout(() => {
        setShowAddModal(false);
        setCreateSuccess("");
      }, 1500);
    } catch (err: any) {
      setCreateError(err.message || "Failed to register user");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Helper for persona styling
  const getPersonaBadge = (persona: string) => {
    switch (persona) {
      case "mule_suspicious":
        return {
          label: lang === "bn" ? "মিউল সন্দেহভাজন" : "Mule Suspicious",
          className: "bg-red-50 text-red-700 border-red-200",
        };
      case "merchant":
        return {
          label: lang === "bn" ? "মার্চেন্ট / এজেন্ট" : "Merchant / Agent",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "low_frequency":
        return {
          label: lang === "bn" ? "অনিয়মিত গ্রাহক" : "Low Frequency",
          className: "bg-slate-50 text-slate-700 border-slate-200",
        };
      case "employee":
      case "salaried_worker":
        return {
          label: lang === "bn" ? "বেতনভুক্ত কর্মী" : "Salaried Worker",
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "student":
        return {
          label: lang === "bn" ? "শিক্ষার্থী" : "Student",
          className: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "rural_remittance":
        return {
          label: lang === "bn" ? "গ্রামীণ রেমিট্যান্স" : "Rural Remittance",
          className: "bg-teal-50 text-teal-700 border-teal-200",
        };
      case "night_owl":
        return {
          label: lang === "bn" ? "রাত্রিকালীন" : "Night Owl",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "dormant":
        return {
          label: lang === "bn" ? "নিষ্ক্রিয় ওয়ালেট" : "Dormant",
          className: "bg-slate-100 text-slate-600 border-slate-200",
        };
      default:
        return {
          label: persona,
          className: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "lead_investigator":
      case "admin":
        return {
          label: lang === "bn" ? "প্রধান তদন্তকারী (L3)" : "Lead Investigator (L3)",
          className: "bg-purple-100 text-purple-800 border-purple-300 font-bold",
        };
      case "fraud_analyst_l2":
        return {
          label: lang === "bn" ? "সিনিয়র বিশ্লেষক (L2)" : "Senior Fraud Analyst (L2)",
          className: "bg-indigo-100 text-indigo-800 border-indigo-300 font-medium",
        };
      case "compliance_officer":
        return {
          label: lang === "bn" ? "কমপ্লায়েন্স অফিসার" : "Compliance Officer",
          className: "bg-emerald-100 text-emerald-800 border-emerald-300 font-medium",
        };
      default:
        return {
          label: lang === "bn" ? "বিশ্লেষক (L1)" : "Fraud Analyst (L1)",
          className: "bg-blue-100 text-blue-800 border-blue-300 font-medium",
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{t("usersTitle")}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {formatNumber(20004)} {lang === "bn" ? "নিবন্ধিত রেকর্ড" : "Total Registered"}
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">{t("usersSubtitle")}</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("mfs")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "mfs"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{t("mfsCustomersTab")}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-mono">
              {formatNumber("20,000")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("soc")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "soc"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t("socTeamTab")}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-800 font-mono">
              {formatNumber(socUsers.length || 4)}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t("totalCustomers")}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatNumber("20,000")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">100%</span>
            <span>{lang === "bn" ? "৮টি বিভাগে সক্রিয়" : "Active in 8 divisions"}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t("monitoredWallets")}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatNumber("20,000")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>bKash, Nagad, Upay & Rocket</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t("kycVerifiedRate")}
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">
            {formatNumber("94.2%")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>EC NID & Biometrics Synced</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t("activeAnalysts")}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatNumber(socUsers.length || 4)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>SOC Workstation Access 24/7</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MFS REGISTERED CUSTOMERS (20,000 Directory)                         */}
      {/* ========================================================================= */}
      {activeTab === "mfs" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchCustomerPlaceholder")}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Persona Filter */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedPersona}
                  onChange={(e) => {
                    setSelectedPersona(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">{t("allPersonas")}</option>
                  <option value="salaried_worker">{t("salariedWorker")}</option>
                  <option value="employee">{lang === "bn" ? "চাকরিজীবী" : "Corporate Employee"}</option>
                  <option value="low_frequency">{lang === "bn" ? "অনিয়মিত গ্রাহক" : "Low Frequency"}</option>
                  <option value="student">{t("student")}</option>
                  <option value="merchant">{t("merchant")}</option>
                  <option value="rural_remittance">{t("ruralRemittance")}</option>
                  <option value="dormant">{t("dormant")}</option>
                  <option value="night_owl">{t("nightOwl")}</option>
                  <option value="mule_suspicious">{t("muleSuspicious")}</option>
                </select>
              </div>

              {/* KYC Filter */}
              <select
                value={selectedKyc}
                onChange={(e) => {
                  setSelectedKyc(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">{t("allKyc")}</option>
                <option value="basic">{t("kycLevel1")}</option>
                <option value="standard">{t("kycLevel2")}</option>
                <option value="full">{t("kycLevel3")}</option>
              </select>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 shadow-2xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 text-[11px] font-medium">
                  {lang === "bn" ? "সাজান:" : "Sort:"}
                </span>
                <select
                  value={custSortBy}
                  onChange={(e) => {
                    setCustSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-slate-800 font-semibold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="opened_at">{lang === "bn" ? "নিবন্ধন তারিখ (Registration)" : "Registration Date"}</option>
                  <option value="risk_score">{lang === "bn" ? "ঝুঁকি স্কোর (Risk Score)" : "Risk Score"}</option>
                  <option value="display_name">{lang === "bn" ? "গ্রাহকের নাম (Name A-Z)" : "Customer Name"}</option>
                  <option value="code">{lang === "bn" ? "গ্রাহক কোড (Code)" : "Customer Code"}</option>
                  <option value="kyc_level">{lang === "bn" ? "কেওয়াইসি স্তর (KYC Level)" : "KYC Level"}</option>
                  <option value="alert_count">{lang === "bn" ? "অ্যালার্ট সংখ্যা (Alert Count)" : "Alert Count"}</option>
                </select>

                <button
                  type="button"
                  title={`Sort ${custSortDir === "asc" ? "Ascending" : "Descending"}`}
                  onClick={() => setCustSortDir(custSortDir === "asc" ? "desc" : "asc")}
                  className="p-0.5 rounded hover:bg-slate-100 text-slate-600 transition-colors ml-1"
                >
                  {custSortDir === "desc" ? (
                    <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t("searchBtn")}</span>
              </button>

              {(appliedSearch || selectedPersona !== "all" || selectedKyc !== "all" || custSortBy !== "opened_at" || custSortDir !== "desc") && (
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setCustSortBy("opened_at");
                    setCustSortDir("desc");
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-md transition-colors"
                >
                  {t("resetFilters")}
                </button>
              )}
            </form>

            {/* Sub-bar showing active count */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>
                {lang === "bn" ? "প্রদর্শিত হচ্ছে: " : "Showing: "}
                <span className="font-bold text-slate-800 font-mono">
                  {formatNumber(totalCustomers)}
                </span>{" "}
                {lang === "bn" ? "গ্রাহক রেকর্ড" : "customer records"}
                {appliedSearch && (
                  <span className="ml-2 text-indigo-600 font-medium">
                    (Filtered by &ldquo;{appliedSearch}&rdquo;)
                  </span>
                )}
                <span className="ml-2 text-slate-400 font-mono text-[11px]">
                  • Sorted by: {custSortBy} ({custSortDir.toUpperCase()})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadCustomers}
                  className="hover:text-indigo-600 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${custLoading ? "animate-spin" : ""}`} />
                  <span>{t("refreshFeeds")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Customers Data Table with Sortable Column Headers */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    {/* Customer Code */}
                    <th
                      onClick={() => {
                        if (custSortBy === "code") {
                          setCustSortDir(custSortDir === "asc" ? "desc" : "asc");
                        } else {
                          setCustSortBy("code");
                          setCustSortDir("asc");
                        }
                        setPage(1);
                      }}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{t("customerCode")}</span>
                        {custSortBy === "code" ? (
                          custSortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* Customer Name */}
                    <th
                      onClick={() => {
                        if (custSortBy === "display_name") {
                          setCustSortDir(custSortDir === "asc" ? "desc" : "asc");
                        } else {
                          setCustSortBy("display_name");
                          setCustSortDir("asc");
                        }
                        setPage(1);
                      }}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{t("customerName")}</span>
                        {custSortBy === "display_name" ? (
                          custSortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th className="py-3 px-4">{t("walletInfo")}</th>

                    {/* KYC Status */}
                    <th
                      onClick={() => {
                        if (custSortBy === "kyc_level") {
                          setCustSortDir(custSortDir === "asc" ? "desc" : "asc");
                        } else {
                          setCustSortBy("kyc_level");
                          setCustSortDir("desc");
                        }
                        setPage(1);
                      }}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{t("kycStatus")}</span>
                        {custSortBy === "kyc_level" ? (
                          custSortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th className="py-3 px-4">{t("location")}</th>

                    {/* Risk Score */}
                    <th
                      onClick={() => {
                        if (custSortBy === "risk_score") {
                          setCustSortDir(custSortDir === "asc" ? "desc" : "asc");
                        } else {
                          setCustSortBy("risk_score");
                          setCustSortDir("desc");
                        }
                        setPage(1);
                      }}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{t("riskScore")}</span>
                        {custSortBy === "risk_score" ? (
                          custSortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th className="py-3 px-4 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {custLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                          <span className="text-xs font-medium">
                            {lang === "bn" ? "গ্রাহক তথ্য লোড হচ্ছে..." : "Loading customer directory..."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                        <span>
                          {lang === "bn"
                            ? "কোন নিবন্ধিত গ্রাহক পাওয়া যায়নি।"
                            : "No registered customers found matching your filters."}
                        </span>
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => {
                      const personaBadge = getPersonaBadge(c.persona);
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50/80 transition-colors group cursor-default"
                        >
                          {/* Customer Code */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[11px]">
                              {c.code}
                            </span>
                          </td>

                          {/* Customer Name & Persona */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{c.display_name}</div>
                            <div className="mt-1">
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded border ${personaBadge.className}`}
                              >
                                {personaBadge.label}
                              </span>
                            </div>
                          </td>

                          {/* Wallet & Type */}
                          <td className="py-3 px-4 font-mono text-slate-700">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <Wallet className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{c.wallet_code || "N/A"}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 capitalize">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                              <span>{c.wallet_type || "Customer"} • {c.wallet_status || "Active"}</span>
                            </div>
                          </td>

                          {/* KYC Status */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span className="capitalize">{c.kyc_level.replace("_", " ")}</span>
                            </span>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4 text-slate-700">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-medium text-slate-800">{c.home_location}</span>
                            </div>
                          </td>

                          {/* Risk Score */}
                          <td className="py-3 px-4">
                            <RiskBadge level={getRiskLevel(c.risk_score)} score={c.risk_score} />
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/monitoring/transactions?search=${c.wallet_code || c.code}`}
                                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
                                title="Surveillance Stream"
                              >
                                <span>{t("viewTxns")}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setInspectCustomer(c)}
                                className="px-2 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded text-[11px] font-bold transition-colors"
                              >
                                {lang === "bn" ? "প্রোফাইল" : "Profile"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs">
              <div className="text-slate-500 font-medium">
                {t("pageOf")} <span className="font-bold text-slate-800">{formatNumber(page)}</span>{" "}
                {t("ofPages")}{" "}
                <span className="font-bold text-slate-800">{formatNumber(totalPages)}</span> (
                {formatNumber(totalCustomers)} {lang === "bn" ? "গ্রাহক" : "customers"})
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || custLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{t("prevPage")}</span>
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || custLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs"
                >
                  <span>{t("nextPage")}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PLATFORM SOC TEAM & ANALYSTS                                        */}
      {/* ========================================================================= */}
      {activeTab === "soc" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {lang === "bn"
                  ? "এসওসি প্ল্যাটফর্ম বিশ্লেষক ও প্রশাসন দল"
                  : "SOC Platform Analysts & Security Administrators"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === "bn"
                  ? "ভূমিকাভিত্তিক নিরাপত্তা (RBAC) এবং অডিট লগ নিরীক্ষণ সক্ষম ৪টি স্তর।"
                  : "Role-Based Access Control (RBAC) and audit-monitored credentials for security operations."}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* SOC Sort Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 shadow-2xs text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 text-[11px] font-medium">
                  {lang === "bn" ? "সাজান:" : "Sort:"}
                </span>
                <select
                  value={socSortBy}
                  onChange={(e) => setSocSortBy(e.target.value)}
                  className="bg-transparent text-slate-800 font-semibold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="full_name">{lang === "bn" ? "নাম (A-Z)" : "Full Name (A-Z)"}</option>
                  <option value="email">{lang === "bn" ? "ইমেইল (Email)" : "Email"}</option>
                  <option value="created_at">{lang === "bn" ? "নিবন্ধন তারিখ" : "Member Since"}</option>
                  <option value="is_active">{lang === "bn" ? "স্ট্যাটাস" : "Active Status"}</option>
                </select>

                <button
                  type="button"
                  title={`Sort ${socSortDir === "asc" ? "Ascending" : "Descending"}`}
                  onClick={() => setSocSortDir(socSortDir === "asc" ? "desc" : "asc")}
                  className="p-0.5 rounded hover:bg-slate-200 text-slate-600 transition-colors ml-1"
                >
                  {socSortDir === "desc" ? (
                    <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("addAnalystBtn")}</span>
              </button>
            </div>
          </div>

          {/* SOC Users Table with Clickable Sort Headers */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th
                    onClick={() => {
                      if (socSortBy === "full_name") {
                        setSocSortDir(socSortDir === "asc" ? "desc" : "asc");
                      } else {
                        setSocSortBy("full_name");
                        setSocSortDir("asc");
                      }
                    }}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{t("analystFullName")}</span>
                      {socSortBy === "full_name" ? (
                        socSortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => {
                      if (socSortBy === "email") {
                        setSocSortDir(socSortDir === "asc" ? "desc" : "asc");
                      } else {
                        setSocSortBy("email");
                        setSocSortDir("asc");
                      }
                    }}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{t("analystEmail")}</span>
                      {socSortBy === "email" ? (
                        socSortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>

                  <th className="py-3 px-4">{t("analystAccessRole")}</th>
                  <th className="py-3 px-4">{t("analystPermissions")}</th>

                  <th
                    onClick={() => {
                      if (socSortBy === "is_active") {
                        setSocSortDir(socSortDir === "asc" ? "desc" : "asc");
                      } else {
                        setSocSortBy("is_active");
                        setSocSortDir("desc");
                      }
                    }}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{t("analystStatus")}</span>
                      {socSortBy === "is_active" ? (
                        socSortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => {
                      if (socSortBy === "created_at") {
                        setSocSortDir(socSortDir === "asc" ? "desc" : "asc");
                      } else {
                        setSocSortBy("created_at");
                        setSocSortDir("desc");
                      }
                    }}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200/60 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{lang === "bn" ? "নিবন্ধন তারিখ" : "Member Since"}</span>
                      {socSortBy === "created_at" ? (
                        socSortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {socLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                      <span>Loading analyst personnel...</span>
                    </td>
                  </tr>
                ) : (
                  socUsers.map((u) => {
                    const roleBadge = getRoleBadge(u.role);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                              {u.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.full_name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: {u.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-700">{u.email}</td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[11px] border ${roleBadge.className}`}
                          >
                            {roleBadge.label}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {u.permissions && u.permissions.length > 0 ? (
                              u.permissions.slice(0, 3).map((perm, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200"
                                >
                                  {perm}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[11px]">Default Analyst</span>
                            )}
                            {u.permissions && u.permissions.length > 3 && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">
                                +{u.permissions.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>{lang === "bn" ? "সক্রিয়" : "Active"}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                          {u.created_at ? formatDate(u.created_at) : "System Seed"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD SOC ANALYST USER                                               */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-indigo-100 text-indigo-700">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{t("addAnalystBtn")}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs">
              {createError && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{createSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("analystFullName")}
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("analystEmail")}
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="tanvir.ahmed@sentinelflow.mfs.bd"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("analystPassword")}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("analystAccessRole")}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
                >
                  <option value="fraud_analyst_l1">Fraud Analyst (L1 - Triage)</option>
                  <option value="fraud_analyst_l2">Senior Fraud Analyst (L2 - Escalation)</option>
                  <option value="lead_investigator">Lead Investigator (L3 - Executive)</option>
                  <option value="compliance_officer">Compliance Officer (Bangladesh Bank)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {createSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  <span>{t("saveUser")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: CUSTOMER PROFILE INSPECTOR                                */}
      {/* ========================================================================= */}
      {inspectCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-indigo-100 text-indigo-700">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {lang === "bn" ? "গ্রাহক আইডেন্টিটি প্রোফাইল" : "Customer Identity Profile"}
                  </h3>
                  <span className="font-mono text-[10px] text-slate-500">
                    {inspectCustomer.code}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-extrabold text-base text-slate-900">
                    {inspectCustomer.display_name}
                  </div>
                  <div className="text-slate-500 mt-0.5 flex items-center gap-1.5 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                      {inspectCustomer.code}
                    </span>
                    <span>• {inspectCustomer.wallet_type || "Customer Wallet"}</span>
                  </div>
                </div>
                <RiskBadge level={getRiskLevel(inspectCustomer.risk_score)} score={inspectCustomer.risk_score} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {t("walletInfo")}
                  </div>
                  <div className="font-mono font-bold text-slate-900 mt-1">
                    {inspectCustomer.wallet_code || "N/A"}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {t("kycStatus")}
                  </div>
                  <div className="font-bold text-slate-900 mt-1 capitalize">
                    {inspectCustomer.kyc_level.replace("_", " ")}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {t("location")}
                  </div>
                  <div className="font-bold text-slate-900 mt-1">
                    {inspectCustomer.home_location}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Persona Profile
                  </div>
                  <div className="font-bold text-slate-900 mt-1 capitalize">
                    {inspectCustomer.persona.replace("_", " ")}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setInspectCustomer(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  {lang === "bn" ? "বন্ধ করুন" : "Close"}
                </button>
                <Link
                  href={`/monitoring/transactions?search=${inspectCustomer.wallet_code || inspectCustomer.code}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <span>{t("viewTxns")}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
