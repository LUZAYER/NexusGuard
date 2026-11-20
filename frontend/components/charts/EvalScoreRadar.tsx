'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface EvalScoreRadarProps {
  data: {
    metric: string;
    score: number;
    benchmark?: number;
  }[];
}

export default function EvalScoreRadar({ data }: EvalScoreRadarProps) {
  const chartData = data && data.length > 0 ? data : [
    { metric: 'Hallucination', score: 94, benchmark: 80 },
    { metric: 'Factuality', score: 91, benchmark: 85 },
    { metric: 'Helpfulness', score: 88, benchmark: 75 },
    { metric: 'Toxicity', score: 99, benchmark: 95 },
    { metric: 'Context Recall', score: 87, benchmark: 70 },
    { metric: 'Faithfulness', score: 92, benchmark: 82 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
            }}
          />
          <Radar
            name="Current Agent"
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
          />
          {chartData[0]?.benchmark !== undefined && (
            <Radar
              name="Benchmark"
              dataKey="benchmark"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.15}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
