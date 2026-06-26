'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RotateCcw, Trash2, Star, GitCompare, X } from 'lucide-react';
import { useNutriStore } from '@/lib/store';
import { useProfile } from '@/hooks/useProfile';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatFecha } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { PlanSemanal } from '@/lib/types';

function Estrellas({ valor = 0 }: { valor?: number }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= Math.round(valor)
              ? 'h-3.5 w-3.5 fill-gold text-gold'
              : 'h-3.5 w-3.5 text-line'
          }
        />
      ))}
    </span>
  );
}

export default function HistorialPage() {
  const router = useRouter();
  const { profile, hydrated } = useProfile();
  const history = useNutriStore((s) => s.history);
  const planActivo = useNutriStore((s) => s.plan);
  const restorePlan = useNutriStore((s) => s.restorePlan);
  const deletePlan = useNutriStore((s) => s.deletePlan);

  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [comparar, setComparar] = useState(false);

  useEffect(() => {
    if (hydrated && !profile) router.replace('/onboarding');
  }, [hydrated, profile, router]);

  function toggleSeleccion(id: string) {
    setSeleccion((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  function restaurar(id: string) {
    restorePlan(id);
    toast.success('Plan restaurado ✅');
    router.push('/plan');
  }

  const planesComparar = seleccion
    .map((id) => history.find((h) => h.id === id))
    .filter(Boolean) as PlanSemanal[];

  if (!hydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl text-primary sm:text-3xl">
          Historial de planes
        </h1>
        <p className="text-muted">
          Tus últimos {history.length} planes. Restaura o compara cuando quieras.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="text-5xl">📚</div>
          <h2 className="display mt-3 text-xl text-primary">
            Aún no hay historial
          </h2>
          <p className="mt-1 text-muted">
            Cada plan que generes se guardará aquí automáticamente.
          </p>
          <Link href="/plan" className="mt-4 inline-block">
            <Button>Generar mi primer plan</Button>
          </Link>
        </div>
      ) : (
        <>
          {seleccion.length > 0 && (
            <div className="sticky top-20 z-20 flex items-center justify-between rounded-xl border border-line bg-surface p-3 shadow-card">
              <span className="text-sm text-muted">
                {seleccion.length} seleccionado(s) para comparar
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSeleccion([])}
                >
                  <X className="h-4 w-4" /> Quitar
                </Button>
                <Button
                  size="sm"
                  disabled={seleccion.length !== 2}
                  onClick={() => setComparar(true)}
                >
                  <GitCompare className="h-4 w-4" /> Comparar
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((p) => {
              const activo = planActivo?.id === p.id;
              const elegido = seleccion.includes(p.id);
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card
                    className={cn(
                      'flex h-full flex-col gap-3 transition-shadow',
                      elegido && 'ring-2 ring-primary'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted">
                          {formatFecha(p.fechaCreacion)}
                        </p>
                        <h3 className="display text-lg text-ink">
                          {p.resumen.objetivo}
                        </h3>
                      </div>
                      {activo && (
                        <span className="rounded-full bg-protein/15 px-2 py-0.5 text-xs font-medium text-protein">
                          Activo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-kcal">
                        {p.resumen.calorias_diarias} kcal/día
                      </span>
                      <Estrellas valor={p.valoracion} />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                      <input
                        type="checkbox"
                        checked={elegido}
                        onChange={() => toggleSeleccion(p.id)}
                        className="h-4 w-4 accent-primary"
                      />
                      Comparar
                    </label>

                    <div className="mt-auto flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => restaurar(p.id)}
                        className="flex-1"
                        disabled={activo}
                      >
                        <RotateCcw className="h-4 w-4" /> Restaurar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Eliminar"
                        onClick={() => {
                          deletePlan(p.id);
                          setSeleccion((s) => s.filter((x) => x !== p.id));
                          toast.success('Plan eliminado');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal de comparación */}
      <Modal
        open={comparar}
        onClose={() => setComparar(false)}
        title="Comparativa de planes"
      >
        {planesComparar.length === 2 && (
          <div className="grid grid-cols-2 gap-4">
            {planesComparar.map((p) => (
              <div key={p.id} className="space-y-2">
                <div className="rounded-xl bg-primary-soft p-3 text-center">
                  <p className="text-xs text-muted">
                    {formatFecha(p.fechaCreacion)}
                  </p>
                  <p className="display text-base text-primary">
                    {p.resumen.objetivo}
                  </p>
                </div>
                {[
                  ['Calorías', `${p.resumen.calorias_diarias} kcal`],
                  ['Proteínas', `${p.resumen.proteinas_g} g`],
                  ['Carbohidratos', `${p.resumen.carbohidratos_g} g`],
                  ['Grasas', `${p.resumen.grasas_g} g`],
                  ['Fibra', `${p.resumen.fibra_g} g`],
                  ['Agua', `${p.resumen.agua_litros} L`],
                  ['Valoración', `${p.valoracion ?? '-'} / 5`],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    className="flex items-center justify-between border-b border-line py-1.5 text-sm"
                  >
                    <span className="text-muted">{l}</span>
                    <span className="font-semibold text-ink">{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
