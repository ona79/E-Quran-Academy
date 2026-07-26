// Espace élève — accès salle de classe.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { AccesClasseEleve } from '@/composants/eleve/acces-classe';

export default function PageClasseEleve() {
  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte>
        <AccesClasseEleve />
      </ShellConnecte>
    </GardeRoute>
  );
}
