import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — NexusGuard',
  description: 'Terms and conditions governing the use of the NexusGuard agent observability platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-xs text-slate-400 font-mono">Last updated: November 20, 2026 • Effective Version 2.4</p>
        </div>

        <div className="prose prose-invert prose-indigo max-w-none space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the NexusGuard platform, APIs, or open-source SDKs, you agree to be bound by these Terms of Service.
              If you are accessing on behalf of an organization or financial institution, you represent that you possess requisite authority.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Acceptable Use & AI Safety Compliance</h2>
            <p>
              NexusGuard is intended exclusively for authorized observability, performance evaluation, and safety governance
              of autonomous AI systems. You explicitly agree not to use the platform to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Bypass or disable access control restrictions on third-party financial or LLM APIs.</li>
              <li>Deploy autonomous agents designed for unauthorized credential stuffing or financial skimming.</li>
              <li>Transcribe or transmit unconsented personally identifiable information (PII).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Third-Party Connector Guardrails</h2>
            <p>
              By default, all external fintech and payment connectors (e.g. bKash, Nagad, SSLCommerz) run in
              <strong> Simulator Mode</strong> using synthetic mock events. Transitioning to sandbox or live production APIs
              requires independent merchant verification, partner agreements, and formal institutional compliance sign-off.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Limitation of Liability</h2>
            <p>
              NexusGuard provides heuristic recommendations, precision scores, and automated circuit breakers as engineering aids.
              Final automated actions (e.g. blocking accounts, holding disbursements) must be configured with human-in-the-loop review thresholds.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
