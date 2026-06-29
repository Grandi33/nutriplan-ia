import { NextResponse } from 'next/server';
import type { RecetaDetallada } from '@/lib/types';
import {
  MODELO_RAPIDO,
  SYSTEM_NUTRICIONISTA,
  promptReceta,
  generarTexto,
  extraerJSON,
} from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { comida } = (await req.json()) as {
      comida: { nombre: string; descripcion?: string; ingredientes?: { item: string; cantidad: string }[] };
    };
    if (!comida?.nombre) {
      return NextResponse.json({ error: 'Falta la comida.' }, { status: 400 });
    }

    const texto = await generarTexto({
      model: MODELO_RAPIDO,
      system: SYSTEM_NUTRICIONISTA,
      prompt: promptReceta(comida),
      maxTokens: 3000,
      json: true,
    });
    const receta = extraerJSON<RecetaDetallada>(texto);
    return NextResponse.json({ receta });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'FALTA_API_KEY') {
      return NextResponse.json(
        { error: 'Falta configurar GEMINI_API_KEY en .env.local.' },
        { status: 500 }
      );
    }
    console.error('[recipe]', message);
    return NextResponse.json(
      { error: 'No se pudo generar la receta.' },
      { status: 500 }
    );
  }
}
