'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { OpcionCard } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function OptionGrid<T extends string>({
  options,
  value,
  onSelect,
  columns = 2,
}: {
  options: OpcionCard<T>[];
  value: T | undefined;
  onSelect: (v: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        'grid gap-3',
        columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
      )}
    >
      {options.map((opt) => {
        const active = value === opt.valor;
        return (
          <motion.button
            key={opt.valor}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(opt.valor)}
            className={cn(
              'relative flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
              active
                ? 'border-primary bg-primary-soft'
                : 'border-line bg-surface hover:border-primary/40'
            )}
          >
            <span className="text-2xl" aria-hidden>
              {opt.emoji}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-ink">{opt.titulo}</span>
              <span className="block text-sm text-muted">{opt.descripcion}</span>
            </span>
            {active && (
              <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-contrast">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
