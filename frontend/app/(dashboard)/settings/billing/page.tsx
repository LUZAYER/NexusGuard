'use client';

import React from 'react';
import { CreditCard, CheckCircle, Zap } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight">Subscription & Billing</h1>
        <p className="text-xs text-slate-400 mt-1">Manage event limits, quota enforcement, and institutional invoices.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase">
              Current Plan: Pro Team
            </span>
            <span className="text-2xl font-black text-white">$49 / mo</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Includes up to 10M events/month, automated circuit breakers, LLM-as-judge evaluation suites, and 90-day retention.
          </p>

          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Monthly Event Consumption</span>
              <span className="text-indigo-400 font-bold">1.42M / 10M (14.2%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="w-[14.2%] h-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-white text-sm mb-2">Need Custom SLAs or Air-Gapped Deployments?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore Enterprise tier for private VPC deployments and dedicated compliance mapping.
            </p>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs mt-4">
            Contact Enterprise Sales
          </button>
        </div>
      </div>
    </div>
  );
}
