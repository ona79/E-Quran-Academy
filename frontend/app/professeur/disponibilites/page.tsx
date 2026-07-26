// Espace professeur — disponibilités récurrentes.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { DisponibilitesProfesseur } from '@/composants/professeur/disponibilites';

export default function PageDisponibilites() {
  return (
    <GardeRoute rolesAutorises={['PROFESSEUR']}>
      <ShellConnecte>
        <DisponibilitesProfesseur />
      </ShellConnecte>
    </GardeRoute>
  );
}
