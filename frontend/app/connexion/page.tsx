'use client';

// Page de connexion — dark glassmorphism premium, thème coranique.
// Mascotte animée, fond animé avec blobs, motif islamique, Framer Motion.

import { useState, useCallback, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { utiliserAuth, ErreurApi } from '@/composants/auth/fournisseur-auth';
import { MascotteCoran, type EtatMascotte } from '@/composants/auth/mascotte-coran';

// ─── Motif islamique SVG répété en fond ───
function MotifIslamiqueFond() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="motif-etoile-8" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <g opacity="0.04" stroke="white" fill="none">
              <rect x="20" y="20" width="40" height="40" strokeWidth="1" transform="rotate(0 40 40)" />
              <rect x="20" y="20" width="40" height="40" strokeWidth="1" transform="rotate(45 40 40)" />
              <circle cx="40" cy="40" r="24" strokeWidth="0.7" />
              <circle cx="40" cy="40" r="16" strokeWidth="0.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#motif-etoile-8)" />
      </svg>
    </div>
  );
}

// ─── Blobs animés en arrière-plan ───
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

// ─── Bordure animée (statique sur mobile, dégradé conique tournant 360° sur PC) ───
function BordureAnimee({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-[1px] rounded-2xl overflow-hidden sm:overflow-visible">
      <motion.div
        className="absolute inset-0 rounded-2xl hidden sm:block pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, #0B5E45, #B8923A, #0B5E45, #B8923A, #0B5E45)',
          opacity: 0.5,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute inset-0 rounded-2xl sm:hidden bg-gradient-to-r from-[#0B5E45]/60 via-[#B8923A]/40 to-[#0B5E45]/60 pointer-events-none" />
      <div className="relative rounded-2xl">{children}</div>
    </div>
  );
}

// ─── Animation stagger pour les enfants ───
const conteneurStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const enfantStagger: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

// ─── Page principale ───
export default function PageConnexion() {
  const { connexion } = utiliserAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [champActif, setChampActif] = useState<'email' | 'password' | null>(null);
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [souvenir, setSouvenir] = useState(false);
  const [enChargement, setEnChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [connexionReussie, setConnexionReussie] = useState(false);
  const [secouer, setSecouer] = useState(false);

  const gererFocusEmail = useCallback(() => setChampActif('email'), []);
  const gererFocusMotDePasse = useCallback(() => setChampActif('password'), []);
  const gererBlur = useCallback(() => setChampActif(null), []);

  const getEtatMascotte = (): EtatMascotte => {
    if (connexionReussie) return 'heureux';
    if (enChargement) return 'ecrire';

    // Si l'utilisateur est dans le mot de passe
    if (champActif === 'password') {
      return afficherMotDePasse ? 'espionner' : 'cacher';
    }
    // Si l'utilisateur est dans l'email : reste stable sur 'ecrire' pendant la saisie
    if (champActif === 'email') {
      return 'ecrire';
    }

    // Si une erreur est affichée
    if (erreur) return 'decu';

    // Si rempli et valide au repos
    const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (emailValide && motDePasse.length >= 8) {
      return 'pouce';
    }

    return 'idle';
  };
  const etatMascotte = getEtatMascotte();

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnChargement(true);

    try {
      const user = await connexion(email, motDePasse, souvenir);
      setConnexionReussie(true);

      // Petite pause pour voir l'animation "heureux"
      await new Promise((r) => setTimeout(r, 800));

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
      setErreur(
        err instanceof ErreurApi ? err.message : 'Une erreur est survenue',
      );
      setSecouer(true);
      setTimeout(() => setSecouer(false), 500);
      setEnChargement(false);
    }
  };

  return (
    <div
      className="relative min-h-screen py-6 flex items-center justify-center overflow-y-auto px-4"
      style={{ 
        backgroundColor: '#0D1A14',
        backgroundImage: 'url("/mascotte/image_fond_login_inscription.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Blobs animés */}
      <BlobsAnimes />

      {/* Motif islamique */}
      <MotifIslamiqueFond />

      {/* Carte principale */}
      <motion.div
        className="relative z-10 my-auto"
        style={{ width: 'min(420px, calc(100vw - 32px))' }}
        initial={{ opacity: 0, y: 24 }}
        animate={
          secouer
            ? { opacity: 1, y: 0, x: [0, -8, 8, -8, 8, 0] }
            : { opacity: 1, y: 0 }
        }
        transition={
          secouer
            ? { duration: 0.4, ease: 'easeInOut' }
            : { duration: 0.5, ease: 'easeOut' }
        }
      >
        <BordureAnimee>
          <div
            className="rounded-2xl p-5 sm:p-6 flex flex-col items-center overflow-hidden"
            style={{
              background: 'rgba(13, 26, 20, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(11,94,69,0.4)',
            }}
          >
            <motion.div
              variants={conteneurStagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center w-full"
            >
              {/* Logo de l'application */}
              <motion.div variants={enfantStagger} className="mb-2 mt-[-8px]">
                <img 
                  src="/mascotte/logo_equran_accademy.png" 
                  alt="Logo Quran-Academy" 
                  className="w-20 h-auto drop-shadow-xl" 
                />
              </motion.div>

              {/* Mascotte animée */}
              <motion.div variants={enfantStagger} className="mb-2">
                <MascotteCoran etat={etatMascotte} />
              </motion.div>



              {/* Formulaire */}
              <form onSubmit={soumettre} className="w-full space-y-4">
                {/* Champ Email */}
                <div>
                  <label
                    htmlFor="email-connexion"
                    className="block font-medium mb-1.5"
                    style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}
                  >
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      <Mail size={18} />
                    </div>
                    <input
                      id="email-connexion"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (erreur) setErreur(null);
                      }}
                      onFocus={gererFocusEmail}
                      onBlur={gererBlur}
                      className="w-full pl-10 rounded-xl outline-none transition-all duration-200 focus:border-[#0B5E45] focus:ring-2 focus:ring-[#0B5E45]/30"
                      style={{
                        paddingTop: '7px',
                        paddingBottom: '7px',
                        paddingRight: '12px',
                        fontSize: '14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                      }}
                    />
                  </div>
                </div>

                {/* Champ Mot de passe */}
                <div>
                  <label
                    htmlFor="motdepasse-connexion"
                    className="block font-medium mb-1.5"
                    style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}
                  >
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      <Lock size={18} />
                    </div>
                    <input
                      id="motdepasse-connexion"
                      type={afficherMotDePasse ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={motDePasse}
                      onChange={(e) => {
                        setMotDePasse(e.target.value);
                        if (erreur) setErreur(null);
                      }}
                      onFocus={gererFocusMotDePasse}
                      onBlur={gererBlur}
                      className="w-full pl-10 rounded-xl outline-none transition-all duration-200 focus:border-[#0B5E45] focus:ring-2 focus:ring-[#0B5E45]/30"
                      style={{
                        paddingTop: '7px',
                        paddingBottom: '7px',
                        paddingRight: '12px',
                        fontSize: '14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors duration-200"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                      aria-label={
                        afficherMotDePasse
                          ? 'Masquer le mot de passe'
                          : 'Afficher le mot de passe'
                      }
                    >
                      {afficherMotDePasse ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Ligne options */}
                <motion.div
                  variants={enfantStagger}
                  className="flex items-center justify-between my-[8px]"
                >
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={souvenir}
                        onChange={(e) => setSouvenir(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className="w-4 h-4 rounded transition-all duration-200 flex items-center justify-center"
                        style={{
                          background: souvenir
                            ? '#0B5E45'
                            : 'rgba(255,255,255,0.05)',
                          border: souvenir
                            ? '1px solid #0B5E45'
                            : '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        {souvenir && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span
                      style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}
                    >
                      Se souvenir de moi
                    </span>
                  </label>

                  <Link
                    href="/mot-de-passe-oublie"
                    className="font-medium transition-all duration-200 hover:underline"
                    style={{ color: '#B8923A', fontSize: '11px' }}
                  >
                    Mot de passe oublié ?
                  </Link>
                </motion.div>

                {/* Message d'erreur */}
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

                {/* Bouton Se connecter */}
                <motion.div variants={enfantStagger}>
                  <motion.button
                    type="submit"
                    disabled={enChargement}
                    className="w-full rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden"
                    style={{
                      padding: '10px',
                      fontSize: '14px',
                      background:
                        'linear-gradient(135deg, #0B5E45 0%, #B8923A 100%)',
                      boxShadow: '0 4px 20px rgba(11,94,69,0.4)',
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 6px 30px rgba(11,94,69,0.5)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {enChargement ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            stroke="#B8923A"
                            strokeWidth="2"
                            strokeDasharray="40"
                            strokeDashoffset="10"
                            strokeLinecap="round"
                          />
                        </motion.svg>
                        Connexion…
                      </span>
                    ) : (
                      'Se connecter'
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* Inscription & Liens */}
              <motion.div variants={enfantStagger} className="mt-[8px] flex flex-col items-center gap-[8px] w-full text-[11px]">
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Pas encore de compte ?{' '}
                  <Link
                    href="/inscription"
                    className="font-semibold transition-all duration-200 hover:underline"
                    style={{ color: '#B8923A' }}
                  >
                    S&apos;inscrire →
                  </Link>
                </p>

                <div className="flex items-center justify-between w-full mt-2">
                  <Link
                    href="/"
                    className="transition-all duration-200 hover:underline"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    ← Retour à l&apos;accueil
                  </Link>
                  <img 
                    src="/mascotte/logo_equran_accademy.png" 
                    alt="Logo Quran-Academy" 
                    className="w-6 h-auto opacity-70" 
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </BordureAnimee>
      </motion.div>
    </div>
  );
}
