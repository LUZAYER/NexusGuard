import Link from 'next/link';
import Image from 'next/image';
import { ShieldAlert, Globe, MessageSquare, Terminal, Code2 } from 'lucide-react';

const FOOTER_COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'SOC Command Center', href: '/dashboard' },
      { label: 'Transaction Surveillance', href: '/monitoring/transactions' },
      { label: 'Graph Forensics', href: '/intelligence/network' },
      { label: 'WalletGuard (ATO)', href: '/monitoring/walletguard' },
      { label: 'Autonomous AI Cases', href: '/investigations/cases' },
    ],
  },
  {
    title: 'Architecture',
    links: [
      { label: 'Sub-25ms Dual ML', href: '/models' },
      { label: 'Shadow Backtesting', href: '/governance' },
      { label: 'AgentOps Observability', href: '/agentops/traces' },
      { label: 'FATF & BFIU Standards', href: '/docs' },
      { label: 'Model Context Protocol', href: '/docs' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'System Documentation', href: '/docs' },
      { label: 'Architecture Specifications', href: '/docs' },
      { label: 'Controlled ATO Demo', href: '/monitoring/transactions/TXN-982173' },
      { label: 'API Reference', href: 'http://localhost:8000/docs' },
      { label: 'Health Status', href: 'http://localhost:8000/api/v1/system/health' },
    ],
  },
  {
    title: 'Institutional',
    links: [
      { label: 'About Platform', href: '/about' },
      { label: 'Pricing Plans', href: '/pricing' },
      { label: 'Air-Gapped Sovereign Ops', href: '/about' },
      { label: 'Audit Trail Ledger', href: '/admin/audit' },
      { label: 'Contact Solutions', href: '/about' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand info */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] p-1 shadow-xs group-hover:border-[var(--accent-primary)] transition-colors">
                <Image
                  src="/logo.png"
                  alt="NexusGuard Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="font-serif-luxury font-normal text-2xl tracking-wider text-[var(--foreground)]">
                NexusGuard
              </span>
            </Link>
            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              Financial crime intelligence operating system. Sub-25ms ML scoring, multi-hop graph forensics, and autonomous AI dossiers across 212,749 transactions.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--foreground-muted)] mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SOC Live · v4.0</span>
            </div>
          </div>

          {/* Links */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-4 font-mono">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-8 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--foreground-muted)]">
          <div>
            © {new Date().getFullYear()} NexusGuard Intelligence Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Bangladesh Bank MFS Guidelines</span>
            <span>FATF Recommendations 10 &amp; 16</span>
          </div>
        </div>
      </div>
    </footer>
  );
}