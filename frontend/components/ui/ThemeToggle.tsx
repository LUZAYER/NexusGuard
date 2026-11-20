"use client";

import React from "react";
import { Sun, Moon, Flame } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  variant?: "pill" | "icon" | "full";
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "pill",
  className = "",
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const handleToggleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleTheme(e);
  };

  // 1. Icon variant
  if (variant === "icon") {
    return (
      <button
        onClick={handleToggleClick}
        data-theme-toggle="true"
        title={isDark ? "Switch to Light Mode (Circular Wipe)" : "Switch to Dark Obsidian Mode (Circular Wipe)"}
        className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer obsidian-card ${
          isDark
            ? "border-[var(--card-border)] text-amber-400 hover:border-amber-500/50 hover:bg-white/5"
            : "border-slate-300 bg-white text-slate-800 hover:border-orange-400 hover:bg-orange-50/50 shadow-sm"
        } ${className}`}
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
        )}
      </button>
    );
  }

  // 2. Full variant for sidebar
  if (variant === "full") {
    return (
      <button
        onClick={handleToggleClick}
        data-theme-toggle="true"
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer obsidian-card ${
          isDark
            ? "border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--card-border-hover)]"
            : "border-slate-200 bg-white text-slate-800 hover:border-orange-300 shadow-sm"
        } ${className}`}
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Flame className="w-4 h-4 text-orange-500" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="font-medium text-[11px]">
            {isDark ? "Obsidian Dark" : "Alabaster Light"}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[var(--foreground-muted)] uppercase">
          {isDark ? "DARK" : "LIGHT"}
        </span>
      </button>
    );
  }

  // 3. Default "pill" variant
  return (
    <button
      onClick={handleToggleClick}
      data-theme-toggle="true"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer obsidian-card ${
        isDark
          ? "border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--card-border-hover)]"
          : "border-slate-300 bg-white text-slate-800 hover:border-orange-400 shadow-sm"
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-slate-700" />
        )}
        <span className="font-mono text-[11px] uppercase tracking-wider">
          {isDark ? "Dark" : "Light"}
        </span>
      </div>
    </button>
  );
};
