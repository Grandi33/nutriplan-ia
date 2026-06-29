import { NextResponse } from 'next/server';
import type { Perfil, PlanSemanal } from '@/lib/types';
import {
  MODELO,
  SYSTEM_NUTRICIONISTA,
  promptAnalizarDia,
  generarTexto,
} from '@/lib/ai';

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

    const analisis = await generarTexto({
      model: MODELO,
      system: SYSTEM_NUTRICIONISTA,
      prompt: promptAnalizarDia(dia, perfil),
      maxTokens: 1200,
    });

    return NextResponse.json({ analisis: analisis.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'FALTA_API_KEY') {
      return NextResponse.json(
        { error: 'Falta configurar GEMINI_API_KEY en .env.local.' },
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
