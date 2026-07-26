'use client';

// Formulaire de connexion. Utilise le contexte d'auth et redirige
// immédiatement vers l'espace approprié après succès.
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { utiliserAuth, ErreurApi } from './fournisseur-auth';
import { BoutonPrimaire } from '@/composants/ui/boutons';

export function FormulaireConnexion() {
  const { connexion } = utiliserAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnEnvoi(true);
    try {
      const user = await connexion(email, motDePasse);
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'PROFESSEUR':
          router.push('/professeur');
          break;
        case 'ELEVE':
        default:
          router.push('/eleve');
          break;
      }
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Une erreur est survenue');
    } finally {
      setEnEnvoi(false);
    }
  };

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <div>
        <label htmlFor="email" className="etiquette">Adresse e-mail</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="champ"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="aminata.diallo@example.com"
        />
      </div>
      <div>
        <label htmlFor="motDePasse" className="etiquette">Mot de passe</label>
        <input
          id="motDePasse"
          type="password"
          required
          autoComplete="current-password"
          className="champ"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
        />
      </div>

      {erreur && (
        <p className="text-sm" role="alert" style={{ color: 'var(--erreur)' }}>
          {erreur}
        </p>
      )}

      <BoutonPrimaire type="submit" disabled={enEnvoi} pleineLargeur>
        {enEnvoi ? 'Connexion…' : 'Se connecter'}
      </BoutonPrimaire>
    </form>
  );
}
