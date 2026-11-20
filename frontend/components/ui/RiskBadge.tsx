import React from "react";
import { cn, getRiskBadgeClasses } from "@/lib/utils";

interface RiskBadgeProps {
  level?: string;
  score?: number;
  className?: string;
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  className,
  showDot = true,
}) => {
  const resolvedLevel = level || (score !== undefined ? (score >= 80 ? "critical" : score >= 50 ? "high" : score >= 20 ? "medium" : "low") : "low");
  const styles = getRiskBadgeClasses(resolvedLevel);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border",
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)}
        />
      )}
      <span>{resolvedLevel}</span>
      {typeof score === "number" && !isNaN(score) && (
        <span className="font-mono font-bold ml-1 opacity-90">
          ({score.toFixed(1)})
        </span>
      )}
    </span>
  );
};
