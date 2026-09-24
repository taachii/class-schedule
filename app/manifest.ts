import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Plan Zajęć WNMZ',
    short_name: 'Plan WNMZ',
    description: 'Harmonogram zajęć dla kierunku lekarskiego SUM Zabrze',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0f14',
    theme_color: '#0d0f14',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
