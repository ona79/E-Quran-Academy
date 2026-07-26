// Petites fonctions utilitaires d'affichage.
import type { StatutReservation } from './types';

const LIBELLES_STATUT_RESERVATION: Record<StatutReservation, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRME: 'Confirmé',
  ANNULE: 'Annulé',
  REALISE: 'Réalisé',
  ABSENT: 'Absent',
};

/** Libellé français d'un statut de réservation. */
export function libelleStatutReservation(statut: StatutReservation): string {
  return LIBELLES_STATUT_RESERVATION[statut] ?? statut;
}

/** Couleur sémantique associée à un statut (pour pastille/badge). */
export function couleurStatutReservation(statut: StatutReservation): string {
  switch (statut) {
    case 'CONFIRME':
    case 'REALISE':
      return 'var(--primaire)';
    case 'EN_ATTENTE':
      return 'var(--accent)';
    case 'ANNULE':
    case 'ABSENT':
      return 'var(--erreur)';
    default:
      return 'var(--texte-secondaire)';
  }
}

/** Version capitalisée d'une chaîne. */
export function capitale(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
