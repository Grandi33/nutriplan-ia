'use client';

import { motion } from 'framer-motion';
import { SUGERENCIAS_CHAT } from '@/lib/constants';

export function SuggestionChips({
  onPick,
}: {
  onPick: (texto: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGERENCIAS_CHAT.map((s, i) => (
        <motion.button
          key={s}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onPick(s)}
          className="rounded-full border border-line bg-surface px-3.5 py-2 text-left text-sm text-ink transition-colors hover:bg-primary-soft hover:text-primary"
        >
          {s}
        </motion.button>
      ))}
    </div>
  );
}
