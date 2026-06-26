'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { DiaPlan } from '@/lib/types';
import { DIAS_CORTOS } from '@/lib/constants';

export function CaloriasBar({
  dias,
  objetivo,
}: {
  dias: DiaPlan[];
  objetivo: number;
}) {
  const data = dias.map((d) => ({
    dia: DIAS_CORTOS[d.nombre],
    kcal: d.total_calorias,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="dia"
            tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgb(var(--muted))', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgb(var(--surface-2))' }}
            formatter={(v: number) => [`${v} kcal`, 'Calorías']}
            contentStyle={{
              background: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderRadius: 12,
              color: 'rgb(var(--text))',
              fontSize: 13,
            }}
          />
          <ReferenceLine
            y={objetivo}
            stroke="rgb(var(--accent))"
            strokeDasharray="4 4"
            label={{
              value: `Objetivo ${objetivo}`,
              fill: 'rgb(var(--accent))',
              fontSize: 11,
              position: 'insideTopRight',
            }}
          />
          <Bar dataKey="kcal" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.kcal > objetivo * 1.08 ? '#D9534F' : '#E0A23A'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
