'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TagInput } from '@/components/ui/TagInput';
import { OptionGrid } from '@/components/onboarding/OptionGrid';
import { Confetti } from '@/components/common/Confetti';
import { useProfile } from '@/hooks/useProfile';
import {
  OBJETIVOS,
  NIVELES_ACTIVIDAD,
  TIPOS_DIETA,
  PRESUPUESTOS,
  RESTRICCIONES_COMUNES,
} from '@/lib/constants';
import { calcularBMI, clasificarBMI } from '@/lib/calculations';
import type {
  Objetivo,
  NivelActividad,
  TipoDieta,
  Presupuesto,
  Sexo,
  Perfil,
} from '@/lib/types';
import { cn } from '@/lib/utils';

const TOTAL_PASOS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile } = useProfile();

  const [paso, setPaso] = useState(1);
  const [dir, setDir] = useState(1);
  const [confetti, setConfetti] = useState(false);

  // Campos
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState<Sexo>('mujer');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [pesoObjetivo, setPesoObjetivo] = useState('');
  const [objetivo, setObjetivo] = useState<Objetivo>();
  const [actividad, setActividad] = useState<NivelActividad>();
  const [comidas, setComidas] = useState<3 | 4 | 5>(4);
  const [dieta, setDieta] = useState<TipoDieta>();
  const [dietaOtra, setDietaOtra] = useState('');
  const [restricciones, setRestricciones] = useState<string[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [noGustan, setNoGustan] = useState<string[]>([]);
  const [presupuesto, setPresupuesto] = useState<Presupuesto>();

  const [errores, setErrores] = useState<Record<string, string>>({});

  const bmi = useMemo(
    () => calcularBMI(Number(peso), Number(altura)),
    [peso, altura]
  );
  const bmiInfo = bmi ? clasificarBMI(bmi) : null;

  function validarPaso(p: number): boolean {
    const e: Record<string, string> = {};
    if (p === 1) {
      if (!nombre.trim()) e.nombre = 'Pon un nombre para personalizar el plan.';
    }
    if (p === 2) {
      const ed = Number(edad);
      const pe = Number(peso);
      const al = Number(altura);
      if (!ed || ed < 12 || ed > 100) e.edad = 'Edad entre 12 y 100.';
      if (!pe || pe < 30 || pe > 300) e.peso = 'Peso en kg (30-300).';
      if (!al || al < 120 || al > 230) e.altura = 'Altura en cm (120-230).';
    }
    if (p === 3) {
      if (!objetivo) e.objetivo = 'Elige un objetivo.';
      if (!actividad) e.actividad = 'Elige tu nivel de actividad.';
    }
    if (p === 4) {
      if (!dieta) e.dieta = 'Elige un tipo de dieta.';
      if (dieta === 'otras' && !dietaOtra.trim())
        e.dietaOtra = 'Especifica tu dieta.';
      if (!presupuesto) e.presupuesto = 'Elige un presupuesto.';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function siguiente() {
    if (!validarPaso(paso)) return;
    if (paso < TOTAL_PASOS) {
      setDir(1);
      setPaso((p) => p + 1);
    } else {
      finalizar();
    }
  }

  function anterior() {
    if (paso > 1) {
      setDir(-1);
      setPaso((p) => p - 1);
    }
  }

  function finalizar() {
    if (!validarPaso(4)) return;
    const perfil: Perfil = {
      nombre: nombre.trim(),
      edad: Number(edad),
      sexo,
      peso: Number(peso),
      altura: Number(altura),
      pesoObjetivo: pesoObjetivo ? Number(pesoObjetivo) : undefined,
      objetivo: objetivo!,
      nivelActividad: actividad!,
      comidasPorDia: comidas,
      tipoDieta: dieta!,
      tipoDietaOtra: dieta === 'otras' ? dietaOtra.trim() : undefined,
      restricciones,
      favoritos,
      noGustan,
      presupuesto: presupuesto!,
    };
    setProfile(perfil);
    setConfetti(true);
    setTimeout(() => router.push('/plan'), 1600);
  }

  const progreso = (paso / TOTAL_PASOS) * 100;

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-8">
      {confetti && <Confetti />}

      {/* Cabecera + progreso */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="display text-lg text-primary">🥗 NutriPlan IA</span>
          <span className="text-sm text-muted">
            Paso {paso} de {TOTAL_PASOS}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary-soft">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progreso}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={paso}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* PASO 1 */}
            {paso === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="display text-2xl text-primary">
                    Empecemos por lo primero
                  </h1>
                  <p className="mt-1 text-muted">
                    ¿Para quién es este plan?
                  </p>
                </div>
                <Input
                  label="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Laura"
                  error={errores.nombre}
                  autoFocus
                />
                {nombre.trim() && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="display text-lg text-accent"
                  >
                    Vamos a crear el plan perfecto para {nombre.trim()} ✨
                  </motion.p>
                )}
              </div>
            )}

            {/* PASO 2 */}
            {paso === 2 && (
              <div className="space-y-5">
                <div>
                  <h1 className="display text-2xl text-primary">Datos físicos</h1>
                  <p className="mt-1 text-muted">
                    Para calcular tus necesidades con precisión.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Edad"
                    type="number"
                    inputMode="numeric"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    suffix="años"
                    error={errores.edad}
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
                          onClick={() => setSexo(s)}
                          className={cn(
                            'h-11 flex-1 rounded-xl border text-sm font-medium capitalize transition-colors',
                            sexo === s
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
                    label="Peso actual"
                    type="number"
                    inputMode="decimal"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    suffix="kg"
                    error={errores.peso}
                  />
                  <Input
                    label="Altura"
                    type="number"
                    inputMode="numeric"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    suffix="cm"
                    error={errores.altura}
                  />
                </div>

                <Input
                  label="Peso objetivo (opcional)"
                  type="number"
                  inputMode="decimal"
                  value={pesoObjetivo}
                  onChange={(e) => setPesoObjetivo(e.target.value)}
                  suffix="kg"
                />

                {/* IMC en tiempo real */}
                <AnimatePresence>
                  {bmiInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl border border-line bg-surface-2 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">
                          Tu IMC ahora mismo
                        </span>
                        <span
                          className={cn('text-2xl font-bold', bmiInfo.color)}
                        >
                          {bmiInfo.valor}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            bmiInfo.color.replace('text-', 'bg-')
                          )}
                          style={{
                            width: `${Math.min(100, (bmiInfo.valor / 40) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className={cn('mt-1 text-sm font-medium', bmiInfo.color)}>
                        {bmiInfo.categoria}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* PASO 3 */}
            {paso === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="display text-2xl text-primary">
                    Objetivo y estilo de vida
                  </h1>
                </div>

                <div>
                  <h2 className="mb-2 text-sm font-semibold text-ink">
                    ¿Cuál es tu objetivo?
                  </h2>
                  <OptionGrid
                    options={OBJETIVOS}
                    value={objetivo}
                    onSelect={setObjetivo}
                  />
                  {errores.objetivo && (
                    <p className="mt-1 text-sm text-fat">{errores.objetivo}</p>
                  )}
                </div>

                <div>
                  <h2 className="mb-2 text-sm font-semibold text-ink">
                    Nivel de actividad
                  </h2>
                  <OptionGrid
                    options={NIVELES_ACTIVIDAD}
                    value={actividad}
                    onSelect={setActividad}
                  />
                  {errores.actividad && (
                    <p className="mt-1 text-sm text-fat">{errores.actividad}</p>
                  )}
                </div>

                <div>
                  <h2 className="mb-2 text-sm font-semibold text-ink">
                    ¿Cuántas comidas al día?
                  </h2>
                  <div className="flex gap-2">
                    {([3, 4, 5] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setComidas(n)}
                        className={cn(
                          'h-14 flex-1 rounded-xl border text-lg font-bold transition-colors',
                          comidas === n
                            ? 'border-primary bg-primary-soft text-primary'
                            : 'border-line bg-surface text-muted'
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 4 */}
            {paso === 4 && (
              <div className="space-y-6">
                <div>
                  <h1 className="display text-2xl text-primary">
                    Preferencias alimentarias
                  </h1>
                </div>

                <div>
                  <h2 className="mb-2 text-sm font-semibold text-ink">
                    Tipo de dieta
                  </h2>
                  <OptionGrid
                    options={TIPOS_DIETA}
                    value={dieta}
                    onSelect={setDieta}
                    columns={3}
                  />
                  {errores.dieta && (
                    <p className="mt-1 text-sm text-fat">{errores.dieta}</p>
                  )}
                  {dieta === 'otras' && (
                    <div className="mt-3">
                      <Input
                        placeholder="Describe tu dieta"
                        value={dietaOtra}
                        onChange={(e) => setDietaOtra(e.target.value)}
                        error={errores.dietaOtra}
                      />
                    </div>
                  )}
                </div>

                <TagInput
                  label="Restricciones y alergias"
                  value={restricciones}
                  onChange={setRestricciones}
                  placeholder="Añade alergias o intolerancias…"
                  suggestions={RESTRICCIONES_COMUNES}
                  tone="accent"
                />

                <TagInput
                  label="Alimentos favoritos"
                  value={favoritos}
                  onChange={setFavoritos}
                  placeholder="Ej. salmón, aguacate, lentejas…"
                />

                <TagInput
                  label="Alimentos que no le gustan"
                  value={noGustan}
                  onChange={setNoGustan}
                  placeholder="Ej. coliflor, hígado…"
                  tone="accent"
                />

                <div>
                  <h2 className="mb-2 text-sm font-semibold text-ink">
                    Presupuesto semanal
                  </h2>
                  <OptionGrid
                    options={PRESUPUESTOS}
                    value={presupuesto}
                    onSelect={setPresupuesto}
                    columns={3}
                  />
                  {errores.presupuesto && (
                    <p className="mt-1 text-sm text-fat">
                      {errores.presupuesto}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegación */}
      <div className="mt-8 flex items-center gap-3">
        {paso > 1 && (
          <Button variant="ghost" onClick={anterior}>
            <ArrowLeft className="h-4 w-4" /> Atrás
          </Button>
        )}
        <Button variant="primary" onClick={siguiente} fullWidth>
          {paso === TOTAL_PASOS ? (
            <>
              <Check className="h-4 w-4" /> Crear mi perfil
            </>
          ) : (
            <>
              Continuar <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
