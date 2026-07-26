// Libellés français des jours de la semaine.
import type { JourSemaine } from './types';

const LIBELLES: Record<JourSemaine, string> = {
  LUNDI: 'Lundi',
  MARDI: 'Mardi',
  MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi',
  VENDREDI: 'Vendredi',
  SAMEDI: 'Samedi',
  DIMANCHE: 'Dimanche',
};

export function libelleJour(jour: JourSemaine): string {
  return LIBELLES[jour] ?? jour;
}
