'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ShoppingItem({
  item,
  checked,
  onToggle,
}: {
  item: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.li
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-2"
      >
        <span
          className={cn(
            'grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border transition-colors',
            checked
              ? 'border-primary bg-primary text-primary-contrast'
              : 'border-line bg-surface'
          )}
        >
          {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <span
          className={cn(
            'text-sm transition-colors',
            checked ? 'text-muted line-through' : 'text-ink'
          )}
        >
          {item}
        </span>
      </button>
    </motion.li>
  );
}
