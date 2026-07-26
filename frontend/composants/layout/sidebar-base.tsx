'use client';

// Sidebar de base (commune aux 3 rôles) — Dark Dashboard Edition.
// Fond vert profond #08402F, liens ivoire, lien actif = border-left or + bg vert.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

export interface LienSidebar {
  href: string;
  libelle: string;
  icone: string;
  badge?: number;
}

export function SidebarBase({
  liens,
  ouverte,
  surFermeture,
  children,
}: {
  liens: LienSidebar[];
  ouverte: boolean;
  surFermeture: () => void;
  children?: ReactNode;
}) {
  const chemin = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {ouverte && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={surFermeture}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-60 shrink-0 transform transition-transform duration-300 md:translate-x-0 flex flex-col ${
          ouverte ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#08402F',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          // Motif islamique en filigrane
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20 2L22.5 10H31L24.5 15L27 23L20 18L13 23L15.5 15L9 10H17.5Z' fill='none' stroke='white' stroke-width='0.5' opacity='0.05'/%3E%3C/svg%3E")`,
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5 flex items-center gap-2.5 font-bold"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#F0EDE6' }}
        >
          <span className="text-2xl">📖</span>
          <div>
            <span className="text-sm">E-Quran</span>
            <span className="block text-[10px] font-normal" style={{ color: 'rgba(240,237,230,0.5)' }}>Academy</span>
          </div>
        </div>

        {/* Liens */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 px-2">
          {liens.map((lien) => {
            const actif = chemin === lien.href || chemin.startsWith(lien.href + '/');
            return (
              <Link
                key={lien.href}
                href={lien.href}
                onClick={surFermeture}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 mb-0.5 relative"
                style={{
                  borderLeft: actif ? '3px solid #B8923A' : '3px solid transparent',
                  background: actif ? 'rgba(11,94,69,0.4)' : 'transparent',
                  color: actif ? '#F0EDE6' : 'rgba(240,237,230,0.7)',
                  fontWeight: actif ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!actif) e.currentTarget.style.background = 'rgba(11,94,69,0.2)';
                }}
                onMouseLeave={(e) => {
                  if (!actif) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span aria-hidden className="text-base w-5 text-center shrink-0">{lien.icone}</span>
                <span className="flex-1 truncate">{lien.libelle}</span>
                {lien.badge !== undefined && lien.badge > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: '#B8923A', color: '#0D1A14' }}
                  >
                    {lien.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {children}

        {/* Footer sidebar */}
        <div
          className="px-4 py-3 text-[10px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(240,237,230,0.3)' }}
        >
          E-Quran Academy © 2025
        </div>
      </aside>
    </>
  );
}
