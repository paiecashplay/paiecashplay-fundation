// app/layout.tsx
import './globals.css'; // ton fichier Tailwind global
import { Inter } from 'next/font/google';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PaieCashPlay - Super App avec Dons Solidaires',
  description: 'Plateforme solidaire pour soutenir les enfants africains par le sport.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <Head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </Head>
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
