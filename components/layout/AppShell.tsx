'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { PageTransition } from './PageTransition';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Onboarding y splash van a pantalla completa, sin cabecera ni barra inferior.
  const sinChrome = pathname === '/' || pathname.startsWith('/onboarding');

  if (sinChrome) {
    return (
      <ErrorBoundary>
        <main className="min-h-screen">{children}</main>
      </ErrorBoundary>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:pb-10">
        <ErrorBoundary>
          <PageTransition key={pathname}>{children}</PageTransition>
        </ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  );
}
