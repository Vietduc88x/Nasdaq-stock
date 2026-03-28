'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/solar', label: 'Solar PV' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-800/50 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        <Link href="/" className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 text-xs font-bold">
            RE
          </span>
          <span className="hidden sm:inline text-gray-200">Materials</span>
        </Link>
        <nav className="flex gap-1 text-sm ml-2">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
