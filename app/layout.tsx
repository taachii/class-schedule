import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Plan Zajęć – I Rok Lekarski | SUM Zabrze 2026/2027',
  description:
    'Harmonogram zajęć dla I roku kierunku lekarskiego, Wydział Nauk Medycznych w Zabrzu, Śląski Uniwersytet Medyczny, semestr zimowy 2026/2027.',
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
  themeColor: '#f0f4f8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
