import { NextResponse } from 'next/server';
import type { Alternativa, Perfil } from '@/lib/types';
import {
  MODELO_RAPIDO,
  SYSTEM_NUTRICIONISTA,
  promptAlternativas,
  generarTexto,
  extraerJSON,
} from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { comida, perfil } = (await req.json()) as {
      comida: { nombre: string; calorias: number; proteinas: number; carbos: number; grasas: number };
      perfil: Perfil;
    };
    if (!comida?.nombre || !perfil) {
      return NextResponse.json(
        { error: 'Faltan datos para sugerir alternativas.' },
        { status: 400 }
      );
    }

    const texto = await generarTexto({
      model: MODELO_RAPIDO,
      system: SYSTEM_NUTRICIONISTA,
      prompt: promptAlternativas(comida, perfil),
      maxTokens: 2500,
      json: true,
    });
    const alternativas = extraerJSON<Alternativa[]>(texto);
    return NextResponse.json({ alternativas });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'FALTA_API_KEY') {
      return NextResponse.json(
        { error: 'Falta configurar GEMINI_API_KEY en .env.local.' },
        { status: 500 }
      );
    }
    console.error('[alternatives]', message);
    return NextResponse.json(
      { error: 'No se pudieron generar alternativas.' },
      { status: 500 }
    );
  }
}
