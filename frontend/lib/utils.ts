import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "৳0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "৳0.00";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(num)
    .replace("BDT", "৳");
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toISOString().replace("T", " ").substring(0, 19) + " UTC";
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toISOString().substring(11, 19) + " UTC";
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "";
  try {
    const then = typeof dateStr === "string" ? new Date(dateStr).getTime() : dateStr.getTime();
    const now = Date.now();
    const diff = now - then;
    const diffMins = Math.round(diff / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "";
  }
}

export function getRiskLevel(score: number): "critical" | "high" | "moderate" | "low" {
  if (score >= 80) return "critical";
  if (score >= 50) return "high";
  if (score >= 20) return "moderate";
  return "low";
}

export function getRiskBadgeClasses(level: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const norm = level.toLowerCase();
  switch (norm) {
    case "critical":
      return {
        bg: "bg-red-950/60",
        text: "text-red-400",
        border: "border-red-800/80",
        dot: "bg-red-500",
      };
    case "high":
      return {
        bg: "bg-amber-950/60",
        text: "text-amber-400",
        border: "border-amber-800/80",
        dot: "bg-amber-500",
      };
    case "moderate":
      return {
        bg: "bg-yellow-950/60",
        text: "text-yellow-400",
        border: "border-yellow-800/80",
        dot: "bg-yellow-500",
      };
    case "low":
    default:
      return {
        bg: "bg-emerald-950/60",
        text: "text-emerald-400",
        border: "border-emerald-800/80",
        dot: "bg-emerald-500",
      };
  }
}

export function formatNumber(n: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("en-US", opts).format(n);
}

export function formatCurrency(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(n);
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
  return `${Math.floor(ms / 3_600_000)}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}…`;
}
