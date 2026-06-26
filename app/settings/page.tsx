'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save, Trash2, Flame } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TagInput } from '@/components/ui/TagInput';
import { Modal } from '@/components/ui/Modal';
import { OptionGrid } from '@/components/onboarding/OptionGrid';
import {
  OBJETIVOS,
  NIVELES_ACTIVIDAD,
  TIPOS_DIETA,
  PRESUPUESTOS,
  RESTRICCIONES_COMUNES,
} from '@/lib/constants';
import { calcularMacros, calcularBMI, clasificarBMI } from '@/lib/calculations';
import type {
  Perfil,
  Objetivo,
  NivelActividad,
  TipoDieta,
  Presupuesto,
  Sexo,
} from '@/lib/types';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, hydrated, setProfile, resetTodo } = useProfile();

  const [form, setForm] = useState<Perfil | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (hydrated && !profile) router.replace('/onboarding');
  }, [hydrated, profile, router]);

  useEffect(() => {
    if (profile && !form) setForm(profile);
  }, [profile, form]);

  if (!hydrated || !form) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-1/2 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  function update<K extends keyof Perfil>(key: K, value: Perfil[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function guardar() {
    if (!form) return;
    if (!form.nombre.trim()) {
      toast.error('El nombre no puede estar vacío.');
      return;
    }
    setProfile(form);
    toast.success('Perfil actualizado ✅');
  }

  const macros = calcularMacros(form);
  const bmi = calcularBMI(form.peso, form.altura);
  const bmiInfo = bmi ? clasificarBMI(bmi) : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-2xl text-primary sm:text-3xl">
          Perfil y preferencias
        </h1>
        <p className="text-muted">
          Ajusta tus datos. Vuelve a generar el plan para aplicar cambios
          grandes.
        </p>
      </div>

      {/* Objetivos calculados */}
      <Card className="bg-primary text-primary-contrast">
        <div className="mb-2 flex items-center gap-2">
          <Flame className="h-4 w-4 text-gold" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Tus objetivos calculados
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Calorías', `${macros.calorias}`],
            ['Proteínas', `${macros.proteinas_g} g`],
            ['Carbos', `${macros.carbos_g} g`],
            ['Grasas', `${macros.grasas_g} g`],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-xl font-bold">{v}</div>
              <div className="text-xs opacity-80">{l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Datos físicos */}
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Datos físicos
        </h2>
        <Input
          label="Nombre"
          value={form.nombre}
          onChange={(e) => update('nombre', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Edad"
            type="number"
            value={String(form.edad)}
            onChange={(e) => update('edad', Number(e.target.value))}
            suffix="años"
          />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Sexo
            </span>
            <div className="flex gap-1.5">
              {(['mujer', 'hombre', 'otro'] as Sexo[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update('sexo', s)}
                  className={cn(
                    'h-11 flex-1 rounded-xl border text-sm font-medium capitalize transition-colors',
                    form.sexo === s
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-line bg-surface text-muted'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Peso"
            type="number"
            value={String(form.peso)}
            onChange={(e) => update('peso', Number(e.target.value))}
            suffix="kg"
          />
          <Input
            label="Altura"
            type="number"
            value={String(form.altura)}
            onChange={(e) => update('altura', Number(e.target.value))}
            suffix="cm"
          />
        </div>
        <Input
          label="Peso objetivo (opcional)"
          type="number"
          value={form.pesoObjetivo ? String(form.pesoObjetivo) : ''}
          onChange={(e) =>
            update(
              'pesoObjetivo',
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          suffix="kg"
        />
        {bmiInfo && (
          <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-2">
            <span className="text-sm text-muted">IMC</span>
            <span className={cn('font-bold', bmiInfo.color)}>
              {bmiInfo.valor} · {bmiInfo.categoria}
            </span>
          </div>
        )}
      </Card>

      {/* Objetivo */}
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Objetivo
        </h2>
        <OptionGrid
          options={OBJETIVOS}
          value={form.objetivo}
          onSelect={(v: Objetivo) => update('objetivo', v)}
        />
      </Card>

      {/* Actividad + comidas */}
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Actividad
        </h2>
        <OptionGrid
          options={NIVELES_ACTIVIDAD}
          value={form.nivelActividad}
          onSelect={(v: NivelActividad) => update('nivelActividad', v)}
        />
        <div>
          <span className="mb-2 block text-sm font-medium text-ink">
            Comidas al día
          </span>
          <div className="flex gap-2">
            {([3, 4, 5] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => update('comidasPorDia', n)}
                className={cn(
                  'h-12 flex-1 rounded-xl border text-lg font-bold transition-colors',
                  form.comidasPorDia === n
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line bg-surface text-muted'
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Preferencias */}
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Preferencias alimentarias
        </h2>
        <OptionGrid
          options={TIPOS_DIETA}
          value={form.tipoDieta}
          onSelect={(v: TipoDieta) => update('tipoDieta', v)}
          columns={3}
        />
        {form.tipoDieta === 'otras' && (
          <Input
            placeholder="Describe tu dieta"
            value={form.tipoDietaOtra ?? ''}
            onChange={(e) => update('tipoDietaOtra', e.target.value)}
          />
        )}
        <TagInput
          label="Restricciones y alergias"
          value={form.restricciones}
          onChange={(v) => update('restricciones', v)}
          suggestions={RESTRICCIONES_COMUNES}
          placeholder="Añade alergias…"
          tone="accent"
        />
        <TagInput
          label="Alimentos favoritos"
          value={form.favoritos}
          onChange={(v) => update('favoritos', v)}
          placeholder="Ej. salmón, lentejas…"
        />
        <TagInput
          label="Alimentos que no le gustan"
          value={form.noGustan}
          onChange={(v) => update('noGustan', v)}
          placeholder="Ej. coliflor…"
          tone="accent"
        />
        <div>
          <span className="mb-2 block text-sm font-medium text-ink">
            Presupuesto
          </span>
          <OptionGrid
            options={PRESUPUESTOS}
            value={form.presupuesto}
            onSelect={(v: Presupuesto) => update('presupuesto', v)}
            columns={3}
          />
        </div>
      </Card>

      {/* Acciones */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button onClick={guardar}>
          <Save className="h-4 w-4" /> Guardar cambios
        </Button>
        <Button variant="danger" onClick={() => setConfirmReset(true)}>
          <Trash2 className="h-4 w-4" /> Borrar todos mis datos
        </Button>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="¿Borrar todos los datos?"
      >
        <p className="text-base text-muted">
          Se eliminará tu perfil, el plan activo, el historial y el chat. Esta
          acción no se puede deshacer.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetTodo();
              toast.success('Datos borrados');
              router.replace('/onboarding');
            }}
          >
            <Trash2 className="h-4 w-4" /> Sí, borrar todo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
