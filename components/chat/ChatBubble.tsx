'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { MensajeChat } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ChatBubble({ mensaje }: { mensaje: MensajeChat }) {
  const esUsuario = mensaje.rol === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex w-full', esUsuario ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] px-4 py-2.5 text-base shadow-card',
          esUsuario
            ? 'rounded-2xl rounded-br-md bg-primary text-primary-contrast'
            : 'rounded-2xl rounded-bl-md bg-surface text-ink'
        )}
      >
        {esUsuario ? (
          <p className="whitespace-pre-wrap">{mensaje.contenido}</p>
        ) : (
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {mensaje.contenido || '…'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
