// ============================================================================
// Tipos centrales de NutriPlan IA
// ============================================================================

export type Sexo = 'hombre' | 'mujer' | 'otro';

export type Objetivo =
  | 'perder_peso'
  | 'ganar_musculo'
  | 'mantener_tonificar'
  | 'mejorar_salud'
  | 'dieta_equilibrada';

export type NivelActividad =
  | 'sedentario'
  | 'ligero'
  | 'moderado'
  | 'muy_activo'
  | 'atleta';

export type TipoDieta =
  | 'omnivora'
  | 'vegetariana'
  | 'vegana'
  | 'flexitariana'
  | 'mediterranea'
  | 'keto'
  | 'otras';

export type Presupuesto = 'economico' | 'moderado' | 'sin_limite';

export interface Perfil {
  nombre: string;
  edad: number;
  sexo: Sexo;
  peso: number; // kg
  altura: number; // cm
  pesoObjetivo?: number; // kg (opcional)
  objetivo: Objetivo;
  nivelActividad: NivelActividad;
  comidasPorDia: 3 | 4 | 5;
  tipoDieta: TipoDieta;
  tipoDietaOtra?: string;
  restricciones: string[]; // alergias / intolerancias
  favoritos: string[];
  noGustan: string[];
  presupuesto: Presupuesto;
}

// ----------------------------------------------------------------------------
// Plan semanal
// ----------------------------------------------------------------------------

export type NombreDia =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

export type Dificultad = 'fácil' | 'media' | 'elaborado';

export interface Ingrediente {
  item: string;
  cantidad: string;
}

export interface Comida {
  nombre: string;
  descripcion_breve: string;
  ingredientes: Ingrediente[];
  calorias: number;
  proteinas: number;
  carbos: number;
  grasas: number;
  fibra: number;
  tiempo_prep: string;
  tiempo_coccion: string;
  tags: string[];
  emoji: string;
}

export type TipoComida =
  | 'desayuno'
  | 'media_manana'
  | 'almuerzo'
  | 'merienda'
  | 'cena';

export interface ComidasDia {
  desayuno: Comida;
  media_manana?: Comida;
  almuerzo: Comida;
  merienda?: Comida;
  cena: Comida;
}

export interface DiaPlan {
  nombre: NombreDia;
  comidas: ComidasDia;
  total_calorias: number;
  total_proteinas: number;
  total_carbos: number;
  total_grasas: number;
  hidratacion_extra?: string;
  nota_dia: string;
  nivel_dificultad: Dificultad;
}

export interface ListaCompra {
  proteinas: string[];
  verduras_frutas: string[];
  cereales_legumbres: string[];
  lacteos_huevos: string[];
  grasas_saludables: string[];
  condimentos_especias: string[];
  otros: string[];
}

export interface DistribucionMacros {
  proteinas_pct: number;
  carbos_pct: number;
  grasas_pct: number;
}

export interface ResumenPlan {
  objetivo: string;
  descripcionPlan: string;
  calorias_diarias: number;
  proteinas_g: number;
  carbohidratos_g: number;
  grasas_g: number;
  fibra_g: number;
  agua_litros: number;
  distribucionMacros: DistribucionMacros;
}

export interface PlanSemanal {
  id: string;
  fechaCreacion: string;
  nombrePersona?: string;
  valoracion?: number; // 1-5 estrellas (generada por IA)
  resumen: ResumenPlan;
  dias: DiaPlan[];
  lista_compra: ListaCompra;
  consejos: string[];
  suplementos?: string[];
}

// ----------------------------------------------------------------------------
// Receta detallada (/api/recipe)
// ----------------------------------------------------------------------------

export interface RecetaDetallada {
  nombre: string;
  emoji: string;
  descripcion: string;
  raciones: number;
  tiempo_total: string;
  ingredientes: Ingrediente[];
  pasos: string[];
  info_nutricional: {
    calorias: number;
    proteinas: number;
    carbos: number;
    grasas: number;
    fibra: number;
  };
  consejo_chef?: string;
}

// Alternativa a una comida (/api/alternatives)
export interface Alternativa {
  nombre: string;
  emoji: string;
  descripcion_breve: string;
  calorias: number;
  proteinas: number;
  carbos: number;
  grasas: number;
  tiempo_prep: string;
  por_que: string;
}

// ----------------------------------------------------------------------------
// Chat
// ----------------------------------------------------------------------------

export interface MensajeChat {
  id: string;
  rol: 'user' | 'assistant';
  contenido: string;
  fecha: number;
}

// ----------------------------------------------------------------------------
// Lista de la compra: estado de marcado
// ----------------------------------------------------------------------------

export type EstadoCompra = Record<string, boolean>;
