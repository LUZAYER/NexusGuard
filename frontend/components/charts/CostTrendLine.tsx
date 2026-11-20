'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { clsx } from 'clsx';

interface CostDataPoint {
  time: string;
  cost: number;
  budget?: number;
}

interface CostTrendLineProps {
  data: CostDataPoint[];
  className?: string;
  height?: number;
  showBudgetLine?: boolean;
  budgetValue?: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl">
      <p className="mb-1.5 text-xs font-medium text-slate-400">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-semibold text-white">
            ${p.value.toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function CostTrendLine({
  data,
  className,
  height = 200,
  showBudgetLine = false,
  budgetValue,
}: CostTrendLineProps) {
  return (
    <div className={clsx('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="costLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {showBudgetLine && budgetValue && (
            <ReferenceLine
              y={budgetValue}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: 'Budget',
                fill: '#f59e0b',
                fontSize: 10,
                position: 'right',
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="cost"
            name="Cost"
            stroke="url(#costLineGrad)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
