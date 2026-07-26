import type { Metadata } from 'next';
import { Inter, Amiri } from 'next/font/google';
import './globals.css';
import { FournisseurTheme } from '@/composants/theme/fournisseur-theme';
import { FournisseurAuth } from '@/composants/auth/fournisseur-auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'E-Quran Academy',
  description: 'Plateforme de cours de Coran avec professeurs certifiés.',
};

export default function LayoutRacine({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${amiri.variable}`}>
      <body className="font-sans">
        <FournisseurTheme>
          <FournisseurAuth>{children}</FournisseurAuth>
        </FournisseurTheme>
      </body>
    </html>
  );
}
