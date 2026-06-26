import type {
  Objetivo,
  NivelActividad,
  TipoDieta,
  Presupuesto,
  NombreDia,
  TipoComida,
} from '@/lib/types';

// Claves de localStorage (según especificación)
export const STORAGE_KEYS = {
  profile: 'nutriplan_profile',
  plan: 'nutriplan_plan_active',
  history: 'nutriplan_history',
  chat: 'nutriplan_chat',
  compra: 'nutriplan_compra',
  compraExtras: 'nutriplan_compra_extras',
  recetas: 'nutriplan_recetas',
  theme: 'nutriplan_theme',
} as const;

export const MAX_HISTORIAL = 10;

// ----------------------------------------------------------------------------
// Opciones de onboarding
// ----------------------------------------------------------------------------

export interface OpcionCard<T extends string> {
  valor: T;
  titulo: string;
  descripcion: string;
  emoji: string;
}

export const OBJETIVOS: OpcionCard<Objetivo>[] = [
  {
    valor: 'perder_peso',
    titulo: 'Perder peso',
    descripcion: 'Déficit calórico saludable y sostenible',
    emoji: '🔥',
  },
  {
    valor: 'ganar_musculo',
    titulo: 'Ganar músculo',
    descripcion: 'Superávit con proteína alta',
    emoji: '💪',
  },
  {
    valor: 'mantener_tonificar',
    titulo: 'Mantener y tonificar',
    descripcion: 'Recomposición corporal',
    emoji: '✨',
  },
  {
    valor: 'mejorar_salud',
    titulo: 'Mejorar salud',
    descripcion: 'Energía, digestión y bienestar',
    emoji: '🌱',
  },
  {
    valor: 'dieta_equilibrada',
    titulo: 'Dieta equilibrada',
    descripcion: 'Comer bien, sin obsesionarse',
    emoji: '🥗',
  },
];

export const NIVELES_ACTIVIDAD: OpcionCard<NivelActividad>[] = [
  {
    valor: 'sedentario',
    titulo: 'Sedentario',
    descripcion: 'Poco o ningún ejercicio',
    emoji: '🪑',
  },
  {
    valor: 'ligero',
    titulo: 'Ligero',
    descripcion: '1-3 días de ejercicio',
    emoji: '🚶',
  },
  {
    valor: 'moderado',
    titulo: 'Moderado',
    descripcion: '3-5 días de ejercicio',
    emoji: '🏃',
  },
  {
    valor: 'muy_activo',
    titulo: 'Muy activo',
    descripcion: '6-7 días de ejercicio',
    emoji: '🏋️',
  },
  {
    valor: 'atleta',
    titulo: 'Atleta',
    descripcion: 'Entreno intenso o doble sesión',
    emoji: '🥇',
  },
];

export const TIPOS_DIETA: OpcionCard<TipoDieta>[] = [
  { valor: 'omnivora', titulo: 'Omnívora', descripcion: 'De todo', emoji: '🍽️' },
  {
    valor: 'vegetariana',
    titulo: 'Vegetariana',
    descripcion: 'Sin carne ni pescado',
    emoji: '🥦',
  },
  { valor: 'vegana', titulo: 'Vegana', descripcion: '100% vegetal', emoji: '🌿' },
  {
    valor: 'flexitariana',
    titulo: 'Flexitariana',
    descripcion: 'Mayormente vegetal',
    emoji: '🥕',
  },
  {
    valor: 'mediterranea',
    titulo: 'Mediterránea',
    descripcion: 'Aceite de oliva, pescado, verdura',
    emoji: '🫒',
  },
  { valor: 'keto', titulo: 'Keto', descripcion: 'Baja en carbos', emoji: '🥑' },
  { valor: 'otras', titulo: 'Otras', descripcion: 'Especifícalo tú', emoji: '🍴' },
];

export const PRESUPUESTOS: OpcionCard<Presupuesto>[] = [
  {
    valor: 'economico',
    titulo: 'Económico',
    descripcion: 'Ingredientes asequibles',
    emoji: '💰',
  },
  {
    valor: 'moderado',
    titulo: 'Moderado',
    descripcion: 'Equilibrio precio-calidad',
    emoji: '🛒',
  },
  {
    valor: 'sin_limite',
    titulo: 'Sin límite',
    descripcion: 'Los mejores ingredientes',
    emoji: '⭐',
  },
];

export const RESTRICCIONES_COMUNES = [
  'Gluten',
  'Lactosa',
  'Frutos secos',
  'Mariscos',
  'Huevos',
  'Soja',
  'Pescado',
  'Sésamo',
];

// ----------------------------------------------------------------------------
// Días y comidas
// ----------------------------------------------------------------------------

export const DIAS: NombreDia[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export const DIAS_CORTOS: Record<NombreDia, string> = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miércoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
  Sábado: 'Sáb',
  Domingo: 'Dom',
};

export const LABEL_COMIDA: Record<TipoComida, string> = {
  desayuno: 'Desayuno',
  media_manana: 'Media mañana',
  almuerzo: 'Almuerzo',
  merienda: 'Merienda',
  cena: 'Cena',
};

export const ORDEN_COMIDAS: TipoComida[] = [
  'desayuno',
  'media_manana',
  'almuerzo',
  'merienda',
  'cena',
];

// ----------------------------------------------------------------------------
// Categorías de la lista de la compra
// ----------------------------------------------------------------------------

export const CATEGORIAS_COMPRA: { key: keyof import('@/lib/types').ListaCompra; label: string; emoji: string }[] =
  [
    { key: 'proteinas', label: 'Proteínas', emoji: '🍗' },
    { key: 'verduras_frutas', label: 'Verduras y frutas', emoji: '🥬' },
    { key: 'cereales_legumbres', label: 'Cereales y legumbres', emoji: '🌾' },
    { key: 'lacteos_huevos', label: 'Lácteos y huevos', emoji: '🥚' },
    { key: 'grasas_saludables', label: 'Grasas saludables', emoji: '🥑' },
    { key: 'condimentos_especias', label: 'Condimentos y especias', emoji: '🧂' },
    { key: 'otros', label: 'Otros', emoji: '🛒' },
  ];

// ----------------------------------------------------------------------------
// Mensajes de la pantalla de generación
// ----------------------------------------------------------------------------

export const MENSAJES_GENERACION = [
  'Calculando tus macros…',
  'Eligiendo recetas mediterráneas…',
  'Balanceando nutrientes…',
  'Seleccionando ingredientes de temporada…',
  'Ajustando porciones a tu objetivo…',
  'Creando tu lista de la compra…',
  'Añadiendo los toques del chef…',
];

// ----------------------------------------------------------------------------
// Sugerencias rápidas del chat
// ----------------------------------------------------------------------------

export const SUGERENCIAS_CHAT = [
  '¿Por qué me recomiendas este plan?',
  'Dame una receta alternativa para la cena del martes',
  '¿Puedo tomar alcohol el fin de semana?',
  'Tengo poco tiempo, simplifica las comidas de esta semana',
  'Dame una lista de snacks saludables extra',
  'Explícame los macros del almuerzo del jueves',
];
