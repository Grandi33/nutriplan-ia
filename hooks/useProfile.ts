'use client';

import { useNutriStore } from '@/lib/store';

export function useProfile() {
  const profile = useNutriStore((s) => s.profile);
  const hydrated = useNutriStore((s) => s.hydrated);
  const setProfile = useNutriStore((s) => s.setProfile);
  const resetTodo = useNutriStore((s) => s.resetTodo);

  return { profile, hydrated, setProfile, resetTodo };
}
