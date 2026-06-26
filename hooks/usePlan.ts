'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNutriStore } from '@/lib/store';
import type { Perfil, PlanSemanal } from '@/lib/types';

export function usePlan() {
  const plan = useNutriStore((s) => s.plan);
  const history = useNutriStore((s) => s.history);
  const hydrated = useNutriStore((s) => s.hydrated);
  const setPlan = useNutriStore((s) => s.setPlan);
  const restorePlan = useNutriStore((s) => s.restorePlan);
  const deletePlan = useNutriStore((s) => s.deletePlan);

  const [generating, setGenerating] = useState(false);

  const generate = useCallback(
    async (perfil: Perfil): Promise<PlanSemanal | null> => {
      setGenerating(true);
      try {
        const res = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ perfil }),
        });
        const data = await res.json();
        if (!res.ok || !data.plan) {
          toast.error(data.error || 'No se pudo generar el plan.');
          return null;
        }
        setPlan(data.plan as PlanSemanal);
        toast.success('Plan generado ✅');
        return data.plan as PlanSemanal;
      } catch {
        toast.error('Error de red al generar el plan.');
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [setPlan]
  );

  return {
    plan,
    history,
    hydrated,
    generating,
    generate,
    restorePlan,
    deletePlan,
  };
}
