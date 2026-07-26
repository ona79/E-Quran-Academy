'use client';

// Espace professeur — Formulaire de suivi pédagogique d'un cours spécifique.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { FormulaireSuivi } from '@/composants/professeur/formulaire-suivi';

interface PageProps {
  params: {
    sessionId: string;
  };
}

export default function PageSuiviCoursSpecifique({ params }: PageProps) {
  return (
    <GardeRoute rolesAutorises={['PROFESSEUR']}>
      <ShellConnecte>
        <main className="max-w-xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl font-bold">Suivi pédagogique</h1>
            <p className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
              Remplissez le rapport d&apos;apprentissage de la séance (ID : {params.sessionId}).
            </p>
          </div>

          <div 
            className="carte p-6"
            style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
          >
            <FormulaireSuivi reservationId={params.sessionId} />
          </div>
        </main>
      </ShellConnecte>
    </GardeRoute>
  );
}
