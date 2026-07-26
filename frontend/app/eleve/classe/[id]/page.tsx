// Salle de classe dynamique d'une réservation.
// Le composant de classe virtuelle complet (visio Daily.co + Mushaf) est livré
// à l'étape 4 ; cette route sert déjà de point d'entrée stable.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { SalleDeClasse } from '@/composants/classe-virtuelle/salle-classe';

export default function PageSalleClasse({ params }: { params: { id: string } }) {
  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte>
        <SalleDeClasse reservationId={params.id} />
      </ShellConnecte>
    </GardeRoute>
  );
}
