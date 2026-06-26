import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { Perfil, PlanSemanal } from '@/lib/types';
import { calcularMacros, calcularBMI, LABEL_OBJETIVO, LABEL_ACTIVIDAD } from '@/lib/calculations';

// Modelo por defecto. Sonnet 4.6: rápido, económico y de gran calidad,
// ideal para uso diario y para el límite de 60s del hosting gratuito.
// Se puede cambiar con la variable de entorno NUTRIPLAN_MODEL
// (p. ej. 'claude-opus-4-8' para máxima calidad).
export const MODELO = process.env.NUTRIPLAN_MODEL || 'claude-sonnet-4-6';

// Modelo barato para tareas secundarias (recetas, alternativas): Haiku.
// Mucho más económico y de sobra para estas tareas.
export const MODELO_RAPIDO =
  process.env.NUTRIPLAN_MODEL_FAST || 'claude-haiku-4-5-20251001';

let _client: Anthropic | null = null;

/** Cliente perezoso: solo se crea cuando hay clave. */
export function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('FALTA_API_KEY');
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export function hayApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// ----------------------------------------------------------------------------
// Prompt de sistema (nutricionista)
// ----------------------------------------------------------------------------

export const SYSTEM_NUTRICIONISTA = `Eres un nutricionista y dietista clínico con 15 años de experiencia especializado en nutrición mediterránea y deportiva. Generas planes de dieta de máxima calidad: variados, deliciosos, con recetas reales de la gastronomía española y mediterránea, nutricionalmente equilibrados y 100% prácticos de preparar en casa.

Principios:
- Recetas reales, sabrosas y factibles en una cocina doméstica española.
- Respeta SIEMPRE las restricciones, alergias y alimentos que no gustan.
- Prioriza alimentos de temporada y el presupuesto indicado.
- Cantidades realistas y porciones coherentes con el objetivo calórico.
- Variedad a lo largo de la semana: no repitas el mismo plato.
- Responde siempre en español de España.`;

// ----------------------------------------------------------------------------
// Utilidades
// ----------------------------------------------------------------------------

/** Extrae el primer bloque JSON válido de un texto del modelo. */
export function extraerJSON<T>(texto: string): T {
  let limpio = texto.trim();
  // quitar fences ```json ... ```
  limpio = limpio.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();

  const primerObj = limpio.indexOf('{');
  const primerArr = limpio.indexOf('[');
  let inicio = -1;
  let cierre = '}';
  if (primerObj === -1 && primerArr === -1) {
    throw new Error('No se encontró JSON en la respuesta del modelo.');
  }
  if (primerArr === -1 || (primerObj !== -1 && primerObj < primerArr)) {
    inicio = primerObj;
    cierre = '}';
  } else {
    inicio = primerArr;
    cierre = ']';
  }
  const fin = limpio.lastIndexOf(cierre);
  const fragmento = limpio.slice(inicio, fin + 1);
  return JSON.parse(fragmento) as T;
}

/** Devuelve solo el texto concatenado de un mensaje del SDK. */
export function textoDeMensaje(content: Anthropic.Message['content']): string {
  return content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('');
}

// ----------------------------------------------------------------------------
// Resumen del perfil en lenguaje natural (reutilizable en varios prompts)
// ----------------------------------------------------------------------------

export function describirPerfil(perfil: Perfil): string {
  const macros = calcularMacros(perfil);
  const bmi = calcularBMI(perfil.peso, perfil.altura);
  const dieta =
    perfil.tipoDieta === 'otras' && perfil.tipoDietaOtra
      ? perfil.tipoDietaOtra
      : perfil.tipoDieta;

  const presupuesto = {
    economico: 'económico (ingredientes asequibles)',
    moderado: 'moderado',
    sin_limite: 'sin límite (mejores ingredientes)',
  }[perfil.presupuesto];

  return `PERFIL DE ${perfil.nombre.toUpperCase()}
- Edad: ${perfil.edad} años | Sexo: ${perfil.sexo}
- Peso: ${perfil.peso} kg | Altura: ${perfil.altura} cm | IMC: ${bmi.toFixed(1)}${
    perfil.pesoObjetivo ? ` | Peso objetivo: ${perfil.pesoObjetivo} kg` : ''
  }
- Objetivo: ${LABEL_OBJETIVO[perfil.objetivo]}
- Nivel de actividad: ${LABEL_ACTIVIDAD[perfil.nivelActividad]}
- Comidas al día: ${perfil.comidasPorDia}
- Tipo de dieta: ${dieta}
- Restricciones/alergias: ${perfil.restricciones.length ? perfil.restricciones.join(', ') : 'ninguna'}
- Alimentos favoritos: ${perfil.favoritos.length ? perfil.favoritos.join(', ') : 'sin preferencias'}
- Alimentos que NO le gustan: ${perfil.noGustan.length ? perfil.noGustan.join(', ') : 'ninguno'}
- Presupuesto semanal: ${presupuesto}

OBJETIVOS NUTRICIONALES CALCULADOS (úsalos como referencia):
- Calorías diarias: ~${macros.calorias} kcal
- Proteínas: ~${macros.proteinas_g} g | Carbohidratos: ~${macros.carbos_g} g | Grasas: ~${macros.grasas_g} g
- Fibra: ~${macros.fibra_g} g | Agua: ~${macros.agua_litros} L`;
}

