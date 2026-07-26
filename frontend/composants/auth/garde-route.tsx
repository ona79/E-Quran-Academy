'use client';

// Garde de route côté client : protège les espaces connectés.
// - Redirige vers /connexion si non authentifié.
// - Vérifie le rôle attendu (optionnel) et redirige sinon.
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { utiliserAuth } from './fournisseur-auth';
import type { Role } from '@/lib/types';

export function GardeRoute({
  children,
  rolesAutorises,
}: {
  children: ReactNode;
  rolesAutorises?: Role[];
}) {
  const { utilisateur, enChargement } = utiliserAuth();
  const router = useRouter();

  useEffect(() => {
    if (enChargement) return;
    if (!utilisateur) {
      router.replace('/connexion');
      return;
    }
    if (rolesAutorises && !rolesAutorises.includes(utilisateur.role)) {
      // Mauvais espace : on redirige vers le bon.
      switch (utilisateur.role) {
        case 'ADMIN':
          router.replace('/admin');
          break;
        case 'PROFESSEUR':
          router.replace('/professeur');
          break;
        default:
          router.replace('/eleve');
      }
    }
  }, [utilisateur, enChargement, rolesAutorises, router]);

  // Pendant le chargement ou si redirige, on affiche un état d'attente.
  if (enChargement || !utilisateur) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[var(--fond)]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--bordure)] border-t-[var(--primaire)] animate-spin" />
        <p className="text-sm font-medium" style={{ color: 'var(--texte-secondaire)' }}>
          Validation de l&apos;accès en cours…
        </p>
      </div>
    );
  }

  if (rolesAutorises && !rolesAutorises.includes(utilisateur.role)) {
    return null;
  }

  return <>{children}</>;
}
