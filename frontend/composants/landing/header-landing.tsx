'use client';

import { useState } from 'react';
import Link from 'next/link';

export function HeaderLanding() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 w-full"
      style={{
        height: 64,
        background: 'rgba(13,26,20,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="text-lg font-bold transition-colors duration-200"
        style={{ color: '#F0EDE6' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#B8923A')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#F0EDE6')}
      >
        📖 E-Quran Academy
      </Link>

      {/* Navigation Desktop */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link
          href="/professeurs"
          className="transition-colors duration-200"
          style={{ color: 'rgba(240,237,230,0.7)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F0EDE6')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240,237,230,0.7)')}
        >
          Professeurs
        </Link>
        <a
          href="#comment"
          className="transition-colors duration-200"
          style={{ color: 'rgba(240,237,230,0.7)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F0EDE6')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240,237,230,0.7)')}
        >
          Comment ça marche
        </a>
        <a
          href="#tarifs"
          className="transition-colors duration-200"
          style={{ color: 'rgba(240,237,230,0.7)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F0EDE6')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240,237,230,0.7)')}
        >
          Tarifs
        </a>
      </nav>

      {/* Actions Desktop */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          href="/connexion"
          className="text-sm font-medium transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#F0EDE6',
            borderRadius: 10,
            padding: '8px 18px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          Connexion
        </Link>
        <Link
          href="/inscription"
          className="text-sm font-semibold transition-transform duration-200"
          style={{
            background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
            color: 'white',
            borderRadius: 10,
            padding: '8px 18px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(11,94,69,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          S&apos;inscrire
        </Link>
      </div>

      {/* Bouton Hamburger Mobile */}
      <button
        type="button"
        className="md:hidden p-2 text-2xl"
        style={{ color: '#F0EDE6' }}
        onClick={() => setMenuOuvert(!menuOuvert)}
      >
        {menuOuvert ? '✕' : '☰'}
      </button>

      {/* Drawer Menu Mobile */}
      {menuOuvert && (
        <div
          className="absolute top-[64px] left-0 w-full flex flex-col gap-6 p-6 border-b md:hidden"
          style={{
            background: 'rgba(13,26,20,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(255,255,255,0.06)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          <Link
            href="/professeurs"
            className="text-lg font-medium"
            style={{ color: 'rgba(240,237,230,0.9)' }}
            onClick={() => setMenuOuvert(false)}
          >
            Professeurs
          </Link>
          <a
            href="#comment"
            className="text-lg font-medium"
            style={{ color: 'rgba(240,237,230,0.9)' }}
            onClick={() => setMenuOuvert(false)}
          >
            Comment ça marche
          </a>
          <a
            href="#tarifs"
            className="text-lg font-medium"
            style={{ color: 'rgba(240,237,230,0.9)' }}
            onClick={() => setMenuOuvert(false)}
          >
            Tarifs
          </a>
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <Link
              href="/connexion"
              className="text-center font-medium py-3 rounded-xl transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#F0EDE6',
              }}
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="text-center font-semibold py-3 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
                color: 'white',
              }}
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