// ----------------------------------------------------------------------------
// Builders de prompts
// ----------------------------------------------------------------------------

export function promptPlanSemanal(perfil: Perfil): string {
  const comidas = perfil.comidasPorDia;
  const claves =
    comidas === 3
      ? '"desayuno", "almuerzo", "cena"'
      : comidas === 4
        ? '"desayuno", "almuerzo", "merienda", "cena"'
        : '"desayuno", "media_manana", "almuerzo", "merienda", "cena"';

  const m = calcularMacros(perfil);
  const porComida = (n: number) => Math.round(n / comidas);

  return `${describirPerfil(perfil)}

TAREA: Crea un plan de dieta semanal completo (Lunes a Domingo) con ${comidas} comidas al día: ${claves}.

🎯 OBJETIVOS DIARIOS OBLIGATORIOS (esto es lo MÁS importante del plan):
- Calorías/día: ${m.calorias} kcal
- Proteínas/día: ${m.proteinas_g} g
- Carbohidratos/día: ${m.carbos_g} g
- Grasas/día: ${m.grasas_g} g
Como referencia, repartido entre ${comidas} comidas son ~${porComida(m.calorias)} kcal, ~${porComida(m.proteinas_g)} g proteína, ~${porComida(m.carbos_g)} g carbos y ~${porComida(m.grasas_g)} g grasa por comida.

REGLA DE ORO — cada día DEBE alcanzar esos objetivos:
- "total_calorias" de CADA día dentro de ±5% de ${m.calorias} kcal.
- "total_proteinas" ≥ ${m.proteinas_g} g (nunca por debajo).
- "total_carbos" y "total_grasas" dentro de ±10% de su objetivo. ¡OJO con quedarte corto de carbohidratos!
- Para cuadrarlo, AJUSTA LAS CANTIDADES de los ingredientes (más arroz/pasta/pan/patata/avena/fruta si faltan carbos o calorías). No dejes los días por debajo del objetivo.
- "resumen.calorias_diarias" = ${m.calorias}, "resumen.proteinas_g" = ${m.proteinas_g}, "resumen.carbohidratos_g" = ${m.carbos_g}, "resumen.grasas_g" = ${m.grasas_g}.
- Cada "total_*" del día debe ser EXACTAMENTE la suma de las comidas de ese día. Verifícalo sumando antes de responder.

Responde ÚNICAMENTE con un objeto JSON válido (sin texto adicional, sin markdown) con EXACTAMENTE esta estructura:
{
  "resumen": {
    "objetivo": "string corto",
    "descripcionPlan": "2-3 frases describiendo el enfoque del plan",
    "calorias_diarias": number,
    "proteinas_g": number,
    "carbohidratos_g": number,
    "grasas_g": number,
    "fibra_g": number,
    "agua_litros": number,
    "distribucionMacros": { "proteinas_pct": number, "carbos_pct": number, "grasas_pct": number }
  },
  "valoracion": number (1-5, valoración del plan),
  "dias": [
    {
      "nombre": "Lunes",
      "comidas": {
        ${claves
          .split(', ')
          .map(
            (k) =>
              `${k}: { "nombre": string, "descripcion_breve": string, "ingredientes": [{ "item": string, "cantidad": string }], "calorias": number, "proteinas": number, "carbos": number, "grasas": number, "fibra": number, "tiempo_prep": string, "tiempo_coccion": string, "tags": [string], "emoji": string }`
          )
          .join(',\n        ')}
      },
      "total_calorias": number,
      "total_proteinas": number,
      "total_carbos": number,
      "total_grasas": number,
      "hidratacion_extra": "string opcional",
      "nota_dia": "consejo del nutricionista para ese día",
      "nivel_dificultad": "fácil" | "media" | "elaborado"
    }
    // ... los 7 días (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)
  ],
  "lista_compra": {
    "proteinas": [string],
    "verduras_frutas": [string],
    "cereales_legumbres": [string],
    "lacteos_huevos": [string],
    "grasas_saludables": [string],
    "condimentos_especias": [string],
    "otros": [string]
  },
  "consejos": [string],
  "suplementos": [string]
}

Reglas:
- Incluye los 7 días completos.
- PRIORIDAD MÁXIMA: cada día debe alcanzar los objetivos diarios indicados arriba (calorías y macros). Ajusta porciones hasta cuadrarlos; un día que se queda corto de calorías o carbohidratos es un ERROR.
- Cada comida con un emoji apetecible y tags útiles (p. ej. "alto en proteína", "sin gluten", "batch cooking").
- Las cantidades de "lista_compra" deben cubrir toda la semana.
- Antes de dar cada día, SUMA las comidas y comprueba que "total_calorias/proteinas/carbos/grasas" coinciden con esa suma y caen dentro de la tolerancia.
- No repitas platos a lo largo de la semana.`;
}

