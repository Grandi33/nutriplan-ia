import type {
  Perfil,
  Sexo,
  NivelActividad,
  Objetivo,
} from '@/lib/types';

// ----------------------------------------------------------------------------
// IMC (BMI)
// ----------------------------------------------------------------------------

export interface RangoBMI {
  valor: number;
  categoria: 'Bajo peso' | 'Normal' | 'Sobrepeso' | 'Obesidad';
  color: string; // clase tailwind para el texto/acento
}

export function calcularBMI(pesoKg: number, alturaCm: number): number {
  if (!pesoKg || !alturaCm) return 0;
  const m = alturaCm / 100;
  return pesoKg / (m * m);
}

export function clasificarBMI(bmi: number): RangoBMI {
  let categoria: RangoBMI['categoria'];
  let color: string;
  if (bmi < 18.5) {
    categoria = 'Bajo peso';
    color = 'text-carbs';
  } else if (bmi < 25) {
    categoria = 'Normal';
    color = 'text-protein';
  } else if (bmi < 30) {
    categoria = 'Sobrepeso';
    color = 'text-gold';
  } else {
    categoria = 'Obesidad';
    color = 'text-fat';
  }
  return { valor: Math.round(bmi * 10) / 10, categoria, color };
}

// ----------------------------------------------------------------------------
// TDEE (Mifflin-St Jeor) + factor de actividad
// ----------------------------------------------------------------------------

const FACTOR_ACTIVIDAD: Record<NivelActividad, number> = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  muy_activo: 1.725,
  atleta: 1.9,
};

export function calcularBMR(
  pesoKg: number,
  alturaCm: number,
  edad: number,
  sexo: Sexo
): number {
  // Mifflin-St Jeor
  const base = 10 * pesoKg + 6.25 * alturaCm - 5 * edad;
  if (sexo === 'hombre') return base + 5;
  if (sexo === 'mujer') return base - 161;
  // "otro": promedio de ambas constantes
  return base - 78;
}

export function calcularTDEE(perfil: Perfil): number {
  const bmr = calcularBMR(perfil.peso, perfil.altura, perfil.edad, perfil.sexo);
  return Math.round(bmr * FACTOR_ACTIVIDAD[perfil.nivelActividad]);
}

// ----------------------------------------------------------------------------
// Calorías objetivo según meta
// ----------------------------------------------------------------------------

export function caloriasObjetivo(perfil: Perfil): number {
  const tdee = calcularTDEE(perfil);
  const ajuste: Record<Objetivo, number> = {
    perder_peso: -0.18,
    ganar_musculo: 0.12,
    mantener_tonificar: 0,
    mejorar_salud: -0.05,
    dieta_equilibrada: 0,
  };
  return Math.round(tdee * (1 + ajuste[perfil.objetivo]));
}

// ----------------------------------------------------------------------------
// Distribución de macros (gramos)
// ----------------------------------------------------------------------------

export interface MacrosObjetivo {
  calorias: number;
  proteinas_g: number;
  carbos_g: number;
  grasas_g: number;
  fibra_g: number;
  agua_litros: number;
  distribucion: { proteinas_pct: number; carbos_pct: number; grasas_pct: number };
}

export function calcularMacros(perfil: Perfil): MacrosObjetivo {
  const kcal = caloriasObjetivo(perfil);

  // Proteína por kg de peso según objetivo
  const proteinaPorKg: Record<Objetivo, number> = {
    perder_peso: 2.0,
    ganar_musculo: 2.0,
    mantener_tonificar: 1.8,
    mejorar_salud: 1.4,
    dieta_equilibrada: 1.5,
  };

  let proteinas_g = Math.round(perfil.peso * proteinaPorKg[perfil.objetivo]);

  // Grasa: ~25-30% de las calorías
  const grasaPct = perfil.tipoDieta === 'keto' ? 0.65 : 0.28;
  let grasas_g = Math.round((kcal * grasaPct) / 9);

  // Carbos: el resto
  const kcalProteina = proteinas_g * 4;
  const kcalGrasa = grasas_g * 9;
  let carbos_g = Math.round(Math.max(0, kcal - kcalProteina - kcalGrasa) / 4);

  // Keto: limitar carbos y reajustar
  if (perfil.tipoDieta === 'keto') {
    carbos_g = Math.min(carbos_g, 40);
  }

  const totalKcal = proteinas_g * 4 + carbos_g * 4 + grasas_g * 9 || 1;
  const distribucion = {
    proteinas_pct: Math.round(((proteinas_g * 4) / totalKcal) * 100),
    carbos_pct: Math.round(((carbos_g * 4) / totalKcal) * 100),
    grasas_pct: Math.round(((grasas_g * 9) / totalKcal) * 100),
  };

  return {
    calorias: kcal,
    proteinas_g,
    carbos_g,
    grasas_g,
    fibra_g: 30,
    agua_litros: Math.round((perfil.peso * 0.035) * 10) / 10,
    distribucion,
  };
}

// ----------------------------------------------------------------------------
// Etiquetas legibles
// ----------------------------------------------------------------------------

export const LABEL_OBJETIVO: Record<Objetivo, string> = {
  perder_peso: 'Perder peso',
  ganar_musculo: 'Ganar músculo',
  mantener_tonificar: 'Mantener y tonificar',
  mejorar_salud: 'Mejorar salud',
  dieta_equilibrada: 'Dieta equilibrada',
};

export const LABEL_ACTIVIDAD: Record<NivelActividad, string> = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  muy_activo: 'Muy activo',
  atleta: 'Atleta',
};
