import { cn } from '@/lib/utils';
import type { Dificultad } from '@/lib/types';

type Tone = 'neutral' | 'primary' | 'accent' | 'gold' | 'green' | 'blue';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted border border-line',
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent-soft text-accent',
  gold: 'bg-gold/15 text-gold',
  green: 'bg-protein/15 text-protein',
  blue: 'bg-carbs/15 text-carbs',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function DificultadBadge({ nivel }: { nivel: Dificultad }) {
  const map: Record<Dificultad, { tone: Tone; emoji: string }> = {
    fácil: { tone: 'green', emoji: '🟢' },
    media: { tone: 'gold', emoji: '🟡' },
    elaborado: { tone: 'accent', emoji: '🔴' },
  };
  const { tone, emoji } = map[nivel];
  return (
    <Badge tone={tone}>
      <span aria-hidden>{emoji}</span> {nivel}
    </Badge>
  );
}
