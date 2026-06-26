'use client';

import toast from 'react-hot-toast';
import { Download, RefreshCw, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PlanSemanal } from '@/lib/types';
import { formatFecha } from '@/lib/utils';

function Estrellas({ valor = 0 }: { valor?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= Math.round(valor)
              ? 'h-4 w-4 fill-gold text-gold'
              : 'h-4 w-4 text-line'
          }
        />
      ))}
    </span>
  );
}

export function PlanHeader({
  plan,
  onExport,
  exporting,
  onRegenerate,
  regenerating,
}: {
  plan: PlanSemanal;
  onExport: () => void;
  exporting: boolean;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  const kcalProm = Math.round(
    plan.dias.reduce((s, d) => s + d.total_calorias, 0) / (plan.dias.length || 1)
  );
  const protProm = Math.round(
    plan.dias.reduce((s, d) => s + d.total_proteinas, 0) /
      (plan.dias.length || 1)
  );

  async function compartir() {
    const texto = `Mi plan de dieta NutriPlan IA (${
      plan.nombrePersona ?? ''
    }) — ${kcalProm} kcal/día de media. ${plan.resumen.descripcionPlan}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'NutriPlan IA', text: texto });
      } else {
        await navigator.clipboard.writeText(texto);
        toast.success('Resumen copiado al portapapeles 📋');
      }
    } catch {
      /* el usuario canceló */
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            {formatFecha(plan.fechaCreacion)}
          </p>
          <h1 className="display text-2xl text-primary sm:text-3xl">
            Plan de {plan.nombrePersona ?? 'la semana'}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Estrellas valor={plan.valoracion} />
            <span className="text-xs text-muted">valoración IA</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={compartir}>
            <Share2 className="h-4 w-4" /> Compartir
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onExport}
            loading={exporting}
          >
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button
            size="sm"
            variant="accent"
            onClick={onRegenerate}
            loading={regenerating}
          >
            <RefreshCw className="h-4 w-4" /> Regenerar
          </Button>
        </div>
      </div>

      {/* Barra de resumen */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: 'kcal/día', v: kcalProm, c: 'text-kcal' },
          { l: 'Proteína/día', v: `${protProm} g`, c: 'text-protein' },
          { l: 'Agua/día', v: `${plan.resumen.agua_litros} L`, c: 'text-carbs' },
          { l: 'Fibra/día', v: `${plan.resumen.fibra_g} g`, c: 'text-primary' },
        ].map((x) => (
          <div key={x.l} className="card p-3 text-center">
            <div className={`text-xl font-bold tabular-nums ${x.c}`}>{x.v}</div>
            <div className="text-xs text-muted">{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
