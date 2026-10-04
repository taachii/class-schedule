import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://planwnmz.pl';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Plan Zajęć – Kierunek Lekarski | SUM Zabrze',
  description:
    'Zawsze aktualny harmonogram zajęć, wykładów i seminariów dla studentów kierunku lekarskiego na Wydziale Nauk Medycznych w Zabrzu (Śląski Uniwersytet Medyczny).',
  keywords: ['plan zajęć', 'sum', 'zabrze', 'lekarski', 'śląski uniwersytet medyczny', 'wnmz', 'harmonogram', 'studia'],
  authors: [{ name: 'Adam Chyt' }],
  openGraph: {
    title: 'Plan Zajęć – Kierunek Lekarski | SUM Zabrze',
    description: 'Zawsze aktualny harmonogram zajęć dla studentów kierunku lekarskiego na WNMZ.',
    url: '/',
    siteName: 'Plan Zajęć SUM',
    locale: 'pl_PL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan Zajęć – Kierunek Lekarski | SUM',
    description: 'Bądź na bieżąco z planem zajęć na Wydziale Nauk Medycznych w Zabrzu.',
  },
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Plan WNMZ',
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: '3JJojKDLvq-FJDGfrKkdqiRZnECIuuhXGZBAx5ICeyg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Plan Zajęć – Kierunek Lekarski | SUM Zabrze',
    url: siteUrl,
    description: 'Harmonogram zajęć dla kierunku lekarskiego, WNMZ SUM Zabrze.',
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'Śląski Uniwersytet Medyczny w Katowicach',
    }
  };

  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.variable}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
