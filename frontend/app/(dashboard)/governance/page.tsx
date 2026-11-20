'use client';

import React from 'react';
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Users,
  CheckCircle,
  Database,
  Key,
} from 'lucide-react';

export default function GovernancePage() {
  const policies = [
    { name: 'Max Reasoning Loop Threshold', limit: '15 recursive steps', status: 'Enforced', type: 'Safety' },
    { name: 'Adversarial Prompt Quarantine', limit: 'Active regex & tokenizer', status: 'Enforced', type: 'Security' },
    { name: 'FinTech Hourly Budget Cap', limit: '$50.00 / hour', status: 'Enforced', type: 'Cost' },
    { name: 'Human-in-the-Loop High Risk Hold', limit: 'Risk score > 0.80', status: 'Enforced', type: 'Compliance' },
    { name: 'PII Tokenization & Minimization', limit: 'SHA-256 + Salt', status: 'Enforced', type: 'Privacy' },
  ];

  const nistChecklist = [
    { id: 'GOVERN-1.1', title: 'Legal & Regulatory Mapping', status: 'Verified', notes: 'Supports GDPR & NIST AI RMF profiles' },
    { id: 'MAP-1.2', title: 'Context & Impact Assessment', status: 'Verified', notes: 'FinSphere AI financial domain precision' },
    { id: 'MEASURE-2.3', title: 'Precision & Calibration Evaluation', status: 'Verified', notes: 'PR-AUC & Brier score benchmarks' },
    { id: 'MANAGE-3.1', title: 'Automated Circuit Breaker Response', status: 'Verified', notes: 'Immediate loop termination & quarantine' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight">Agent Governance & Policies</h1>
        <p className="text-xs text-slate-400 mt-1">
          NIST AI RMF compliance verification, role-based access control (RBAC), and deterministic guardrail enforcement.
        </p>
      </div>

      {/* Active Policies Table */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" />
          Active Deterministic Policies
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Policy Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Configured Constraint</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {policies.map((p) => (
                <tr key={p.name} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-slate-200">{p.name}</td>
                  <td className="py-3 px-3 text-indigo-400">{p.type}</td>
                  <td className="py-3 px-3 text-slate-400">{p.limit}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NIST AI RMF Compliance Audit */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-cyan-400" />
          NIST AI Risk Management Framework (AI RMF 1.0) Mapping
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {nistChecklist.map((item) => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-indigo-400">{item.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {item.status}
                </span>
              </div>
              <h4 className="font-bold text-white text-xs mb-1">{item.title}</h4>
              <p className="text-[11px] text-slate-400">{item.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
