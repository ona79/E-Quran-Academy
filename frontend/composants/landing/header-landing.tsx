'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { CurseurPersonnalise } from '@/composants/ui/curseur-personnalise';


export function HeaderLanding() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const pathname = usePathname();

  // Scroll progress bar — animated spring for smooth fill
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // On scroll: transparent -> glassmorphism
  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ['rgba(253, 251, 246, 0)', 'rgba(253, 251, 246, 0.95)']
  );

  const headerBackdrop = useTransform(
    scrollY,
    [0, 50],
    ['blur(0px)', 'blur(16px)']
  );

  const headerBorder = useTransform(
    scrollY,
    [0, 50],
    ['1px solid rgba(229, 224, 213, 0)', '1px solid rgba(229, 224, 213, 1)']
  );

  const headerShadow = useTransform(
    scrollY,
    [0, 50],
    ['0 1px 12px rgba(0,0,0,0)', '0 1px 12px rgba(0,0,0,0.06)']
  );

  return (
    <>
      <CurseurPersonnalise />
      <motion.header
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6"
        style={{
          height: 70,
          background: headerBg,
          backdropFilter: headerBackdrop,
          WebkitBackdropFilter: headerBackdrop,
          borderBottom: headerBorder,
          boxShadow: headerShadow,
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cliquable group">
          <img
            src="/mascotte/logo_equran_accademy.png"
            alt="E-Quran Academy Logo"
            className="h-9 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-xl font-extrabold transition-colors duration-200" style={{ color: '#0B5E45' }}>
            E-Quran Academy
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="/"
            className="transition-colors duration-200 cliquable text-[#4B5563] hover:text-[#0B5E45]"
            onClick={() => {
              if (window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            Accueil
          </Link>
          <Link
            href="/professeurs"
            className="transition-colors duration-200 cliquable text-[#4B5563] hover:text-[#0B5E45]"
          >
            Professeurs
          </Link>
          <a
            href="/#comment"
            className="transition-colors duration-200 cliquable text-[#4B5563] hover:text-[#0B5E45]"
          >
            Comment ça marche
          </a>
          <a
            href="/#tarifs"
            className="transition-colors duration-200 cliquable text-[#4B5563] hover:text-[#0B5E45]"
          >
            Tarifs
          </a>
        </nav>

        {/* Actions Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/connexion"
            className="text-sm font-medium transition-colors cliquable text-[#08402F] bg-[#E8F5EF] hover:bg-[#d1ede1] px-5 py-2.5 rounded-full"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="text-sm font-semibold transition-transform duration-200 cliquable text-white px-5 py-2.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #0B5E45 0%, #B8923A 100%)',
              boxShadow: '0 4px 14px rgba(11,94,69,0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            S&apos;inscrire
          </Link>
        </div>

        {/* Bouton Hamburger Mobile */}
        <button
          type="button"
          className="md:hidden p-2 text-2xl cliquable text-[#1A1A1A]"
          onClick={() => setMenuOuvert(!menuOuvert)}
        >
          {menuOuvert ? '✕' : '☰'}
        </button>

        {/* Drawer Menu Mobile */}
        <AnimatePresence>
          {menuOuvert && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute top-[70px] left-0 w-full flex flex-col px-4 py-3 border-b md:hidden bg-white/95 backdrop-blur-xl shadow-2xl border-[#F0EBE1] overflow-hidden rounded-b-[20px]"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href="/"
                  className="text-[14px] font-semibold text-[#1A1A1A] px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setMenuOuvert(false);
                    if (window.location.pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  Accueil
                </Link>
                <Link
                  href="/professeurs"
                  className="text-[14px] font-semibold text-[#1A1A1A] px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOuvert(false)}
                >
                  Professeurs
                </Link>
                <a
                  href="/#comment"
                  className="text-[14px] font-semibold text-[#1A1A1A] px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOuvert(false)}
                >
                  Comment ça marche
                </a>
                <a
                  href="/#tarifs"
                  className="text-[14px] font-semibold text-[#1A1A1A] px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOuvert(false)}
                >
                  Tarifs
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#F0EBE1] px-2 mb-2">
                <Link
                  href="/connexion"
                  className="flex items-center justify-center font-bold text-[13px] py-2.5 rounded-lg transition-colors text-[#0B5E45] bg-[#E8F5EF] hover:bg-[#d1ede1]"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="flex items-center justify-center font-bold text-[13px] py-2.5 rounded-lg text-white shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #0B5E45 0%, #B8923A 100%)',
                  }}
                >
                  S'inscrire
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ── Barre de progression du scroll ── */}
        {pathname === '/' && (
          <motion.div
            style={{
              scaleX,
              transformOrigin: 'left',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #1F6948 0%, #B8923A 100%)',
              borderRadius: '0 2px 2px 0',
            }}
          />
        )}
      </motion.header>
    </>
  );
}
