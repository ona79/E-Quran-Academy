'use client';

// Espace professeur — gestion des revenus.
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { RevenusProfesseur } from '@/composants/professeur/revenus';

export default function PageRevenusProfesseur() {
  return (
    <GardeRoute rolesAutorises={['PROFESSEUR']}>
      <ShellConnecte>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Mes revenus</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--texte-secondaire)' }}>
            Consultez votre solde total cumulé et l&apos;historique de vos gains par cours réalisé.
          </p>
          <RevenusProfesseur />
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
