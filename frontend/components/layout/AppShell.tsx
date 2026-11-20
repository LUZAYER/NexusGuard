'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  Bell,
  Search,
  ChevronRight,
  Menu,
  X,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Zap,
  Globe,
  ShieldCheck,
  Check,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth, PRESET_USERS } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

function useBreadcrumbs(): BreadcrumbSegment[] {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbSegment[] = [{ label: 'NexusGuard', href: '/dashboard' }];
  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const label = seg
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: path });
  }
  return crumbs;
}

interface AlertItem {
  id: string;
  title: string;
  subtitle: string;
  severity: 'critical' | 'high' | 'medium';
  time: string;
  href: string;
}

const mockAlerts: AlertItem[] = [
  {
    id: '1',
    title: 'Critical ATO Alert: Arif Hossain (TXN-982173)',
    subtitle: '৳ 18,700 transfer, new device DEV-8821 at 02:13 AM (94.3 Risk)',
    severity: 'critical',
    time: '2m ago',
    href: '/monitoring/transactions/TXN-982173',
  },
  {
    id: '2',
    title: 'Mule Ring Detected: Layering Hub WALLET-X',
    subtitle: 'Rapid fan-out to 3 mule wallets (৳ 18,300 total flow)',
    severity: 'high',
    time: '14m ago',
    href: '/intelligence/network?target=WALLET-X',
  },
  {
    id: '3',
    title: 'Circuit Breaker: Tool Call Frequency Throttle',
    subtitle: 'Agent FraudInvestigator-V3 tripped 15 calls/min limit',
    severity: 'medium',
    time: '1h ago',
    href: '/alerts',
  },
];

const severityDot: Record<AlertItem['severity'], string> = {
  critical: 'bg-red-500 ring-2 ring-red-500/20',
  high: 'bg-orange-500 ring-2 ring-orange-500/20',
  medium: 'bg-amber-500 ring-2 ring-amber-500/20',
};

interface AppShellProps {
  onMenuClick?: () => void;
}

