'use client';

// Navigation mobile bas d'écran (étudiant et professeur). 5 icônes max.
// Visible uniquement sur petits écrans (md:hidden).
import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Onglet {
  href: string;
  libelle: string;
  icone: ReactNode;
}

export function BottomNav({ onglets }: { onglets: Onglet[] }) {
  const chemin = usePathname();
  const items = onglets.slice(0, 5);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 md:hidden border-t flex"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: 'var(--bordure)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {items.map((o) => {
        const actif = chemin === o.href || chemin.startsWith(o.href + '/');
        return (
          <Link
            key={o.href}
            href={o.href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs"
            style={{ color: actif ? 'var(--primaire)' : 'var(--texte-secondaire)' }}
          >
            <span aria-hidden className="flex items-center justify-center h-6">{o.icone}</span>
            <span className={actif ? 'font-medium' : ''}>{o.libelle}</span>
          </Link>
        );
      })}
    </nav>
  );
}
