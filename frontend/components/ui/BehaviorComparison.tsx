import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

export interface ComparisonRow {
  label: string;
  historical_baseline: string;
  current_value: string;
  deviation: string;
  is_anomalous: boolean;
}

interface BehaviorComparisonProps {
  comparisons: ComparisonRow[];
  customerName?: string;
  className?: string;
}

export const BehaviorComparison: React.FC<BehaviorComparisonProps> = ({
  comparisons,
  customerName,
  className,
}) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden ${className || ""}`}>
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Behavioral Profile Comparison
          </h3>
          <p className="text-xs text-slate-500">
            Current event contrasted against 30-day rolling baseline {customerName ? `for ${customerName}` : ""}
          </p>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
          Point-in-Time v1.0
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Behavioral Dimension</th>
              <th className="py-2.5 px-4">Historical Baseline (30d)</th>
              <th className="py-2.5 px-4">Flagged Event</th>
              <th className="py-2.5 px-4">Deviation</th>
              <th className="py-2.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-tabular">
            {comparisons.map((row, idx) => (
              <tr
                key={idx}
                className={row.is_anomalous ? "bg-red-50/40 hover:bg-red-50/60" : "hover:bg-slate-50/80"}
              >
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                  {row.label}
                </td>
                <td className="py-2.5 px-4 text-slate-600 font-mono">
                  {row.historical_baseline}
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                  {row.current_value}
                </td>
                <td className="py-2.5 px-4 font-mono">
                  <span
                    className={
                      row.is_anomalous
                        ? "text-red-600 font-bold"
                        : "text-slate-500 font-medium"
                    }
                  >
                    {row.deviation}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  {row.is_anomalous ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 text-red-600" /> ANOMALY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> NORMAL
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
