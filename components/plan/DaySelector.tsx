'use client';

import { motion } from 'framer-motion';
import { DIAS, DIAS_CORTOS } from '@/lib/constants';
import type { NombreDia } from '@/lib/types';
import { cn } from '@/lib/utils';

export function DaySelector({
  activo,
  hoy,
  onSelect,
}: {
  activo: NombreDia;
  hoy?: NombreDia;
  onSelect: (dia: NombreDia) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
      {DIAS.map((dia) => {
        const isActive = dia === activo;
        return (
          <button
            key={dia}
            onClick={() => onSelect(dia)}
            className={cn(
              'relative flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              isActive ? 'text-primary-contrast' : 'text-muted hover:text-ink'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="day-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              {DIAS_CORTOS[dia]}
              {dia === hoy && (
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    isActive ? 'bg-gold' : 'bg-accent'
                  )}
                  aria-label="hoy"
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
