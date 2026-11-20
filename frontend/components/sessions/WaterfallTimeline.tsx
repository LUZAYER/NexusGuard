'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

export type EventType = 'llm' | 'tool' | 'handoff' | 'retrieval' | 'error' | 'agent';

export interface WaterfallEvent {
  id: string;
  name: string;
  type: EventType;
  startMs: number;
  durationMs: number;
  depth?: number;
  model?: string;
  tokens?: { prompt: number; completion: number };
  cost?: number;
  status?: 'success' | 'error' | 'pending';
  metadata?: Record<string, unknown>;
  children?: WaterfallEvent[];
}

interface WaterfallTimelineProps {
  events: WaterfallEvent[];
  onSelect?: (event: WaterfallEvent) => void;
  selectedId?: string;
  className?: string;
}

const typeConfig: Record<EventType, { color: string; label: string; bg: string }> = {
  llm: { color: 'bg-indigo-500', label: 'LLM', bg: 'bg-indigo-500/10 text-indigo-400' },
  tool: { color: 'bg-cyan-500', label: 'Tool', bg: 'bg-cyan-500/10 text-cyan-400' },
  handoff: { color: 'bg-violet-500', label: 'Handoff', bg: 'bg-violet-500/10 text-violet-400' },
  retrieval: { color: 'bg-emerald-500', label: 'Retrieval', bg: 'bg-emerald-500/10 text-emerald-400' },
  error: { color: 'bg-red-500', label: 'Error', bg: 'bg-red-500/10 text-red-400' },
  agent: { color: 'bg-amber-500', label: 'Agent', bg: 'bg-amber-500/10 text-amber-400' },
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

interface EventRowProps {
  event: WaterfallEvent;
  totalDurationMs: number;
  onSelect?: (event: WaterfallEvent) => void;
  selectedId?: string;
  depth?: number;
}

function EventRow({ event, totalDurationMs, onSelect, selectedId, depth = 0 }: EventRowProps) {
  const [expanded, setExpanded] = useState(true);
  const cfg = typeConfig[event.type];
  const leftPct = (event.startMs / totalDurationMs) * 100;
  const widthPct = Math.max((event.durationMs / totalDurationMs) * 100, 1);
  const isSelected = selectedId === event.id;
  const hasChildren = event.children && event.children.length > 0;

  return (
    <>
      <div
        className={clsx(
          'group flex cursor-pointer items-center border-b border-slate-800/50 py-1.5 transition-colors hover:bg-slate-800/30',
          isSelected && 'bg-slate-800/50'
        )}
        onClick={() => onSelect?.(event)}
      >
        {/* Left: label column */}
        <div
          className="flex shrink-0 items-center gap-2 pr-3"
          style={{ width: 280, paddingLeft: `${8 + depth * 16}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((x) => !x);
              }}
              className="text-slate-500 hover:text-slate-300"
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span className="w-3.5" />
          )}
          <span className={clsx('rounded px-1.5 py-0.5 text-[10px] font-medium', cfg.bg)}>
            {cfg.label}
          </span>
          <span className="truncate text-xs text-slate-300">{event.name}</span>
          {event.status === 'error' && (
            <AlertCircle className="ml-auto h-3.5 w-3.5 shrink-0 text-red-400" />
          )}
        </div>

        {/* Right: waterfall bar */}
        <div className="relative min-w-0 flex-1">
          <div className="relative h-5 w-full overflow-hidden rounded-sm">
            <div
              className={clsx('absolute top-0 h-full rounded-sm opacity-80', cfg.color)}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            />
          </div>
          <span className="absolute right-0 top-0 text-[10px] text-slate-500">
            {formatDuration(event.durationMs)}
          </span>
        </div>

        {/* Cost */}
        <div className="ml-3 w-16 shrink-0 text-right text-[10px] text-slate-500">
          {event.cost != null ? `$${event.cost.toFixed(4)}` : '—'}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded &&
        event.children!.map((child) => (
          <EventRow
            key={child.id}
            event={child}
            totalDurationMs={totalDurationMs}
            onSelect={onSelect}
            selectedId={selectedId}
            depth={depth + 1}
          />
        ))}
    </>
  );
}

export function WaterfallTimeline({
  events,
  onSelect,
  selectedId,
  className,
}: WaterfallTimelineProps) {
  const totalDuration = events.reduce(
    (max, e) => Math.max(max, e.startMs + e.durationMs),
    0
  );

  // Generate time axis ticks
  const ticks = Array.from({ length: 5 }, (_, i) =>
    Math.round((totalDuration / 4) * i)
  );

  return (
    <div className={clsx('overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50', className)}>
      {/* Column headers */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        <div style={{ width: 280 }} className="shrink-0">
          Span
        </div>
        <div className="flex-1">
          {/* Time axis */}
          <div className="relative flex">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute text-[10px] text-slate-600"
                style={{ left: `${(t / totalDuration) * 100}%` }}
              >
                {formatDuration(t)}
              </span>
            ))}
          </div>
        </div>
        <div className="ml-3 w-16 shrink-0 text-right">Cost</div>
      </div>

      {/* Events */}
      <div className="max-h-[420px] overflow-y-auto px-3">
        {events.map((event) => (
          <EventRow
            key={event.id}
            event={event}
            totalDurationMs={totalDuration}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-4 py-2 text-[11px] text-slate-500">
        <span>{events.length} spans</span>
        <span>Total: {formatDuration(totalDuration)}</span>
      </div>
    </div>
  );
}
