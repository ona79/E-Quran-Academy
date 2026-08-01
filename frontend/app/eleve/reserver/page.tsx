'use client';

// Espace étudiant — réservation d'un cours.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { ReservationCours } from '@/composants/eleve/reservation';
import { PacksCours } from '@/composants/eleve/packs-cours';

export default function PageReserverEleve() {
  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte>
        <div className="space-y-6 w-full max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Trouver un professeur</h1>
            <p className="text-sm mt-1 mb-4" style={{ color: 'var(--texte-secondaire)' }}>
              Sélectionnez un enseignant pour réserver un créneau de cours.
            </p>
          </div>
          
          <ReservationCours />
          <PacksCours />
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
