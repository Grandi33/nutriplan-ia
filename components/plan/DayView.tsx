'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { Droplets, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DificultadBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DayMacros } from './DayMacros';
import { MealCard } from './MealCard';
import { RecipeModal } from './RecipeModal';
import { ORDEN_COMIDAS } from '@/lib/constants';
import type {
  DiaPlan,
  ResumenPlan,
  Perfil,
  Comida,
  TipoComida,
} from '@/lib/types';

export function DayView({
  dia,
  resumen,
  perfil,
}: {
  dia: DiaPlan;
  resumen: ResumenPlan;
  perfil: Perfil | null;
}) {
  const [seleccion, setSeleccion] = useState<{
    comida: Comida;
    tipo: TipoComida;
  } | null>(null);
  const [analisis, setAnalisis] = useState<string | null>(null);
  const [analizando, setAnalizando] = useState(false);

  const comidas = ORDEN_COMIDAS.map((tipo) => ({
    tipo,
    comida: dia.comidas[tipo],
  })).filter((c): c is { tipo: TipoComida; comida: Comida } => Boolean(c.comida));

  function analizarDia() {
    if (!perfil) return;
    setAnalizando(true);
    setAnalisis(null);
    fetch('/api/analyze-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dia, perfil }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.analisis) setAnalisis(data.analisis);
        else toast.error(data.error || 'No se pudo analizar el día.');
      })
      .catch(() => toast.error('Error al analizar el día.'))
      .finally(() => setAnalizando(false));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <DayMacros dia={dia} resumen={resumen} />

        <Card className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Nota del día
            </h3>
            <DificultadBadge nivel={dia.nivel_dificultad} />
          </div>
          <p className="flex-1 text-base leading-relaxed text-ink">
            {dia.nota_dia}
          </p>
          {dia.hidratacion_extra && (
            <p className="mt-3 flex items-center gap-2 text-sm text-carbs">
              <Droplets className="h-4 w-4" />
              {dia.hidratacion_extra}
            </p>
          )}
          <div className="mt-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={analizarDia}
              loading={analizando}
            >
              <Sparkles className="h-4 w-4" /> Analizar este día con IA
            </Button>
          </div>
        </Card>
      </div>

      {(analizando || analisis) && (
        <Card className="bg-primary-soft">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" /> Análisis del nutricionista IA
          </h3>
          {analizando ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Analizando…
            </p>
          ) : (
            <div className="prose-chat text-ink">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analisis || ''}
              </ReactMarkdown>
            </div>
          )}
        </Card>
      )}

      <motion.div
        key={dia.nombre}
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2"
      >
        {comidas.map(({ tipo, comida }) => (
          <MealCard
            key={tipo}
            tipo={tipo}
            comida={comida}
            onClick={() => setSeleccion({ comida, tipo })}
          />
        ))}
      </motion.div>

      <RecipeModal
        open={!!seleccion}
        onClose={() => setSeleccion(null)}
        comida={seleccion?.comida ?? null}
        tipo={seleccion?.tipo}
        diaNombre={dia.nombre}
        perfil={perfil}
      />
    </div>
  );
}
