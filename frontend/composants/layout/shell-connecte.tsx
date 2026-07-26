'use client';

// Shell commun aux espaces connectés — Dark Dashboard Edition.
// Fond #0D1A14 + motif islamique, header glassmorphism, sidebar verte profonde.
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { utiliserAuth } from '@/composants/auth/fournisseur-auth';
import { apiClient } from '@/lib/api-client';
import type { Role, ProfilProfesseur, Page, Message } from '@/lib/types';
import { SidebarBase, type LienSidebar } from './sidebar-base';
import { BottomNav } from './bottom-nav';

const LIENS_PAR_ROLE: Record<Role, LienSidebar[]> = {
  ELEVE: [
    { href: '/eleve', libelle: 'Accueil', icone: '🏠' },
    { href: '/eleve/reserver', libelle: 'Réserver', icone: '🗓️' },
    { href: '/eleve/classe', libelle: 'Cours', icone: '🎓' },
    { href: '/eleve/messages', libelle: 'Messages', icone: '💬' },
    { href: '/eleve/profil', libelle: 'Profil', icone: '👤' },
  ],
  PROFESSEUR: [
    { href: '/professeur', libelle: 'Accueil', icone: '🏠' },
    { href: '/professeur/disponibilites', libelle: 'Disponibilités', icone: '🗓️' },
    { href: '/professeur/suivi', libelle: 'Cours', icone: '🎓' },
    { href: '/professeur/messages', libelle: 'Messages', icone: '💬' },
    { href: '/professeur/profil', libelle: 'Profil', icone: '👤' },
    { href: '/professeur/revenus', libelle: 'Revenus', icone: '💰' },
  ],
  ADMIN: [
    { href: '/admin', libelle: 'Tableau de bord', icone: '📊' },
    { href: '/admin/professeurs', libelle: 'Professeurs', icone: '👨‍🏫' },
    { href: '/admin/utilisateurs', libelle: 'Utilisateurs', icone: '👥' },
    { href: '/admin/feature-flags', libelle: 'Feature flags', icone: '🚩' },
    { href: '/admin/paiements', libelle: 'Paiements', icone: '💳' },
  ],
};

// Motif islamique en position fixed sur toute la page
function MotifFond() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.03 }}
      aria-hidden
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="motif-dashboard" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M30 4L33.5 14H44L35.5 20L39 30L30 24L21 30L24.5 20L16 14H26.5Z"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#motif-dashboard)" />
      </svg>
    </div>
  );
}

