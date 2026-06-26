'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { DiaPlan } from '@/lib/types';
import { DIAS_CORTOS } from '@/lib/constants';

export function SemanaLine({ dias }: { dias: DiaPlan[] }) {
  const data = dias.map((d) => ({
    dia: DIAS_CORTOS[d.nombre],
    proteina: d.total_proteinas,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
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
            formatter={(v: number) => [`${v} g`, 'Proteína']}
            contentStyle={{
              background: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderRadius: 12,
              color: 'rgb(var(--text))',
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="proteina"
            stroke="#3E8E5A"
            strokeWidth={3}
            dot={{ r: 4, fill: '#3E8E5A' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
