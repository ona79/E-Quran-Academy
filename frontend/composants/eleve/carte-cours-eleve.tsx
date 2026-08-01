'use client';

// CarteCoursEleve — carte de réservation dans l'espace étudiant.
// Affiche : nom du prof, date/heure dans le fuseau étudiant, statut,
// bouton "Rejoindre" (actif 15 min avant), "Annuler", "Laisser un avis".
import Link from 'next/link';
import type { Reservation, StatutReservation } from '@/lib/types';
import { BadgeStatut } from '@/composants/ui/badge-statut';
import { formaterDateHeure } from '@/lib/fuseau-horaire';

interface CarteCours {
  reservation: Reservation;
  nomProf?: string;
  onAnnuler?: (id: string) => void;
  onAvis?: (id: string) => void;
}

/** Retourne vrai si le cours commence dans moins de 15 minutes ou a déjà commencé. */
function peutRejoindre(creneauDebut: string): boolean {
  const now = Date.now();
  const debut = new Date(creneauDebut).getTime();
  return debut - now <= 15 * 60 * 1000 && debut > now - 2 * 60 * 60 * 1000;
}

/** Retourne vrai si le cours est plus de 12h dans le futur. */
function peutAnnuler(creneauDebut: string): boolean {
  const now = Date.now();
  const debut = new Date(creneauDebut).getTime();
  return debut - now > 12 * 60 * 60 * 1000;
}

const LIBELLES_STATUT: Record<StatutReservation, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRME: 'Confirmé',
  ANNULE: 'Annulé',
  REALISE: 'Réalisé',
  ABSENT: 'Absent',
};

export function CarteCoursEleve({ reservation, nomProf, onAnnuler, onAvis }: CarteCours) {
  const peutJoindre = peutRejoindre(reservation.creneauDebut);
  const peutCancel = peutAnnuler(reservation.creneauDebut);
  const estPasse = reservation.statut === 'REALISE' || reservation.statut === 'ABSENT';
  const estAnnule = reservation.statut === 'ANNULE';

  return (
    <article
      className="carte group transition-all"
      style={{ borderLeft: '3px solid var(--primaire)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Avatar + nom prof */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: 'var(--primaire)', color: '#FFFFFF' }}
            >
              {(nomProf ?? 'P').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--texte)' }}>
                {nomProf ?? 'Professeur'}
              </p>
              <p className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
                {formaterDateHeure(reservation.creneauDebut)}
              </p>
            </div>
          </div>

          {/* Note étudiant si présente */}
          {reservation.noteEleve && (
            <p className="text-xs italic mt-1 line-clamp-1" style={{ color: 'var(--texte-secondaire)' }}>
              🎯 {reservation.noteEleve}
            </p>
          )}
        </div>

        <div className="shrink-0">
          <BadgeStatut statut={reservation.statut} />
        </div>
      </div>

      {/* Actions */}
      {!estAnnule && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--bordure)' }}>
          {/* Rejoindre — uniquement si confirmé */}
          {reservation.statut === 'CONFIRME' && (
            peutJoindre ? (
              <Link
                href={`/eleve/classe/${reservation.id}`}
                className="btn-primaire text-xs !py-1.5 !px-3"
              >
                🎥 Rejoindre
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="btn-primaire text-xs !py-1.5 !px-3 opacity-40 cursor-not-allowed"
                title="Disponible 15 min avant le cours"
              >
                🎥 Rejoindre
              </button>
            )
          )}

          {/* Annuler — si > 12h avant et pas déjà annulé/passé */}
          {!estPasse && peutCancel && onAnnuler && (
            <button
              type="button"
              onClick={() => onAnnuler(reservation.id)}
              className="btn-secondaire text-xs !py-1.5 !px-3"
            >
              Annuler
            </button>
          )}

          {/* Avis — uniquement si cours réalisé */}
          {estPasse && onAvis && (
            <button
              type="button"
              onClick={() => onAvis(reservation.id)}
              className="btn-secondaire text-xs !py-1.5 !px-3"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              ⭐ Laisser un avis
            </button>
          )}
        </div>
      )}
    </article>
  );
}
