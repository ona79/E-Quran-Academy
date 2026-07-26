// Types TypeScript partagés — miroir des DTOs backend.
// Vocabulaire métier en français (cohérent avec l'API).

export type Role = 'ELEVE' | 'PROFESSEUR' | 'ADMIN';

export interface Utilisateur {
  id: string;
  email: string;
  nomComplet: string;
  role: Role;
  langue: string;
  fuseauHoraire: string;
  creeLe: string;
}

export interface ReponseConnexion {
  jeton: string;
  utilisateur: Utilisateur;
}

export type StatutReservation =
  | 'EN_ATTENTE'
  | 'CONFIRME'
  | 'ANNULE'
  | 'REALISE'
  | 'ABSENT';

export interface Reservation {
  id: string;
  eleveId: string;
  professeurId: string;
  creneauDebut: string;
  creneauFin: string;
  statut: StatutReservation;
  noteEleve?: string | null;
}

export type JourSemaine =
  | 'LUNDI'
  | 'MARDI'
  | 'MERCREDI'
  | 'JEUDI'
  | 'VENDREDI'
  | 'SAMEDI'
  | 'DIMANCHE';

export interface Disponibilite {
  id: string;
  jour: JourSemaine;
  heureDebut: string;
  heureFin: string;
  recurrence: 'PONCTUELLE' | 'HEBDOMADAIRE';
}

export type StatutSession = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE';

export interface SeanceCours {
  id: string;
  reservationId: string;
  eleveId: string;
  professeurId: string;
  statut: StatutSession;
  lienVisio?: string | null;
  tokenVisio?: string;
  modeRepliActif: boolean;
  enregistrementConsente: boolean;
  enregistrementActif: boolean;
  enregistrementUrl?: string | null;
}

export interface EtatMushaf {
  numeroSourate: number;
  numeroVerset: number;
  plageSurlignage?: string | null;
}

export interface Avis {
  id: string;
  professeurId: string;
  eleveId: string;
  note: number;
  commentaire?: string | null;
  creeLe: string;
}

export interface Message {
  id: string;
  expediteurId: string;
  destinataireId: string;
  contenu: string;
  lu: boolean;
  horodatage: string;
}

export interface NoteSession {
  id: string;
  seanceId: string;
  eleveId: string;
  professeurId: string;
  sourateMemorisee?: string | null;
  sourateRevisee?: string | null;
  pointsTajwid?: string | null;
  commentaire?: string | null;
  creeLe: string;
}

export interface FeatureFlag {
  id: string;
  cle: string;
  actif: boolean;
  description?: string | null;
}

export type Qiraat = 'HAFS' | 'WARSH';

export interface ProfilProfesseur {
  id: string;
  userId: string;
  bio?: string | null;
  photoUrl?: string | null;
  ijazaUrl?: string | null;
  audioUrl?: string | null;
  tarifHoraire: number;
  qiraatParDefaut: Qiraat;
  reservationInstantanee: boolean;
  valide: boolean;
}

export interface Page<T> {
  donnees: T[];
  total: number;
  page: number;
  taille: number;
}