export function AppShell({ onMenuClick }: AppShellProps) {
  const router = useRouter();
  const crumbs = useBreadcrumbs();
  const { user, logout, quickLogin } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const [alertsOpen, setAlertsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [operatorSwitchOpen, setOperatorSwitchOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => {
      setAlertsOpen(false);
      setUserMenuOpen(false);
      setOperatorSwitchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    if (q.toUpperCase().startsWith('TXN-')) {
      router.push(`/monitoring/transactions/${q.toUpperCase()}`);
    } else if (q.toUpperCase().startsWith('WAL-') || q.toUpperCase().startsWith('WALLET')) {
      router.push(`/intelligence/network?target=${encodeURIComponent(q.toUpperCase())}`);
    } else {
      router.push(`/monitoring/transactions?search=${encodeURIComponent(q)}`);
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleOperatorSwitch = (preset: 'reyazul' | 'sadia' | 'badol' | 'rafi') => {
    quickLogin(preset);
    setOperatorSwitchOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--card-border)] bg-[var(--card-bg)]/85 px-4 backdrop-blur-xl z-30 transition-colors">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="text-slate-400 hover:text-slate-200 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      <nav className="flex min-w-0 flex-1 items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href ?? i}>
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-700" />}
            {crumb.href && i < crumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="truncate text-slate-500 hover:text-slate-300 transition-colors text-xs md:text-sm"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-slate-200 text-xs md:text-sm">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right-side controls */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-lg border border-indigo-500/50 bg-slate-900 px-3 py-1.5 shadow-lg shadow-indigo-500/10">
              <Search className="h-3.5 w-3.5 text-indigo-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="TXN-982173, WALLET-X, Arif..."
                className="w-48 md:w-64 bg-transparent text-xs md:text-sm text-slate-200 placeholder:text-slate-500 outline-none"
              />
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                <X className="h-3.5 w-3.5 text-slate-500 hover:text-slate-300" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Search transactions, wallets, traces..."
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Theme Toggle with Circular Wipe Transition */}
        <ThemeToggle variant="pill" />

        {/* Language Switcher Toggle */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setLang('en')}
            className={clsx(
              'px-2 py-1 rounded transition-colors',
              lang === 'en'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            )}
            title="English"
          >
            EN
          </button>
          <button
            onClick={() => setLang('bn')}
            className={clsx(
              'px-2 py-1 rounded transition-colors',
              lang === 'bn'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            )}
            title="বাংলা (Bengali)"
          >
            বাংলা
          </button>
        </div>

        {/* Live SOC Status indicator */}
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 md:flex">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
            {lang === 'bn' ? 'সক্রিয় মিশন কন্ট্রোল' : 'SOC LIVE'}
          </span>
        </div>

        {/* Notifications / Alerts Popover */}
        <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setAlertsOpen((x) => !x); setUserMenuOpen(false); setOperatorSwitchOpen(false); }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Active Security Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          {alertsOpen && (
            <div className="absolute right-0 top-10 z-50 w-84 md:w-96 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-1">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {lang === 'bn' ? 'সক্রিয় নিরাপত্তা সতর্কতা' : 'Active Security Alerts'}
                  </span>
                </div>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                  {mockAlerts.length} Critical
                </span>
              </div>
              <ul className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                {mockAlerts.map((alert) => (
                  <li key={alert.id}>
                    <Link
                      href={alert.href}
                      onClick={() => setAlertsOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/60 transition-colors group"
                    >
                      <span className={clsx('mt-1.5 h-2 w-2 shrink-0 rounded-full', severityDot[alert.severity])} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">{alert.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{alert.subtitle}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{alert.time}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-300 mt-1" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-800 px-4 py-2.5 flex justify-between items-center bg-slate-950/40 rounded-b-lg">
                <Link
                  href="/alerts"
                  onClick={() => setAlertsOpen(false)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  {lang === 'bn' ? 'সকল অ্যালার্ট দেখুন →' : 'View all alerts & rules →'}
                </Link>
                <Link
                  href="/monitoring/transactions"
                  onClick={() => setAlertsOpen(false)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  {lang === 'bn' ? 'লেনদেন প্রবাহ' : 'Stream'}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu & Operator Switcher */}
        <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setUserMenuOpen((x) => !x); setAlertsOpen(false); setOperatorSwitchOpen(false); }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-white hover:opacity-90 transition-opacity ring-2 ring-indigo-500/20"
            title="User Account & Switch Operator"
          >
            {user?.avatar || (user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'RI')}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
              {/* Profile Card Header */}
              <div className="border-b border-slate-800 px-4 py-3 bg-slate-950/60 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    {user?.avatar || 'RI'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Reyazul Islam'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email || 'reyazul.islam@nexusops.demo'}</p>
                    <span className="inline-block mt-0.5 rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-indigo-300">
                      {user?.role_display_name || user?.role || 'Administrator'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operator Switcher toggle button */}
              <div className="px-3 pt-2">
                <button
                  onClick={() => setOperatorSwitchOpen((x) => !x)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                    {lang === 'bn' ? 'অপারেটর পরিবর্তন করুন' : 'Switch Active Operator'}
                  </span>
                  <ChevronRight className={clsx('h-3.5 w-3.5 transition-transform', operatorSwitchOpen && 'rotate-90')} />
                </button>
              </div>

              {/* Submenu: Operator Choices */}
              {operatorSwitchOpen && (
                <div className="p-2 space-y-1 bg-slate-950/80 mx-2 mt-1 rounded-lg border border-slate-800">
                  {Object.entries(PRESET_USERS).map(([key, u]) => (
                    <button
                      key={key}
                      onClick={() => handleOperatorSwitch(key as any)}
                      className={clsx(
                        'w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs transition-colors',
                        user?.email === u.email
                          ? 'bg-indigo-600/30 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{u.full_name}</p>
                        <p className="truncate text-[10px] text-slate-500">{u.role_display_name}</p>
                      </div>
                      {user?.email === u.email && (
                        <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation Items */}
              <ul className="p-1 mt-1">
                {[
                  { icon: User, label: lang === 'bn' ? 'অপারেটর প্রোফাইল' : 'Operator Profile', href: '/profile' },
                  { icon: Settings, label: lang === 'bn' ? 'ওয়ার্কস্পেস সেটিংস' : 'Workspace Settings', href: '/settings' },
                  { icon: HelpCircle, label: lang === 'bn' ? 'পিচ ডেক ও নির্দেশিকা' : 'Pitch Deck & Documentation', href: '/docs' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <item.icon className="h-4 w-4 text-slate-500" />
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="mt-1 border-t border-slate-800 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    {lang === 'bn' ? 'লগআউট করুন' : 'Sign out'}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
