'use client';

// Les 3 sidebars par rôle. Elles partagent SidebarBase et ne diffèrent que par
// la liste de liens. L'état d'ouverture (drawer mobile) est géré par le shell
// connecté.
import { SidebarBase, type LienSidebar } from './sidebar-base';

const LIENS_ELEVE: LienSidebar[] = [
  { href: '/eleve', libelle: 'Accueil', icone: '🏠' },
  { href: '/eleve/reserver', libelle: 'Réserver', icone: '🗓️' },
  { href: '/eleve/classe', libelle: 'Cours', icone: '🎓' },
  { href: '/eleve/messages', libelle: 'Messages', icone: '💬' },
  { href: '/eleve/profil', libelle: 'Profil', icone: '👤' },
];

const LIENS_PROFESSEUR: LienSidebar[] = [
  { href: '/professeur', libelle: 'Accueil', icone: '🏠' },
  { href: '/professeur/disponibilites', libelle: 'Disponibilités', icone: '🗓️' },
  { href: '/professeur/suivi', libelle: 'Cours', icone: '🎓' },
  { href: '/professeur/messages', libelle: 'Messages', icone: '💬' },
  { href: '/professeur/profil', libelle: 'Profil', icone: '👤' },
  { href: '/professeur/revenus', libelle: 'Revenus', icone: '💰' },
];

const LIENS_ADMIN: LienSidebar[] = [
  { href: '/admin', libelle: 'Tableau de bord', icone: '📊' },
  { href: '/admin/professeurs', libelle: 'Professeurs', icone: '👨‍🏫' },
  { href: '/admin/utilisateurs', libelle: 'Utilisateurs', icone: '👥' },
  { href: '/admin/feature-flags', libelle: 'Feature flags', icone: '🚩' },
  { href: '/admin/paiements', libelle: 'Paiements', icone: '💳' },
];

export function SidebarEleve({
  ouverte,
  surFermeture,
  messagesNonLus = 0,
}: {
  ouverte: boolean;
  surFermeture: () => void;
  messagesNonLus?: number;
}) {
  const liens = LIENS_ELEVE.map((l) =>
    l.href === '/eleve/messages' ? { ...l, badge: messagesNonLus } : l,
  );
  return (
    <SidebarBase liens={liens} ouverte={ouverte} surFermeture={surFermeture} />
  );
}

export function SidebarProfesseur({
  ouverte,
  surFermeture,
}: {
  ouverte: boolean;
  surFermeture: () => void;
}) {
  return <SidebarBase liens={LIENS_PROFESSEUR} ouverte={ouverte} surFermeture={surFermeture} />;
}

export function SidebarAdmin({
  ouverte,
  surFermeture,
}: {
  ouverte: boolean;
  surFermeture: () => void;
}) {
  return <SidebarBase liens={LIENS_ADMIN} ouverte={ouverte} surFermeture={surFermeture} />;
}
