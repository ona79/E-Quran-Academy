'use client';

// Page de réinitialisation de mot de passe avec jeton unique — glassmorphism & mascotte animée.

import { useState, useCallback, Suspense, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiClient, ErreurApi } from '@/lib/api-client';
import { MascotteCoran, type EtatMascotte } from '@/composants/auth/mascotte-coran';

function MotifIslamiqueFond() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="motif-etoile-8-rmdp" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <g opacity="0.14" stroke="white" fill="none">
              <rect x="20" y="20" width="40" height="40" strokeWidth="1" transform="rotate(0 40 40)" />
              <rect x="20" y="20" width="40" height="40" strokeWidth="1" transform="rotate(45 40 40)" />
              <circle cx="40" cy="40" r="24" strokeWidth="0.7" />
              <circle cx="40" cy="40" r="16" strokeWidth="0.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#motif-etoile-8-rmdp)" />
      </svg>
    </div>
  );
}

const BLOBS = [
  { couleur: '#0B5E45', x: '-5%', y: '-10%', taille: 500, delai: 0 },
  { couleur: '#B8923A', x: '55%', y: '30%', taille: 420, delai: 3 },
  { couleur: '#08402F', x: '-8%', y: '65%', taille: 550, delai: 6 },
];

function BlobsAnimes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 hidden sm:block" aria-hidden>
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: blob.taille,
            height: blob.taille,
            left: blob.x,
            top: blob.y,
            background: `radial-gradient(circle, ${blob.couleur} 0%, transparent 70%)`,
            filter: 'blur(120px)',
            opacity: 0.25,
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.08, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: blob.delai,
          }}
        />
      ))}
    </div>
  );
}

