import { NextResponse } from 'next/server';
import type { RecetaDetallada } from '@/lib/types';
import {
  getClient,
  MODELO_RAPIDO,
  SYSTEM_NUTRICIONISTA,
  promptReceta,
  textoDeMensaje,
  extraerJSON,
} from '@/lib/anthropic';

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

    const client = getClient();
    const msg = await client.messages.create({
      model: MODELO_RAPIDO,
      max_tokens: 3000,
      system: SYSTEM_NUTRICIONISTA,
      messages: [{ role: 'user', content: promptReceta(comida) }],
    });

    const receta = extraerJSON<RecetaDetallada>(textoDeMensaje(msg.content));
    return NextResponse.json({ receta });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'FALTA_API_KEY') {
      return NextResponse.json(
        { error: 'Falta configurar ANTHROPIC_API_KEY en .env.local.' },
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
