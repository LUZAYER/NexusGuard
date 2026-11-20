"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Layers,
  Network,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  Smartphone,
  User,
  Wallet,
  X,
  Zap,
  Flame,
  GitBranch,
} from "lucide-react";
import { NetworkGraph, GraphNode, GraphEdge } from "@/components/network/NetworkGraph";
import { getNetworkEntity, getNetworkTargets, searchNetworkEntities, getSystemStats } from "@/lib/api";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { formatBDT } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useSkeletonDelay, NetworkGraphSkeleton } from "@/components/ui/DataSkeletonLoader";

const PRESET_SCENARIOS = [
  { code: "WAL-5512", label: "Sylhet Mule Ring (WAL-5512)", risk: 94.3, type: "Mule Aggregator", desc: "14 downstream cashout hops" },
  { code: "WAL-9821", label: "Midnight ATO Funnel (WAL-9821)", risk: 91.5, type: "Layering Relay", desc: "02:13 AM credential takeover" },
  { code: "WAL-4412", label: "Circular Wash Syndicate (WAL-4412)", risk: 88.4, type: "Circular Flow", desc: "A → B → C → D → A loop" },
  { code: "MERCH-094", label: "Merchant Invoicing Smurf (MERCH-094)", risk: 95.0, type: "Merchant Liquidation", desc: "High velocity QR cashout" },
];

const DEFAULT_NODES: GraphNode[] = [
  { id: "USER-10492", code: "USER-10492", label: "USER-10492 (Victim Account)", type: "customer", risk_score: 86.0, group: "source" },
  { id: "WAL-5512", code: "WAL-5512", label: "WAL-5512 (Layering Hub)", type: "wallet", risk_score: 94.3, group: "hub" },
  { id: "WALLET-A1", code: "WALLET-A1", label: "WALLET-A1 (Mule Layer 1)", type: "wallet", risk_score: 88.0, group: "split" },
  { id: "WALLET-A2", code: "WALLET-A2", label: "WALLET-A2 (Mule Layer 1)", type: "wallet", risk_score: 87.5, group: "split" },
  { id: "WALLET-A3", code: "WALLET-A3", label: "WALLET-A3 (Mule Layer 1)", type: "wallet", risk_score: 89.2, group: "split" },
  { id: "WALLET-B1", code: "WALLET-B1", label: "WALLET-B1 (Intermediary)", type: "wallet", risk_score: 90.1, group: "mule" },
  { id: "WALLET-B2", code: "WALLET-B2", label: "WALLET-B2 (Intermediary)", type: "wallet", risk_score: 91.4, group: "mule" },
  { id: "WALLET-B3", code: "WALLET-B3", label: "WALLET-B3 (Intermediary)", type: "wallet", risk_score: 88.6, group: "mule" },
  { id: "WALLET-Y1", code: "WALLET-Y1", label: "WALLET-Y1 (Consolidator A)", type: "wallet", risk_score: 93.0, group: "consolidator" },
  { id: "WALLET-Y2", code: "WALLET-Y2", label: "WALLET-Y2 (Consolidator B)", type: "wallet", risk_score: 92.5, group: "consolidator" },
  { id: "AGENT-004", code: "AGENT-004", label: "AGENT-004 (Cashout Sylhet)", type: "merchant", risk_score: 95.0, group: "exit" },
  { id: "AGENT-009", code: "AGENT-009", label: "AGENT-009 (Cashout Dhaka)", type: "merchant", risk_score: 94.0, group: "exit" },
  { id: "DEV-8821", code: "DEV-8821", label: "DEV-8821 (Attacker Hardware)", type: "device", risk_score: 91.0, group: "threat" },
  { id: "IP-103.21", code: "IP-103.21", label: "IP-103.21 (VPN Exit Point)", type: "device", risk_score: 89.0, group: "threat" },
];

const DEFAULT_EDGES: GraphEdge[] = [
  { source: "USER-10492", target: "WAL-5512", amount: 18700, label: "৳ 18,700", type: "transfer", weight: 4 },
  { source: "DEV-8821", target: "WAL-5512", amount: 0, label: "Login Pairing", type: "device", weight: 2 },
  { source: "IP-103.21", target: "WAL-5512", amount: 0, label: "Proxy Tunnel", type: "device", weight: 2 },
  { source: "WAL-5512", target: "WALLET-A1", amount: 6200, label: "৳ 6,200", type: "split", weight: 2 },
  { source: "WAL-5512", target: "WALLET-A2", amount: 6100, label: "৳ 6,100", type: "split", weight: 2 },
  { source: "WAL-5512", target: "WALLET-A3", amount: 6000, label: "৳ 6,000", type: "split", weight: 2 },
  { source: "WALLET-A1", target: "WALLET-B1", amount: 3100, label: "৳ 3,100", type: "split", weight: 2 },
  { source: "WALLET-A1", target: "WALLET-B2", amount: 3050, label: "৳ 3,050", type: "split", weight: 2 },
  { source: "WALLET-A2", target: "WALLET-B2", amount: 3050, label: "৳ 3,050", type: "split", weight: 2 },
  { source: "WALLET-A2", target: "WALLET-B3", amount: 3000, label: "৳ 3,000", type: "split", weight: 2 },
  { source: "WALLET-A3", target: "WALLET-B3", amount: 5950, label: "৳ 5,950", type: "split", weight: 2 },
  { source: "WALLET-B1", target: "WALLET-Y1", amount: 6150, label: "৳ 6,150", type: "consolidation", weight: 3 },
  { source: "WALLET-B2", target: "WALLET-Y1", amount: 6050, label: "৳ 6,050", type: "consolidation", weight: 3 },
  { source: "WALLET-B3", target: "WALLET-Y2", amount: 5950, label: "৳ 5,950", type: "consolidation", weight: 3 },
  { source: "WALLET-Y1", target: "AGENT-004", amount: 12200, label: "৳ 12,200 Cashout", type: "cashout", weight: 4 },
  { source: "WALLET-Y2", target: "AGENT-009", amount: 5950, label: "৳ 5,950 Cashout", type: "cashout", weight: 3 },
];

