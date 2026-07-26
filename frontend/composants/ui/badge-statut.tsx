// Pastille de statut colorée (réservations, séances).
import type { StatutReservation } from '@/lib/types';
import {
  libelleStatutReservation,
  couleurStatutReservation,
} from '@/lib/utilitaires';

export function BadgeStatut({ statut }: { statut: StatutReservation }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        color: couleurStatutReservation(statut),
        backgroundColor: `color-mix(in srgb, ${couleurStatutReservation(statut)} 15%, transparent)`,
      }}
    >
      {libelleStatutReservation(statut)}
    </span>
  );
}
