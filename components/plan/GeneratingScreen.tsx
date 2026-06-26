'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { MENSAJES_GENERACION } from '@/lib/constants';

export function GeneratingScreen() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % MENSAJES_GENERACION.length);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  const particulas = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 10,
        delay: Math.random() * 4,
        duration: 5 + Math.random() * 6,
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-bg">
      {/* Partículas verdes sutiles */}
      <div className="pointer-events-none absolute inset-0">
        {particulas.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-primary/20"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{ y: [0, -28, 0], opacity: [0.15, 0.5, 0.15] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <motion.div
          className="text-6xl"
          animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🥗
        </motion.div>

        <h2 className="display text-2xl text-primary">
          Cocinando tu plan perfecto
        </h2>

        <div className="h-7">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-base text-muted"
            >
              {MENSAJES_GENERACION[idx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Barra indeterminada */}
        <div className="relative h-1.5 w-56 overflow-hidden rounded-full bg-primary-soft">
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-primary"
            animate={{ x: ['-120%', '320%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <p className="text-xs text-muted">
          Tiempo estimado: 30-90 segundos · la IA está calculando comida a comida
        </p>
      </div>
    </div>
  );
}
