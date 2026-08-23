'use client';

// Page Mot de passe oublié — glassmorphism premium, thème coranique, mascotte animée.

import { useState, useCallback, type FormEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { apiClient, ErreurApi } from '@/lib/api-client';
import { MascotteCoran, type EtatMascotte } from '@/composants/auth/mascotte-coran';

// ─── Motif islamique SVG en fond ───
function MotifIslamiqueFond() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="motif-etoile-8-mdpo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <g opacity="0.04" stroke="white" fill="none">
              <rect x="20" y="20" width="40" height="40" strokeWidth="1" transform="rotate(0 40 40)" />
              <rect x="20" y="20" width="40" height="40" strokeWidth="1" transform="rotate(45 40 40)" />
              <circle cx="40" cy="40" r="24" strokeWidth="0.7" />
              <circle cx="40" cy="40" r="16" strokeWidth="0.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#motif-etoile-8-mdpo)" />
      </svg>
    </div>
  );
}

// ─── Blobs animés ───
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
            filter: 'blur(80px)',
            opacity: 0.2,
          }}
          animate={{
            x: [0, 20, -15, 0],
            y: [0, -15, 10, 0],
          }}
          transition={{
            duration: 20,
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
    <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-[#0B5E45]/60 via-[#B8923A]/40 to-[#0B5E45]/60">
      <div className="relative rounded-2xl">{children}</div>
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

export default function PageMotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [estFocus, setEstFocus] = useState(false);
  const [enChargement, setEnChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succesMessage, setSuccesMessage] = useState<string | null>(null);

  const gererFocus = useCallback(() => setEstFocus(true), []);
  const gererBlur = useCallback(() => setEstFocus(false), []);

  const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getEtatMascotte = (): EtatMascotte => {
    if (succesMessage) return 'heureux';
    if (erreur) return 'decu';
    if (estFocus) return 'ecrire';
    if (emailValide) return 'pouce';
    return 'idle';
  };

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnChargement(true);
    setSuccesMessage(null);

    try {
      const res = await apiClient.post<{ message: string }>(
        '/utilisateurs/mot-de-passe-oublie',
        { email },
      );
      setSuccesMessage(res.message);
    } catch (err) {
      setErreur(
        err instanceof ErreurApi ? err.message : 'Une erreur est survenue lors de l’envoi.',
      );
    } finally {
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
              {/* Logo */}
              <motion.div variants={enfantStagger} className="mb-2 mt-[-8px]">
                <img
                  src="/mascotte/logo_equran_accademy.png"
                  alt="Logo Quran-Academy"
                  className="w-20 h-auto drop-shadow-xl"
                />
              </motion.div>

              {/* Mascotte */}
              <motion.div variants={enfantStagger} className="mb-2">
                <MascotteCoran etat={getEtatMascotte()} />
              </motion.div>

              {/* Titre */}
              <motion.div variants={enfantStagger} className="text-center mb-4">
                <h1 className="text-lg font-bold text-white mb-1">Mot de passe oublié ?</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                  Saisissez votre e-mail pour recevoir un lien de réinitialisation.
                </p>
              </motion.div>

              {/* Formulaire ou Succès */}
              {succesMessage ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center text-center space-y-4"
                >
                  <div
                    className="p-4 rounded-xl flex flex-col items-center gap-2 w-full"
                    style={{
                      background: 'rgba(11, 94, 69, 0.25)',
                      border: '1px solid rgba(11, 94, 69, 0.5)',
                    }}
                  >
                    <CheckCircle2 size={32} className="text-emerald-400" />
                    <p className="text-sm font-medium text-emerald-200">{succesMessage}</p>
                  </div>

                  <p className="text-xs text-slate-300">
                    Veuillez consulter votre boîte de réception (et vos spams) pour cliquer sur le lien de réinitialisation. Le lien expire dans 15 minutes.
                  </p>

                  <Link
                    href="/connexion"
                    className="w-full py-2.5 rounded-xl font-semibold text-white text-center transition-all duration-300 block"
                    style={{
                      background: 'linear-gradient(135deg, #0B5E45 0%, #B8923A 100%)',
                      fontSize: '14px',
                    }}
                  >
                    Retour à la connexion
                  </Link>
                </motion.div>
              ) : (
                <form onSubmit={soumettre} className="w-full space-y-4">
                  <motion.div variants={enfantStagger}>
                    <label
                      htmlFor="email-recuperation"
                      className="block font-medium mb-1.5"
                      style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}
                    >
                      Adresse e-mail du compte
                    </label>
                    <div className="relative">
                      <div
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        <Mail size={18} />
                      </div>
                      <input
                        id="email-recuperation"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (erreur) setErreur(null);
                        }}
                        onFocus={gererFocus}
                        onBlur={gererBlur}
                        className="w-full pl-10 rounded-xl outline-none transition-all duration-300"
                        style={{
                          paddingTop: '8px',
                          paddingBottom: '8px',
                          paddingRight: '12px',
                          fontSize: '14px',
                          background: 'rgba(255,255,255,0.05)',
                          border: estFocus ? '1px solid #0B5E45' : '1px solid rgba(255,255,255,0.1)',
                          color: '#FFFFFF',
                          boxShadow: estFocus ? '0 0 0 3px rgba(11,94,69,0.3)' : 'none',
                        }}
                      />
                    </div>
                  </motion.div>

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

                  <motion.div variants={enfantStagger}>
                    <motion.button
                      type="submit"
                      disabled={enChargement || !emailValide}
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
                      {enChargement ? 'Envoi en cours…' : 'Envoyer le lien'}
                    </motion.button>
                  </motion.div>
                </form>
              )}

              <motion.div variants={enfantStagger} className="mt-4 flex items-center justify-between w-full text-[11px]">
                <Link
                  href="/connexion"
                  className="flex items-center gap-1 transition-all duration-200 hover:underline"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  <ArrowLeft size={14} /> Retour à la connexion
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </BordureAnimee>
      </motion.div>
    </div>
  );
}
