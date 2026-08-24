// Utilitaires de conversion de fuseau horaire.
// Règle métier (cahier des charges) : un élève choisit un créneau dans SON
// fuseau ; on le stocke en UTC en base. À l'inverse, on sait re-projeter un
// créneau UTC dans n'importe quel fuseau pour l'affichage.
//
// Bibliothèque : date-fns-tz (libre, légère, sans dépendance lourde — adaptée
// à des connexions faibles côté serveur).
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { fr } from 'date-fns/locale';

export const FORMAT_HEURE = 'HH:mm';

/**
 * Convertit un instant décrit en heure LOCALE d'un fuseau donné en Date UTC.
 *
 * @param dateIsoLocal  date au format "YYYY-MM-DD" vue par l'utilisateur
 * @param heureLocale   heure "HH:mm" vue par l'utilisateur
 * @param fuseau        fuseau IANA de l'utilisateur ("Africa/Dakar", "Europe/Paris"…)
 *
 * Exemple : ("2024-09-02", "10:00", "Africa/Dakar") → la Date UTC correspondant
 * à 10:00 à Dakar ce jour-là.
 */
export function heureLocaleVersUtc(
  dateIsoLocal: string,
  heureLocale: string,
  fuseau: string,
): Date {
  // fromZonedTime interprète "YYYY-MM-DDTHH:mm" comme étant dans `fuseau`.
  const composing = `${dateIsoLocal}T${heureLocale}:00`;
  return fromZonedTime(composing, fuseau);
}

/**
 * Projette une Date UTC en heure "HH:mm" dans le fuseau demandé (pour affichage).
 */
export function utcVersHeureLocale(dateUtc: Date, fuseau: string): string {
  return formatInTimeZone(dateUtc, fuseau, FORMAT_HEURE, { locale: fr });
}

/**
 * Projette une Date UTC en date ISO locale "YYYY-MM-DD" dans le fuseau demandé.
 */
export function utcVersDateLocale(dateUtc: Date, fuseau: string): string {
  return formatInTimeZone(dateUtc, fuseau, 'yyyy-MM-dd', { locale: fr });
}

/**
 * Projette une Date UTC en numéro du jour de la semaine locale (1=Lundi, ..., 7=Dimanche) dans le fuseau demandé.
 */
export function utcVersJourSemaineLocale(dateUtc: Date, fuseau: string): number {
  return parseInt(formatInTimeZone(dateUtc, fuseau, 'i', { locale: fr }), 10);
}

