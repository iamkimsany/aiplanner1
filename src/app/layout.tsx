import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Just Start',
  description: 'A smart planner that adapts to your energy level.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body style={{ backgroundColor: 'var(--color-bg)' }}>
        <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="max-w-[390px] mx-auto min-h-screen px-5 pt-12 pb-10 flex flex-col">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
