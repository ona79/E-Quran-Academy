'use client';

// Sidebar de base (commune aux 3 rôles) — Thème Clair.

import { useState, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';

export interface LienSidebar {
  href: string;
  libelle: string;
  icone: ReactNode;
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
  const [reduite, setReduite] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_reduite') === 'true';
    }
    return false;
  });

  const toggleReduite = (val: boolean) => {
    setReduite(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar_reduite', val.toString());
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-30 md:hidden transition-opacity duration-500 ease-in-out ${ouverte ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={surFermeture}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen shrink-0 transform transition-all duration-500 ease-in-out flex flex-col ${ouverte ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          } ${reduite ? 'w-60 md:w-20' : 'w-60'}`}
        style={{
          background: 'linear-gradient(180deg, #1B5E3B 0%, #145A32 100%)',
        }}
      >
        {/* Logo et Toggle */}
        <div
          className={`px-4 flex items-center h-14 group relative ${reduite ? 'justify-center cursor-pointer' : 'justify-between'}`}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}
          onClick={reduite ? () => toggleReduite(false) : undefined}
          title={reduite ? "Agrandir le menu" : undefined}
        >
          <div className="flex items-center gap-2.5 overflow-hidden relative">
            <div className="w-12 h-12 relative shrink-0 rounded-full overflow-hidden bg-white flex items-center justify-center p-1 shadow-sm transition-opacity group-hover:opacity-80">
              <Image src="/mascotte/logo_equran_accademy.png" alt="E-Quran Academy Logo" width={40} height={40} className="object-contain" />
            </div>
            <div className={`transition-opacity duration-300 ${reduite ? 'hidden' : 'block'}`}>
              <span className="text-sm font-bold">Quran-</span>
              <span className="block text-[10px] font-normal" style={{ color: 'rgba(255,255,255,0.65)' }}>Academy</span>
            </div>

            {/* Overlay icône sur logo quand réduit et survolé */}
            {reduite && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full z-10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B5E3B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </div>
            )}
          </div>

          {/* Icône de toggle (façon iTalki) quand étendu */}
          {!reduite && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleReduite(true); }}
              className="hidden md:flex items-center justify-center p-1.5 rounded-lg transition-colors hover:bg-white/10 shrink-0 text-white/80 hover:text-white"
              title="Réduire le menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Liens */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-3 px-2">
          {liens.map((lien) => {
            const estRacine = lien.href === '/eleve' || lien.href === '/professeur' || lien.href === '/admin';
            const actif = estRacine ? chemin === lien.href : (chemin === lien.href || chemin.startsWith(lien.href + '/'));
            return (
              <Link
                key={lien.href}
                href={lien.href}
                onClick={surFermeture}
                className={`flex items-center rounded-xl transition-all duration-150 mb-0.5 relative whitespace-nowrap overflow-hidden ${reduite ? 'md:justify-center md:px-0 py-2.5 px-3' : 'gap-3 px-3 py-2.5'
                  }`}
                style={{
                  background: actif ? '#F6F3EB' : 'transparent',
                  color: actif ? '#1B5E3B' : 'rgba(255,255,255,0.8)',
                  fontWeight: actif ? 600 : 400,
                }}
                title={reduite ? lien.libelle : undefined}
              >
                <span aria-hidden className="text-base w-5 text-center shrink-0 flex items-center justify-center">{lien.icone}</span>
                <span className={`flex-1 truncate transition-opacity duration-300 ${reduite ? 'md:hidden' : 'block'}`}>{lien.libelle}</span>
                {lien.badge !== undefined && lien.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${reduite ? 'md:absolute md:top-1 md:right-1' : ''}`}
                    style={{ background: '#B8923A', color: '#FFFFFF' }}
                  >
                    {lien.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {children}

        {/* Illustration décorative bas sidebar */}
        <div
          className={`relative px-4 py-4 mx-3 mb-3 rounded-2xl overflow-hidden transition-opacity duration-300 ${reduite ? 'md:hidden' : 'block'}`}
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div className="text-center flex flex-col items-center">
            <BookOpen size={22} className="text-amber-300" />
            <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Apprenez le Coran avec excellence
            </p>
          </div>
        </div>

        {/* Footer sidebar */}
        <div
          className={`px-4 py-3 text-[10px] transition-opacity duration-300 whitespace-nowrap overflow-hidden text-center ${reduite ? 'md:hidden' : 'block'}`}
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
        >
          Quran-Academy © 2026
        </div>
      </aside>
    </>
  );
}
