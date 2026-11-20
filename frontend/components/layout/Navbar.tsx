'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ShieldAlert, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const PLATFORM_SUBMENU = [
  { label: 'Executive SOC Command', href: '/dashboard', desc: 'Real-time financial crime metrics & KPIs' },
  { label: 'Live Streaming Radar', href: '/monitoring/transactions', desc: 'Sub-25ms transaction risk surveillance' },
  { label: 'Graph Link Intelligence', href: '/intelligence/network', desc: 'Money mule & circular ring forensics' },
  { label: 'Behavioral Biometrics (ATO)', href: '/monitoring/walletguard', desc: 'Keystroke & mouse trajectory deviations' },
  { label: 'Autonomous AI Cases & SAR', href: '/investigations/cases', desc: 'Evidence dossiers & regulatory reports' },
  { label: 'No-Code Rules & Shadow Mode', href: '/governance', desc: 'Backtest logic against historical txns' },
  { label: 'MLOps & SHAP Governance', href: '/models', desc: 'Feature attribution & drift monitoring' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[var(--card-bg)]/90 backdrop-blur-xl border-b border-[var(--card-border)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] p-1 group-hover:scale-105 transition-transform shadow-xs shrink-0">
              <Image
                src="/logo.png"
                alt="NexusGuard Logo"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif-luxury font-normal tracking-wide text-[var(--foreground)]">
                NexusGuard
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[var(--foreground-muted)] font-mono -mt-1">Financial Intelligence</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Platform Dropdown */}
            <div className="relative" onMouseLeave={() => setPlatformOpen(false)}>
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--surface-hover)]"
                onMouseEnter={() => setPlatformOpen(true)}
                onClick={() => setPlatformOpen(!platformOpen)}
              >
                Platform Modules
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {platformOpen && (
                <div 
                  className="absolute top-full left-0 w-80 p-2 mt-1 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl backdrop-blur-xl grid gap-1 z-50"
                  onMouseEnter={() => setPlatformOpen(true)}
                  onMouseLeave={() => setPlatformOpen(false)}
                >
                  {PLATFORM_SUBMENU.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex flex-col gap-0.5 px-3 py-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors group/item"
                    >
                      <span className="text-xs font-bold text-[var(--foreground)] group-hover/item:text-[var(--accent-primary)] transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-[var(--foreground-muted)]">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/docs"
              className="px-3 py-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--surface-hover)]"
            >
              Live /docs
            </Link>

            <Link
              href="/pricing"
              className="px-3 py-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--surface-hover)]"
            >
              Pricing
            </Link>

            <Link
              href="/about"
              className="px-3 py-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--surface-hover)]"
            >
              About
            </Link>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle variant="icon" />
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 rounded-xl shadow-xs transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              <span>Open SOC Dashboard</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto border-t border-white/10">
          <nav className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">Operational Platform</span>
            {PLATFORM_SUBMENU.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-2 pt-2">
              <Link
                href="/docs"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-slate-200"
              >
                Live /docs
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-slate-200"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-slate-200"
              >
                About
              </Link>
              <div className="mt-4 flex flex-col gap-2">
                <div className="pb-1">
                  <ThemeToggle variant="full" />
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-cyan-600 text-white font-bold text-sm"
                >
                  Open SOC Dashboard
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 text-sm text-slate-400"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