function BordureAnimee({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-[1px] rounded-2xl overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square rounded-full hidden sm:block pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, #0B5E45 0deg, #B8923A 90deg, #0B5E45 180deg, #B8923A 270deg, #0B5E45 360deg)',
          opacity: 0.8,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute inset-0 rounded-2xl sm:hidden bg-gradient-to-r from-[#0B5E45]/60 via-[#B8923A]/40 to-[#0B5E45]/60 pointer-events-none" />
      <div className="relative rounded-2xl z-10">{children}</div>
    </div>
  );
}

const conteneurStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const enfantStagger: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function FormulaireReinitialisation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [champActif, setChampActif] = useState<'mdp' | 'conf' | null>(null);
  const [enChargement, setEnChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  const getEtatMascotte = (): EtatMascotte => {
    if (succes) return 'heureux';
    if (erreur || !token) return 'decu';
    if (champActif) return afficherMdp ? 'espionner' : 'cacher';
    if (nouveauMotDePasse.length >= 8 && nouveauMotDePasse === confirmation) return 'pouce';
    return 'idle';
  };

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);

    if (!token) {
      setErreur('Jeton de réinitialisation manquant dans l’adresse URL.');
      return;
    }

    if (nouveauMotDePasse.length < 8) {
      setErreur('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (nouveauMotDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }

    setEnChargement(true);

    try {
      await apiClient.post<{ message: string }>('/utilisateurs/reinitialiser-mot-de-passe', {
        token,
        nouveauMotDePasse,
      });
      setSucces(true);
    } catch (err) {
      setErreur(
        err instanceof ErreurApi ? err.message : 'Impossible de réinitialiser le mot de passe.',
      );
    } finally {
      setEnChargement(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 w-full">
        <MascotteCoran etat="decu" />
        <div
          className="p-4 rounded-xl flex flex-col items-center gap-2 w-full"
          style={{
            background: 'rgba(185, 28, 28, 0.15)',
            border: '1px solid rgba(185, 28, 28, 0.3)',
          }}
        >
          <AlertTriangle size={32} className="text-red-400" />
          <p className="text-sm font-medium text-red-200">
            Lien invalide ou incomplet. Veuillez refaire une demande de réinitialisation.
          </p>
        </div>
        <Link
          href="/mot-de-passe-oublie"
          className="w-full py-2.5 rounded-xl font-semibold text-white text-center transition-all block"
          style={{ background: 'linear-gradient(135deg, #0B5E45 0%, #B8923A 100%)', fontSize: '14px' }}
        >
          Faire une nouvelle demande
        </Link>
      </div>
    );
  }

  if (succes) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center space-y-4 w-full"
      >
        <MascotteCoran etat="heureux" />
        <div
          className="p-4 rounded-xl flex flex-col items-center gap-2 w-full"
          style={{
            background: 'rgba(11, 94, 69, 0.25)',
            border: '1px solid rgba(11, 94, 69, 0.5)',
          }}
        >
          <CheckCircle2 size={32} className="text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-200">
            Votre mot de passe a été mis à jour avec succès !
          </p>
        </div>

        <Link
          href="/connexion"
          className="w-full py-2.5 rounded-xl font-semibold text-white text-center transition-all block"
          style={{ background: 'linear-gradient(135deg, #0B5E45 0%, #B8923A 100%)', fontSize: '14px' }}
        >
          Se connecter maintenant
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <MascotteCoran etat={getEtatMascotte()} />

      <div className="text-center mb-4 mt-2">
        <h1 className="text-lg font-bold text-white mb-1">Nouveau mot de passe</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
          Choisissez un mot de passe fort d&apos;au moins 8 caractères.
        </p>
      </div>

      <form onSubmit={soumettre} className="w-full space-y-4">
        {/* Nouveau mot de passe */}
        <div>
          <label
            htmlFor="nouveau-mot-de-passe"
            className="block font-medium mb-1.5"
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}
          >
            Nouveau mot de passe
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <Lock size={18} />
            </div>
            <input
              id="nouveau-mot-de-passe"
              type={afficherMdp ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={nouveauMotDePasse}
              onChange={(e) => {
                setNouveauMotDePasse(e.target.value);
                if (erreur) setErreur(null);
              }}
              onFocus={() => setChampActif('mdp')}
              onBlur={() => setChampActif(null)}
              className="w-full pl-10 pr-10 py-2 rounded-xl outline-none transition-all duration-300 text-sm text-white"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: champActif === 'mdp' ? '1px solid #0B5E45' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: champActif === 'mdp' ? '0 0 0 3px rgba(11,94,69,0.3)' : 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setAfficherMdp(!afficherMdp)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/70"
            >
              {afficherMdp ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {/* Confirmation */}
        <div>
          <label
            htmlFor="confirmation-mot-de-passe"
            className="block font-medium mb-1.5"
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}
          >
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <Lock size={18} />
            </div>
            <input
              id="confirmation-mot-de-passe"
              type={afficherMdp ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={confirmation}
              onChange={(e) => {
                setConfirmation(e.target.value);
                if (erreur) setErreur(null);
              }}
              onFocus={() => setChampActif('conf')}
              onBlur={() => setChampActif(null)}
              className="w-full pl-10 pr-10 py-2 rounded-xl outline-none transition-all duration-200 focus:border-[#0B5E45] focus:ring-2 focus:ring-[#0B5E45]/30 text-sm text-white"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>
        </div>

        <AnimatePresence>
          {erreur && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-sm text-center px-3 py-2 rounded-lg"
              role="alert"
              style={{
                color: '#fca5a5',
                background: 'rgba(185, 28, 28, 0.15)',
                border: '1px solid rgba(185, 28, 28, 0.25)',
              }}
            >
              {erreur}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={enChargement || nouveauMotDePasse.length < 8 || nouveauMotDePasse !== confirmation}
          className="w-full rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden disabled:opacity-50"
          style={{
            padding: '10px',
            fontSize: '14px',
            background: 'linear-gradient(135deg, #0B5E45 0%, #B8923A 100%)',
            boxShadow: '0 4px 20px rgba(11,94,69,0.4)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {enChargement ? 'Mise à jour…' : 'Enregistrer le mot de passe'}
        </motion.button>
      </form>
    </div>
  );
}

export default function PageReinitialiserMotDePasse() {
  return (
    <div
      className="relative min-h-screen py-6 flex items-center justify-center overflow-y-auto px-4"
      style={{
        backgroundColor: '#0D1A14',
        backgroundImage: 'url("/mascotte/image_fond_login_inscription.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <BlobsAnimes />
      <MotifIslamiqueFond />

      <motion.div
        className="relative z-10 my-auto"
        style={{ width: 'min(420px, calc(100vw - 32px))' }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <BordureAnimee>
          <div
            className="rounded-2xl p-5 sm:p-6 flex flex-col items-center overflow-hidden bg-[#0D1A14]/92 sm:bg-white/5 backdrop-blur-none sm:backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_rgba(11,94,69,0.3)]"
          >
            <motion.div
              variants={conteneurStagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center w-full"
            >
              <motion.div variants={enfantStagger} className="mb-2 mt-[-8px]">
                <img
                  src="/mascotte/logo_equran_accademy.png"
                  alt="Logo Quran-Academy"
                  className="w-20 h-auto drop-shadow-xl"
                />
              </motion.div>

              <Suspense fallback={<div className="text-white text-sm">Chargement…</div>}>
                <FormulaireReinitialisation />
              </Suspense>
            </motion.div>
          </div>
        </BordureAnimee>
      </motion.div>
    </div>
  );
}
