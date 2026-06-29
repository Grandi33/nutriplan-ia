import { create } from 'zustand';
import type {
  Perfil,
  PlanSemanal,
  EstadoCompra,
  Comida,
  TipoComida,
  NombreDia,
} from '@/lib/types';
import { readLS, writeLS, removeLS } from '@/lib/storage';
import { STORAGE_KEYS, MAX_HISTORIAL } from '@/lib/constants';

interface NutriState {
  hydrated: boolean;
  profile: Perfil | null;
  plan: PlanSemanal | null;
  history: PlanSemanal[];
  compra: EstadoCompra;

  hydrate: () => void;
  setProfile: (p: Perfil) => void;
  setPlan: (plan: PlanSemanal, addToHistory?: boolean) => void;
  reemplazarComida: (dia: NombreDia, tipo: TipoComida, nueva: Comida) => void;
  restorePlan: (id: string) => void;
  deletePlan: (id: string) => void;
  setCompra: (estado: EstadoCompra) => void;
  toggleCompra: (item: string) => void;
  resetCompra: () => void;
  resetTodo: () => void;
}

export const useNutriStore = create<NutriState>((set, get) => ({
  hydrated: false,
  profile: null,
  plan: null,
  history: [],
  compra: {},

  hydrate: () => {
    if (get().hydrated) return;
    set({
      hydrated: true,
      profile: readLS<Perfil | null>(STORAGE_KEYS.profile, null),
      plan: readLS<PlanSemanal | null>(STORAGE_KEYS.plan, null),
      history: readLS<PlanSemanal[]>(STORAGE_KEYS.history, []),
      compra: readLS<EstadoCompra>(STORAGE_KEYS.compra, {}),
    });
  },

  setProfile: (p) => {
    writeLS(STORAGE_KEYS.profile, p);
    set({ profile: p });
  },

  setPlan: (plan, addToHistory = true) => {
    writeLS(STORAGE_KEYS.plan, plan);
    // Cambiar de plan reinicia el estado de la lista de la compra.
    writeLS(STORAGE_KEYS.compra, {});

    let history = get().history;
    if (addToHistory) {
      history = [plan, ...history.filter((h) => h.id !== plan.id)].slice(
        0,
        MAX_HISTORIAL
      );
      writeLS(STORAGE_KEYS.history, history);
    }
    set({ plan, history, compra: {} });
  },

  reemplazarComida: (diaNombre, tipo, nueva) => {
    const plan = get().plan;
    if (!plan) return;
    const dias = plan.dias.map((d) => {
      if (d.nombre !== diaNombre) return d;
      const comidas = { ...d.comidas };
      comidas[tipo] = nueva;
      const vals = Object.values(comidas).filter(Boolean) as Comida[];
      const sum = (k: keyof Comida) =>
        Math.round(vals.reduce((s, c) => s + (Number(c[k]) || 0), 0));
      return {
        ...d,
        comidas,
        total_calorias: sum('calorias'),
        total_proteinas: sum('proteinas'),
        total_carbos: sum('carbos'),
        total_grasas: sum('grasas'),
      };
    });
    const next = { ...plan, dias };
    writeLS(STORAGE_KEYS.plan, next);
    set({ plan: next });
  },

  restorePlan: (id) => {
    const found = get().history.find((h) => h.id === id);
    if (!found) return;
    writeLS(STORAGE_KEYS.plan, found);
    writeLS(STORAGE_KEYS.compra, {});
    set({ plan: found, compra: {} });
  },

  deletePlan: (id) => {
    const history = get().history.filter((h) => h.id !== id);
    writeLS(STORAGE_KEYS.history, history);
    const cur = get().plan;
    if (cur && cur.id === id) {
      removeLS(STORAGE_KEYS.plan);
      set({ plan: null, history });
    } else {
      set({ history });
    }
  },

  setCompra: (estado) => {
    writeLS(STORAGE_KEYS.compra, estado);
    set({ compra: estado });
  },

  toggleCompra: (item) => {
    const next = { ...get().compra, [item]: !get().compra[item] };
    writeLS(STORAGE_KEYS.compra, next);
    set({ compra: next });
  },

  resetCompra: () => {
    writeLS(STORAGE_KEYS.compra, {});
    set({ compra: {} });
  },

  resetTodo: () => {
    removeLS(STORAGE_KEYS.profile);
    removeLS(STORAGE_KEYS.plan);
    removeLS(STORAGE_KEYS.history);
    removeLS(STORAGE_KEYS.compra);
    removeLS(STORAGE_KEYS.chat);
    set({ profile: null, plan: null, history: [], compra: {} });
  },
}));
