import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PaieCash - Solutions digitales pour clubs de football',
    short_name: 'PaieCash',
    description: 'Solutions digitales innovantes pour rapprocher les clubs de football de leurs supporters.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4FBA73',
    icons: [
      {
        src: '/logo-nobg.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/logo-nobg.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}