'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { Comida, TipoComida } from '@/lib/types';
import { LABEL_COMIDA } from '@/lib/constants';
import { MacroChipsRow } from './MacroChip';
import { Badge } from '@/components/ui/Badge';

export function MealCard({
  comida,
  tipo,
  onClick,
}: {
  comida: Comida;
  tipo: TipoComida;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="card group flex w-full flex-col p-5 text-left transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl bg-primary-soft text-3xl transition-transform group-hover:scale-110">
          <span aria-hidden>{comida.emoji || '🍽️'}</span>
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">
            {LABEL_COMIDA[tipo]}
          </span>
          <h3 className="display text-lg leading-snug text-ink">
            {comida.nombre}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-muted">
            {comida.descripcion_breve}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <MacroChipsRow
          calorias={comida.calorias}
          proteinas={comida.proteinas}
          carbos={comida.carbos}
          grasas={comida.grasas}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" />
          {comida.tiempo_prep}
          {comida.tiempo_coccion ? ` + ${comida.tiempo_coccion}` : ''}
        </span>
        {comida.tags?.slice(0, 3).map((t) => (
          <Badge key={t} tone="primary">
            {t}
          </Badge>
        ))}
      </div>
    </motion.button>
  );
}
