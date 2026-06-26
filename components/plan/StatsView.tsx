'use client';

import { motion } from 'framer-motion';
import { Award, CalendarCheck, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { MacroDonut } from '@/components/charts/MacroDonut';
import { CaloriasBar } from '@/components/charts/CaloriasBar';
import { SemanaLine } from '@/components/charts/SemanaLine';
import { MacroChipsRow } from './MacroChip';
import type { PlanSemanal, Comida } from '@/lib/types';

function platoMasNutritivo(plan: PlanSemanal): { comida: Comida; dia: string } | null {
  let best: { comida: Comida; dia: string; score: number } | null = null;
  for (const dia of plan.dias) {
    for (const c of Object.values(dia.comidas)) {
      if (!c) continue;
      const comida = c as Comida;
      const score = comida.proteinas + comida.fibra * 2;
      if (!best || score > best.score) {
        best = { comida, dia: dia.nombre, score };
      }
    }
  }
  return best ? { comida: best.comida, dia: best.dia } : null;
}

function diaMasCompleto(plan: PlanSemanal): PlanSemanal['dias'][number] | null {
  const objetivo = plan.resumen.calorias_diarias || 2000;
  let best: { dia: PlanSemanal['dias'][number]; diff: number } | null = null;
  for (const dia of plan.dias) {
    const diff = Math.abs(dia.total_calorias - objetivo) - dia.total_proteinas * 0.1;
    if (!best || diff < best.diff) best = { dia, diff };
  }
  return best?.dia ?? null;
}

export function StatsView({ plan }: { plan: PlanSemanal }) {
  const mejorPlato = platoMasNutritivo(plan);
  const mejorDia = diaMasCompleto(plan);

  const cards = [
    {
      titulo: 'Distribución de macros',
      contenido: <MacroDonut dist={plan.resumen.distribucionMacros} />,
    },
    {
      titulo: 'Calorías por día vs objetivo',
      contenido: (
        <CaloriasBar
          dias={plan.dias}
          objetivo={plan.resumen.calorias_diarias}
        />
      ),
    },
    {
      titulo: 'Proteína a lo largo de la semana',
      contenido: <SemanaLine dias={plan.dias} />,
    },
  ];

  return (
    <motion.div
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {cards.map((c) => (
          <motion.div
            key={c.titulo}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
          >
            <Card>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {c.titulo}
              </h3>
              {c.contenido}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mejorPlato && (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
          >
            <Card className="h-full">
              <div className="mb-1 flex items-center gap-2 text-gold">
                <Award className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Plato más nutritivo
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl" aria-hidden>
                  {mejorPlato.comida.emoji}
                </span>
                <div>
                  <p className="display text-lg leading-tight text-ink">
                    {mejorPlato.comida.nombre}
                  </p>
                  <p className="text-xs text-muted">{mejorPlato.dia}</p>
                </div>
              </div>
              <div className="mt-3">
                <MacroChipsRow
                  calorias={mejorPlato.comida.calorias}
                  proteinas={mejorPlato.comida.proteinas}
                  carbos={mejorPlato.comida.carbos}
                  grasas={mejorPlato.comida.grasas}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {mejorDia && (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
          >
            <Card className="h-full">
              <div className="mb-1 flex items-center gap-2 text-protein">
                <CalendarCheck className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Día más equilibrado
                </span>
              </div>
              <p className="display mt-2 text-xl text-ink">{mejorDia.nombre}</p>
              <p className="mt-1 text-sm text-muted">{mejorDia.nota_dia}</p>
              <div className="mt-3">
                <MacroChipsRow
                  calorias={mejorDia.total_calorias}
                  proteinas={mejorDia.total_proteinas}
                  carbos={mejorDia.total_carbos}
                  grasas={mejorDia.total_grasas}
                />
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
        >
          <Card className="h-full bg-primary text-primary-contrast">
            <div className="mb-1 flex items-center gap-2 text-gold">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Consejo estrella
              </span>
            </div>
            <p className="mt-2 text-base leading-relaxed">
              {plan.consejos?.[0] ??
                'Mantén la constancia: la hidratación y el descanso potencian cualquier plan.'}
            </p>
          </Card>
        </motion.div>
      </div>

      {plan.consejos && plan.consejos.length > 1 && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Más consejos del nutricionista
          </h3>
          <ul className="space-y-2">
            {plan.consejos.slice(1).map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink">
                <span className="text-accent">•</span>
                {c}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {plan.suplementos && plan.suplementos.length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Suplementos sugeridos
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.suplementos.map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-gold/15 px-3 py-1 text-sm text-gold"
              >
                {s}
              </span>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
