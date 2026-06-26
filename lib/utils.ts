// Utilidades generales

/**
 * Une clases condicionalmente (versión ligera de clsx).
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ');
}

/** Genera un id corto y razonablemente único. */
export function uid(prefix = ''): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

/** Formatea una fecha ISO/number a algo legible en español. */
export function formatFecha(fecha: string | number): string {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Formatea una fecha corta. */
export function formatFechaCorta(fecha: string | number): string {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Capitaliza la primera letra. */
export function capitalizar(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Limita un número a un rango. */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Devuelve el nombre del día actual en el formato del plan. */
export function diaActual():
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo' {
  const dias = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ] as const;
  return dias[new Date().getDay()];
}

/** Espera ms milisegundos. */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
