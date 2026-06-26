'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import type { MensajeChat } from '@/lib/types';
import { readLS, writeLS, removeLS } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { uid } from '@/lib/utils';
import { useNutriStore } from '@/lib/store';

export function useChat() {
  const perfil = useNutriStore((s) => s.profile);
  const plan = useNutriStore((s) => s.plan);

  const [messages, setMessages] = useState<MensajeChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const messagesRef = useRef<MensajeChat[]>([]);

  // Cargar historial del chat
  useEffect(() => {
    const stored = readLS<MensajeChat[]>(STORAGE_KEYS.chat, []);
    setMessages(stored);
    messagesRef.current = stored;
    setReady(true);
  }, []);

  const persist = useCallback((msgs: MensajeChat[]) => {
    messagesRef.current = msgs;
    writeLS(STORAGE_KEYS.chat, msgs);
  }, []);

  const send = useCallback(
    async (texto: string) => {
      if (loading) return;
      const userMsg: MensajeChat = {
        id: uid('m_'),
        rol: 'user',
        contenido: texto,
        fecha: Date.now(),
      };
      const asistente: MensajeChat = {
        id: uid('m_'),
        rol: 'assistant',
        contenido: '',
        fecha: Date.now(),
      };

      const base = [...messagesRef.current, userMsg];
      const conPlaceholder = [...base, asistente];
      setMessages(conPlaceholder);
      messagesRef.current = conPlaceholder;
      setLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: base.map((m) => ({ rol: m.rol, contenido: m.contenido })),
            perfil,
            plan,
          }),
        });

        if (!res.ok || !res.body) {
          const errText = await res.text().catch(() => '');
          throw new Error(errText || 'Error en la respuesta');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acumulado = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acumulado += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === asistente.id ? { ...m, contenido: acumulado } : m
            );
            messagesRef.current = next;
            return next;
          });
        }

        const finales = messagesRef.current.map((m) =>
          m.id === asistente.id ? { ...m, contenido: acumulado } : m
        );
        persist(finales);
      } catch (err) {
        const msg =
          err instanceof Error && err.message
            ? err.message
            : 'No se pudo conectar con el nutricionista IA.';
        toast.error(msg.slice(0, 120));
        // quitar el placeholder vacío
        const limpio = messagesRef.current.filter(
          (m) => m.id !== asistente.id
        );
        setMessages(limpio);
        persist(limpio);
      } finally {
        setLoading(false);
      }
    },
    [loading, perfil, plan, persist]
  );

  const clear = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    removeLS(STORAGE_KEYS.chat);
  }, []);

  return { messages, loading, ready, send, clear };
}
