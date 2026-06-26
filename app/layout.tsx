import type { Metadata, Viewport } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from '@/components/layout/AppShell';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NutriPlan IA — tu plan de dieta con inteligencia artificial',
  description:
    'Asistente de dieta personalizado con IA: planes semanales, recetas, lista de la compra y un nutricionista virtual disponible 24/7.',
  manifest: '/manifest.webmanifest',
  applicationName: 'NutriPlan IA',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NutriPlan IA',
  },
  keywords: ['dieta', 'nutrición', 'plan semanal', 'recetas', 'IA', 'macros'],
  authors: [{ name: 'NutriPlan IA' }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F3EE' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1A14' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${dmSans.variable} ${dmSerif.variable}`}
    >
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
