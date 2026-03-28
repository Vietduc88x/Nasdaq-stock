import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'RE Materials Intelligence',
  description: 'Track how raw material prices affect renewable energy system costs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
          {children}
        </main>
        <footer className="border-t border-gray-800/50 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-gray-600">
            <div>
              <span className="text-primary-500 font-semibold">RE</span> Materials Intelligence
            </div>
            <div>Data: IRENA, Yahoo Finance, ITRPV</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
