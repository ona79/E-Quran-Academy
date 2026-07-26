'use client';

// Page admin — gestion des utilisateurs.
// useSearchParams() impose une boundary <Suspense> pour le rendu statique.
import { Suspense } from 'react';
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { ContenuUtilisateurs } from '@/composants/admin/contenu-utilisateurs';

export default function PageAdminUtilisateurs() {
  return (
    <GardeRoute rolesAutorises={['ADMIN']}>
      <ShellConnecte>
        <Suspense
          fallback={<p style={{ color: 'var(--texte-secondaire)' }}>Chargement…</p>}
        >
          <ContenuUtilisateurs />
        </Suspense>
      </ShellConnecte>
    </GardeRoute>
  );
}
