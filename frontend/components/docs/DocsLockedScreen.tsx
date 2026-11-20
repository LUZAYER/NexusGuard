'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { DocsAccessConfig } from './DocsTypes';

interface DocsLockedScreenProps {
  config: DocsAccessConfig;
  onAdminUnlock: () => void;
  isAdmin: boolean;
}

export function DocsLockedScreen({ config, onAdminUnlock, isAdmin }: DocsLockedScreenProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(config.startDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.startDate]);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center">
        {/* Brand Header */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] p-1.5 shadow-md">
            <Image
              src="/logo.png"
              alt="NexusGuard Logo"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-serif-luxury font-normal text-3xl tracking-tight text-[var(--foreground)]">
            NexusGuard
          </span>
        </Link>

        {/* Lock Pill */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Restricted Evaluation Showcase</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-[var(--foreground)]">
          Documentation Window Scheduled
        </h1>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-md mx-auto leading-relaxed mb-8">
          The NexusGuard YC Pitch Deck and Deep Technical Whitepaper are restricted to scheduled evaluation windows and verified institutional partners.
        </p>

        {/* Schedule Info Box */}
        <div className="obsidian-card rounded-2xl border border-[var(--card-border)] p-6 mb-8 text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
              <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Publishing Window</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold">
              SCHEDULE CONFIGURED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-[var(--foreground-muted)] block">Window Opens</span>
              <span className="font-semibold text-[var(--foreground)] mt-0.5 block">
                {formatDate(config.startDate)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-[var(--foreground-muted)] block">Window Closes</span>
              <span className="font-semibold text-[var(--foreground)] mt-0.5 block">
                {formatDate(config.endDate)}
              </span>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="pt-2">
            <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--foreground-muted)] block mb-2">
              Time Remaining Until Next Window
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Days', val: timeLeft.days },
                { label: 'Hours', val: timeLeft.hours },
                { label: 'Mins', val: timeLeft.minutes },
                { label: 'Secs', val: timeLeft.seconds },
              ].map((item) => (
                <div key={item.label} className="bg-[var(--surface-hover)] rounded-xl p-2.5 border border-[var(--card-border)]">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--foreground)]">
                    {String(item.val).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] font-mono text-[var(--foreground-muted)] mt-0.5">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Immediate Evaluator / Judge Access Bypass */}
        <div className="rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 p-5 text-left mb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-primary)]">
            <Sparkles className="w-4 h-4" />
            <span>Judge & Institutional Evaluator Override</span>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
            If you are an authorized hackathon judge, investor, or security auditor conducting a live system review, you may unlock instant preview access below:
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={onAdminUnlock}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-white" />
              <span>Instant Judge / Admin Unlock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] obsidian-card px-4 py-2.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <span>Operator Login</span>
            </Link>
          </div>
        </div>

        {/* Return to homepage */}
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--foreground-muted)]">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            ← Return to Homepage
          </Link>
          <span>·</span>
          <Link href="/dashboard" className="hover:text-[var(--foreground)] transition-colors">
            Live SOC Dashboard
          </Link>
          <span>·</span>
          <a href="mailto:invest@nexusguard.io" className="hover:text-[var(--foreground)] transition-colors">
            Request Private Access
          </a>
        </div>
      </div>
    </div>
  );
}
