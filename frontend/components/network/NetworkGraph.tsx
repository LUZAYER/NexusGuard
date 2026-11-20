"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Activity,
  ArrowRight,
  Filter,
  Info,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  Smartphone,
  User,
  Wallet,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Layers,
  GitBranch,
  Building2,
  Globe,
  Radio,
  Sliders,
} from "lucide-react";
import { RiskBadge } from "../ui/RiskBadge";
import { formatBDT } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

export interface GraphNode {
  id: string;
  code: string;
  type: "customer" | "wallet" | "device" | "merchant" | "location";
  label: string;
  risk_score: number;
  group?: string;
  stage?: number;
  metrics?: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
  amount?: number;
  amount_total?: number;
  label?: string;
}

interface NetworkGraphProps {
  initialNodes?: GraphNode[];
  initialEdges?: GraphEdge[];
  centerEntity?: string;
  loading?: boolean;
  onSelectEntity?: (code: string) => void;
  indicators?: string[];
  muleClusterDetected?: boolean;
  highlightMuleRing?: boolean;
  className?: string;
}

type LayoutMode = "pipeline" | "orbit" | "force";

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  initialNodes,
  initialEdges,
  centerEntity,
  loading = false,
  onSelectEntity,
  indicators = [],
  muleClusterDetected = true,
  highlightMuleRing = true,
  className,
}) => {
  const { isDark } = useTheme();

  // Master baseline nodes if none provided
  const defaultNodes: GraphNode[] = [
    { id: "USER-10492", code: "USER-10492", type: "customer", label: "Arif Hossain (Victim Account)", risk_score: 86.0, group: "source" },
    { id: "DEV-8821", code: "DEV-8821", type: "device", label: "Rogue Phone (DEV-8821)", risk_score: 98.2, group: "threat" },
    { id: "IP-103.21", code: "IP-103.21", type: "device", label: "Proxy Tunnel (IP-103.21)", risk_score: 89.0, group: "threat" },
    { id: "WAL-5512", code: "WAL-5512", type: "wallet", label: "Mule Aggregator (WAL-5512)", risk_score: 94.3, group: "hub" },
    { id: "WALLET-A1", code: "WALLET-A1", type: "wallet", label: "Mule Layer 1 (WALLET-A1)", risk_score: 88.0, group: "split" },
    { id: "WALLET-A2", code: "WALLET-A2", type: "wallet", label: "Mule Layer 1 (WALLET-A2)", risk_score: 87.5, group: "split" },
    { id: "WALLET-A3", code: "WALLET-A3", type: "wallet", label: "Mule Layer 1 (WALLET-A3)", risk_score: 89.2, group: "split" },
    { id: "WALLET-B1", code: "WALLET-B1", type: "wallet", label: "Intermediary (WALLET-B1)", risk_score: 90.1, group: "mule" },
    { id: "WALLET-B2", code: "WALLET-B2", type: "wallet", label: "Intermediary (WALLET-B2)", risk_score: 91.4, group: "mule" },
    { id: "WALLET-B3", code: "WALLET-B3", type: "wallet", label: "Intermediary (WALLET-B3)", risk_score: 88.6, group: "mule" },
    { id: "WALLET-Y1", code: "WALLET-Y1", type: "wallet", label: "Consolidator A (WALLET-Y1)", risk_score: 93.0, group: "consolidator" },
    { id: "WALLET-Y2", code: "WALLET-Y2", type: "wallet", label: "Consolidator B (WALLET-Y2)", risk_score: 92.5, group: "consolidator" },
    { id: "AGENT-004", code: "AGENT-004", type: "merchant", label: "Cashout Sylhet (AGENT-004)", risk_score: 95.0, group: "exit" },
    { id: "AGENT-009", code: "AGENT-009", type: "merchant", label: "Cashout Dhaka (AGENT-009)", risk_score: 94.0, group: "exit" },
  ];

  const defaultEdges: GraphEdge[] = [
    { source: "USER-10492", target: "WAL-5512", type: "unauthorized_transfer", weight: 4, amount: 18700, label: "৳ 18,700" },
    { source: "DEV-8821", target: "WAL-5512", type: "credential_takeover", weight: 3, label: "Login Pairing" },
    { source: "IP-103.21", target: "WAL-5512", type: "proxy_tunnel", weight: 2, label: "VPN Proxy" },
    { source: "WAL-5512", target: "WALLET-A1", type: "rapid_split", weight: 3, amount: 6200, label: "৳ 6,200" },
    { source: "WAL-5512", target: "WALLET-A2", type: "rapid_split", weight: 3, amount: 6100, label: "৳ 6,100" },
    { source: "WAL-5512", target: "WALLET-A3", type: "rapid_split", weight: 3, amount: 6000, label: "৳ 6,000" },
    { source: "WALLET-A1", target: "WALLET-B1", type: "layering", weight: 2, amount: 3100, label: "৳ 3,100" },
    { source: "WALLET-A1", target: "WALLET-B2", type: "layering", weight: 2, amount: 3050, label: "৳ 3,050" },
    { source: "WALLET-A2", target: "WALLET-B2", type: "layering", weight: 2, amount: 3050, label: "৳ 3,050" },
    { source: "WALLET-A2", target: "WALLET-B3", type: "layering", weight: 2, amount: 3000, label: "৳ 3,000" },
    { source: "WALLET-A3", target: "WALLET-B3", type: "layering", weight: 2, amount: 5950, label: "৳ 5,950" },
    { source: "WALLET-B1", target: "WALLET-Y1", type: "consolidation", weight: 3, amount: 6150, label: "৳ 6,150" },
    { source: "WALLET-B2", target: "WALLET-Y1", type: "consolidation", weight: 3, amount: 6050, label: "৳ 6,050" },
    { source: "WALLET-B3", target: "WALLET-Y2", type: "consolidation", weight: 3, amount: 5950, label: "৳ 5,950" },
    { source: "WALLET-Y1", target: "AGENT-004", type: "cashout", weight: 4, amount: 12200, label: "৳ 12,200 Cashout" },
    { source: "WALLET-Y2", target: "AGENT-009", type: "cashout", weight: 4, amount: 5950, label: "৳ 5,950 Cashout" },
  ];

  const rawNodes = initialNodes && initialNodes.length > 0 ? initialNodes : defaultNodes;
  const rawEdges = initialEdges && initialEdges.length > 0 ? initialEdges : defaultEdges;

  // Layout Mode state
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("pipeline");
  const [selectedNodeId, setSelectedNodeId] = useState<string>(centerEntity || "WAL-5512");
  const [filterType, setFilterType] = useState<string>("all");
  const [zoom, setZoom] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [showMulePulse, setShowMulePulse] = useState<boolean>(highlightMuleRing);
  const [animateFlow, setAnimateFlow] = useState<boolean>(true);

  // Dragging state
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute Layout Coordinates based on active mode
  const computedLayout = useMemo(() => {
    const W = 1120;
    const H = 640;
    const cx = W / 2;
    const cy = H / 2;

    const positions: Record<string, { x: number; y: number }> = {};

    if (layoutMode === "pipeline") {
      // 1. Stage-based Hierarchical Flow (Infiltration -> Ingestion -> Layer 1 -> Layer 2 -> Consolidator -> Cashout)
      const stageBuckets: GraphNode[][] = [[], [], [], [], [], []];

      rawNodes.forEach((node) => {
        const idLower = node.id.toLowerCase();
        const codeLower = node.code.toLowerCase();
        const group = (node.group || "").toLowerCase();

        // Stage 0: Threat, Devices, Customer Victims
        if (
          node.type === "device" ||
          node.type === "customer" ||
          group === "source" ||
          group === "threat" ||
          idLower.includes("dev") ||
          idLower.includes("ip-") ||
          idLower.includes("user") ||
          idLower.includes("cust")
        ) {
          stageBuckets[0].push(node);
        }
        // Stage 1: Central Ingestion Hub (WAL-5512 or central wallet)
        else if (
          group === "hub" ||
          (centerEntity && (idLower === centerEntity.toLowerCase() || codeLower === centerEntity.toLowerCase())) ||
          idLower.includes("5512")
        ) {
          stageBuckets[1].push(node);
        }
        // Stage 2: Layer 1 Smurfs / Splits
        else if (
          group === "split" ||
          idLower.includes("-a1") ||
          idLower.includes("-a2") ||
          idLower.includes("-a3") ||
          idLower.includes("0171") ||
          idLower.includes("0182") ||
          idLower.includes("0193")
        ) {
          stageBuckets[2].push(node);
        }
        // Stage 3: Layer 2 Intermediaries
        else if (
          idLower.includes("-b1") ||
          idLower.includes("-b2") ||
          idLower.includes("-b3") ||
          (group === "mule" && !idLower.includes("-y"))
        ) {
          stageBuckets[3].push(node);
        }
        // Stage 4: Consolidators
        else if (
          group === "consolidator" ||
          idLower.includes("-y1") ||
          idLower.includes("-y2") ||
          idLower.includes("9821")
        ) {
          stageBuckets[4].push(node);
        }
        // Stage 5: Cashout Agents & Merchants
        else if (
          node.type === "merchant" ||
          group === "exit" ||
          idLower.includes("agent") ||
          idLower.includes("merch")
        ) {
          stageBuckets[5].push(node);
        }
        // Catch-all
        else {
          stageBuckets[3].push(node);
        }
      });

      // Assign X coords per stage column with generous spacing
      const stageX = [110, 290, 480, 680, 870, 1020];

      stageBuckets.forEach((bucket, sIdx) => {
        const x = stageX[sIdx];
        const count = bucket.length;
        if (count === 0) return;

        // Even vertical spacing
        const verticalSpread = Math.min(480, Math.max(220, count * 110));
        const startY = cy - verticalSpread / 2;
        const step = count > 1 ? verticalSpread / (count - 1) : 0;

        bucket.forEach((node, i) => {
          const y = count === 1 ? cy : startY + i * step;
          positions[node.id] = { x, y };
        });
      });
    } else if (layoutMode === "orbit") {
      // 2. Concentric Orbit Rings Layout
      const hubNode =
        rawNodes.find((n) => n.group === "hub" || n.code.toLowerCase() === (centerEntity || "wal-5512").toLowerCase()) ||
        rawNodes[0];

      positions[hubNode.id] = { x: cx, y: cy };

      const otherNodes = rawNodes.filter((n) => n.id !== hubNode.id);
      const ring1: GraphNode[] = []; // Threat & Victims (R = 150)
      const ring2: GraphNode[] = []; // Layer 1 Splits (R = 260)
      const ring3: GraphNode[] = []; // Layer 2 & Consolidators (R = 360)
      const ring4: GraphNode[] = []; // Cashout Agents (R = 460)

      otherNodes.forEach((node) => {
        if (node.type === "device" || node.type === "customer") ring1.push(node);
        else if (node.type === "merchant" || node.group === "exit") ring4.push(node);
        else if (node.code.includes("-A") || node.code.includes("017")) ring2.push(node);
        else ring3.push(node);
      });

      const assignRing = (ringNodes: GraphNode[], radius: number, angleOffset: number = 0) => {
        const count = ringNodes.length;
        ringNodes.forEach((node, i) => {
          const angle = angleOffset + (i / Math.max(1, count)) * Math.PI * 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius * 0.78; // Slight elliptical ratio for widescreen
          positions[node.id] = { x, y };
        });
      };

      assignRing(ring1, 140, Math.PI);
      assignRing(ring2, 230, Math.PI / 4);
      assignRing(ring3, 330, -Math.PI / 6);
      assignRing(ring4, 430, Math.PI / 3);
    } else {
      // 3. Spacious Force Layout with Relaxation
      const count = rawNodes.length;
      rawNodes.forEach((node, idx) => {
        const angle = (idx / count) * Math.PI * 2;
        const dist = 180 + (idx % 3) * 70;
        positions[node.id] = {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist * 0.75,
        };
      });

      // Relaxation passes to push overlapping nodes apart
      for (let iter = 0; iter < 40; iter++) {
        for (let i = 0; i < rawNodes.length; i++) {
          for (let j = i + 1; j < rawNodes.length; j++) {
            const idA = rawNodes[i].id;
            const idB = rawNodes[j].id;
            const posA = positions[idA];
            const posB = positions[idB];
            const dx = posB.x - posA.x;
            const dy = posB.y - posA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = 130;

            if (dist < minDist) {
              const overlap = (minDist - dist) / 2;
              const pushX = (dx / dist) * overlap;
              const pushY = (dy / dist) * overlap;
              posA.x = Math.max(80, Math.min(W - 80, posA.x - pushX));
              posA.y = Math.max(70, Math.min(H - 70, posA.y - pushY));
              posB.x = Math.max(80, Math.min(W - 80, posB.x + pushX));
              posB.y = Math.max(70, Math.min(H - 70, posB.y + pushY));
            }
          }
        }
      }
    }

    return positions;
  }, [rawNodes, layoutMode, centerEntity]);

  // Sync positions when computed layout changes
  useEffect(() => {
    setNodePositions(computedLayout);
  }, [computedLayout]);

  // Sync selected node
  useEffect(() => {
    if (centerEntity) {
      setSelectedNodeId(centerEntity);
    }
  }, [centerEntity]);

  // Helper to reliably get position from drag state or computed layout
  const getNodePos = (id: string, fallbackX: number = 560, fallbackY: number = 320) => {
    return nodePositions[id] || computedLayout[id] || { x: fallbackX, y: fallbackY };
  };

  const selectedNode = useMemo(() => {
    return (
      rawNodes.find((n) => n.id === selectedNodeId || n.code === selectedNodeId) ||
      rawNodes[0]
    );
  }, [rawNodes, selectedNodeId]);

  const filteredNodes = useMemo(() => {
    return rawNodes.filter((n) => {
      if (filterType !== "all" && n.type !== filterType) return false;
      if (
        search &&
        !n.label.toLowerCase().includes(search.toLowerCase()) &&
        !n.code.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [rawNodes, filterType, search]);

  // Handle Dragging
  const handleMouseDown = (nodeId: string) => {
    setDraggedNode(nodeId);
    setSelectedNodeId(nodeId);
    if (onSelectEntity) {
      const match = rawNodes.find((n) => n.id === nodeId);
      if (match) onSelectEntity(match.code);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setNodePositions((prev) => ({
      ...prev,
      [draggedNode]: { x, y },
    }));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const getNodeColor = (type: string, risk: number) => {
    if (risk >= 80) return "#ef4444"; // Crimson Red
    switch (type) {
      case "customer":
        return "#3b82f6"; // Blue
      case "wallet":
        return "#10b981"; // Emerald
      case "device":
        return "#8b5cf6"; // Violet
      case "merchant":
        return "#f59e0b"; // Amber
      default:
        return "#64748b";
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "customer":
        return <User className="w-3.5 h-3.5" />;
      case "wallet":
        return <Wallet className="w-3.5 h-3.5" />;
      case "device":
        return <Smartphone className="w-3.5 h-3.5" />;
      case "merchant":
        return <Building2 className="w-3.5 h-3.5" />;
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={`rounded-2xl border flex flex-col h-[780px] overflow-hidden transition-all shadow-xl obsidian-card border-[var(--card-border)] ${className || ""}`}
    >
      {/* ── Top Toolbar ── */}
      <div className="px-4 py-3 border-b border-[var(--card-border)] bg-[var(--background-secondary)] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Search & Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search graph entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] text-xs outline-none focus:border-[var(--accent-primary)] transition-colors w-44 sm:w-52"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--foreground-muted)] font-semibold hidden md:inline text-[11px]">Filter:</span>
            {(["all", "wallet", "customer", "device", "merchant"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  filterType === type
                    ? "bg-rose-600 text-white shadow-xs"
                    : "border border-[var(--card-border)] hover:border-[var(--card-border-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Layout Mode View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl obsidian-card border border-[var(--card-border)] bg-[var(--card-bg)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] px-2">
            Layout:
          </span>
          <button
            onClick={() => setLayoutMode("pipeline")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              layoutMode === "pipeline"
                ? "bg-[var(--accent-primary)] text-white shadow-xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
            title="Multi-stage Left-to-Right pipeline view"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Pipeline Flow</span>
          </button>
          <button
            onClick={() => setLayoutMode("orbit")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              layoutMode === "orbit"
                ? "bg-[var(--accent-primary)] text-white shadow-xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
            title="Concentric orbit ring layout"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Syndicate Orbit</span>
          </button>
          <button
            onClick={() => setLayoutMode("force")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              layoutMode === "force"
                ? "bg-[var(--accent-primary)] text-white shadow-xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
            title="Spacious organic force graph"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Force Topology</span>
          </button>
        </div>

        {/* Right: Controls & Zoom */}
        <div className="flex items-center gap-2">
          {/* Mule Ring Pulse Toggle */}
          <button
            onClick={() => setShowMulePulse(!showMulePulse)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
              showMulePulse
                ? "border-rose-500/50 bg-rose-500/15 text-rose-400 shadow-xs"
                : "border-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 text-rose-500 ${showMulePulse ? "animate-bounce" : ""}`} />
            <span>Ring Pulse</span>
          </button>

          {/* Flow Animation Toggle */}
          <button
            onClick={() => setAnimateFlow(!animateFlow)}
            className="p-1.5 rounded-xl border border-[var(--card-border)] hover:border-[var(--card-border-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            title={animateFlow ? "Pause Flow Animation" : "Play Flow Animation"}
          >
            {animateFlow ? <Pause className="w-3.5 h-3.5 text-rose-400" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center border border-[var(--card-border)] rounded-xl overflow-hidden bg-[var(--card-bg)]">
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1.5 hover:bg-white/10 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[10px] text-[var(--foreground-muted)]">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1.5 hover:bg-white/10 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1.5 text-[10px] font-semibold border-l border-[var(--card-border)] hover:bg-white/10 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              title="Reset View"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Canvas Area ── */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative overflow-hidden select-none cursor-grab active:cursor-grabbing bg-[var(--card-bg)]">
          {/* Subtle Grid Backdrop */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: isDark
                ? "radial-gradient(#ef4444 1.5px, transparent 1.5px)"
                : "radial-gradient(#dc2626 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Pipeline Stage Column Labels (shown in pipeline mode) */}
          {layoutMode === "pipeline" && (
            <div className="absolute top-2 left-0 right-0 pointer-events-none px-6 flex justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--foreground-muted)] opacity-60">
              <span className="w-36 text-center">Infiltration / Origin</span>
              <span className="w-36 text-center">Ingestion Hub</span>
              <span className="w-36 text-center">Layer 1 Splits</span>
              <span className="w-36 text-center">Intermediary Mules</span>
              <span className="w-36 text-center">Consolidators</span>
              <span className="w-36 text-center">Cash-Out Terminals</span>
            </div>
          )}

          <svg
            ref={svgRef}
            viewBox="0 0 1120 640"
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              transition: draggedNode ? "none" : "transform 0.15s ease",
            }}
          >
            <defs>
              <marker
                id="network-arrow"
                viewBox="0 0 10 10"
                refX="26"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={isDark ? "#ef4444" : "#dc2626"} opacity="0.8" />
              </marker>
              <filter id="mule-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edge Connections with Smooth Curving Beziers */}
            {rawEdges.map((edge, idx) => {
              const srcPos = getNodePos(edge.source);
              const tgtPos = getNodePos(edge.target);
              if (!srcPos || !tgtPos) return null;

              const isSuspicious =
                edge.type.includes("mule") ||
                edge.type.includes("split") ||
                edge.type.includes("takeover") ||
                edge.type.includes("cashout") ||
                edge.weight >= 3;

              // Bezier Control Points for fluid curved filaments
              const dx = tgtPos.x - srcPos.x;
              const dy = tgtPos.y - srcPos.y;
              const cx1 = srcPos.x + dx * 0.45;
              const cy1 = srcPos.y;
              const cx2 = tgtPos.x - dx * 0.45;
              const cy2 = tgtPos.y;

              const pathD = `M ${srcPos.x} ${srcPos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tgtPos.x} ${tgtPos.y}`;
              const midX = (srcPos.x + tgtPos.x) / 2;
              const midY = (srcPos.y + tgtPos.y) / 2;

              return (
                <g key={`edge-${idx}`}>
                  {/* Outer glow stroke for high risk */}
                  {isSuspicious && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isDark ? "#ef4444" : "#dc2626"}
                      strokeWidth={4}
                      opacity={0.15}
                    />
                  )}

                  {/* Main Curving Edge Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      isSuspicious
                        ? isDark
                          ? "#ef4444"
                          : "#dc2626"
                        : isDark
                        ? "#475569"
                        : "#94a3b8"
                    }
                    strokeWidth={isSuspicious ? 2.5 : 1.5}
                    strokeDasharray={isSuspicious ? "5,3" : "none"}
                    opacity={isSuspicious ? 0.9 : 0.45}
                    markerEnd="url(#network-arrow)"
                  />

                  {/* Flow Particle Animation along the Bezier curve */}
                  {animateFlow && (
                    <circle r={isSuspicious ? 3.5 : 2.5} fill={isSuspicious ? "#ef4444" : "#38bdf8"}>
                      <animateMotion
                        path={pathD}
                        dur={`${Math.max(1.8, 4.5 - edge.weight * 0.6)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* High-Contrast Badge Pill for Edge Label */}
                  {edge.label && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-40"
                        y="-10"
                        width="80"
                        height="20"
                        rx="6"
                        fill={isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)"}
                        stroke={isSuspicious ? "rgba(239, 68, 68, 0.5)" : "rgba(148, 163, 184, 0.3)"}
                        strokeWidth="1"
                        className="select-none pointer-events-none shadow-xs"
                      />
                      <text
                        x="0"
                        y="4"
                        fill={isSuspicious ? (isDark ? "#f87171" : "#b91c1c") : isDark ? "#cbd5e1" : "#475569"}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="select-none pointer-events-none"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render Nodes with Contrast Badges & Icons */}
            {filteredNodes.map((node) => {
              const pos = getNodePos(node.id, node.x, node.y);
              const isSelected = selectedNode?.id === node.id || selectedNode?.code === node.code;
              const isHighRisk = node.risk_score >= 80;
              const color = getNodeColor(node.type, node.risk_score);

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={() => handleMouseDown(node.id)}
                  className="cursor-pointer group"
                >
                  {/* Mule Ring Pulse Animation */}
                  {showMulePulse && isHighRisk && (
                    <circle r="32" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6">
                      <animate attributeName="r" values="22;38;22" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Selection Glow Indicator */}
                  {isSelected && (
                    <circle
                      r="26"
                      fill="none"
                      stroke="var(--accent-primary, #6366f1)"
                      strokeWidth="2.5"
                      strokeDasharray="4,2"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r="19"
                    fill={isDark ? "#0f172a" : "#ffffff"}
                    stroke={color}
                    strokeWidth={isSelected ? 3.5 : isHighRisk ? 3 : 2}
                    filter={isHighRisk ? "url(#mule-glow)" : "none"}
                  />

                  {/* Centered Node Icon Representation */}
                  <circle r="12" fill={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"} />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill={color}
                    className="select-none pointer-events-none"
                  >
                    {node.type === "device" ? "📱" : node.type === "merchant" ? "🏪" : node.type === "customer" ? "👤" : "💳"}
                  </text>

                  {/* Top-Right Risk Score Pill Badge */}
                  <g transform="translate(13, -13)">
                    <circle
                      r="8"
                      fill={isHighRisk ? "#ef4444" : "#10b981"}
                      stroke={isDark ? "#0f172a" : "#ffffff"}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="3"
                      fill="#ffffff"
                      fontSize="7.5"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="select-none pointer-events-none font-mono"
                    >
                      {Math.round(node.risk_score)}
                    </text>
                  </g>

                  {/* High-Contrast Bottom Pill for Entity Code */}
                  <g transform="translate(0, 24)">
                    <rect
                      x="-48"
                      y="0"
                      width="96"
                      height="20"
                      rx="6"
                      fill={isDark ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 255, 255, 0.94)"}
                      stroke={isSelected ? "var(--accent-primary)" : isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}
                      strokeWidth={isSelected ? 1.5 : 1}
                      className="select-none pointer-events-none shadow-xs"
                    />
                    <text
                      x="0"
                      y="14"
                      fill={isSelected ? "var(--accent-primary)" : isDark ? "#f1f5f9" : "#0f172a"}
                      fontSize="9.5"
                      fontWeight={isSelected ? "bold" : "600"}
                      textAnchor="middle"
                      fontFamily="monospace"
                      className="select-none pointer-events-none"
                    >
                      {node.code}
                    </text>
                  </g>

                  {/* Sublabel below code pill */}
                  <text
                    x="0"
                    y="53"
                    fill={isDark ? "#94a3b8" : "#64748b"}
                    fontSize="8.5"
                    fontWeight="500"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── Right Inspection Side-Drawer ── */}
        {selectedNode && (
          <div
            className={`w-72 sm:w-84 border-l p-4 flex flex-col justify-between overflow-y-auto shrink-0 transition-colors ${
              isDark ? "bg-slate-900/90 border-[var(--card-border)]" : "bg-slate-50/95 border-[var(--card-border)]"
            }`}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-500 font-bold">
                    Forensic Node Dossier
                  </span>
                  <h4 className="text-base font-bold text-[var(--foreground)] mt-0.5">{selectedNode.code}</h4>
                  <p className="text-xs text-[var(--foreground-muted)]">{selectedNode.label}</p>
                </div>
                <RiskBadge score={selectedNode.risk_score} />
              </div>

              {/* Status Pill */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  selectedNode.risk_score >= 80
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                }`}
              >
                {selectedNode.risk_score >= 80 ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold block text-[var(--foreground)]">
                    {selectedNode.risk_score >= 80 ? "Critical Threat Node" : "Verified Entity"}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {selectedNode.risk_score >= 80
                      ? "Flagged for Money Mule Syndication"
                      : "Compliant Historical Baseline"}
                  </span>
                </div>
              </div>

              {/* Node Metadata Table */}
              <div className="space-y-2 text-xs border-y border-[var(--card-border)] py-3">
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Entity Type:</span>
                  <span className="font-mono uppercase font-bold text-rose-400">{selectedNode.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Topological Role:</span>
                  <span className="font-semibold text-[var(--foreground)]">{selectedNode.group || "Intermediary Relay"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Connected Hops:</span>
                  <span className="font-mono font-bold text-[var(--foreground)]">
                    {rawEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id).length} Counterparties
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-muted)]">Aggregated Volume:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ৳{" "}
                    {rawEdges
                      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                      .reduce((sum, e) => sum + (e.amount_total || e.amount || 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Red-Flag Signals */}
              <div>
                <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-2">
                  Observed Graph Tripwires
                </span>
                <div className="space-y-1.5">
                  {(indicators.length > 0
                    ? indicators
                    : [
                        "Rapid fan-out structuring under BFIU threshold",
                        "New device DEV-8821 attached off-hours (02:13 AM)",
                        "Immediate liquidation to agent cash-out node",
                        "High PageRank centrality in money laundering ring",
                      ]
                  ).map((ind, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-4 border-t border-[var(--card-border)] space-y-2">
              <a
                href={`/investigations/cases?search=${selectedNode.code}`}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Launch AI Investigation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={`/monitoring/transactions?search=${selectedNode.code}`}
                className="w-full py-2 px-3 rounded-xl border border-[var(--card-border)] obsidian-card hover:border-[var(--card-border-hover)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Raw Stream Records</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Summary Bar ── */}
      <div className="px-4 py-2.5 border-t border-[var(--card-border)] bg-[var(--background-secondary)] flex flex-wrap items-center justify-between text-xs text-[var(--foreground-muted)]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-[var(--foreground)]">{filteredNodes.length}</span> Active Entities
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-semibold text-[var(--foreground)]">{rawEdges.length}</span> Transaction Filaments
          </span>
          <span className="text-rose-400 font-semibold hidden md:inline">
            Topology Engine: NetworkX Multi-Hop Cycle & Centrality Detection
          </span>
        </div>
        <div className="text-[11px] font-mono">
          Interactive: Drag nodes • Switch Layouts • Click to inspect dossier
        </div>
      </div>
    </div>
  );
};
