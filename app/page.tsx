'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNutriStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const hydrated = useNutriStore((s) => s.hydrated);
  const profile = useNutriStore((s) => s.profile);

  useEffect(() => {
    if (!hydrated) return;
    if (profile) {
      router.replace('/plan');
    } else {
      router.replace('/onboarding');
    }
  }, [hydrated, profile, router]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <div className="text-5xl animate-float">🥗</div>
      <div className="display text-2xl text-primary">NutriPlan IA</div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-primary-soft">
        <div className="h-full w-1/2 animate-[shimmer_1.2s_infinite] rounded-full bg-primary" />
      </div>
      <p className="text-sm text-muted">Cargando tu cocina…</p>
    </div>
  );
}
