'use client';

// Page de messagerie de l'espace professeur.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { MessagerieProfesseur } from '@/composants/professeur/messagerie';

export default function PageMessagesProfesseur() {
  return (
    <GardeRoute rolesAutorises={['PROFESSEUR']}>
      <ShellConnecte>
        <MessagerieProfesseur />
      </ShellConnecte>
    </GardeRoute>
  );
}
