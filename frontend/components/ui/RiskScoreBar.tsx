import React from "react";
import { cn, getRiskLevel } from "@/lib/utils";

interface RiskScoreBarProps {
  score: number;
  showLabels?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const RiskScoreBar: React.FC<RiskScoreBarProps> = ({
  score,
  showLabels = true,
  className,
  size = "md",
}) => {
  const safeScore = typeof score === "number" && !isNaN(score) ? score : 0;
  const level = getRiskLevel(safeScore);
  const clamped = Math.min(Math.max(safeScore, 0), 100);

  const getBarColor = (lvl: string) => {
    switch (lvl) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "moderate":
        return "bg-amber-500";
      case "low":
      default:
        return "bg-emerald-500";
    }
  };

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  return (
    <div className={cn("w-full flex flex-col gap-1", className)}>
      {showLabels && (
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700 uppercase tracking-wider">
            Risk Score
          </span>
          <span className="font-mono font-bold text-slate-900">
            {clamped.toFixed(1)} <span className="text-slate-400 font-normal">/ 100</span>
          </span>
        </div>
      )}
      <div className={cn("w-full bg-slate-200 rounded-full overflow-hidden flex", heights[size])}>
        <div
          className={cn("transition-all duration-500 rounded-full", getBarColor(level))}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
