'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useNutriStore } from '@/lib/store';

function Hydrator() {
  const hydrate = useNutriStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="nutriplan_theme"
    >
      <Hydrator />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgb(var(--surface))',
            color: 'rgb(var(--text))',
            border: '1px solid rgb(var(--border))',
            borderRadius: '14px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
            fontSize: '14px',
          },
        }}
      />
    </ThemeProvider>
  );
}
