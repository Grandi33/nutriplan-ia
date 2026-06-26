import type { Perfil, PlanSemanal, MensajeChat } from '@/lib/types';
import { getClient, MODELO, systemChat } from '@/lib/anthropic';

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

    const client = getClient();
    const system = systemChat(perfil, plan);

    const apiMessages = (messages || [])
      .filter((m) => m.contenido?.trim())
      .map((m) => ({ role: m.rol, content: m.contenido }));

    const stream = client.messages.stream({
      model: MODELO,
      max_tokens: 2048,
      system,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
      cancel() {
        stream.abort();
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
        ? 'Falta configurar ANTHROPIC_API_KEY en .env.local.'
        : 'No se pudo conectar con el nutricionista IA. Inténtalo de nuevo.';
    return new Response(texto, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
