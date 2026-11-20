'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Activity,
  GitBranch,
  Bot,
  FlaskConical,
  Database,
  FileText,
  CheckSquare,
  Bell,
  DollarSign,
  Cpu,
  Plug,
  Shield,
  Eye,
  Settings,
  Users,
  Key,
  CreditCard,
  ChevronDown,
  ChevronRight,
  X,
  Hexagon,
  ShieldAlert,
  Layers,
  Lock,
  UserCheck,
  Languages,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  labelBn?: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: 'red' | 'indigo' | 'emerald';
}

interface NavGroup {
  title: string;
  titleBn?: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

// ── Nav definition ────────────────────────────────────────────────────────────

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    titleBn: 'সাধারণ তথ্য',
    defaultOpen: true,
    items: [
      { label: 'Dashboard', labelBn: 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'FinTech Trust & FraudShield',
    titleBn: 'ফিনটেক নজরদারি ও ফ্রডশিল্ড',
    defaultOpen: true,
    items: [
      { label: 'Transactions Stream', labelBn: 'লেনদেন স্ট্রিম', href: '/monitoring/transactions', icon: Activity },
      { label: 'WalletGuard ATO', labelBn: 'ওয়ালেটগার্ড এটিও', href: '/intelligence/walletguard', icon: ShieldAlert, badge: '94.3', badgeColor: 'red' },
      { label: 'ScamShield Network', labelBn: 'মিউল নেটওয়ার্ক গ্রাফ', href: '/intelligence/network', icon: GitBranch },
      { label: 'Cases & Workflows', labelBn: 'মামলা ও তদন্ত', href: '/investigations/cases', icon: CheckSquare, badge: 'Active', badgeColor: 'indigo' },
      { label: 'Model Governance', labelBn: 'মডেল ও ড্রিফট', href: '/analytics/models', icon: Cpu },
    ],
  },
  {
    title: 'AgentOps & Observability',
    titleBn: 'এজেন্টঅপ্স ও নজরদারি',
    defaultOpen: true,
    items: [
      { label: 'Agent Sessions', labelBn: 'এজেন্ট সেশনস', href: '/sessions', icon: Activity },
      { label: 'Distributed Traces', labelBn: 'ডিস্ট্রিবিউটেড ট্রেস', href: '/traces', icon: GitBranch },
      { label: 'Autonomous Agents', labelBn: 'এআই এজেন্টস', href: '/agents', icon: Bot },
      { label: 'Service Map (OTel)', labelBn: 'সার্ভিস ম্যাপ', href: '/observability', icon: Eye },
    ],
  },
  {
    title: 'Developer & Evaluation',
    titleBn: 'ডেভেলপার ও পরীক্ষণ',
    defaultOpen: false,
    items: [
      { label: 'Prompt Playground', labelBn: 'প্রম্পট প্লেগ্রাউন্ড', href: '/playground', icon: FlaskConical },
      { label: 'Datasets Catalog', labelBn: 'ডেটাবেস ক্যাটালগ', href: '/datasets', icon: Database },
      { label: 'Prompt Versioning', labelBn: 'প্রম্পট ভার্সনিং', href: '/prompts', icon: FileText },
      { label: 'Evaluation Suites', labelBn: 'ইভ্যালুয়েশন স্যুটস', href: '/evals', icon: CheckSquare },
    ],
  },
  {
    title: 'Operations & Platform',
    titleBn: 'অপারেশনস ও প্ল্যাটফর্ম',
    defaultOpen: false,
    items: [
      { label: 'Circuit Breakers', labelBn: 'সার্কিট ব্রেকার', href: '/alerts', icon: Bell, badge: '3', badgeColor: 'red' },
      { label: 'Token Costs', labelBn: 'টোকেন খরচ', href: '/costs', icon: DollarSign },
      { label: 'Model Registry', labelBn: 'মডেল রেজিস্ট্রি', href: '/models', icon: Cpu },
      { label: 'Integrations & MCP', labelBn: 'ইন্টিগ্রেশন ও এমসিপি', href: '/integrations', icon: Plug },
      { label: 'NIST AI Governance', labelBn: 'এনআইএসটি সুশাসন', href: '/governance', icon: Shield },
    ],
  },
  {
    title: 'Compliance & Database',
    titleBn: 'কমপ্লায়েন্স ও ডেটাবেস',
    defaultOpen: false,
    items: [
      { label: 'Signed Audit Ledger', labelBn: 'স্বাক্ষরিত অডিট লেজার', href: '/admin/audit', icon: Lock },
      { label: 'Database Explorer', labelBn: 'ডেটাবেস এক্সপ্লোরার', href: '/admin/database', icon: Database },
      { label: 'System Operators', labelBn: 'সিস্টেম অপারেটর', href: '/admin/users', icon: Users },
    ],
  },
  {
    title: 'Documentation & Architecture',
    titleBn: 'নথিপত্র ও আর্কিটেকচার',
    defaultOpen: false,
    items: [
      { label: 'System Architecture', labelBn: 'সিস্টেম আর্কিটেকচার', href: '/docs', icon: FileText },
    ],
  },
  {
    title: 'Account & Settings',
    titleBn: 'অ্যাকাউন্ট ও সেটিংস',
    defaultOpen: false,
    items: [
      { label: 'Operator Profile', labelBn: 'অপারেটর প্রোফাইল', href: '/profile', icon: UserCheck },
      { label: 'Settings', labelBn: 'সেটিংস', href: '/settings', icon: Settings },
      { label: 'Team', labelBn: 'টিম', href: '/settings/team', icon: Users },
      { label: 'API Keys', labelBn: 'এপিআই চাবি', href: '/settings/api-keys', icon: Key },
      { label: 'Billing', labelBn: 'বিলিং', href: '/settings/billing', icon: CreditCard },
    ],
  },
];

// ── NavGroup component ────────────────────────────────────────────────────────

function SidebarGroup({
  group,
  pathname,
  lang,
}: {
  group: NavGroup;
  pathname: string;
  lang: string;
}) {
  const [open, setOpen] = useState(group.defaultOpen ?? false);

  return (
    <div>
      <button
        onClick={() => setOpen((x) => !x)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-400 transition-colors"
      >
        <span>{lang === 'bn' && group.titleBn ? group.titleBn : group.title}</span>
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>

      {open && (
        <ul className="mt-0.5 space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const badgeBg =
              item.badgeColor === 'red'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : item.badgeColor === 'emerald'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                    active
                      ? 'bg-indigo-500/15 text-indigo-300 font-semibold shadow-xs border border-indigo-500/20'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  )}
                >
                  <Icon
                    className={clsx(
                      'h-4 w-4 shrink-0',
                      active ? 'text-indigo-400' : 'text-slate-500'
                    )}
                  />
                  <span className="flex-1 truncate">
                    {lang === 'bn' && item.labelBn ? item.labelBn : item.label}
                  </span>
                  {item.badge && (
                    <span className={clsx('rounded-full px-1.5 py-0.5 text-[9px] font-bold', badgeBg)}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();

  const content = (
    <div className="flex h-full flex-col bg-[var(--background-secondary)] border-r border-[var(--card-border)] transition-colors">
      {/* Brand Header */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--card-border)] px-4">
        <Link href="/" className="flex items-center gap-2.5" title="NexusGuard Homepage">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] p-1 shadow-xs shrink-0">
            <Image
              src="/logo.png"
              alt="NexusGuard Logo"
              width={26}
              height={26}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-[var(--foreground)]">
                Nexus<span className="text-[var(--accent-primary)]">Guard</span>
              </span>
              <span className="rounded bg-[var(--accent-primary)]/15 px-1 py-0.2 text-[9px] font-bold text-[var(--accent-primary)] border border-[var(--accent-primary)]/25">
                PRO
              </span>
            </div>
            <p className="text-[9px] font-medium text-[var(--foreground-muted)]">MFS Trust & AgentOps</p>
          </div>
        </Link>
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="ml-auto text-slate-500 hover:text-slate-300 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
        {navGroups.map((group) => (
          <SidebarGroup
            key={group.title}
            group={group}
            pathname={pathname}
            lang={lang}
          />
        ))}
      </nav>

      {/* Operator profile footer */}
      <div className="shrink-0 border-t border-[var(--card-border)] p-3 space-y-2">
        <ThemeToggle variant="full" />
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-slate-800/50 transition-colors"
        >
          {/* Avatar with initials */}
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
            {user?.avatar || (user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'OP')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-slate-200">
              {user?.full_name || 'Reyazul Islam'}
            </div>
            <div className="truncate text-[10px] text-slate-400">
              {user?.role_display_name || user?.role || 'Administrator'}
            </div>
          </div>
          <UserCheck className="h-4 w-4 shrink-0 text-slate-500 hover:text-indigo-400 transition-colors" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 shrink-0">
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            {content}
          </aside>
        </>
      )}
    </>
  );
}
