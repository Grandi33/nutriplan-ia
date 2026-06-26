'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader2, Plus, RefreshCcw, ShoppingCart, ChefHat } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MacroChipsRow } from './MacroChip';
import type {
  Comida,
  Perfil,
  RecetaDetallada,
  Alternativa,
} from '@/lib/types';
import { readLS, writeLS } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

// Gradiente temático determinista a partir del nombre (placeholder de "foto").
function gradiente(nombre: string): string {
  const paletas = [
    'from-[#1D3D28] to-[#3E8E5A]',
    'from-[#E05C38] to-[#C9943A]',
    'from-[#3B82C4] to-[#1D3D28]',
    'from-[#C9943A] to-[#E05C38]',
    'from-[#3E8E5A] to-[#3B82C4]',
  ];
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) >>> 0;
  return paletas[h % paletas.length];
}

export function RecipeModal({
  open,
  onClose,
  comida,
  perfil,
}: {
  open: boolean;
  onClose: () => void;
  comida: Comida | null;
  perfil: Perfil | null;
}) {
  const [receta, setReceta] = useState<RecetaDetallada | null>(null);
  const [loadingReceta, setLoadingReceta] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [alternativas, setAlternativas] = useState<Alternativa[] | null>(null);
  const [loadingAlt, setLoadingAlt] = useState(false);

  // Cargar receta detallada al abrir (con caché para no volver a pagar
  // si se reabre el mismo plato).
  useEffect(() => {
    if (!open || !comida) return;
    setReceta(null);
    setAlternativas(null);
    setChecked({});

    const cacheKey = `${STORAGE_KEYS.recetas}:${comida.nombre}`;
    const cacheada = readLS<RecetaDetallada | null>(cacheKey, null);
    if (cacheada) {
      setReceta(cacheada);
      setLoadingReceta(false);
      return;
    }

    let cancelled = false;
    setLoadingReceta(true);
    fetch('/api/recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comida: {
          nombre: comida.nombre,
          descripcion: comida.descripcion_breve,
          ingredientes: comida.ingredientes,
        },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.receta) {
          setReceta(data.receta);
          writeLS(cacheKey, data.receta);
        } else toast.error(data.error || 'No se pudo cargar la receta.');
      })
      .catch(() => !cancelled && toast.error('Error al cargar la receta.'))
      .finally(() => !cancelled && setLoadingReceta(false));
    return () => {
      cancelled = true;
    };
  }, [open, comida]);

  if (!comida) return null;

  const ingredientes = receta?.ingredientes ?? comida.ingredientes ?? [];

  function pedirAlternativas() {
    if (!comida) return;
    setLoadingAlt(true);
    setAlternativas(null);
    fetch('/api/alternatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comida: {
          nombre: comida.nombre,
          calorias: comida.calorias,
          proteinas: comida.proteinas,
          carbos: comida.carbos,
          grasas: comida.grasas,
        },
        perfil,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.alternativas)) setAlternativas(data.alternativas);
        else toast.error(data.error || 'No se pudieron generar alternativas.');
      })
      .catch(() => toast.error('Error al pedir alternativas.'))
      .finally(() => setLoadingAlt(false));
  }

  function anadirALista() {
    const items = ingredientes.map((i) => `${i.item} — ${i.cantidad}`);
    const prev = readLS<string[]>(STORAGE_KEYS.compraExtras, []);
    const merged = Array.from(new Set([...prev, ...items]));
    writeLS(STORAGE_KEYS.compraExtras, merged);
    toast.success('Ingredientes añadidos a tu lista 📋');
  }

  const info = receta?.info_nutricional ?? {
    calorias: comida.calorias,
    proteinas: comida.proteinas,
    carbos: comida.carbos,
    grasas: comida.grasas,
    fibra: comida.fibra,
  };

  return (
    <Modal open={open} onClose={onClose} title={comida.nombre}>
      <div className="space-y-5">
        {/* "Foto" generada con gradiente temático */}
        <div
          className={`relative grid h-40 w-full place-items-center rounded-xl bg-gradient-to-br ${gradiente(
            comida.nombre
          )}`}
        >
          <span className="text-6xl drop-shadow-lg" aria-hidden>
            {comida.emoji || '🍽️'}
          </span>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {comida.tags?.map((t) => (
              <Badge key={t} tone="primary">
                {t}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">
            {receta?.descripcion || comida.descripcion_breve}
          </p>
        </div>

        {/* Ingredientes con checkboxes */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Ingredientes
          </h3>
          {loadingReceta && !receta ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-9 rounded-lg" />
              ))}
            </div>
          ) : (
            <ul className="space-y-1.5">
              {ingredientes.map((ing, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2">
                    <input
                      type="checkbox"
                      checked={!!checked[i]}
                      onChange={() =>
                        setChecked((c) => ({ ...c, [i]: !c[i] }))
                      }
                      className="h-4 w-4 accent-primary"
                    />
                    <span
                      className={
                        checked[i] ? 'text-muted line-through' : 'text-ink'
                      }
                    >
                      <span className="font-medium">{ing.item}</span>{' '}
                      <span className="text-muted">— {ing.cantidad}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pasos */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Preparación
          </h3>
          {loadingReceta && !receta ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-lg" />
              ))}
            </div>
          ) : receta?.pasos?.length ? (
            <ol className="space-y-3">
              {receta.pasos.map((paso, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-contrast">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink">{paso}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">
              No hay pasos detallados disponibles.
            </p>
          )}
          {receta?.consejo_chef && (
            <div className="mt-3 flex gap-2 rounded-xl bg-accent-soft p-3 text-sm text-ink">
              <ChefHat className="h-4 w-4 flex-shrink-0 text-accent" />
              <span>{receta.consejo_chef}</span>
            </div>
          )}
        </section>

        {/* Información nutricional */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Información nutricional
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              { l: 'Calorías', v: `${Math.round(info.calorias)}`, c: 'text-kcal' },
              { l: 'Proteínas', v: `${Math.round(info.proteinas)} g`, c: 'text-protein' },
              { l: 'Carbos', v: `${Math.round(info.carbos)} g`, c: 'text-carbs' },
              { l: 'Grasas', v: `${Math.round(info.grasas)} g`, c: 'text-fat' },
              { l: 'Fibra', v: `${Math.round(info.fibra)} g`, c: 'text-primary' },
            ].map((x) => (
              <div
                key={x.l}
                className="rounded-xl border border-line bg-surface-2 p-2.5 text-center"
              >
                <div className={`text-lg font-bold tabular-nums ${x.c}`}>
                  {x.v}
                </div>
                <div className="text-xs text-muted">{x.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Acciones */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            onClick={pedirAlternativas}
            loading={loadingAlt}
            className="flex-1"
          >
            <RefreshCcw className="h-4 w-4" /> ¿No me apetece?
          </Button>
          <Button variant="primary" onClick={anadirALista} className="flex-1">
            <ShoppingCart className="h-4 w-4" /> Añadir a la compra
          </Button>
        </div>

        {/* Alternativas */}
        <AnimatePresence>
          {(loadingAlt || alternativas) && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                Alternativas similares
              </h3>
              {loadingAlt ? (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" /> Buscando
                  alternativas…
                </div>
              ) : (
                <div className="space-y-2">
                  {alternativas?.map((alt, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-line bg-surface-2 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl" aria-hidden>
                          {alt.emoji}
                        </span>
                        <span className="display text-base text-ink">
                          {alt.nombre}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {alt.descripcion_breve}
                      </p>
                      <div className="mt-2">
                        <MacroChipsRow
                          calorias={alt.calorias}
                          proteinas={alt.proteinas}
                          carbos={alt.carbos}
                          grasas={alt.grasas}
                        />
                      </div>
                      <p className="mt-2 flex items-start gap-1 text-xs text-primary">
                        <Plus className="h-3.5 w-3.5 flex-shrink-0" />
                        {alt.por_que}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
