import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'RE Materials Intelligence — Renewable Energy Supply Chain',
  description: 'Track how raw material prices affect solar, battery, and wind energy costs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="max-w-[var(--layout-max)] mx-auto px-[var(--layout-px)] py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
