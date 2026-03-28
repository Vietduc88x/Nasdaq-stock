'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/hooks/useSession';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/solar', label: 'Solar PV' },
];

export default function Nav() {
  const pathname = usePathname();
  const { user, loading, signOut } = useSession();

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

        {/* Auth section */}
        <div className="ml-auto flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-8 bg-gray-800 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 text-xs font-bold uppercase">
                  {user.name?.[0] || user.email[0]}
                </div>
                <span className="text-sm text-gray-300 max-w-[150px] truncate">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-800"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href={`/auth/signin?returnTo=${encodeURIComponent(pathname)}`}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
