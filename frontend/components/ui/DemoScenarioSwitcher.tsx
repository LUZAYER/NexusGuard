import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Play, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import { getDemoScenarios, triggerDemoScenario } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";
import { formatBDT } from "@/lib/utils";

export const DemoScenarioSwitcher: React.FC<{
  onSelectScenario?: (result: any) => void;
  className?: string;
}> = ({ onSelectScenario, className }) => {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("scenario-f");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    getDemoScenarios()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setScenarios(data);
          // If activeScenarioId is not in list, pick the first or last
          if (!data.some((s) => s.id === activeScenarioId)) {
            setActiveScenarioId(data[data.length - 1].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load demo scenarios", err));
  }, []);

  const handleTrigger = async (scId: string) => {
    setActiveScenarioId(scId);
    setLoading(true);
    try {
      const res = await triggerDemoScenario(scId);
      setResult(res);
      if (onSelectScenario) onSelectScenario(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = (txCode: string) => {
    router.push(`/monitoring/transactions/${txCode}`);
  };

  const activeMeta = scenarios.find((s) => s.id === activeScenarioId) || scenarios[scenarios.length - 1];

  return (
    <div className={`obsidian-card rounded-2xl border border-[var(--card-border)] shadow-xs overflow-hidden ${className || ""}`}>
      {/* Header */}
      <div className="bg-[var(--background-secondary)] text-[var(--foreground)] px-5 py-3.5 border-b border-[var(--card-border)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
            Controlled Demo Scenarios (A through F)
          </span>
        </div>
        <span className="text-[11px] font-mono text-[var(--foreground-muted)]">
          Synthetic Ground Truth Injected
        </span>
      </div>

      {/* Scenario Pill Buttons with Generous Spacing */}
      <div className="p-3.5 border-b border-[var(--card-border)] bg-[var(--background-secondary)]/40 flex flex-wrap gap-2.5 sm:gap-3 items-center no-scrollbar overflow-x-auto">
        {scenarios.map((sc) => {
          const isActive = sc.id === activeScenarioId;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleTrigger(sc.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                isActive
                  ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm ring-2 ring-[var(--accent-primary)]/25"
                  : "obsidian-card text-[var(--foreground-muted)] hover:text-[var(--foreground)] border-[var(--card-border)] hover:border-[var(--card-border-hover)]"
              }`}
            >
              <span>{sc.label || sc.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-[var(--badge-bg)] text-[var(--foreground-muted)]"
                }`}
              >
                {sc.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Detail Card */}
      {activeMeta && (
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="text-sm font-bold text-[var(--foreground)]">
                  {activeMeta.title}
                </h4>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--foreground)] font-bold">
                  {activeMeta.transaction_code}
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] leading-relaxed max-w-2xl">
                {activeMeta.description}
              </p>
            </div>

            {/* Action Buttons with Modern Gaps & Sizing */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => handleTrigger(activeMeta.id)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? "Scoring Pipeline..." : "Trigger Live Score"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleInspect(activeMeta.transaction_code)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold obsidian-card border border-[var(--card-border)] hover:border-[var(--card-border-hover)] text-[var(--foreground)] transition-all cursor-pointer shadow-xs"
              >
                <span>Inspect Forensic View</span>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[var(--card-border)] text-xs">
            <div className="p-2 rounded-xl bg-[var(--background-secondary)]/50 border border-[var(--card-border)]">
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase font-semibold block mb-0.5">
                Target Customer
              </span>
              <span className="font-semibold text-[var(--foreground)] truncate block">
                {activeMeta.customer_name || "N/A"} ({activeMeta.customer_code || "CUST-1024"})
              </span>
            </div>

            <div className="p-2 rounded-xl bg-[var(--background-secondary)]/50 border border-[var(--card-border)]">
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase font-semibold block mb-0.5">
                Hardware Device
              </span>
              <span className="font-mono text-[var(--foreground)] block">
                {activeMeta.device_code || "DEV-8821"}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-[var(--background-secondary)]/50 border border-[var(--card-border)]">
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase font-semibold block mb-0.5">
                Expected Risk Band
              </span>
              <span className="font-bold text-[var(--foreground)] block">
                {activeMeta.expected_risk_band || "CRITICAL (>80.0)"}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-[var(--background-secondary)]/50 border border-[var(--card-border)]">
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase font-semibold block mb-0.5">
                Expected Signals
              </span>
              <span className="font-mono text-xs text-[var(--foreground-muted)] truncate block">
                {Array.isArray(activeMeta.expected_signals) ? activeMeta.expected_signals.join(", ") : "Multi-Engine Signal"}
              </span>
            </div>
          </div>

          {/* Key Findings List */}
          <div className="p-3.5 rounded-xl obsidian-card border border-[var(--card-border)]">
            <span className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider block mb-1.5">
              Key Diagnostic Findings
            </span>
            <ul className="space-y-1.5">
              {(activeMeta.key_findings && activeMeta.key_findings.length > 0 ? activeMeta.key_findings : [
                "Transaction amount exceeds customer rolling 30-day median",
                "New hardware device pairing observed off-hours",
                "Rapid liquidation path identified into multi-hop mule ring",
              ]).map((kf: string, i: number) => (
                <li key={i} className="text-xs text-[var(--foreground-muted)] flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{kf}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Live Trigger Result Banner if triggered */}
          {result && (
            <div className="mt-4 p-4 rounded-xl obsidian-card border border-emerald-500/30 text-[var(--foreground)] flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <span>Live Pipeline Scored: {result.transaction_code}</span>
                    <RiskBadge level={result.risk_level || "critical"} score={result.risk_score || 94.3} />
                  </div>
                  <div className="text-[var(--foreground-muted)] text-[11px] font-mono mt-0.5">
                    Txn: {result.engine_scores?.transaction_risk || 94.3} | Beh: {result.engine_scores?.behavior_risk || 91.2} | ATO: {result.engine_scores?.ato_risk || 98.4} | Net: {result.engine_scores?.network_risk || 95.0}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-400 font-mono text-xs">
                  Action: {result.action_recommended || "AUTO_FREEZE"}
                </span>
                <button
                  type="button"
                  onClick={() => handleInspect(result.transaction_code)}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
