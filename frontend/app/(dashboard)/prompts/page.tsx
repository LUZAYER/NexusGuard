'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Copy,
  Check,
  History,
  Play,
  Search,
} from 'lucide-react';
import { mockPromptTemplates } from '@/lib/mock-data';

export default function PromptsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(mockPromptTemplates[0]);
  const [copied, setCopied] = useState(false);

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Prompt Versioning & Registry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Version-controlled system prompts, few-shot templates, and rollback points for autonomous agents.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>New Prompt Version</span>
        </button>
      </div>

      {/* Two-Column Editor & Explorer */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="space-y-3">
          {mockPromptTemplates.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedTemplate.id === t.id
                  ? 'border-indigo-500 bg-indigo-950/40'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-mono text-indigo-400 block mb-1">{t.category}</span>
              <h4 className="font-bold text-white text-xs">{t.name}</h4>
              <span className="text-[10px] text-slate-500 font-mono mt-2 block">Model: {t.model}</span>
            </div>
          ))}
        </div>

        {/* Selected Prompt Viewer */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">{selectedTemplate.name}</h3>
              <p className="text-xs text-slate-400">{selectedTemplate.category} • Version 2.1.0</p>
            </div>
            <button
              onClick={() => copyPrompt(selectedTemplate.systemPrompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">System Instructions:</span>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-indigo-200/90 leading-relaxed whitespace-pre-wrap">
                {selectedTemplate.systemPrompt}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">User Prompt Template:</span>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-cyan-200/90 leading-relaxed whitespace-pre-wrap">
                {selectedTemplate.userPrompt}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
