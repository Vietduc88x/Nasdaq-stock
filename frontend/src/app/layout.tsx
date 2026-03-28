import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'RE Materials Intelligence',
  description: 'Track how raw material prices affect renewable energy system costs',
};

function Nav() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="font-bold text-lg text-white tracking-tight">
          <span className="text-primary-500">RE</span> Materials
        </Link>
        <nav className="flex gap-1 text-sm">
          <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/solar" className="px-3 py-1.5 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
            Solar PV
          </Link>
        </nav>
        <div className="ml-auto text-xs text-gray-500">
          market.techmadeeasy.info
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
