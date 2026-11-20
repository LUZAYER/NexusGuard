'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth, PRESET_USERS } from '@/context/AuthContext';
import { Shield, Sparkles, UserCheck, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (key: 'reyazul' | 'sadia' | 'badol' | 'rafi') => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(key);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Quick login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Header & Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center gap-2.5 mb-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-700/80 p-1.5 shadow-lg shadow-indigo-500/10 group-hover:scale-105 group-hover:border-indigo-500/50 transition-all">
              <Image
                src="/logo.png"
                alt="NexusGuard Logo"
                width={30}
                height={30}
                className="object-contain"
                priority
              />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-white tracking-tight">
                Nexus<span className="text-red-500">Guard</span>
              </span>
              <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-300">
                FINANCIAL CRIME SOC
              </span>
            </div>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Mission Control Authentication</h1>
          <p className="mt-1 text-xs md:text-sm text-slate-400 text-center max-w-md">
            Sign in to access AI Agent Observability & MFS FinSphere Fraud Surveillance Core.
          </p>
        </div>

        {/* 1-Click Fast Operator Switcher Cards */}
        <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-slate-900/60 p-4 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                1-Click Instant Operator Access
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Demo & Judge Evaluator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                id: 'reyazul',
                name: 'Reyazul Islam',
                role: 'Administrator & SecOps Lead',
                badge: 'Full Access',
                color: 'from-indigo-600 to-blue-700',
              },
              {
                id: 'sadia',
                name: 'Sadia Jannat',
                role: 'Senior Fraud Analyst (L3)',
                badge: 'ATO & Cases',
                color: 'from-purple-600 to-indigo-700',
              },
              {
                id: 'rafi',
                name: 'Rafi Mahmud',
                role: 'Security & DevSecOps',
                badge: 'Audits & Circuit',
                color: 'from-cyan-600 to-teal-700',
              },
              {
                id: 'badol',
                name: 'Mohammad Badol',
                role: 'Principal ML & Graph Engineer',
                badge: 'Graph & ML',
                color: 'from-amber-600 to-rose-700',
              },
            ].map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => handleQuickLogin(op.id as any)}
                disabled={loading}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${op.color} flex items-center justify-center text-xs font-bold text-white shadow-xs`}>
                    {op.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {op.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{op.role}</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email/Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Operator Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@nexusops.demo"
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 pl-10 pr-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Security Passcode
                </label>
                <span className="text-[11px] text-indigo-400 font-mono">
                  Default: any valid key
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 pl-10 pr-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold py-2.5 text-xs md:text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Authorizing Console...
                </span>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Authorize & Access SOC Console
                </>
              )}
            </button>
          </form>

          {/* Direct Sandbox Access link */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Need a new organization?</span>
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Register Team Workspace →
            </Link>
          </div>
        </div>

        {/* Hero Incident callout for judges */}
        <div className="mt-4 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 text-center">
          <p className="text-[11px] text-slate-400">
            Evaluation Hero Incident: <span className="font-bold text-slate-200">TXN-982173</span> (Arif Hossain, ৳18,700, 94.3 Critical ATO).
          </p>
        </div>
      </div>
    </div>
  );
}
