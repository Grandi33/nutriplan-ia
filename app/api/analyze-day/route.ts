import { NextResponse } from 'next/server';
import type { Perfil, PlanSemanal } from '@/lib/types';
import {
  getClient,
  MODELO,
  SYSTEM_NUTRICIONISTA,
  promptAnalizarDia,
  textoDeMensaje,
} from '@/lib/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { dia, perfil } = (await req.json()) as {
      dia: PlanSemanal['dias'][number];
      perfil: Perfil;
    };
    if (!dia || !perfil) {
      return NextResponse.json(
        { error: 'Faltan datos para analizar el día.' },
        { status: 400 }
      );
    }

    const client = getClient();
    const msg = await client.messages.create({
      model: MODELO,
      max_tokens: 1200,
      system: SYSTEM_NUTRICIONISTA,
      messages: [{ role: 'user', content: promptAnalizarDia(dia, perfil) }],
    });

    return NextResponse.json({ analisis: textoDeMensaje(msg.content).trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'FALTA_API_KEY') {
      return NextResponse.json(
        { error: 'Falta configurar ANTHROPIC_API_KEY en .env.local.' },
        { status: 500 }
      );
    }
    console.error('[analyze-day]', message);
    return NextResponse.json(
      { error: 'No se pudo analizar el día.' },
      { status: 500 }
    );
  }
}
