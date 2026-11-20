import type { Metadata } from 'next'
import { Zap, Shield, Bug, Sparkles, Layers, Bell } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Changelog — NexusGuard',
  description: 'What\'s new in NexusGuard. Product updates, new features, and improvements.',
  openGraph: {
    title: 'Changelog — NexusGuard',
    description: "What's new in NexusGuard. Product updates, new features, and improvements.",
    images: [{ url: '/og-image.png' }],
  },
}

const entries = [
  {
    version: 'v2.4.0',
    date: 'November 18, 2026',
    type: 'feature',
    icon: <Sparkles className="h-4 w-4" />,
    title: 'Prompt Versioning GA + Git-style Diffs',
    color: 'bg-indigo-500',
    changes: [
      'Prompt versioning is now generally available for all plans',
      'New side-by-side diff viewer for prompt versions',
      'Attach eval results directly to prompt versions',
      'API support for headless prompt management (CI/CD integration)',
      'Webhooks on prompt publish/rollback events',
    ],
  },
  {
    version: 'v2.3.1',
    date: 'November 10, 2026',
    type: 'fix',
    icon: <Bug className="h-4 w-4" />,
    title: 'Bug Fixes & Performance',
    color: 'bg-orange-500',
    changes: [
      'Fixed session replay playback stutter on Firefox 128+',
      'Resolved trace correlation issue in multi-tenant environments',
      'Reduced dashboard initial load time by 42%',
      'Fixed cost attribution bug for Claude 3.5 Sonnet pricing',
    ],
  },
  {
    version: 'v2.3.0',
    date: 'October 29, 2026',
    type: 'feature',
    icon: <Shield className="h-4 w-4" />,
    title: 'Enterprise Governance Suite',
    color: 'bg-violet-500',
    changes: [
      'Full RBAC with custom roles and resource-level permissions',
      'Approval workflows for sensitive agent actions',
      'Immutable audit log with SIEM export (Splunk, Datadog)',
      'Policy-as-code with JSON Schema validation',
      'SSO/SAML integration (Okta, Azure AD, Google Workspace)',
    ],
  },
  {
    version: 'v2.2.0',
    date: 'October 14, 2026',
    type: 'feature',
    icon: <Zap className="h-4 w-4" />,
    title: 'Circuit Breakers & Auto-Remediation',
    color: 'bg-red-500',
    changes: [
      'Circuit breakers: halt agents on cost, error rate, or latency thresholds',
      'Auto-remediation: restart, fallback, or alert on circuit open',
      'Dashboard widget for circuit breaker state across all agents',
      'PagerDuty and OpsGenie integration for circuit events',
    ],
  },
  {
    version: 'v2.1.0',
    date: 'September 30, 2026',
    type: 'feature',
    icon: <Layers className="h-4 w-4" />,
    title: 'Multi-Framework SDK v2',
    color: 'bg-cyan-500',
    changes: [
      'Native LangGraph support with subgraph tracing',
      'AutoGen 0.4 compatibility',
      'LlamaIndex Workflows integration',
      'OpenAI Agents SDK beta support',
      'Zero-config instrumentation via OTEL auto-instrumentation',
    ],
  },
  {
    version: 'v2.0.0',
    date: 'September 10, 2026',
    type: 'major',
    icon: <Sparkles className="h-4 w-4" />,
    title: 'NexusGuard 2.0 — Platform Relaunch',
    color: 'bg-gradient-to-r from-indigo-500 to-cyan-500',
    changes: [
      'Complete platform rebuild on Next.js 16 + React 19',
      'New real-time streaming dashboard (sub-100ms latency)',
      'Agent Registry: catalog, version, and deploy agents',
      'Eval Suites: automated quality scoring pipelines',
      'Cost Analytics v2 with per-model, per-team breakdown',
      'New onboarding wizard — instrument in < 5 minutes',
    ],
  },
  {
    version: 'v1.9.2',
    date: 'August 22, 2026',
    type: 'improvement',
    icon: <Bell className="h-4 w-4" />,
    title: 'Alerting Improvements',
    color: 'bg-yellow-500',
    changes: [
      'Alert deduplication to prevent notification storms',
      'Multi-condition alert rules (AND/OR logic)',
      'Slack rich message formatting for alerts',
      'Alert history and acknowledgment workflow',
    ],
  },
  {
    version: 'v1.9.0',
    date: 'August 5, 2026',
    type: 'feature',
    icon: <Layers className="h-4 w-4" />,
    title: 'Session Replay & Time Travel Debugging',
    color: 'bg-green-500',
    changes: [
      'Full session replay for any agent run (scrubber, speed control)',
      'Inspect intermediate state at any point in a run',
      'Share replay links with teammates (with access control)',
      'Export replays as structured JSON for offline analysis',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-24">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-14">
          <h1 className="mb-4 text-5xl font-black text-white">
            What&apos;s{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              new
            </span>
          </h1>
          <p className="text-lg text-slate-400">
            New features, improvements, and fixes — updated every sprint.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-indigo-500/50 via-white/10 to-transparent" />

          <div className="space-y-10">
            {entries.map((entry) => (
              <div key={entry.version} className="relative pl-12">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 flex h-9 w-9 items-center justify-center rounded-full text-white ${entry.color.startsWith('bg-gradient') ? entry.color : entry.color}`}
                >
                  {entry.icon}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-lg border border-white/15 bg-white/8 px-3 py-1 font-mono text-sm font-semibold text-white">
                      {entry.version}
                    </span>
                    <span className="text-sm text-slate-400">{entry.date}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        entry.type === 'major'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : entry.type === 'feature'
                          ? 'bg-cyan-500/15 text-cyan-300'
                          : entry.type === 'fix'
                          ? 'bg-orange-500/15 text-orange-300'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {entry.type}
                    </span>
                  </div>

                  <h3 className="mb-4 text-lg font-bold text-white">{entry.title}</h3>

                  <ul className="space-y-2">
                    {entry.changes.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
