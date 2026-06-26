'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  reset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <div className="text-5xl" aria-hidden>
            🍃
          </div>
          <h2 className="display text-xl text-primary">Algo se ha torcido</h2>
          <p className="text-sm text-muted">
            Ha ocurrido un error inesperado en esta sección. Puedes reintentar.
          </p>
          <Button onClick={this.reset} variant="secondary">
            <RefreshCw className="h-4 w-4" /> Reintentar
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