export function promptReceta(comida: {
  nombre: string;
  descripcion?: string;
  ingredientes?: { item: string; cantidad: string }[];
}): string {
  return `Genera la receta detallada del siguiente plato de un plan de dieta saludable.

PLATO: ${comida.nombre}
${comida.descripcion ? `DESCRIPCIÓN: ${comida.descripcion}` : ''}
${
  comida.ingredientes && comida.ingredientes.length
    ? `INGREDIENTES BASE: ${comida.ingredientes.map((i) => `${i.item} (${i.cantidad})`).join(', ')}`
    : ''
}

Responde ÚNICAMENTE con JSON válido con esta estructura:
{
  "nombre": string,
  "emoji": string,
  "descripcion": string,
  "raciones": number,
  "tiempo_total": string,
  "ingredientes": [{ "item": string, "cantidad": string }],
  "pasos": [string],
  "info_nutricional": { "calorias": number, "proteinas": number, "carbos": number, "grasas": number, "fibra": number },
  "consejo_chef": string
}

Los pasos deben ser claros, numerables y prácticos para cocinar en casa.`;
}

export function promptAlternativas(
  comida: { nombre: string; calorias: number; proteinas: number; carbos: number; grasas: number },
  perfil: Perfil
): string {
  return `${describirPerfil(perfil)}

A la persona no le apetece este plato y quiere alternativas similares:
PLATO ORIGINAL: ${comida.nombre}
MACROS APROX: ${comida.calorias} kcal, ${comida.proteinas}g proteína, ${comida.carbos}g carbos, ${comida.grasas}g grasa.

Propón 3 alternativas DISTINTAS, similares en calorías y macros (±10%), respetando sus restricciones y gustos.

Responde ÚNICAMENTE con JSON válido: un array de exactamente 3 objetos con esta estructura:
[
  { "nombre": string, "emoji": string, "descripcion_breve": string, "calorias": number, "proteinas": number, "carbos": number, "grasas": number, "tiempo_prep": string, "por_que": "por qué es buena alternativa" }
]`;
}

export function promptAnalizarDia(
  dia: PlanSemanal['dias'][number],
  perfil: Perfil
): string {
  return `${describirPerfil(perfil)}

Analiza este día concreto del plan y da feedback breve y útil.

DÍA: ${dia.nombre}
Totales: ${dia.total_calorias} kcal, ${dia.total_proteinas}g proteína, ${dia.total_carbos}g carbos, ${dia.total_grasas}g grasa.
Comidas: ${Object.values(dia.comidas)
    .filter(Boolean)
    .map((c) => (c as { nombre: string }).nombre)
    .join('; ')}

Da un análisis en markdown (máx. 180 palabras) con: qué tal está equilibrado, 1-2 puntos fuertes y 1-2 sugerencias de mejora. Tono cercano y motivador.`;
}

export function systemChat(perfil: Perfil | null, plan: PlanSemanal | null): string {
  let s = `${SYSTEM_NUTRICIONISTA}

Estás en un chat con la persona usuaria. Responde de forma directa, cercana y práctica, en markdown cuando ayude (negritas, listas). No muestres tu razonamiento interno; ve directo a la respuesta útil.`;

  if (perfil) {
    s += `\n\n--- PERFIL DEL USUARIO ---\n${describirPerfil(perfil)}`;
  }
  if (plan) {
    s += `\n\n--- PLAN ACTIVO DE LA SEMANA (resumen) ---\n${plan.resumen.descripcionPlan}\nCalorías diarias objetivo: ${plan.resumen.calorias_diarias} kcal.\nDías: ${plan.dias
      .map(
        (d) =>
          `${d.nombre}: ${Object.values(d.comidas)
            .filter(Boolean)
            .map((c) => (c as { nombre: string }).nombre)
            .join(', ')}`
      )
      .join(' | ')}`;
  }
  return s;
}
