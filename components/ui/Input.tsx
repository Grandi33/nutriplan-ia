'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, suffix, className, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-11 w-full rounded-xl border bg-surface px-3.5 text-base text-ink placeholder:text-muted/70 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary/35',
            error ? 'border-fat' : 'border-line',
            suffix && 'pr-12',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-fat">{error}</p>}
    </div>
  );
});
