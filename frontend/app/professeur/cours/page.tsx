// Espace professeur — gestion des cours.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { CoursProfesseur } from '@/composants/professeur/cours';

export default function PageCoursProfesseur() {
  return (
    <GardeRoute rolesAutorises={['PROFESSEUR']}>
      <ShellConnecte>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Mes cours</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--texte-secondaire)' }}>
            Gérez vos cours confirmés et consultez l&apos;historique.
          </p>
          <CoursProfesseur />
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