function NetworkGraphContent() {
  const { lang, formatNumber } = useLanguage();
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const queryTarget = searchParams.get("target") || searchParams.get("wallet") || searchParams.get("customer") || searchParams.get("search") || "WAL-5512";

  const [stats, setStats] = useState<any | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>(queryTarget);
  const [depth, setDepth] = useState<number>(2);

  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    edges: GraphEdge[];
    centerEntity: string;
    muleClusterDetected: boolean;
    indicators: string[];
  }>({
    nodes: DEFAULT_NODES,
    edges: DEFAULT_EDGES,
    centerEntity: queryTarget,
    muleClusterDetected: true,
    indicators: [
      "High velocity fan-out within 4 minutes of victim credit",
      "Layering through 6 intermediary wallets to evade BFIU thresholds",
      "Rapid consolidation and attempted cash-out at AGENT-004 & AGENT-009",
      "New hardware pairing DEV-8821 detected at 02:13 AM (off-hours)",
    ],
  });
  const [loading, setLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load Graph for Selected Target
  const loadGraph = (targetCode: string, targetDepth: number = depth) => {
    setLoading(true);
    getNetworkEntity(targetCode, targetDepth)
      .then((res: any) => {
        setGraphData({
          nodes: res.nodes || [],
          edges: res.edges || [],
          centerEntity: res.center_entity || targetCode,
          muleClusterDetected: res.mule_cluster_detected || false,
          indicators: res.indicators || [],
        });
        setSelectedTarget(res.center_entity || targetCode);
      })
      .catch((err) => {
        console.error("Failed to load network graph:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadGraph(selectedTarget, depth);
  }, [depth]);

  // Autocomplete search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setSearchLoading(true);
      searchNetworkEntities(searchQuery.trim())
        .then((items) => {
          setSearchResults(items || []);
          setShowDropdown(true);
        })
        .catch((err) => console.error("Search failed:", err))
        .finally(() => setSearchLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectTarget = (targetCode: string) => {
    setSelectedTarget(targetCode);
    setSearchQuery("");
    setShowDropdown(false);
    loadGraph(targetCode, depth);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSelectTarget(searchQuery.trim());
    }
  };

  const skeletonLoading = useSkeletonDelay(1000, selectedTarget);

  if (skeletonLoading) {
    return <NetworkGraphSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col transition-colors">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
              NetworkX Graph Forensics
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Topological Engine Active
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2.5">
            <GitBranch className="w-6 h-6 text-rose-500" />
            Financial Relationship & Money Mule Network Forensics
          </h1>
          <p className="text-xs text-[var(--foreground-muted)] max-w-3xl mt-1">
            Uncover multi-hop money mule syndicates, rapid fund split-layering, and circular wash transactions (A → B → C → A) across Mobile Financial Services.
          </p>
        </div>

        {/* Quick Search Input */}
        <div className="relative w-full md:w-80" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit}>
            <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search wallet, customer, device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full obsidian-card border border-[var(--card-border)] text-[var(--foreground)] rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
          </form>

          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-[var(--card-border)] obsidian-card shadow-2xl p-2 z-50 space-y-1">
              {searchResults.map((res: any) => {
                const entityCode = res.code || res.id;
                return (
                  <button
                    key={entityCode}
                    onClick={() => handleSelectTarget(entityCode)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-rose-500/10 text-left text-xs transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-[var(--foreground)] block">{entityCode}</span>
                      <span className="text-[10px] text-[var(--foreground-muted)]">{res.label}</span>
                    </div>
                    <RiskBadge score={res.risk || res.risk_score || 85} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preset Threat Scenario Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_SCENARIOS.map((scen) => {
          const isSelected = selectedTarget.toLowerCase() === scen.code.toLowerCase();
          return (
            <button
              key={scen.code}
              onClick={() => handleSelectTarget(scen.code)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-rose-500 bg-rose-500/15 shadow-md shadow-rose-950/20 ring-1 ring-rose-500/30"
                  : "obsidian-card border-[var(--card-border)] hover:border-[var(--card-border-hover)]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                  {scen.type}
                </span>
                <span className="text-xs font-bold text-rose-400">{scen.risk} Risk</span>
              </div>
              <h4 className="text-xs font-bold text-[var(--foreground)] truncate">{scen.label}</h4>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">{scen.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Interactive Network Graph Component */}
      <div className="flex-1">
        <NetworkGraph
          initialNodes={graphData.nodes}
          initialEdges={graphData.edges}
          centerEntity={selectedTarget}
          indicators={graphData.indicators}
          muleClusterDetected={graphData.muleClusterDetected}
          onSelectEntity={(code) => setSelectedTarget(code)}
        />
      </div>
    </div>
  );
}

export default function NetworkPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 flex items-center justify-center text-xs text-slate-400">
          Loading Financial Graph Intelligence...
        </div>
      }
    >
      <NetworkGraphContent />
    </Suspense>
  );
}
