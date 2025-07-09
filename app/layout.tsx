// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PaieCashPlay - Super App avec Dons Solidaires',
  description: 'Plateforme solidaire pour soutenir les enfants africains par le sport.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* FontAwesome CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
        />
        {/* Chart.js CDN */}
        <script
          src="https://cdn.jsdelivr.net/npm/chart.js"
          defer
        ></script>
      </head>
      <body className={inter.className}>
        <Suspense fallback={<div>Chargement de la page...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
