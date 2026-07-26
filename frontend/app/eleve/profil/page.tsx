'use client';

// Espace élève — gestion du profil.
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
            <h1 className="text-xl font-bold" style={{ color: '#F0EDE6' }}>Mon profil</h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(240,237,230,0.55)' }}>
              Gérez vos informations personnelles et préférences.
            </p>
          </div>

          <form
            onSubmit={soumettre}
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Nom complet */}
            <div>
              <label htmlFor="nomComplet" className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(240,237,230,0.7)' }}>
                Nom complet
              </label>
              <input
                id="nomComplet"
                type="text"
                required
                maxLength={120}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F0EDE6',
                }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid #0B5E45')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
                value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(240,237,230,0.7)' }}>
                Adresse e-mail <span className="opacity-50">(non modifiable)</span>
              </label>
              <input
                id="email"
                type="email"
                disabled
                className="w-full rounded-xl px-3 py-2 text-sm opacity-40 cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#F0EDE6',
                }}
                value={email}
              />
            </div>

            {/* Langue */}
            <div>
              <label htmlFor="langue" className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(240,237,230,0.7)' }}>
                Langue de préférence
              </label>
              <select
                id="langue"
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F0EDE6',
                }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid #0B5E45')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
                value={langue}
                onChange={(e) => setLangue(e.target.value)}
              >
                <option value="fr" className="bg-[#131F18]">Français</option>
                <option value="ar" className="bg-[#131F18]">العربية (Arabe)</option>
                <option value="en" className="bg-[#131F18]">English (Anglais)</option>
              </select>
            </div>

            {/* Fuseau horaire */}
            <div>
              <label htmlFor="fuseauHoraire" className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(240,237,230,0.7)' }}>
                Fuseau horaire
              </label>
              <input
                id="fuseauHoraire"
                type="text"
                required
                className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F0EDE6',
                }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid #0B5E45')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
                value={fuseauHoraire}
                onChange={(e) => setFuseauHoraire(e.target.value)}
                placeholder="Ex: Africa/Dakar, Europe/Paris"
              />
              <p className="text-[10px] mt-1" style={{ color: 'rgba(240,237,230,0.4)' }}>
                Détermine l&apos;affichage de vos cours selon votre heure locale.
              </p>
            </div>

            {erreur && (
              <p className="text-xs px-3 py-2 rounded-lg" role="alert" style={{ color: '#fca5a5', background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.25)' }}>
                {erreur}
              </p>
            )}
            {succes && (
              <p className="text-xs px-3 py-2 rounded-lg" role="status" style={{ color: '#4ade80', background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.25)' }}>
                {succes}
              </p>
            )}

            <button
              type="submit"
              disabled={enEnvoi}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity mt-2"
              style={{
                background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
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

