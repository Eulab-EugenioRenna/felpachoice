'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Nuovo Ordine' },
    { href: '/orders', label: 'Lista Ordini' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Shirt className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              FelpaChoice
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-foreground',
                  pathname === link.href
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-start md:hidden">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <Shirt className="h-6 w-6 text-primary" />
                 <span className="font-bold">
                    FelpaChoice
                </span>
            </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 md:justify-end">
           <nav className="flex items-center space-x-2 text-sm font-medium md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-foreground rounded-md px-3 py-2',
                  pathname === link.href
                    ? 'bg-secondary text-foreground'
                    : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
