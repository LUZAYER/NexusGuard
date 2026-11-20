'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import PricingCards from '@/components/landing/PricingCards'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'

// Note: metadata must be in a server component; kept here for reference
// export const metadata: Metadata = { ... }

const comparisonRows = [
  { feature: 'Events per month', starter: '1M', pro: '10M', enterprise: 'Unlimited' },
  { feature: 'Data retention', starter: '7 days', pro: '90 days', enterprise: 'Unlimited' },
  { feature: 'Session replay', starter: '100/mo', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Distributed tracing', starter: 'Basic', pro: 'Full', enterprise: 'Full + custom' },
  { feature: 'Cost analytics', starter: false, pro: true, enterprise: true },
  { feature: 'Prompt versioning', starter: false, pro: true, enterprise: true },
  { feature: 'Eval suites', starter: '3 suites', pro: 'Unlimited', enterprise: 'Unlimited + custom' },
  { feature: 'Circuit breakers', starter: false, pro: true, enterprise: true },
  { feature: 'Agent registry', starter: '5 agents', pro: '100 agents', enterprise: 'Unlimited' },
  { feature: 'Real-time alerts', starter: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Governance & RBAC', starter: false, pro: 'Basic', enterprise: 'Advanced' },
  { feature: 'SSO / SAML', starter: false, pro: false, enterprise: true },
  { feature: 'Audit logs', starter: false, pro: '30 days', enterprise: 'Unlimited' },
  { feature: 'API rate limit', starter: '1k req/min', pro: '10k req/min', enterprise: 'Unlimited' },
  { feature: 'Webhooks', starter: '1', pro: '20', enterprise: 'Unlimited' },
  { feature: 'Team seats', starter: '1', pro: '10', enterprise: 'Unlimited' },
  { feature: 'Support', starter: 'Community', pro: 'Priority email', enterprise: 'Dedicated CSM' },
  { feature: 'SLA', starter: false, pro: '99.9%', enterprise: 'Custom' },
  { feature: 'On-prem / VPC', starter: false, pro: false, enterprise: true },
  { feature: 'SOC2 Type II report', starter: false, pro: false, enterprise: true },
  { feature: 'Custom integrations', starter: false, pro: false, enterprise: true },
]

const faqs = [
  {
    q: 'What counts as an "event"?',
    a: 'An event is any unit of observability data: an LLM call, a tool invocation, a span start/end, a custom log entry, or a cost record. We designed the event model to be generous — most agent turns generate 5–15 events.',
  },
  {
    q: 'Can I use NexusGuard with my existing OpenTelemetry setup?',
    a: 'Yes. NexusGuard is natively OTel-compatible. Send your OTLP data directly to our collector endpoint, or use our SDK which wraps your agents and emits standard OTel spans automatically.',
  },
  {
    q: 'What happens if I exceed my monthly event limit?',
    a: 'On the Starter plan, events are dropped after the limit. On Pro, we send you an alert and you can choose to upgrade or enable auto-sampling. We never cut access to your existing data.',
  },
  {
    q: 'Is there a free trial for the Pro plan?',
    a: "Yes — 14-day full Pro trial, no credit card required. All features unlocked, 10M events included. After the trial you can keep using the Starter plan for free.",
  },
  {
    q: 'How does the annual discount work?',
    a: "Pay for 12 months upfront and get 2 months free (20% discount). You can switch from monthly to annual at any time and we'll prorate the difference.",
  },
  {
    q: 'Do you support self-hosted / on-premises deployment?',
    a: 'Yes, via our Enterprise plan. We offer Docker Compose, Helm charts, and a fully managed VPC deployment option. Contact our sales team for details.',
  },
  {
    q: 'What LLM providers and agent frameworks do you support?',
    a: 'We support 400+ LLMs via OpenAI-compatible APIs and native integrations. For frameworks: LangChain, LangGraph, CrewAI, AutoGen, LlamaIndex, OpenAI Agents SDK, Mistral, and 8+ more.',
  },
  {
    q: 'How is my data secured?',
    a: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC2 Type II certified, GDPR compliant, and offer data residency options (US, EU, AP) on Enterprise.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-medium text-white md:text-base">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-indigo-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-slate-400">{a}</p>}
    </div>
  )
}

function Cell({ val }: { val: string | boolean }) {
  if (val === true) return <Check className="mx-auto h-4 w-4 text-cyan-400" />
  if (val === false) return <X className="mx-auto h-4 w-4 text-slate-600" />
  return <span className="text-sm text-slate-300">{val}</span>
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="mb-4 text-5xl font-black text-white md:text-6xl">
            Simple,{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              transparent pricing
            </span>
          </h1>
          <p className="mb-8 text-lg text-slate-400">
            Start free and scale as your AI platform grows.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                !annual ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                annual ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-20">
          <PricingCards annual={annual} />
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
          <h2 className="mb-8 text-2xl font-bold text-white">Full feature comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                    Starter
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-400">
                    Pro
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                  >
                    <td className="px-6 py-3.5 text-sm text-slate-300">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center">
                      <Cell val={row.starter} />
                    </td>
                    <td className="bg-indigo-500/5 px-6 py-3.5 text-center">
                      <Cell val={row.pro} />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <Cell val={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-2xl font-bold text-white">Frequently asked questions</h2>
          <div>
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 to-slate-900 p-10 text-center">
          <h3 className="mb-3 text-2xl font-bold text-white">Still have questions?</h3>
          <p className="mb-6 text-slate-400">
            Talk to our team. We&apos;ll help you find the right plan.
          </p>
          <a
            href="/contact"
            className="inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-8 py-3 font-semibold text-white shadow-xl shadow-indigo-500/30 hover:from-indigo-400 hover:to-cyan-400"
          >
            Contact sales
          </a>
        </div>
      </div>
    </div>
  )
}
