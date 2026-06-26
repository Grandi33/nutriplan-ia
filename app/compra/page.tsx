'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Copy, Filter, Trash2 } from 'lucide-react';
import { useNutriStore } from '@/lib/store';
import { useProfile } from '@/hooks/useProfile';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { CategorySection } from '@/components/compra/CategorySection';
import { CATEGORIAS_COMPRA, STORAGE_KEYS } from '@/lib/constants';
import { readLS, writeLS } from '@/lib/storage';
import type { ListaCompra } from '@/lib/types';

const PRECIO_ITEM = { economico: 1.2, moderado: 2.1, sin_limite: 3.4 } as const;
const WhatsAppIcon = () => <span aria-hidden>🟢</span>;

export default function CompraPage() {
  const { profile, hydrated } = useProfile();
  const plan = useNutriStore((s) => s.plan);
  const compra = useNutriStore((s) => s.compra);
  const toggleCompra = useNutriStore((s) => s.toggleCompra);
  const resetCompra = useNutriStore((s) => s.resetCompra);

  const [soloFalta, setSoloFalta] = useState(false);
  const [extras, setExtras] = useState<string[]>([]);

  useEffect(() => {
    setExtras(readLS<string[]>(STORAGE_KEYS.compraExtras, []));
  }, [hydrated]);

  // Todas las categorías + extras
  const secciones = useMemo(() => {
    if (!plan) return [];
    const base = CATEGORIAS_COMPRA.map((cat) => ({
      emoji: cat.emoji,
      label: cat.label,
      items: plan.lista_compra[cat.key as keyof ListaCompra] ?? [],
    }));
    if (extras.length) {
      base.push({ emoji: '➕', label: 'Añadidos manualmente', items: extras });
    }
    return base;
  }, [plan, extras]);

  const todosLosItems = useMemo(
    () => secciones.flatMap((s) => s.items),
    [secciones]
  );
  const total = todosLosItems.length;
  const comprados = todosLosItems.filter((i) => compra[i]).length;
  const pct = total ? (comprados / total) * 100 : 0;

  const precioEstimado = profile
    ? Math.round(total * PRECIO_ITEM[profile.presupuesto])
    : null;

  function copiarLista() {
    const texto = textoLista();
    navigator.clipboard
      .writeText(texto)
      .then(() => toast.success('Lista copiada 📋'))
      .catch(() => toast.error('No se pudo copiar.'));
  }

  function compartirWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(textoLista())}`;
    window.open(url, '_blank');
  }

  function textoLista(): string {
    let t = '🛒 *Lista de la compra · NutriPlan IA*\n\n';
    for (const s of secciones) {
      if (!s.items.length) continue;
      t += `*${s.emoji} ${s.label}*\n`;
      for (const item of s.items) {
        t += `${compra[item] ? '✅' : '▫️'} ${item}\n`;
      }
      t += '\n';
    }
    return t.trim();
  }

  function limpiarExtras() {
    writeLS(STORAGE_KEYS.compraExtras, []);
    setExtras([]);
    toast.success('Extras eliminados');
  }

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-1/2 rounded-xl" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="display mt-3 text-xl text-primary">
          Sin lista de la compra
        </h1>
        <p className="mt-1 text-muted">
          Genera primero un plan semanal para tener tu lista.
        </p>
        <Link href="/plan" className="mt-4 inline-block">
          <Button>Ir al plan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl text-primary sm:text-3xl">
          Lista de la compra
        </h1>
        <p className="text-muted">Todo lo que necesitas para tu semana.</p>
      </div>

      {/* Progreso */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink">
            {comprados} de {total} artículos comprados
          </span>
          {precioEstimado !== null && (
            <span className="text-sm font-semibold text-gold">
              ≈ {precioEstimado} €
            </span>
          )}
        </div>
        <Progress value={pct} barClassName="bg-primary" height={10} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={copiarLista}>
            <Copy className="h-4 w-4" /> Copiar lista
          </Button>
          <Button size="sm" variant="secondary" onClick={compartirWhatsApp}>
            <WhatsAppIcon /> WhatsApp
          </Button>
          <Button
            size="sm"
            variant={soloFalta ? 'primary' : 'secondary'}
            onClick={() => setSoloFalta((v) => !v)}
          >
            <Filter className="h-4 w-4" />
            {soloFalta ? 'Mostrando lo que falta' : 'Solo lo que falta'}
          </Button>
          {comprados > 0 && (
            <Button size="sm" variant="ghost" onClick={resetCompra}>
              <Trash2 className="h-4 w-4" /> Reiniciar
            </Button>
          )}
        </div>
      </Card>

      {/* Categorías */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2"
      >
        {secciones.map((s) => {
          const items = soloFalta
            ? s.items.filter((i) => !compra[i])
            : s.items;
          if (items.length === 0) return null;
          return (
            <motion.div
              key={s.label}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <CategorySection
                emoji={s.emoji}
                label={s.label}
                items={items}
                checkedMap={compra}
                onToggle={toggleCompra}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {extras.length > 0 && (
        <button
          onClick={limpiarExtras}
          className="text-sm text-muted underline hover:text-fat"
        >
          Eliminar ingredientes añadidos manualmente
        </button>
      )}
    </div>
  );
}
