'use client';

// Fournisseur d'authentification : expose l'utilisateur courant et les actions
// de connexion/déconnexion/inscription. Le jeton JWT est stocké en localStorage
// (API stateless côté backend).
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { ReponseConnexion, Utilisateur } from '@/lib/types';

interface ContexteAuth {
  utilisateur: Utilisateur | null;
  enChargement: boolean;
  connexion: (email: string, motDePasse: string) => Promise<Utilisateur>;
  inscription: (
    email: string,
    motDePasse: string,
    nomComplet: string,
    role?: 'ELEVE' | 'PROFESSEUR',
  ) => Promise<void>;
  deconnexion: () => void;
}

const ContexteFournisseurAuth = createContext<ContexteAuth | undefined>(undefined);

export function FournisseurAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [enChargement, setEnChargement] = useState(true);

  // Au montage : on récupère le profil si le cookie de session est actif.
  useEffect(() => {
    apiClient
      .get<Utilisateur>('/utilisateurs/moi')
      .then(setUtilisateur)
      .catch(() => {
        setUtilisateur(null);
      })
      .finally(() => setEnChargement(false));
  }, []);

  const connexion = async (email: string, motDePasse: string) => {
    const { utilisateur, jeton } = await apiClient.post<{ utilisateur: Utilisateur; jeton: string }>(
      '/utilisateurs/connexion',
      { email, motDePasse },
    );
    if (jeton) {
      localStorage.setItem('jeton_ws', jeton);
    }
    setUtilisateur(utilisateur);
    return utilisateur;
  };

  const inscription = async (
    email: string,
    motDePasse: string,
    nomComplet: string,
    role: 'ELEVE' | 'PROFESSEUR' = 'ELEVE',
  ) => {
    // langue : "fr" par défaut (non exposé à l'utilisateur).
    // fuseauHoraire : détecté silencieusement depuis le navigateur.
    const langue = 'fr';
    const fuseauHoraire = Intl.DateTimeFormat().resolvedOptions().timeZone;

    await apiClient.post<Utilisateur>('/utilisateurs/inscription', {
      email,
      motDePasse,
      nomComplet,
      langue,
      fuseauHoraire,
      role,
    });
    // Inscription créée → on connecte directement.
    await connexion(email, motDePasse);
  };

  const deconnexion = () => {
    apiClient.post('/utilisateurs/deconnexion').finally(() => {
      localStorage.removeItem('jeton_ws');
      setUtilisateur(null);
      router.push('/');
    });
  };

  return (
    <ContexteFournisseurAuth.Provider
      value={{ utilisateur, enChargement, connexion, inscription, deconnexion }}
    >
      {children}
    </ContexteFournisseurAuth.Provider>
  );
}

export function utiliserAuth(): ContexteAuth {
  const ctx = useContext(ContexteFournisseurAuth);
  if (!ctx) {
    throw new Error('utiliserAuth doit être utilisé dans FournisseurAuth');
  }
  return ctx;
}

// Réexport pour centraliser la gestion d'erreur dans les formulaires.
export { ErreurApi };
