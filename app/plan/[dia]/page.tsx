'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { usePlan } from '@/hooks/usePlan';
import { DayView } from '@/components/plan/DayView';
import { Button } from '@/components/ui/Button';
import { MealCardSkeleton } from '@/components/ui/Skeleton';

function normaliza(s: string): string {
  return decodeURIComponent(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export default function DiaPage({ params }: { params: { dia: string } }) {
  const router = useRouter();
  const { profile, hydrated } = useProfile();
  const { plan } = usePlan();

  useEffect(() => {
    if (hydrated && !profile) router.replace('/onboarding');
  }, [hydrated, profile, router]);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-1/2 rounded-xl" />
        <MealCardSkeleton />
        <MealCardSkeleton />
      </div>
    );
  }

  const dia = plan?.dias.find((d) => normaliza(d.nombre) === normaliza(params.dia));

  if (!plan || !dia) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="text-5xl">🤔</div>
        <h1 className="display mt-3 text-xl text-primary">Día no encontrado</h1>
        <p className="mt-1 text-muted">
          No hay datos para este día en tu plan actual.
        </p>
        <Link href="/plan" className="mt-4 inline-block">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" /> Volver al plan
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/plan">
          <Button size="sm" variant="ghost" aria-label="Volver">
            <ArrowLeft className="h-4 w-4" /> Plan
          </Button>
        </Link>
        <h1 className="display text-2xl text-primary">{dia.nombre}</h1>
      </div>
      <DayView dia={dia} resumen={plan.resumen} perfil={profile} />
    </div>
  );
}
