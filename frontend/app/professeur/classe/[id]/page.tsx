'use client';

// Espace professeur — Salle de classe virtuelle d'une réservation.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { SalleDeClasse } from '@/composants/classe-virtuelle/salle-classe';

export default function PageSalleClasseProfesseur({ params }: { params: { id: string } }) {
  return (
    <GardeRoute rolesAutorises={['PROFESSEUR']}>
      <ShellConnecte>
        <SalleDeClasse reservationId={params.id} />
      </ShellConnecte>
    </GardeRoute>
  );
}
