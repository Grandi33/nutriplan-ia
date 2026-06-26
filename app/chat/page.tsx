'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Stethoscope } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useProfile } from '@/hooks/useProfile';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { SuggestionChips } from '@/components/chat/SuggestionChips';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Button } from '@/components/ui/Button';

export default function ChatPage() {
  const router = useRouter();
  const { profile, hydrated } = useProfile();
  const { messages, loading, ready, send, clear } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated && !profile) router.replace('/onboarding');
  }, [hydrated, profile, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const ultimoEsAsistenteVacio =
    messages.length > 0 &&
    messages[messages.length - 1].rol === 'assistant' &&
    messages[messages.length - 1].contenido === '';

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-2xl flex-col md:h-[calc(100vh-8rem)]">
      {/* Cabecera */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div>
            <h1 className="display text-lg text-primary">Nutricionista IA</h1>
            <p className="text-xs text-muted">Conoce tu perfil y tu plan</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button size="sm" variant="ghost" onClick={clear}>
            <Trash2 className="h-4 w-4" /> Nueva
          </Button>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-surface-2 p-4">
        {ready && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="text-5xl">👩‍⚕️</div>
            <div>
              <p className="display text-lg text-primary">
                ¿En qué te ayudo hoy?
              </p>
              <p className="text-sm text-muted">
                Pregúntame sobre tu plan, recetas o nutrición.
              </p>
            </div>
            <SuggestionChips onPick={send} />
          </div>
        )}

        {messages.map((m, i) => {
          // No mostramos la burbuja vacía del asistente: mostramos el typing.
          if (
            i === messages.length - 1 &&
            ultimoEsAsistenteVacio &&
            loading
          ) {
            return (
              <div key={m.id} className="flex justify-start">
                <TypingIndicator />
              </div>
            );
          }
          return <ChatBubble key={m.id} mensaje={m} />;
        })}

        <div ref={bottomRef} />
      </div>

      {/* Chips rápidos sobre el input cuando ya hay conversación */}
      {messages.length > 0 && !loading && (
        <div className="mt-3 overflow-x-auto">
          <SuggestionChips onPick={send} />
        </div>
      )}

      {/* Input */}
      <div className="mt-3">
        <ChatInput onSend={send} disabled={loading} />
      </div>
    </div>
  );
}
