import React, { useState } from "react";
import { ChevronDown, ChevronUp, Cpu, Database, Fingerprint, Network } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { cn } from "@/lib/utils";

export interface EvidenceCardData {
  code: string;
  source?: string;
  engine?: string;
  severity: string;
  title?: string;
  signal?: string;
  description?: string;
  explanation?: string;
  observed_value?: string | null;
  value?: string | null;
  baseline_value?: string | null;
  baseline?: string | null;
  confidence?: number;
  weight?: number;
  features?: Record<string, any>;
  details?: Record<string, any>;
}

interface EvidenceCardProps {
  evidence: EvidenceCardData;
  className?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, className }) => {
  const [expanded, setExpanded] = useState(false);

  const title = evidence.title || evidence.signal || "Forensic Anomaly";
  const desc = evidence.description || evidence.explanation || "";
  const observed = evidence.observed_value || evidence.value;
  const base = evidence.baseline_value || evidence.baseline;
  const source = evidence.source || evidence.engine || "ML";
  const details = evidence.features || evidence.details || {};

  const getSourceIcon = (src: string) => {
    const s = src.toLowerCase();
    if (s.includes("net") || s.includes("graph")) return <Network className="w-3.5 h-3.5" />;
    if (s.includes("wallet") || s.includes("ato")) return <Fingerprint className="w-3.5 h-3.5" />;
    if (s.includes("beh") || s.includes("anom")) return <Database className="w-3.5 h-3.5" />;
    return <Cpu className="w-3.5 h-3.5" />;
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            {evidence.code}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {getSourceIcon(source)}
            {source}
          </span>
        </div>

        <RiskBadge level={evidence.severity} />
      </div>

      <div className="mt-2.5">
        <h4 className="text-sm font-semibold text-slate-900 leading-tight">
          {title}
        </h4>
        {desc && (
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            {desc}
          </p>
        )}
      </div>

      {(observed !== undefined || base !== undefined) && (
        <div className="mt-3 grid grid-cols-2 gap-2 p-2 rounded bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Observed Value
            </span>
            <span className="font-mono font-bold text-slate-900 truncate block">
              {observed ?? "N/A"}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Historical Baseline
            </span>
            <span className="font-mono text-slate-600 truncate block">
              {base ?? "N/A"}
            </span>
          </div>
        </div>
      )}

      {Object.keys(details).length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <span>{expanded ? "Hide Forensic Parameters" : "View Forensic Parameters"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <pre className="mt-2 p-2 rounded bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-40">
              {JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
