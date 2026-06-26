'use client';

import { AnimatePresence } from 'framer-motion';
import { ShoppingItem } from './ShoppingItem';
import { Card } from '@/components/ui/Card';

export function CategorySection({
  emoji,
  label,
  items,
  checkedMap,
  onToggle,
}: {
  emoji: string;
  label: string;
  items: string[];
  checkedMap: Record<string, boolean>;
  onToggle: (item: string) => void;
}) {
  if (items.length === 0) return null;

  // Los marcados bajan al fondo con animación.
  const ordenados = [...items].sort((a, b) => {
    const ca = checkedMap[a] ? 1 : 0;
    const cb = checkedMap[b] ? 1 : 0;
    return ca - cb;
  });

  const comprados = items.filter((i) => checkedMap[i]).length;

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
          <span aria-hidden>{emoji}</span> {label}
        </h3>
        <span className="text-xs tabular-nums text-muted">
          {comprados}/{items.length}
        </span>
      </div>
      <ul>
        <AnimatePresence initial={false}>
          {ordenados.map((item) => (
            <ShoppingItem
              key={item}
              item={item}
              checked={!!checkedMap[item]}
              onToggle={() => onToggle(item)}
            />
          ))}
        </AnimatePresence>
      </ul>
    </Card>
  );
}
