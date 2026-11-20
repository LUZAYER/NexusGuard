'use client'

import Link from 'next/link'
import { Check, ShieldCheck, Building2, Sparkles, ArrowRight } from 'lucide-react'

export interface PricingTier {
  name: string
  price: string
  annualPrice?: string
  description: string
  events: string
  features: string[]
  cta: string
  ctaHref: string
  highlighted?: boolean
  badge?: string
  icon: React.ReactNode
}

const tiers: PricingTier[] = [
  {
    name: 'Sandbox & Pilot',
    price: 'Free',
    description: 'Self-contained environment for evaluation, benchmarking & research',
    events: '212,749 Pre-Seeded Txns',
    icon: <Sparkles className="h-5 w-5" />,
    features: [
      '212,749 evaluated transactions dataset',
      'Dual ML: LightGBM + Isolation Forest',
      'NetworkX 4-hop mule detection graph',
      'Behavioral biometrics ATO simulator',
      'Full access to /docs & AI Depth specs',
      'Local Ollama / vLLM integration',
      'Immutable audit trail recording',
    ],
    cta: 'Explore Sandbox Free',
    ctaHref: '/dashboard',
  },
  {
    name: 'Digital Bank / FinTech',
    price: '$499',
    annualPrice: '$399',
    description: 'Production-ready intelligence for digital wallets and neo-banks',
    events: 'Up to 5M txns / month',
    icon: <ShieldCheck className="h-5 w-5" />,
    highlighted: true,
    badge: 'Standard Production',
    features: [
      '5 Million transactions per month',
      'Sub-25ms real-time sliding windows',
      'Visual Rule Engine with Shadow Mode backtesting',
      'Millisecond keystroke & device biometrics',
      'Autonomous LangGraph AI Case Dossiers',
      '1-Click automated regulatory SAR synthesis',
      'AgentOps circuit breakers ($0.25 cap)',
      '99.9% Uptime Service Level Agreement',
    ],
    cta: 'Start FinTech Deployment',
    ctaHref: '/dashboard',
  },
  {
    name: 'Enterprise & Sovereign MFS',
    price: 'Custom',
    description: 'Institutional scale with air-gapped on-premise sovereign execution',
    events: 'Unlimited transactions',
    icon: <Building2 className="h-5 w-5" />,
    features: [
      'Unlimited throughput (15,000+ TPS)',
      'Air-gapped on-premise deployment (Qwen / Llama)',
      'Zero external data egress for strict PII protection',
      'Custom Central Bank / FATF SAR formatters',
      'Dedicated Graph Neural Network cluster',
      'Federated learning multi-institution consortium',
      'Role-based multi-tenant isolation',
      '24/7 dedicated financial crime engineering support',
    ],
    cta: 'Contact Banking Solutions',
    ctaHref: '/about',
  },
]

interface PricingCardsProps {
  annual?: boolean
  compact?: boolean
}

export default function PricingCards({ annual = false, compact = false }: PricingCardsProps) {
  return (
    <div className={`grid gap-6 ${compact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 lg:grid-cols-3'}`}>
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`relative flex flex-col rounded-2xl border p-7 transition-all ${
            tier.highlighted
              ? 'border-[var(--accent-primary)] bg-[var(--card-bg)] shadow-xl'
              : 'border-[var(--card-border)] obsidian-card hover:border-[var(--card-border-hover)]'
          }`}
        >
          {tier.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-[var(--accent-primary)] px-3.5 py-0.5 text-[10px] font-bold text-white shadow-xs uppercase tracking-wider font-mono">
                {tier.badge}
              </span>
            </div>
          )}

          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                tier.highlighted
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/30'
                  : 'bg-[var(--surface-hover)] text-[var(--foreground-muted)] border-[var(--card-border)]'
              }`}
            >
              {tier.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">{tier.name}</h3>
              <p className="text-[11px] font-mono text-[var(--accent-primary)]">{tier.events}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-[var(--foreground)]">
                {tier.price}
              </span>
              {tier.price !== 'Free' && tier.price !== 'Custom' && (
                <span className="text-xs text-[var(--foreground-muted)]">/ month</span>
              )}
            </div>
            <p className="text-xs text-[var(--foreground-muted)] mt-1 leading-relaxed">
              {tier.description}
            </p>
          </div>

          <div className="my-5 border-t border-[var(--card-border)]" />

          <ul className="mb-8 space-y-2.5 flex-1">
            {tier.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-xs text-[var(--foreground-muted)]">
                <Check className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <span className="leading-snug">{feat}</span>
              </li>
            ))}
          </ul>

          <Link
            href={tier.ctaHref}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition-all ${
              tier.highlighted
                ? 'bg-[var(--accent-primary)] text-white hover:opacity-90 shadow-md'
                : 'border border-[var(--card-border)] obsidian-card text-[var(--foreground)] hover:border-[var(--card-border-hover)]'
            }`}
          >
            <span>{tier.cta}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ))}
    </div>
  )
}