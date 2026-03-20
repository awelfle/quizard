import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Quizard',
    short_name: 'Quizard!',
    description: 'Fun Claude-powered quizzes for Joseph, Liam & Tomas',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1e1b4b',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
