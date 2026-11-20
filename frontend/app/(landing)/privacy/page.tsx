import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — NexusGuard',
  description: 'How NexusGuard handles data, telemetry privacy, minimization, and regulatory protections.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-xs text-slate-400 font-mono">Last updated: November 20, 2026 • Effective Version 2.4</p>
        </div>

        <div className="prose prose-invert prose-indigo max-w-none space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Privacy by Design & Zero Raw PII Policy</h2>
            <p>
              NexusGuard operates under a strict <strong>Privacy by Design</strong> standard. Our client-side SDKs and telemetry
              daemons automatically tokenize, salt, and cryptographically hash all identifiers (e.g. MSISDNs, national ID numbers,
              account numbers, IP addresses) before transmission.
            </p>
            <p>
              Under no circumstances do we collect, process, or persist unhashed personal data or raw end-customer credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Telemetry Data Collected</h2>
            <p>We collect system-level telemetry strictly necessary to provide observability and circuit breaker protections:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>OpenTelemetry span names, start times, durations, and status codes.</li>
              <li>Token consumption metrics (prompt tokens, completion tokens, cached tokens).</li>
              <li>Tool execution signatures and structured error classifications.</li>
              <li>Anonymized model latency percentiles and cost estimations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Prompt & Input Sanitization</h2>
            <p>
              Payload memos, customer chat inputs, and unstructured agent contexts are routed through client-side
              sanitization guards. Any potential secret keys (API tokens, private keys) are redacted at source prior to ledger serialization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Regulatory Context & Jurisdictional Notice</h2>
            <p>
              NexusGuard supports customer compliance mappings under the General Data Protection Regulation (GDPR),
              NIST AI Risk Management Framework (AI RMF), and relevant South Asian digital data protection principles.
              Usage on live financial infrastructure is informational and subject to formal merchant/partner agreements and legal review.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Data Retention & Cryptographic Erasure</h2>
            <p>
              Users can configure telemetry retention windows (7 days, 30 days, or 90 days). Upon window expiry,
              transient telemetry records are securely deleted. Signed ledger digests retain mathematical integrity without retaining raw transaction attributes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
