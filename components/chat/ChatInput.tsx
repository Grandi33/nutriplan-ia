'use client';

import { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (texto: string) => void;
  disabled?: boolean;
}) {
  const [valor, setValor] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  function enviar() {
    const t = valor.trim();
    if (!t || disabled) return;
    onSend(t);
    setValor('');
    if (ref.current) ref.current.style.height = 'auto';
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  function autoGrow(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValor(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 shadow-card">
      <textarea
        ref={ref}
        value={valor}
        onChange={autoGrow}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Pregúntale a tu nutricionista…"
        className="max-h-36 flex-1 resize-none bg-transparent px-2 py-1.5 text-base text-ink placeholder:text-muted/70 focus:outline-none"
      />
      <button
        onClick={enviar}
        disabled={disabled || !valor.trim()}
        aria-label="Enviar"
        className={cn(
          'grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-primary text-primary-contrast transition-opacity',
          (disabled || !valor.trim()) && 'opacity-40'
        )}
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
