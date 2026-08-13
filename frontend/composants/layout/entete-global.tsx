'use client';

// En-tête global (pages publiques + landing).
// - Logo cliquable → /
// - Navigation desktop : Professeurs, Comment ça marche
// - Droite : Connexion/Inscription (non connecté) ou avatar + menu (connecté)
// - Hamburger sur mobile
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { utiliserAuth } from '@/composants/auth/fournisseur-auth';
import { BasculeTheme } from '@/composants/theme/bascule-theme';
import { LienBouton } from '@/composants/ui/boutons';
import { ModalConfirmation } from '@/composants/ui/modal-confirmation';

export function EnteteGlobal() {
  const { utilisateur, deconnexion } = utiliserAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [menuAvatar, setMenuAvatar] = useState(false);
  const [modalDeconnexion, setModalDeconnexion] = useState(false);
  const refAvatar = useRef<HTMLDivElement>(null);

  const defilerVersSection = (e: React.MouseEvent) => {
    const el = document.getElementById('comment');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Ferme le menu avatar si clic extérieur.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (refAvatar.current && !refAvatar.current.contains(e.target as Node)) {
        setMenuAvatar(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initiales = utilisateur
    ? utilisateur.nomComplet
      .split(' ')
      .map((m) => m[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : '';

  const lienEspace =
    utilisateur?.role === 'ADMIN'
      ? '/admin'
      : utilisateur?.role === 'PROFESSEUR'
        ? '/professeur'
        : '/eleve';

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: 'var(--fond-surface)',
        borderColor: 'var(--bordure)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <ModalConfirmation
        ouvert={modalDeconnexion}
        titre="Voulez-vous vraiment vous déconnecter ?"
        libelleConfirmer="Déconnexion"
        variante="warning"
        surConfirmation={() => {
          setModalDeconnexion(false);
          deconnexion();
        }}
        surFermeture={() => setModalDeconnexion(false)}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold shrink-0">
          <img
            src="/mascotte/logo_equran_accademy.png"
            alt="Logo Quran-Academy"
            className="w-7 h-7 object-contain"
          />
          <span className="text-sm sm:text-base font-extrabold">Quran-<span style={{ color: '#B8923A' }}>Academy</span></span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:opacity-70"
            onClick={() => {
              if (window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            Accueil
          </Link>
          <Link href="/professeurs" className="text-sm font-medium hover:opacity-70">
            Professeurs
          </Link>
          <Link href="/#comment" onClick={defilerVersSection} className="text-sm font-medium hover:opacity-70">
            Comment ça marche
          </Link>
        </nav>

        {/* Droite */}
        <div className="flex items-center gap-2">
          <BasculeTheme />

          {utilisateur ? (
            <div className="relative" ref={refAvatar}>
              <button
                type="button"
                onClick={() => setMenuAvatar((o) => !o)}
                className="w-9 h-9 rounded-full font-medium text-sm flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--couleur-primaire)',
                  color: 'var(--couleur-ivoire)',
                }}
                aria-label="Menu du compte"
              >
                {initiales}
              </button>
              {menuAvatar && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border py-2 animate-fondu"
                  style={{
                    backgroundColor: 'var(--fond-surface)',
                    borderColor: 'var(--bordure)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}
                >
                  <Link
                    href={lienEspace}
                    className="block px-4 py-2 text-sm hover:bg-[var(--fond)]"
                    onClick={() => setMenuAvatar(false)}
                  >
                    Mon espace
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuAvatar(false);
                      setModalDeconnexion(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-[var(--fond)]"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/connexion" className="text-sm font-medium px-3 py-2">
                Connexion
              </Link>
              <LienBouton href="/inscription" variante="primaire">
                Inscription
              </LienBouton>
            </div>
          )}

          {/* Hamburger mobile */}
          <button
            type="button"
            className="sm:hidden p-2"
            onClick={() => setMenuOuvert((o) => !o)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOuvert}
          >
            <span aria-hidden>{menuOuvert ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {menuOuvert && (
        <nav
          className="sm:hidden border-t px-4 py-3 space-y-2"
          style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
        >
          <Link
            href="/"
            className="block py-2 text-sm font-medium"
            onClick={() => {
              setMenuOuvert(false);
              if (window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            Accueil
          </Link>
          <Link href="/professeurs" className="block py-2 text-sm font-medium" onClick={() => setMenuOuvert(false)}>
            Professeurs
          </Link>
          <Link
            href="/#comment"
            onClick={(e) => {
              setMenuOuvert(false);
              defilerVersSection(e);
            }}
            className="block py-2 text-sm font-medium"
          >
            Comment ça marche
          </Link>
          {!utilisateur && (
            <div className="flex gap-2 pt-2">
              <LienBouton href="/connexion" variante="secondaire" pleineLargeur>
                Connexion
              </LienBouton>
              <LienBouton href="/inscription" variante="primaire" pleineLargeur>
                Inscription
              </LienBouton>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
