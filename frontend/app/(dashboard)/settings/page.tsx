import React from 'react';
import Link from 'next/link';
import { Settings, Users, Key, CreditCard, Shield, Bell } from 'lucide-react';

export default function SettingsOverviewPage() {
  const sections = [
    {
      title: 'Team & Collaboration',
      desc: 'Manage workspace members, assign RBAC roles (Viewer, Analyst, Admin).',
      href: '/settings/team',
      icon: <Users className="w-5 h-5 text-indigo-400" />,
    },
    {
      title: 'API Keys & Access Tokens',
      desc: 'Provision live and test keys, rotate secrets, configure IP whitelists.',
      href: '/settings/api-keys',
      icon: <Key className="w-5 h-5 text-cyan-400" />,
    },
    {
      title: 'Billing & Plan Tiers',
      desc: 'View event consumption, manage payment methods, upgrade tiers.',
      href: '/settings/billing',
      icon: <CreditCard className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure workspace parameters, security rules, and team access.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <Link
            key={sec.title}
            href={sec.href}
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-4">
                {sec.icon}
              </div>
              <h3 className="font-bold text-white text-base mb-1">{sec.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{sec.desc}</p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/60 text-xs font-semibold text-indigo-400">
              Manage →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
