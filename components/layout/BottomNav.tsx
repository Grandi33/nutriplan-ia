'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ShoppingCart, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/plan', label: 'Plan', icon: CalendarDays },
  { href: '/compra', label: 'Compra', icon: ShoppingCart },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/settings', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'fill-primary/10')} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
