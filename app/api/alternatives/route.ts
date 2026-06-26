import { NextResponse } from 'next/server';
import type { Alternativa, Perfil } from '@/lib/types';
import {
  getClient,
  MODELO,
  SYSTEM_NUTRICIONISTA,
  promptAlternativas,
  textoDeMensaje,
  extraerJSON,
} from '@/lib/anthropic';

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

    const client = getClient();
    const msg = await client.messages.create({
      model: MODELO,
      max_tokens: 2500,
      system: SYSTEM_NUTRICIONISTA,
      messages: [{ role: 'user', content: promptAlternativas(comida, perfil) }],
    });

    const alternativas = extraerJSON<Alternativa[]>(textoDeMensaje(msg.content));
    return NextResponse.json({ alternativas });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'FALTA_API_KEY') {
      return NextResponse.json(
        { error: 'Falta configurar ANTHROPIC_API_KEY en .env.local.' },
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
