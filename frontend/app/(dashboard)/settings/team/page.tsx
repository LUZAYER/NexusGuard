'use client';

import React from 'react';
import { Users, Plus, Shield, Mail } from 'lucide-react';

export default function TeamSettingsPage() {
  const members = [
    { name: 'Reyazul Islam', email: 'reyazul.islam@nexusguard.io', role: 'Chief Risk Officer & Admin', status: 'Active' },
    { name: 'Sadia Jannat', email: 'sadia.jannat@nexusguard.io', role: 'Senior AML Forensic Investigator', status: 'Active' },
    { name: 'Mohammad Badol', email: 'mohammad.badol@nexusguard.io', role: 'Principal ML & Graph Engineer', status: 'Active' },
    { name: 'Rafi Mahmud', email: 'rafi.mahmud@nexusguard.io', role: 'Risk Operations Specialist', status: 'Active' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Team Management & RBAC</h1>
          <p className="text-xs text-slate-400 mt-1">Configure role-based access control and operator review privileges.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>Invite Operator</span>
        </button>
      </div>

      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {members.map((m) => (
                <tr key={m.email} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-white">{m.name}</td>
                  <td className="py-3 px-3 text-slate-400">{m.email}</td>
                  <td className="py-3 px-3 text-indigo-400">{m.role}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
