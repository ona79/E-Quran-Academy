// Espace professeur — profil public.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { ProfilProfesseurForm } from '@/composants/professeur/profil';

export default function PageProfilProfesseur() {
  return (
    <GardeRoute rolesAutorises={['PROFESSEUR']}>
      <ShellConnecte>
        <ProfilProfesseurForm />
      </ShellConnecte>
    </GardeRoute>
  );
}
