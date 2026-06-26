'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TagInput({
  label,
  value,
  onChange,
  placeholder,
  suggestions = [],
  tone = 'primary',
}: {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  tone?: 'primary' | 'accent';
}) {
  const [draft, setDraft] = useState('');

  function add(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (value.some((v) => v.toLowerCase() === t.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, t]);
    setDraft('');
  }

  function remove(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  const chipColor =
    tone === 'accent'
      ? 'bg-accent-soft text-accent'
      : 'bg-primary-soft text-primary';

  const sugerenciasDisponibles = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl border border-line bg-surface p-2">
        {value.map((tag) => (
          <span
            key={tag}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium',
              chipColor
            )}
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Quitar ${tag}`}
              className="opacity-70 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 bg-transparent px-1.5 py-1 text-sm text-ink placeholder:text-muted/70 focus:outline-none"
        />
      </div>

      {sugerenciasDisponibles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {sugerenciasDisponibles.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-3 w-3" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
