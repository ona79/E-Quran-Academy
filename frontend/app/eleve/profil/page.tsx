'use client';

// Espace étudiant — gestion du profil.
// Permet de modifier le nom, la langue et le fuseau horaire. L'e-mail reste fixe.
import { useEffect, useState, type FormEvent } from 'react';
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { utiliserAuth } from '@/composants/auth/fournisseur-auth';
import { apiClient, ErreurApi } from '@/lib/api-client';
import { BoutonPrimaire } from '@/composants/ui/boutons';

export default function PageProfilEleve() {
  const { utilisateur, enChargement } = utiliserAuth();
  
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [langue, setLangue] = useState('fr');
  const [fuseauHoraire, setFuseauHoraire] = useState('Africa/Dakar');
  
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);

  useEffect(() => {
    if (utilisateur) {
      setNomComplet(utilisateur.nomComplet);
      setEmail(utilisateur.email);
      setLangue(utilisateur.langue || 'fr');
      setFuseauHoraire(utilisateur.fuseauHoraire || 'Africa/Dakar');
    }
  }, [utilisateur]);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setSucces(null);
    setEnEnvoi(true);

    try {
      await apiClient.patch('/utilisateurs/moi', {
        nomComplet: nomComplet.trim(),
        langue,
        fuseauHoraire,
      });
      setSucces('Profil mis à jour avec succès !');
      // Optionnel : recharger la page ou forcer la mise à jour du contexte
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Impossible de mettre à jour le profil');
    } finally {
      setEnEnvoi(false);
    }
  };

  if (enChargement) {
    return (
      <GardeRoute rolesAutorises={['ELEVE']}>
        <ShellConnecte>
          <p style={{ color: 'var(--texte-secondaire)' }}>Chargement…</p>
        </ShellConnecte>
      </GardeRoute>
    );
  }

  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte>
        <div className="h-full flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-4">
            <h1 className="text-xl font-bold" style={{ color: 'var(--texte)' }}>Mon profil</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--texte-secondaire)' }}>
              Gérez vos informations personnelles et préférences.
            </p>
          </div>

          <form
            onSubmit={soumettre}
            className="rounded-2xl p-5 space-y-3"
            style={{
              backgroundColor: 'var(--fond-surface)',
              border: '1px solid var(--bordure)',
            }}
          >
            {/* Nom complet */}
            <div>
              <label htmlFor="nomComplet" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--texte)' }}>
                Nom complet
              </label>
              <input
                id="nomComplet"
                type="text"
                required
                maxLength={120}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--fond)',
                  border: '1px solid var(--bordure)',
                  color: 'var(--texte)',
                }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--primaire)')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--bordure)')}
                value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--texte)' }}>
                Adresse e-mail <span className="opacity-50">(non modifiable)</span>
              </label>
              <input
                id="email"
                type="email"
                disabled
                className="w-full rounded-xl px-3 py-2 text-sm opacity-60 cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--fond)',
                  border: '1px solid var(--bordure)',
                  color: 'var(--texte)',
                }}
                value={email}
              />
            </div>

            {/* Langue */}
            <div>
              <label htmlFor="langue" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--texte)' }}>
                Langue de préférence
              </label>
              <select
                id="langue"
                className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--fond)',
                  border: '1px solid var(--bordure)',
                  color: 'var(--texte)',
                }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--primaire)')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--bordure)')}
                value={langue}
                onChange={(e) => setLangue(e.target.value)}
              >
                <option value="fr">Français</option>
                <option value="ar">العربية (Arabe)</option>
                <option value="en">English (Anglais)</option>
              </select>
            </div>

            {/* Fuseau horaire */}
            <div>
              <label htmlFor="fuseauHoraire" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--texte)' }}>
                Fuseau horaire
              </label>
              <input
                id="fuseauHoraire"
                type="text"
                required
                className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--fond)',
                  border: '1px solid var(--bordure)',
                  color: 'var(--texte)',
                }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--primaire)')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--bordure)')}
                value={fuseauHoraire}
                onChange={(e) => setFuseauHoraire(e.target.value)}
                placeholder="Ex: Africa/Dakar, Europe/Paris"
              />
              <p className="text-[10px] mt-1" style={{ color: 'var(--texte-secondaire)' }}>
                Détermine l&apos;affichage de vos cours selon votre heure locale.
              </p>
            </div>

            {erreur && (
              <p className="text-xs px-3 py-2 rounded-lg" role="alert" style={{ color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                {erreur}
              </p>
            )}
            {succes && (
              <p className="text-xs px-3 py-2 rounded-lg" role="status" style={{ color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                {succes}
              </p>
            )}

            <button
              type="submit"
              disabled={enEnvoi}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity mt-2"
              style={{
                backgroundColor: 'var(--primaire)',
                opacity: enEnvoi ? 0.6 : 1,
              }}
            >
              {enEnvoi ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}

