// Espace professeur — suivi pédagogique.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { SuiviProfesseur } from '@/composants/professeur/suivi';

export default function PageSuiviProfesseur() {
  return (
    <GardeRoute rolesAutorises={['PROFESSEUR']}>
      <ShellConnecte>
        <SuiviProfesseur />
      </ShellConnecte>
    </GardeRoute>
  );
}
