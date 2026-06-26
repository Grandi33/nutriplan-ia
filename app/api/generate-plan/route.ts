import { NextResponse } from 'next/server';
import type { Perfil, PlanSemanal } from '@/lib/types';
import {
  getClient,
  MODELO,
  SYSTEM_NUTRICIONISTA,
  promptPlanSemanal,
  textoDeMensaje,
  extraerJSON,
} from '@/lib/anthropic';
import { calcularMacros } from '@/lib/calculations';
import { uid } from '@/lib/utils';

export const runtime = 'nodejs';
export const maxDuration = 60;

type PlanGenerado = Omit<PlanSemanal, 'id' | 'fechaCreacion' | 'nombrePersona'>;

export async function POST(req: Request) {
  try {
    const { perfil } = (await req.json()) as { perfil: Perfil };
    if (!perfil || !perfil.nombre) {
      return NextResponse.json(
        { error: 'Falta el perfil del usuario.' },
        { status: 400 }
      );
    }

    const client = getClient();

    // Salida grande → usamos streaming para evitar timeouts de HTTP.
    const stream = client.messages.stream({
      model: MODELO,
      max_tokens: 20000,
      system: SYSTEM_NUTRICIONISTA,
      messages: [{ role: 'user', content: promptPlanSemanal(perfil) }],
    });

    const msg = await stream.finalMessage();
    const texto = textoDeMensaje(msg.content);
    const parsed = extraerJSON<PlanGenerado>(texto);

    // Forzamos que los OBJETIVOS mostrados sean los calculados (Mifflin-St Jeor),
    // independientemente de lo que devuelva el modelo en su resumen.
    const macros = calcularMacros(perfil);
    parsed.resumen = {
      ...parsed.resumen,
      calorias_diarias: macros.calorias,
      proteinas_g: macros.proteinas_g,
      carbohidratos_g: macros.carbos_g,
      grasas_g: macros.grasas_g,
      fibra_g: macros.fibra_g,
      agua_litros: macros.agua_litros,
      distribucionMacros: {
        proteinas_pct: macros.distribucion.proteinas_pct,
        carbos_pct: macros.distribucion.carbos_pct,
        grasas_pct: macros.distribucion.grasas_pct,
      },
    };

    const plan: PlanSemanal = {
      id: uid('plan_'),
      fechaCreacion: new Date().toISOString(),
      nombrePersona: perfil.nombre,
      ...parsed,
    };

    return NextResponse.json({ plan });
  } catch (err) {
    return manejarError(err);
  }
}

function manejarError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (message === 'FALTA_API_KEY') {
    return NextResponse.json(
      {
        error:
          'Falta configurar ANTHROPIC_API_KEY en .env.local. Añade tu clave y reinicia el servidor.',
      },
      { status: 500 }
    );
  }
  console.error('[generate-plan]', message);
  return NextResponse.json(
    { error: 'No se pudo generar el plan. Inténtalo de nuevo.' },
    { status: 500 }
  );
}