export function ShellConnecte({ children }: { children: ReactNode }) {
  const { utilisateur, deconnexion } = utiliserAuth();
  const pathname = usePathname();
  const [valide, setValide] = useState<boolean | null>(null);
  const [enChargementValide, setEnChargementValide] = useState(false);
  const [nonLus, setNonLus] = useState(0);
  const [drawerOuvert, setDrawerOuvert] = useState(false);

  useEffect(() => {
    if (utilisateur?.role === 'PROFESSEUR') {
      setEnChargementValide(true);
      apiClient
        .get<ProfilProfesseur>('/utilisateurs/professeurs/moi')
        .then((p) => setValide(p.valide))
        .catch(() => setValide(false))
        .finally(() => setEnChargementValide(false));
    }
  }, [utilisateur]);

  useEffect(() => {
    if (!utilisateur || utilisateur.role === 'ADMIN') return;
    const chargerNonLus = async () => {
      try {
        const page = await apiClient.get<Page<Message>>(
          '/messagerie/messages/recus?page=1&taille=100',
        );
        setNonLus(page.donnees.filter((m) => !m.lu).length);
      } catch {
        /* ignore */
      }
    };
    chargerNonLus();
    const intervalle = setInterval(chargerNonLus, 30000);
    return () => clearInterval(intervalle);
  }, [utilisateur]);

  if (!utilisateur) return null;

  // Ajoute le badge messages non lus sur le lien concerné.
  const liens = LIENS_PAR_ROLE[utilisateur.role].map((l) =>
    l.libelle === 'Messages' ? { ...l, badge: nonLus } : l,
  );

  const estProfEtNonValide =
    utilisateur.role === 'PROFESSEUR' &&
    valide === false &&
    pathname !== '/professeur/profil';

  // Bottom nav : 5 onglets max (on prend les liens principaux).
  const ongletsMobile = liens.slice(0, 5).map((l) => ({
    href: l.href,
    libelle: l.libelle,
    icone: l.icone,
  }));

  const labelRole = utilisateur.role === 'ADMIN'
    ? 'Administration'
    : utilisateur.role === 'PROFESSEUR'
    ? 'Espace Professeur'
    : 'Espace Élève';

  return (
    <div
      className="h-screen overflow-hidden flex relative"
      style={{ background: '#0D1A14', color: '#F0EDE6' }}
    >
      {/* Motif islamique de fond — z-index 0 */}
      <MotifFond />

      {/* Sidebar — z-index 40 */}
      <SidebarBase
        liens={liens}
        ouverte={drawerOuvert}
        surFermeture={() => setDrawerOuvert(false)}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 relative" style={{ zIndex: 1 }}>

        {/* Header mobile */}
        <header
          className="sticky top-0 z-20 md:hidden flex items-center justify-between px-4 h-14"
          style={{
            background: 'rgba(13,26,20,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            type="button"
            onClick={() => setDrawerOuvert(true)}
            aria-label="Ouvrir le menu"
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#F0EDE6' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm" style={{ color: '#F0EDE6' }}>
            <span>📖</span> E-Quran
          </Link>
          <button
            type="button"
            onClick={deconnexion}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(240,237,230,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Sortir
          </button>
        </header>

        {/* Header desktop */}
        <header
          className="sticky top-0 z-20 hidden md:flex items-center justify-between px-6 h-14"
          style={{
            background: 'rgba(13,26,20,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: 'rgba(240,237,230,0.5)' }}>
              {labelRole}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <span className="text-sm font-medium" style={{ color: '#F0EDE6' }}>
              {utilisateur.nomComplet}
            </span>
          </div>
          <button
            type="button"
            onClick={deconnexion}
            className="text-sm px-4 py-1.5 rounded-lg transition-all duration-150"
            style={{
              color: 'rgba(240,237,230,0.7)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            Déconnexion
          </button>
        </header>

        {/* Contenu — scroll interne uniquement */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar w-full px-4 sm:px-6 py-6 ${utilisateur.role === 'ADMIN' ? 'pb-6' : 'pb-24 md:pb-6'}`}>
          {enChargementValide ? (
            <div className="flex items-center gap-3 py-10">
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#0B5E45', borderTopColor: 'transparent' }} />
              <p style={{ color: 'rgba(240,237,230,0.5)' }}>Chargement…</p>
            </div>
          ) : estProfEtNonValide ? (
            <div
              className="max-w-md mx-auto mt-10 rounded-2xl p-8 text-center space-y-4"
              style={{ background: '#131F18', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-5xl">⏳</p>
              <p className="text-lg font-semibold" style={{ color: '#F0EDE6' }}>Compte en cours de validation</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,230,0.55)' }}>
                Votre compte est en cours de validation par l&apos;administrateur.
                Vous recevrez un email de confirmation dès qu&apos;il sera activé.
              </p>
              <Link
                href="/professeur/profil"
                className="inline-block px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #0B5E45, #B8923A)' }}
              >
                Compléter mon profil →
              </Link>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Footer */}
        <footer
          className="py-3 text-center text-xs pb-16 md:pb-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(240,237,230,0.25)' }}
        >
          E-Quran Academy — {utilisateur.nomComplet}
        </footer>
      </div>

      {utilisateur.role !== 'ADMIN' && <BottomNav onglets={ongletsMobile} />}
    </div>
  );
}
