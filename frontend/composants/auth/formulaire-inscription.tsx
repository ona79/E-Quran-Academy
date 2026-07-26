'use client';

// Formulaire d'inscription en stepper 2 étapes.
// Permet de s'inscrire en tant qu'élève (redirection immédiate)
// ou professeur (compte en cours de validation).
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { utiliserAuth, ErreurApi } from './fournisseur-auth';
import { BoutonPrimaire, BoutonSecondaire } from '@/composants/ui/boutons';

export function FormulaireInscription() {
  const { inscription } = utiliserAuth();
  const router = useRouter();
  
  // États du stepper
  const [etape, setEtape] = useState<1 | 2>(1);
  
  // États des champs
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [role, setRole] = useState<'ELEVE' | 'PROFESSEUR'>('ELEVE');
  
  // États de chargement et d'erreur
  const [erreur, setErreur] = useState<string | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [enAttente, setEnAttente] = useState(false);

  const passerAEtape2 = (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);

    if (nomComplet.trim().length === 0) {
      setErreur('Veuillez renseigner votre nom complet');
      return;
    }
    if (email.trim().length === 0) {
      setErreur('Veuillez renseigner votre e-mail');
      return;
    }
    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }

    setEtape(2);
  };

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnEnvoi(true);

    try {
      await inscription(email, motDePasse, nomComplet, role);
      if (role === 'PROFESSEUR') {
        setEnAttente(true);
      } else {
        router.push('/eleve');
      }
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Une erreur est survenue');
    } finally {
      setEnEnvoi(false);
    }
  };

  // Message d'attente de validation
  if (enAttente) {
    return (
      <div
        className="rounded-2xl border p-5 text-center space-y-4"
        style={{ borderColor: 'var(--bordure)', backgroundColor: 'var(--fond-surface)' }}
      >
        <p className="text-4xl">⏳</p>
        <p className="font-bold text-base" style={{ color: 'var(--texte)' }}>
          Compte en cours de validation
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--texte-secondaire)' }}>
          Votre compte est en cours de validation par l&apos;administrateur.
          Vous serez notifié par email.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Indicateur d'étape */}
      <div className="flex justify-between items-center text-xs font-semibold">
        <span style={{ color: 'var(--texte-secondaire)' }}>
          Étape {etape === 1 ? '1/2 — Informations' : '2/2 — Votre rôle'}
        </span>
        <span
          className="px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--couleur-or-clair)', color: 'var(--couleur-primaire-profond)' }}
        >
          {etape === 1 ? '50%' : '100%'}
        </span>
      </div>

      {etape === 1 ? (
        <form onSubmit={passerAEtape2} className="space-y-3">
          <div>
            <label htmlFor="nomComplet" className="etiquette">Nom complet</label>
            <input
              id="nomComplet"
              type="text"
              required
              maxLength={120}
              className="champ !py-2 text-sm"
              value={nomComplet}
              onChange={(e) => setNomComplet(e.target.value)}
              placeholder="Aminata Diallo"
            />
          </div>
          <div>
            <label htmlFor="email" className="etiquette">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="champ !py-2 text-sm"
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
              minLength={8}
              autoComplete="new-password"
              className="champ !py-2 text-sm"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmation" className="etiquette">Confirmer</label>
            <input
              id="confirmation"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="champ !py-2 text-sm"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </div>

          {erreur && (
            <p className="text-xs" role="alert" style={{ color: 'var(--erreur)' }}>
              {erreur}
            </p>
          )}

          <BoutonPrimaire type="submit" pleineLargeur className="!py-2 text-sm">
            Suivant →
          </BoutonPrimaire>
        </form>
      ) : (
        <form onSubmit={soumettre} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(['ELEVE', 'PROFESSEUR'] as const).map((r) => (
              <label
                key={r}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 cursor-pointer p-4 transition-all ${
                  role === r
                    ? 'border-[var(--primaire)] bg-[var(--primaire)]/5 shadow-douce'
                    : 'border-[var(--bordure)] hover:border-[var(--primaire)]/40'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="sr-only"
                />
                <span className="text-3xl">{r === 'ELEVE' ? '🎓' : '📖'}</span>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--texte)' }}>
                  {r === 'ELEVE' ? 'Je suis un élève' : 'Je suis un professeur'}
                </span>
              </label>
            ))}
          </div>

          {role === 'PROFESSEUR' && (
            <p
              className="text-[10px] leading-relaxed rounded-lg px-3 py-2 border"
              style={{
                backgroundColor: 'rgba(184,146,58,0.06)',
                borderColor: 'var(--couleur-or-clair)',
                color: 'var(--texte-secondaire)',
              }}
            >
              ℹ️ Votre compte sera examiné par l&apos;administrateur avant activation de vos accès.
            </p>
          )}

          {erreur && (
            <p className="text-xs" role="alert" style={{ color: 'var(--erreur)' }}>
              {erreur}
            </p>
          )}

          <div className="flex gap-2">
            <BoutonSecondaire
              type="button"
              onClick={() => setEtape(1)}
              className="flex-1 !py-2 text-sm"
            >
              ← Retour
            </BoutonSecondaire>
            <BoutonPrimaire
              type="submit"
              disabled={enEnvoi}
              className="flex-[2] !py-2 text-sm"
            >
              {enEnvoi ? 'Création…' : 'Créer mon compte'}
            </BoutonPrimaire>
          </div>
        </form>
      )}
    </div>
  );
}
