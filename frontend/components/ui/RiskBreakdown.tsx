import React from "react";
import { RiskScoreBar } from "./RiskScoreBar";
import { RiskBadge } from "./RiskBadge";
import { getRiskLevel } from "@/lib/utils";

interface RiskBreakdownProps {
  overallScore: number;
  overallLevel: string;
  transactionRisk: number;
  behaviorRisk: number;
  atoRisk: number;
  networkRisk?: number | null;
  className?: string;
}

export const RiskBreakdown: React.FC<RiskBreakdownProps> = ({
  overallScore,
  overallLevel,
  transactionRisk,
  behaviorRisk,
  atoRisk,
  networkRisk = 0,
  className,
}) => {
  const engines = [
    {
      name: "Transaction Risk",
      algorithm: "LightGBM + TreeSHAP",
      weight: "30%",
      score: transactionRisk,
      description: "Amount deviation, velocity spikes & immediate signals",
    },
    {
      name: "Behavioral Anomaly",
      algorithm: "IsolationForest",
      weight: "25%",
      score: behaviorRisk,
      description: "Deviation from customer 30-day baseline profile",
    },
    {
      name: "WalletGuard ATO",
      algorithm: "ATO LightGBM + 10 Rules",
      weight: "30%",
      score: atoRisk,
      description: "PIN failures, unfamiliar device, SIM swap & rapid drain",
    },
    {
      name: "Network & Graph",
      algorithm: "NetworkX Topology",
      weight: "15%",
      score: networkRisk ?? 0,
      description: "Shared device graph, PageRank & mule ring clustering",
    },
  ];

  const corroboratingCount = engines.filter((e) => e.score >= 70).length;

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-5 shadow-xs ${className || ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
            Ensemble Decision
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-3xl font-extrabold text-slate-900">
              {(overallScore ?? 0).toFixed(1)}
            </span>
            <RiskBadge level={overallLevel} />
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Corroboration
          </span>
          <div className="mt-1 flex items-center justify-end gap-1.5">
            <span
              className={`font-mono text-sm font-bold px-2 py-0.5 rounded border ${
                corroboratingCount >= 2
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {corroboratingCount} of 4 Engines High
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {engines.map((eng) => (
          <div
            key={eng.name}
            className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">{eng.name}</span>
                <span className="text-slate-500 font-mono text-[11px]">wt: {eng.weight}</span>
              </div>
              <div className="text-[11px] text-slate-500">{eng.algorithm}</div>
            </div>

            <div className="mt-3">
              <RiskScoreBar score={eng.score} size="sm" showLabels={true} />
            </div>

            <p className="mt-2 text-[11px] text-slate-500 truncate">
              {eng.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
