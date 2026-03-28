'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/hooks/useSession';

const links = [
  { href: '/', label: 'Materials' },
  { href: '/solar', label: 'Solar PV' },
  { href: '/solar/anatomy', label: 'Anatomy' },
];

export default function Nav() {
  const pathname = usePathname();
  const { user, loading, signOut } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-[var(--layout-max)] mx-auto px-[var(--layout-px)] h-12 flex items-center gap-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 font-semibold text-[15px] tracking-tight mr-2">
          <span style={{ color: 'var(--accent-green)' }}>RE</span>
          <span style={{ color: 'var(--text-secondary)' }}>Materials</span>
        </Link>

        {/* Nav links */}
        <nav className="flex gap-0.5">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {loading ? null : user ? (
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase"
                style={{ background: 'rgba(52,199,89,0.15)', color: 'var(--up)' }}
              >
                {user.name?.[0] || user.email[0]}
              </div>
              <span className="text-[12px] hidden sm:inline" style={{ color: 'var(--text-tertiary)' }}>
                {user.name || user.email.split('@')[0]}
              </span>
              <button
                onClick={signOut}
                className="text-[11px] px-2 py-1 rounded"
                style={{ color: 'var(--text-faint)' }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href={`/auth/signin?returnTo=${encodeURIComponent(pathname)}`}
              className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'rgba(52,199,89,0.12)', color: 'var(--up)' }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
