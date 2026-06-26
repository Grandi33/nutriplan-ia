'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const COLORES = ['#1D3D28', '#E05C38', '#C9943A', '#3E8E5A', '#3B82C4'];

/** Ráfaga de confeti ligera (sin dependencias externas). */
export function Confetti({ count = 60 }: { count?: number }) {
  const piezas = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.4,
        rotate: Math.random() * 360,
        color: COLORES[i % COLORES.length],
        size: 6 + Math.random() * 8,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {piezas.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-5%] block rounded-[2px]"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
          }}
          initial={{ y: '-10vh', opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}
