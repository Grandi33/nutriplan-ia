import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NutriPlan IA',
    short_name: 'NutriPlan',
    description:
      'Asistente de dieta personalizado con IA: planes semanales, recetas y lista de la compra.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F3EE',
    theme_color: '#1D3D28',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
