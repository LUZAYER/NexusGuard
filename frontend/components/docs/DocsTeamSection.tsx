'use client';

import React from 'react';
import { Mail, Shield, User, Award, CheckCircle2 } from 'lucide-react';
import { TEAM_MEMBERS, TeamMember } from './DocsTypes';

export function DocsTeamSection() {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Core Engineering & Leadership</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          NexusGuard Core Architecture & Forensics Group
        </h2>
        <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-2xl mt-1 leading-relaxed">
          The interdisciplinary team of fraud forensic architects, distributed graph engineers, and AI safety researchers designing high-throughput trust infrastructure for mobile financial services.
        </p>
      </div>

      {/* Grid of Team Cards with Uniform Image Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.id}
            className="obsidian-card rounded-2xl border border-[var(--card-border)] p-5 flex flex-col justify-between hover:border-[var(--card-border-hover)] transition-all group relative overflow-hidden"
          >
            {/* Top Header & Avatar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--card-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)]">
                  {member.department.split('&')[0]}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Uniform Avatar Frame */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-[var(--card-border)] shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                  {/* Styled Fallback Avatar with consistent aspect ratio */}
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${member.accentColor} text-white font-black text-lg shadow-inner select-none`}>
                    {member.avatarText}
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[var(--foreground)] truncate">
                    {member.name}
                  </h3>
                  <p className="text-[11px] font-medium text-[var(--accent-primary)] line-clamp-1 mt-0.5">
                    {member.role.split('&')[0]}
                  </p>
                  <span className="text-[9px] font-mono text-[var(--foreground-muted)] block mt-0.5 truncate">
                    {member.clearance}
                  </span>
                </div>
              </div>

              {/* Bio summary */}
              <p className="text-xs text-[var(--foreground-muted)] leading-relaxed mb-4 line-clamp-3">
                {member.bio}
              </p>

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-[var(--surface-hover)] border border-[var(--card-border)] text-[9px] font-mono text-[var(--foreground-muted)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Email contact footer */}
            <div className="pt-3 border-t border-[var(--card-border)] flex items-center justify-between text-xs">
              <a
                href={`mailto:${member.email}`}
                className="inline-flex items-center gap-1.5 text-[11px] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors truncate font-mono"
              >
                <Mail className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                <span className="truncate">{member.email}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
