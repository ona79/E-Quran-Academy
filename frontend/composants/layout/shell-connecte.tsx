'use client';

// Shell commun aux espaces connectés — Thème Clair.
// Fond clair #F8F9FA, sidebar verte, header blanc.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { utiliserAuth } from '@/composants/auth/fournisseur-auth';
import { apiClient } from '@/lib/api-client';
import type { Role, ProfilProfesseur, Page, Message } from '@/lib/types';
import {
  Home,
  Calendar,
  GraduationCap,
  MessageSquare,
  User,
  Wallet,
  CalendarPlus,
  LayoutDashboard,
  UserCheck,
  Users,
  Sliders,
  CreditCard,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { SidebarBase, type LienSidebar } from './sidebar-base';
import { BottomNav } from './bottom-nav';
import { ModalConfirmation } from '@/composants/ui/modal-confirmation';

const LIENS_PAR_ROLE: Record<Role, LienSidebar[]> = {
  ELEVE: [
    { href: '/eleve', libelle: 'Accueil', icone: <Home size={18} /> },
    { href: '/eleve/reserver', libelle: 'Réserver', icone: <CalendarPlus size={18} /> },
    { href: '/eleve/classe', libelle: 'Cours', icone: <GraduationCap size={18} /> },
    { href: '/eleve/facturation', libelle: 'Portefeuille', icone: <Wallet size={18} /> },
    { href: '/eleve/messages', libelle: 'Messages', icone: <MessageSquare size={18} /> },
    { href: '/eleve/profil', libelle: 'Profil', icone: <User size={18} /> },
  ],
  PROFESSEUR: [
    { href: '/professeur', libelle: 'Accueil', icone: <Home size={18} /> },
    { href: '/professeur/disponibilites', libelle: 'Disponibilités', icone: <Calendar size={18} /> },
    { href: '/professeur/suivi', libelle: 'Cours', icone: <GraduationCap size={18} /> },
    { href: '/professeur/messages', libelle: 'Messages', icone: <MessageSquare size={18} /> },
    { href: '/professeur/profil', libelle: 'Profil', icone: <User size={18} /> },
    { href: '/professeur/revenus', libelle: 'Revenus', icone: <Wallet size={18} /> },
  ],
  ADMIN: [
    { href: '/admin', libelle: 'Tableau de bord', icone: <LayoutDashboard size={18} /> },
    { href: '/admin/professeurs', libelle: 'Professeurs', icone: <UserCheck size={18} /> },
    { href: '/admin/utilisateurs', libelle: 'Utilisateurs', icone: <Users size={18} /> },
    { href: '/admin/feature-flags', libelle: 'Feature flags', icone: <Sliders size={18} /> },
    { href: '/admin/paiements', libelle: 'Paiements', icone: <CreditCard size={18} /> },
  ],
};

export function ShellConnecte({ children, sansPadding = false }: { children: ReactNode, sansPadding?: boolean }) {
  const { utilisateur, deconnexion } = utiliserAuth();
  const pathname = usePathname();
  const [valide, setValide] = useState<boolean | null>(null);
  const [photoProf, setPhotoProf] = useState<string | null>(null);
  const [enChargementValide, setEnChargementValide] = useState(false);
  const [nonLus, setNonLus] = useState(0);
  const [drawerOuvert, setDrawerOuvert] = useState(false);
  const [menuProfilOuvert, setMenuProfilOuvert] = useState(false);
  const [modalDeconnexion, setModalDeconnexion] = useState(false);
  const refMenuProfil = useRef<HTMLDivElement>(null);
  const refMenuMobile = useRef<HTMLDivElement>(null);

  // Fermeture du menu profil au clic extérieur (Desktop & Mobile)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const dansDesktop = refMenuProfil.current?.contains(target);
      const dansMobile = refMenuMobile.current?.contains(target);

      if (!dansDesktop && !dansMobile) {
        setMenuProfilOuvert(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Récupération de la validation et de la photo du professeur
  useEffect(() => {
    const chargerProfilProf = () => {
      if (utilisateur?.role === 'PROFESSEUR') {
        setEnChargementValide(true);
        apiClient
          .get<ProfilProfesseur>('/utilisateurs/professeurs/moi')
          .then((p) => {
            setValide(p.valide);
            if (p.photoUrl) {
              setPhotoProf(p.photoUrl);
            }
          })
          .catch(() => setValide(false))
          .finally(() => setEnChargementValide(false));
      }
    };

    chargerProfilProf();
    window.addEventListener('profil_mis_a_jour', chargerProfilProf);
    return () => window.removeEventListener('profil_mis_a_jour', chargerProfilProf);
  }, [utilisateur, pathname]);

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

  const initiales = utilisateur.nomComplet
    .split(' ')
    .map((m) => m[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const urlPhotoFinale = photoProf
    ? photoProf.startsWith('/')
      ? `/api-backend${photoProf}`
      : photoProf
    : null;

  const lienProfil = utilisateur.role === 'ADMIN'
    ? '/admin'
    : utilisateur.role === 'PROFESSEUR'
      ? '/professeur/profil'
      : '/eleve/profil';

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
      : 'Espace Étudiant';

  return (
    <div
      className="h-screen overflow-hidden flex relative"
      style={{ background: 'var(--fond-page)', color: 'var(--texte)' }}
    >
      {/* Modale de confirmation de déconnexion (Global z-50) */}
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

      {/* Menu Popover Mobile (Niveau Racine avec refMenuMobile) */}
      {menuProfilOuvert && (
        <div className="md:hidden fixed inset-0 z-[100] flex items-start justify-end p-4 pt-16">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMenuProfilOuvert(false)}
          />
          <div
            ref={refMenuMobile}
            className="relative z-10 w-64 rounded-2xl p-3 shadow-2xl bg-white border border-gray-200 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 mb-1">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs shadow-sm bg-[#1B5E3B] text-white">
                {urlPhotoFinale ? (
                  <img src={urlPhotoFinale} alt={utilisateur.nomComplet} className="w-full h-full object-cover" />
                ) : (
                  initiales
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-gray-900 truncate">{utilisateur.nomComplet}</p>
                <p className="text-[11px] text-gray-500 truncate">{utilisateur.email}</p>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <Link
                href={lienProfil}
                onClick={() => setMenuProfilOuvert(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors w-full cursor-pointer"
              >
                <User size={15} className="text-gray-400" />
                <span>Mon profil</span>
              </Link>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuProfilOuvert(false);
                  setModalDeconnexion(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
              >
                <LogOut size={15} className="text-red-500" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--bordure)',
          }}
        >
          <button
            type="button"
            onClick={() => setDrawerOuvert(true)}
            aria-label="Ouvrir le menu"
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--texte)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--texte)' }}>
            <img
              src="/mascotte/logo_equran_accademy.png"
              alt="Logo Quran-Academy"
              className="w-7 h-7 object-contain"
            />
            <span>Quran-<span style={{ color: '#B8923A' }}>Academy</span></span>
          </Link>

          {/* Avatar menu mobile */}
          <button
            type="button"
            onClick={() => setMenuProfilOuvert((prev) => !prev)}
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs shadow-sm bg-[#1B5E3B] text-white shrink-0 cursor-pointer"
          >
            {urlPhotoFinale ? (
              <img src={urlPhotoFinale} alt={utilisateur.nomComplet} className="w-full h-full object-cover" />
            ) : (
              initiales
            )}
          </button>
        </header>

        {/* Header desktop */}
        <header
          className="sticky top-0 z-20 hidden md:flex items-center justify-between px-6 h-14"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--bordure)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ background: 'rgba(27,94,59,0.08)', color: 'var(--primaire)' }}>
              {labelRole}
            </span>
          </div>

          {/* Menu Déroulant Profil Utilisateur Desktop */}
          <div className="relative" ref={refMenuProfil}>
            <button
              type="button"
              onClick={() => setMenuProfilOuvert((prev) => !prev)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full hover:bg-gray-100/80 transition-all border border-transparent hover:border-gray-200 cursor-pointer"
            >
              <span className="text-xs font-semibold text-gray-800">{utilisateur.nomComplet}</span>
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 shadow-sm bg-[#1B5E3B] text-white"
              >
                {urlPhotoFinale ? (
                  <img src={urlPhotoFinale} alt={utilisateur.nomComplet} className="w-full h-full object-cover" />
                ) : (
                  initiales
                )}
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${menuProfilOuvert ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu Popover Desktop */}
            {menuProfilOuvert && (
              <div
                className="absolute right-0 mt-2 w-60 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--bordure)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                }}
              >
                {/* En-tête profil */}
                <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 mb-1">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs bg-[#1B5E3B] text-white">
                    {urlPhotoFinale ? (
                      <img src={urlPhotoFinale} alt={utilisateur.nomComplet} className="w-full h-full object-cover" />
                    ) : (
                      initiales
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 truncate">{utilisateur.nomComplet}</p>
                    <p className="text-[11px] text-gray-500 truncate">{utilisateur.email}</p>
                  </div>
                </div>

                {/* Liens de menu */}
                <div className="space-y-0.5">
                  <Link
                    href={lienProfil}
                    onClick={() => setMenuProfilOuvert(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <User size={14} className="text-gray-400" />
                    <span>Mon profil</span>
                  </Link>

                  <div className="my-1 border-t border-gray-100" />

                  {/* Bouton de déconnexion discret avec icône */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuProfilOuvert(false);
                      setModalDeconnexion(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={14} className="text-red-500" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Contenu — scroll interne uniquement */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar w-full ${sansPadding ? '' : 'px-4 sm:px-6 py-6'} ${utilisateur.role === 'ADMIN' ? 'pb-6' : 'pb-24 md:pb-6'}`}>
          {enChargementValide ? (
            <div className="flex items-center gap-3 py-10">
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primaire)', borderTopColor: 'transparent' }} />
              <p style={{ color: 'var(--texte-secondaire)' }}>Chargement…</p>
            </div>
          ) : estProfEtNonValide ? (
            <div
              className="max-w-md mx-auto mt-10 rounded-2xl p-8 text-center space-y-4"
              style={{ background: '#FFFFFF', border: '1px solid var(--bordure)' }}
            >
              <p className="text-5xl">⏳</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--texte)' }}>Compte en cours de validation</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--texte-secondaire)' }}>
                Votre compte est en cours de validation par l&apos;administrateur.
                Vous recevrez un email de confirmation dès qu&apos;il sera activé.
              </p>
              <Link
                href="/professeur/profil"
                className="btn-primaire text-sm"
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
          style={{ borderTop: '1px solid var(--bordure)', color: 'var(--texte-secondaire)' }}
        >
          Quran Academy — {utilisateur.nomComplet}
        </footer>
      </div>

      {utilisateur.role !== 'ADMIN' && <BottomNav onglets={ongletsMobile} />}
    </div>
  );
}
