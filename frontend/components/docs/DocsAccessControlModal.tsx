'use client';

import React, { useState } from 'react';
import {
  X,
  Shield,
  Calendar,
  Clock,
  ToggleLeft,
  ToggleRight,
  Save,
  RotateCcw,
  Check,
  Eye,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { DocsAccessConfig, DEFAULT_DOCS_CONFIG } from './DocsTypes';

interface DocsAccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DocsAccessConfig;
  onSaveConfig: (newConfig: DocsAccessConfig) => void;
}

export function DocsAccessControlModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: DocsAccessControlModalProps) {
  const [draftConfig, setDraftConfig] = useState<DocsAccessConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: 'judging' | 'always_on' | 'always_off') => {
    if (preset === 'judging') {
      setDraftConfig({
        ...draftConfig,
        enabled: true,
        scheduleMode: 'schedule',
        startDate: '2026-06-10T00:00:00',
        endDate: '2026-06-14T23:59:59',
        showcaseTitle: 'Official Judging Window · AI & FinTech Showcase',
        customNotes: 'Configured for AI Builders Congress & Institutional Evaluation (June 10-14).',
      });
    } else if (preset === 'always_on') {
      setDraftConfig({
        ...draftConfig,
        enabled: true,
        scheduleMode: 'always_on',
        showcaseTitle: 'Open Public Evaluation & Investor Preview',
        customNotes: 'Public access enabled permanently across all time windows.',
      });
    } else {
      setDraftConfig({
        ...draftConfig,
        enabled: false,
        scheduleMode: 'always_off',
        showcaseTitle: 'Private Internal Staging',
        customNotes: 'Public access disabled; available strictly via Admin Override.',
      });
    }
  };

  const handleSave = () => {
    const updated = {
      ...draftConfig,
      lastUpdated: new Date().toISOString(),
    };
    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    setDraftConfig({ ...DEFAULT_DOCS_CONFIG });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Docs Access Control & Publishing Engine
              </h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                Admin controls for visibility toggles, judging windows, and publishing schedules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs">
          {/* 1. Master Visibility Toggle */}
          <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-[var(--foreground)] block">
                Public /docs Visibility
              </span>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                Master switch determining whether unauthenticated visitors can view /docs.
              </p>
            </div>
            <button
              onClick={() => setDraftConfig({ ...draftConfig, enabled: !draftConfig.enabled })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                draftConfig.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {draftConfig.enabled ? (
                <>
                  <ToggleRight className="w-5 h-5 text-emerald-400" />
                  <span>ENABLED (ON)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-rose-400" />
                  <span>RESTRICTED (OFF)</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Schedule Mode Selector */}
          <div className="space-y-2">
            <label className="font-bold uppercase tracking-wider text-[11px] text-[var(--foreground-muted)] block">
              Availability Schedule Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'schedule', label: 'Time-Window Schedule', desc: 'Active only between start & end dates' },
                { id: 'always_on', label: 'Always Public', desc: 'Bypass dates; permanently available' },
                { id: 'always_off', label: 'Private Staging', desc: 'Closed; requires Admin Override' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setDraftConfig({ ...draftConfig, scheduleMode: m.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    draftConfig.scheduleMode === m.id
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--foreground)] shadow-xs'
                      : 'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:border-[var(--card-border-hover)]'
                  }`}
                >
                  <span className="font-bold block text-xs text-[var(--foreground)]">{m.label}</span>
                  <span className="text-[10px] text-[var(--foreground-muted)] block mt-0.5">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] uppercase font-mono text-[var(--foreground-muted)]">Quick Presets:</span>
            <button
              onClick={() => handleApplyPreset('judging')}
              className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 font-semibold hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              Default Judging Window (June 10–14)
            </button>
            <button
              onClick={() => handleApplyPreset('always_on')}
              className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              Always Public
            </button>
            <button
              onClick={() => handleApplyPreset('always_off')}
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Restricted Lock
            </button>
          </div>

          {/* 4. Start & End Date Time inputs */}
          {draftConfig.scheduleMode === 'schedule' && (
            <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--card-border)] space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
                <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Configured Evaluation Window</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-[var(--foreground-muted)] block mb-1">
                    Start Date & Time (UTC)
                  </label>
                  <input
                    type="datetime-local"
                    value={draftConfig.startDate.slice(0, 16)}
                    onChange={(e) => setDraftConfig({ ...draftConfig, startDate: e.target.value })}
                    className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent-primary)]"
                  />
                  <span className="text-[10px] text-[var(--foreground-muted)] mt-1 block">
                    Default: June 10, 2026 (00:00)
                  </span>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-[var(--foreground-muted)] block mb-1">
                    End Date & Time (UTC)
                  </label>
                  <input
                    type="datetime-local"
                    value={draftConfig.endDate.slice(0, 16)}
                    onChange={(e) => setDraftConfig({ ...draftConfig, endDate: e.target.value })}
                    className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent-primary)]"
                  />
                  <span className="text-[10px] text-[var(--foreground-muted)] mt-1 block">
                    Default: June 14, 2026 (23:59)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Admin Override Toggle */}
          <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="font-bold text-xs text-[var(--foreground)]">
                  Admin Preview Override
                </span>
              </div>
              <p className="text-[11px] text-[var(--foreground-muted)]">
                Allow authenticated Admins, CROs, and Judges to preview /docs even if outside window or disabled.
              </p>
            </div>
            <button
              onClick={() => setDraftConfig({ ...draftConfig, adminOverride: !draftConfig.adminOverride })}
              className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                draftConfig.adminOverride
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {draftConfig.adminOverride ? 'OVERRIDE ON' : 'OVERRIDE OFF'}
            </button>
          </div>

          {/* 6. Showcase Title */}
          <div>
            <label className="text-[10px] uppercase font-mono text-[var(--foreground-muted)] block mb-1">
              Showcase Title & Banner Heading
            </label>
            <input
              type="text"
              value={draftConfig.showcaseTitle}
              onChange={(e) => setDraftConfig({ ...draftConfig, showcaseTitle: e.target.value })}
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3.5 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Factory Defaults</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--card-border)] obsidian-card text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] px-6 py-2.5 font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer w-full sm:w-auto"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span>{savedSuccess ? 'Changes Published!' : 'Save & Publish Rules'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
