import React from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers — NexusGuard',
  description: 'Join the team building mission-critical observability and safety for AI agents.',
};

export default function CareersPage() {
  const jobs = [
    {
      title: 'Senior Distributed Systems Engineer (OTel / Rust)',
      department: 'Platform Core',
      location: 'Remote (Global) / Dhaka / Singapore',
      type: 'Full-time',
      desc: 'Build our sub-millisecond OpenTelemetry ingestion pipeline handling 100k+ spans/sec with zero packet loss.',
    },
    {
      title: 'Staff ML Security & Guardrails Engineer',
      department: 'AI Safety',
      location: 'Remote (US/EU/Asia)',
      type: 'Full-time',
      desc: 'Architect deterministic circuit breakers, automated prompt injection fuzzers, and bilingual faithfulness benchmarks.',
    },
    {
      title: 'Frontend Architect (Next.js / WebGL / Three.js)',
      department: 'Product Experience',
      location: 'Remote / Dhaka',
      type: 'Full-time',
      desc: 'Design high-framerate 3D network visualizations, real-time waterfall flame graphs, and responsive SOC console interfaces.',
    },
    {
      title: 'Senior Solutions Architect — FinTech & MFS',
      department: 'Customer Engineering',
      location: 'Dhaka / Hybrid',
      type: 'Full-time',
      desc: 'Partner with enterprise banking and mobile money clients to integrate NexusGuard telemetry with core fraud scoring loops.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            We Are Hiring
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Work on the Most Challenging Problems in <span className="gradient-text">Autonomous AI</span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm md:text-base">
            Help us build the safety infrastructure and observability standards that make multi-agent systems safe for global commerce.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <h4 className="font-bold text-white text-base mb-2">Remote-First & Async</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Work from anywhere with flexible schedules, high trust, and documentation-first communication workflows.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <h4 className="font-bold text-white text-base mb-2">Competitive Equity & Pay</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Top-of-market compensation packages with generous stock options and annual hardware/education stipends.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <h4 className="font-bold text-white text-base mb-2">Real-World Consequence</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our software directly prevents multi-million dollar fraud, protects user wallets, and stops runaway AI loops.
            </p>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">Open Positions</h2>
          {jobs.map((job) => (
            <div
              key={job.title}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  {job.department}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{job.title}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">{job.desc}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {job.type}
                  </span>
                </div>
              </div>

              <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-xs transition-all shrink-0">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
