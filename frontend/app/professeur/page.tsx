// Espace professeur — tableau de bord.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { TableauDeBordProfesseur } from '@/composants/professeur/tableau-de-bord';

export default function PageProfesseur() {
  return (
    <GardeRoute rolesAutorises={['PROFESSEUR']}>
      <ShellConnecte>
        <TableauDeBordProfesseur />
      </ShellConnecte>
    </GardeRoute>
  );
}
