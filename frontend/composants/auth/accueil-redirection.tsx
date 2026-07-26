'use client';

// Si l'utilisateur est déjà connecté, on le redirige vers son espace selon
// son rôle. Sinon, on n'affiche rien (la landing prend le relais).
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { utiliserAuth } from './fournisseur-auth';

export function AccueilRedirection() {
  const { utilisateur, enChargement } = utiliserAuth();
  const router = useRouter();

  useEffect(() => {
    if (enChargement || !utilisateur) return;
    switch (utilisateur.role) {
      case 'ADMIN':
        router.replace('/admin');
        break;
      case 'PROFESSEUR':
        router.replace('/professeur');
        break;
      case 'ELEVE':
      default:
        router.replace('/eleve');
        break;
    }
  }, [utilisateur, enChargement, router]);

  return null;
}
