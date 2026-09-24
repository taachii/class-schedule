import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Plan Zajęć – I Rok Lekarski | SUM Zabrze 2026/2027',
  description:
    'Harmonogram zajęć dla I roku kierunku lekarskiego, Wydział Nauk Medycznych w Zabrzu, Śląski Uniwersytet Medyczny, semestr zimowy 2026/2027.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Plan WNMZ',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#0d0f14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
