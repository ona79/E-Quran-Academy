// Utilitaires de fuseau horaire côté client.
// Miroir de backend/src/partages/fuseau-horaire/fuseau-horaire.utilitaire.ts :
// le backend stocke en UTC, le client projette dans le fuseau de l'utilisateur.
//
// On utilise l'API Intl native (pas de dépendance) — légère, idéale sur
// connexions faibles.

const FORMATEUR_DATE = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const FORMATEUR_HEURE = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

const FORMATEUR_COMPLET = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

/** Formate une date ISO (UTC) en date lisible "lundi 2 septembre". */
export function formaterDate(iso: string): string {
  return FORMATEUR_DATE.format(new Date(iso));
}

/** Formate une date ISO (UTC) en heure locale "10:00". */
export function formaterHeure(iso: string): string {
  return FORMATEUR_HEURE.format(new Date(iso));
}

/** Formate une date ISO en "lundi 2 septembre à 10:00". */
export function formaterDateHeure(iso: string): string {
  return FORMATEUR_COMPLET.format(new Date(iso));
}

/**
 * Renvoie le fuseau horaire IANA du navigateur (ex: "Africa/Dakar").
 * Utilisé par défaut pour la réservation si l'utilisateur n'a pas personnalisé.
 */
export function fuseauNavigateur(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Dakar';
}
