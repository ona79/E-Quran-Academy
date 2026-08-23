import type { Metadata } from 'next';
import './globals.css';
import { FournisseurTheme } from '@/composants/theme/fournisseur-theme';
import { FournisseurAuth } from '@/composants/auth/fournisseur-auth';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Quran-Academy',
  description: 'Plateforme de cours de Coran avec professeurs certifiés.',
};

export default function LayoutRacine({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <FournisseurTheme>
          <FournisseurAuth>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </FournisseurAuth>
        </FournisseurTheme>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
