import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Plan Zajęć WNMZ',
    short_name: 'Plan WNMZ',
    description: 'Harmonogram zajęć dla kierunku lekarskiego SUM Zabrze',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0f4f8',
    theme_color: '#f0f4f8',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
