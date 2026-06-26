'use client';

import { Progress } from '@/components/ui/Progress';

interface MacroBarProps {
  label: string;
  valor: number;
  objetivo: number;
  unidad?: string;
  barClassName: string;
}

export function MacroBar({
  label,
  valor,
  objetivo,
  unidad = 'g',
  barClassName,
}: MacroBarProps) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-xs tabular-nums text-muted">
          <span className="font-semibold text-ink">{Math.round(valor)}</span>
          {unidad} / {Math.round(objetivo)}
          {unidad}
        </span>
      </div>
      <Progress value={valor} max={objetivo} barClassName={barClassName} />
    </div>
  );
}
