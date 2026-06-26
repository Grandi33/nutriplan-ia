'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { DistribucionMacros } from '@/lib/types';

const COLORS = {
  proteinas: '#3E8E5A',
  carbos: '#3B82C4',
  grasas: '#D9534F',
};

export function MacroDonut({ dist }: { dist: DistribucionMacros }) {
  const data = [
    { name: 'Proteínas', value: dist.proteinas_pct, color: COLORS.proteinas },
    { name: 'Carbohidratos', value: dist.carbos_pct, color: COLORS.carbos },
    { name: 'Grasas', value: dist.grasas_pct, color: COLORS.grasas },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => `${v}%`}
            contentStyle={{
              background: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderRadius: 12,
              color: 'rgb(var(--text))',
              fontSize: 13,
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 13, color: 'rgb(var(--muted))' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
