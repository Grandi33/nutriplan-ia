'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Sparkles, BarChart3, UtensilsCrossed } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { usePlan } from '@/hooks/usePlan';
import { GeneratingScreen } from '@/components/plan/GeneratingScreen';
import { PlanHeader } from '@/components/plan/PlanHeader';
import { DaySelector } from '@/components/plan/DaySelector';
import { DayView } from '@/components/plan/DayView';
import { StatsView } from '@/components/plan/StatsView';
import { PlanPDFContent } from '@/components/plan/PlanPDFContent';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { MealCardSkeleton } from '@/components/ui/Skeleton';
import { diaActual, formatFechaCorta } from '@/lib/utils';
import { exportarElementoPDF } from '@/lib/pdf-export';
import { LABEL_OBJETIVO } from '@/lib/calculations';
import type { NombreDia } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function PlanPage() {
  const router = useRouter();
  const { profile, hydrated } = useProfile();
  const { plan, generating, generate } = usePlan();

  const hoy = diaActual();
  const [diaActivo, setDiaActivo] = useState<NombreDia>(hoy);
  const [tab, setTab] = useState<'plan' | 'stats'>('plan');
  const [exporting, setExporting] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  // Redirige a onboarding si no hay perfil
  useEffect(() => {
    if (hydrated && !profile) router.replace('/onboarding');
  }, [hydrated, profile, router]);

  // Ajusta el día activo a uno existente en el plan
  useEffect(() => {
    if (plan && !plan.dias.some((d) => d.nombre === diaActivo)) {
      setDiaActivo(plan.dias[0]?.nombre ?? 'Lunes');
    }
  }, [plan, diaActivo]);

  const diaSeleccionado = useMemo(
    () => plan?.dias.find((d) => d.nombre === diaActivo) ?? plan?.dias[0],
    [plan, diaActivo]
  );

  async function handleGenerate() {
    if (!profile) return;
    await generate(profile);
  }

  async function handleExport() {
    if (!plan) return;
    setExporting(true);
    const nombre = (plan.nombrePersona ?? 'nutriplan')
      .toLowerCase()
      .replace(/\s+/g, '-');
    try {
      await exportarElementoPDF(
        'plan-pdf',
        `plan-${nombre}-${formatFechaCorta(plan.fechaCreacion).replace(/\//g, '-')}.pdf`
      );
      toast.success('Plan exportado 📄');
    } catch {
      toast.error('No se pudo exportar el PDF.');
    } finally {
      setExporting(false);
    }
  }

  // --- Estados de carga / vacío ---

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-2/3 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <MealCardSkeleton />
          <MealCardSkeleton />
        </div>
      </div>
    );
  }

  if (generating) return <GeneratingScreen />;

  if (!plan) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-12 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl"
        >
          🥗
        </motion.div>
        <div>
          <h1 className="display text-2xl text-primary">
            {profile ? `Todo listo, ${profile.nombre}` : 'Bienvenida'}
          </h1>
          <p className="mt-2 text-muted">
            Aún no tienes un plan activo. Deja que la IA cree tu plan semanal
            personalizado en segundos.
          </p>
        </div>
        <Button size="lg" onClick={handleGenerate}>
          <Sparkles className="h-5 w-5" /> Generar mi plan semanal
        </Button>
      </div>
    );
  }

  // --- Plan activo ---

  return (
    <div className="space-y-6">
      <PlanHeader
        plan={plan}
        onExport={handleExport}
        exporting={exporting}
        onRegenerate={() => setConfirmRegen(true)}
        regenerating={generating}
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
        {[
          { id: 'plan' as const, label: 'Plan', icon: UtensilsCrossed },
          { id: 'stats' as const, label: 'Estadísticas', icon: BarChart3 },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                active ? 'text-primary-contrast' : 'text-muted'
              )}
            >
              {active && (
                <motion.span
                  layoutId="plan-tab"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'plan' ? (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <DaySelector activo={diaActivo} hoy={hoy} onSelect={setDiaActivo} />
            {diaSeleccionado && profile && (
              <DayView
                key={diaSeleccionado.nombre}
                dia={diaSeleccionado}
                resumen={plan.resumen}
                perfil={profile}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <StatsView plan={plan} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmación de regeneración */}
      <Modal
        open={confirmRegen}
        onClose={() => setConfirmRegen(false)}
        title="¿Regenerar el plan?"
      >
        <p className="text-base text-muted">
          Se creará un plan nuevo. El actual se guardará en tu historial. ¿Quieres
          continuar?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmRegen(false)}>
            Cancelar
          </Button>
          <Button
            variant="accent"
            onClick={() => {
              setConfirmRegen(false);
              handleGenerate();
            }}
          >
            <Sparkles className="h-4 w-4" /> Sí, regenerar
          </Button>
        </div>
      </Modal>

      {/* Resumen de objetivo (decorativo) */}
      <Card className="bg-surface-2 text-center text-sm text-muted">
        Objetivo del plan:{' '}
        <span className="font-semibold text-ink">
          {profile ? LABEL_OBJETIVO[profile.objetivo] : plan.resumen.objetivo}
        </span>
      </Card>

      {/* Contenido oculto para exportar a PDF */}
      <PlanPDFContent plan={plan} />
    </div>
  );
}
