// Espace élève — messagerie asynchrone.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { MessagerieEleve } from '@/composants/eleve/messagerie';

export default function PageMessagesEleve() {
  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte>
        <MessagerieEleve />
      </ShellConnecte>
    </GardeRoute>
  );
}
