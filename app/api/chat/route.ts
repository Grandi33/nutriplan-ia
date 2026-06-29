import type { Perfil, PlanSemanal, MensajeChat } from '@/lib/types';
import { MODELO, systemChat, streamChatTexto } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Body {
  messages: MensajeChat[];
  perfil: Perfil | null;
  plan: PlanSemanal | null;
}

export async function POST(req: Request) {
  try {
    const { messages, perfil, plan } = (await req.json()) as Body;

    const system = systemChat(perfil, plan);
    const limpios = (messages || [])
      .filter((m) => m.contenido?.trim())
      .map((m) => ({ rol: m.rol, contenido: m.contenido }));

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const t of streamChatTexto({
            model: MODELO,
            system,
            messages: limpios,
          })) {
            controller.enqueue(encoder.encode(t));
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const texto =
      message === 'FALTA_API_KEY'
        ? 'Falta configurar GEMINI_API_KEY en .env.local.'
        : 'No se pudo conectar con el nutricionista IA. Inténtalo de nuevo.';
    return new Response(texto, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
