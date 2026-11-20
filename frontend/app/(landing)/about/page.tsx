import React from 'react';
import Link from 'next/link';
import { Shield, Users, Globe, Target, Award, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — NexusGuard Financial Crime Platform',
  description: 'Our mission to bring reliability, observability, and safety to production AI agents.',
};

export default function AboutPage() {
  const team = [
    {
      name: 'Reyazul Islam',
      role: 'Chief Risk Officer & Lead Forensic Architect',
      bio: 'Pioneered sub-25ms transaction risk streaming and deterministic fraud mitigation architectures for digital payment rails across South Asia.',
      avatar: 'RI',
    },
    {
      name: 'Sadia Jannat',
      role: 'Senior AML Forensic Investigator & SAR Lead',
      bio: 'Expert forensic investigator specializing in mobile money mule clusters, regulatory compliance under BFIU frameworks, and automated SAR filing.',
      avatar: 'SJ',
    },
    {
      name: 'Mohammad Badol',
      role: 'Principal ML & Graph Threat Intelligence Engineer',
      bio: 'Machine learning systems engineer focusing on Graph Neural Networks, TreeSHAP feature attributions, and real-time concept drift compensation.',
      avatar: 'MB',
    },
    {
      name: 'Rafi Mahmud',
      role: 'Risk Operations Specialist & Compliance Auditor',
      bio: 'Domain auditor in South Asian payment rails (bKash, Nagad, Rocket, NPSB, BEFTN) implementing shadow-mode rule backtesting and tamper-evident ledgers.',
      avatar: 'RM',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Our Mission & DNA
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Building the Operating System for <span className="gradient-text">Autonomous Financial Crime Intelligence</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-400 leading-relaxed">
            As autonomous agents shift from research demos to real-world financial decisioning, the stakes transform.
            NexusGuard provides the telemetry, circuit breakers, and verification guarantees required to deploy with total confidence.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Evidence or Nothing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We never fabricate scores, metrics, or evaluation data. Every claim made in NexusGuard is mathematically
              grounded in observable runtime traces and verifiable benchmarks.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <Target className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Precision-First AI</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              High accuracy is meaningless if accompanied by debilitating false positives. Our decisioning engines optimize
              for precision at fixed recall, protecting legitimate user velocity.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <Globe className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Global & Local Context</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Designed from the ground up to respect diverse regional contexts—from North American payment gateways
              to South Asian mobile financial services (bKash, Nagad, Rocket) and bilingual explanations.
            </p>
          </div>
        </div>

        {/* Leadership Team */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">Engineered by Practitioners</h2>
            <p className="text-slate-400 text-sm mt-2">The architects behind NexusGuard observability & safety stack</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-indigo-500/40 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg shadow-indigo-500/20">
                  {member.avatar}
                </div>
                <h4 className="font-bold text-white text-base">{member.name}</h4>
                <p className="text-xs text-indigo-400 font-medium mb-3">{member.role}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-10 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Join Us in Shaping the Future of AgentOps</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
            Explore our open careers or get started with the NexusGuard community edition today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/careers"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
            >
              View Open Roles
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
            >
              Read Technical Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
