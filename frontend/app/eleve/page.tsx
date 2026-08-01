// Espace étudiant — tableau de bord.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { TableauDeBordEleve } from '@/composants/eleve/tableau-de-bord';

export default function PageEleve() {
  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte>
        <TableauDeBordEleve />
      </ShellConnecte>
    </GardeRoute>
  );
}
