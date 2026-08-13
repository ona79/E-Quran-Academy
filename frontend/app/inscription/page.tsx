'use client';

// Page d'inscription — dark glassmorphism premium, thème coranique.
// Formulaire en 2 étapes, stepper, sélection de rôle, mascotte animée interactive.

import { useState, useCallback, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ShieldCheck, GraduationCap, BookOpen, Check, X, Hourglass } from 'lucide-react';
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
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

// ─── Bordure animée en gradient conique ───
function BordureAnimee({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-[1px] rounded-2xl flex flex-col">
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'conic-gradient(from 0deg, #0B5E45, #B8923A, #0B5E45, #B8923A, #0B5E45)',
          opacity: 0.5,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative rounded-2xl flex-1 flex flex-col bg-black/10">{children}</div>
    </div>
  );
}

// ─── Animation stagger pour les enfants ───
const conteneurStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const enfantStagger: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const pageVariants: Variants = {
  entree: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  centre: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  sortie: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeIn' },
  }),
};

// ─── Calcul de la force du mot de passe ───
function evaluerForceMDP(mdp: string) {
  let force = 0;
  if (mdp.length >= 8) force += 1;
  if (/[A-Z]/.test(mdp)) force += 1;
  if (/[0-9]/.test(mdp)) force += 1;
  return force;
}

// ─── Composant principal ───
export default function PageInscription() {
  const { inscription } = utiliserAuth();
  const router = useRouter();

  const [etape, setEtape] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(1);
  const [confirmationAffichee, setConfirmationAffichee] = useState(false);

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [role, setRole] = useState<'ELEVE' | 'PROFESSEUR' | null>(null);

  const [champActif, setChampActif] = useState<'nom' | 'email' | 'password' | 'confirmer' | 'role' | null>(null);
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [afficherConfirmerMotDePasse, setAfficherConfirmerMotDePasse] = useState(false);
  const [enChargement, setEnChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [inscriptionReussie, setInscriptionReussie] = useState(false);
  const [secouer, setSecouer] = useState(false);

  const force = evaluerForceMDP(motDePasse);
  const mdpIdentiques = confirmerMotDePasse.length > 0 && motDePasse === confirmerMotDePasse;
  const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const etape1Valide = nom.length >= 2 && emailValide && force >= 2 && mdpIdentiques;

  const getEtatMascotte = (): EtatMascotte => {
    if (inscriptionReussie) return 'heureux';
    if (enChargement) return 'ecrire';

    // Si l'utilisateur est en train de corriger (focus actif), on affiche l'action en cours
    if (champActif === 'password' || champActif === 'confirmer') {
      const estMasque = champActif === 'password' ? !afficherMotDePasse : !afficherConfirmerMotDePasse;
      return estMasque ? 'cacher' : 'espionner';
    }
    if (champActif === 'nom') {
      return nom.length >= 2 ? 'pouce' : 'ecrire';
    }
    if (champActif === 'email') {
      const emailValideLocal = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      return emailValideLocal ? 'pouce' : 'ecrire';
    }

    // Sinon, s'il y a une erreur (fausse information)
    if (erreur) return 'decu';

    // Rôle sélectionné
    if (role === 'ELEVE') return 'eleve';
    if (role === 'PROFESSEUR') return 'professeur';

    // Si l'étape 1 est valide (content)
    if (etape1Valide) return 'pouce';

    return 'idle';
  };
  const etatMascotte = getEtatMascotte();

  const allerEtape2 = () => {
    if (etape1Valide) {
      setDirection(1);
      setEtape(2);
      setErreur(null);
      setChampActif(null);
    }
  };

  const retourEtape1 = () => {
    setDirection(-1);
    setEtape(1);
    setErreur(null);
  };

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    if (!role) {
      setErreur('Veuillez choisir un profil');
      setSecouer(true);
      setTimeout(() => setSecouer(false), 500);
      return;
    }

    setErreur(null);
    setEnChargement(true);

    try {
      await inscription(email, motDePasse, nom, role);
      setInscriptionReussie(true);

      if (role === 'ELEVE') {
        setTimeout(() => {
          router.push('/eleve');
        }, 1500);
      } else {
        setTimeout(() => {
          setConfirmationAffichee(true);
        }, 800);
      }
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Une erreur est survenue');
      setSecouer(true);
      setTimeout(() => setSecouer(false), 500);
      setEnChargement(false);
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden px-4" style={{ 
      backgroundColor: '#0D1A14',
      backgroundImage: 'url("/mascotte/image_fond_login_inscription.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <BlobsAnimes />
      <MotifIslamiqueFond />

      <motion.div
        className="relative z-10"
        style={{ width: 'min(420px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 32px)' }}
        initial={{ opacity: 0, y: 24 }}
        animate={secouer ? { opacity: 1, y: 0, x: [0, -8, 8, -8, 8, 0] } : { opacity: 1, y: 0 }}
        transition={secouer ? { duration: 0.4, ease: 'easeInOut' } : { duration: 0.5, ease: 'easeOut' }}
      >
        <BordureAnimee>
          <div
            className="rounded-2xl p-5 sm:p-6 flex flex-col overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 60px rgba(11,94,69,0.3)',
            }}
          >
            {confirmationAffichee ? (
              // ─── Écran de confirmation Professeur ───
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 180, 180, 360, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-6"
                  style={{ color: '#B8923A' }}
                >
                  <Hourglass size={64} />
                </motion.div>
                <h2 className="text-2xl font-bold mb-4 text-white">Compte créé avec succès !</h2>
                <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Votre demande est en cours de validation par l&apos;administrateur.<br />
                  Vous recevrez un email de confirmation à <strong className="text-white">{email}</strong> dès que votre compte sera activé.
                </p>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-[0_4px_20px_rgba(11,94,69,0.4)]"
                  style={{ background: 'linear-gradient(135deg, #0B5E45 0%, #B8923A 100%)' }}
                >
                  Retour à l&apos;accueil
                </Link>
              </motion.div>
            ) : (
              // ─── Formulaire Inscription ───
              <motion.div variants={conteneurStagger} initial="hidden" animate="visible" className="flex flex-col flex-1">
                
                {/* Stepper */}
                <motion.div variants={enfantStagger} className="flex items-center justify-center mb-[6px]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-[26px] h-[26px] rounded-full text-xs font-medium transition-all" style={{ background: '#0B5E45', color: '#FFF' }}>1</div>
                    <div className="w-12 h-px transition-all duration-500" style={{ background: etape === 2 ? '#0B5E45' : 'rgba(255,255,255,0.2)' }} />
                    <div className="flex items-center justify-center w-[26px] h-[26px] rounded-full text-xs font-medium transition-all" style={{
                      background: etape === 2 ? '#0B5E45' : 'transparent',
                      color: etape === 2 ? '#FFF' : 'rgba(255,255,255,0.4)',
                      border: etape === 2 ? 'none' : '1px solid rgba(255,255,255,0.2)'
                    }}>2</div>
                  </div>
                </motion.div>

                <div className="flex flex-col items-center flex-1">
                  {/* Logo de l'application */}
                  <motion.div variants={enfantStagger} className="flex justify-center mb-2 mt-[-8px]">
                    <img 
                      src="/mascotte/logo_equran_accademy.png" 
                      alt="Logo E-Quran Academy" 
                      className="w-20 h-auto drop-shadow-xl" 
                    />
                  </motion.div>
                  <motion.div variants={enfantStagger} className="mb-2">
                    <MascotteCoran etat={etatMascotte} />
                  </motion.div>

                  <div className="relative w-full flex-1">
                    <AnimatePresence mode="wait" custom={direction}>
                      
                      {etape === 1 ? (
                        // ─── ÉTAPE 1 ───
                        <motion.div
                          key="etape1"
                          custom={direction}
                          variants={pageVariants}
                          initial="entree"
                          animate="centre"
                          exit="sortie"
                          className="w-full"
                        >


                          <div className="flex flex-col gap-[7px]">
                            {/* Nom */}
                            <div>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}><User size={16} /></div>
                                <input
                                  type="text"
                                  placeholder="Votre nom complet"
                                  value={nom}
                                  onChange={e => {
                                    setNom(e.target.value);
                                    if (erreur) setErreur(null);
                                  }}
                                  onFocus={() => setChampActif('nom')}
                                  onBlur={() => setChampActif(null)}
                                  className="w-full pl-9 rounded-xl outline-none transition-all duration-300"
                                  style={{ paddingTop: '7px', paddingBottom: '7px', paddingRight: '12px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', border: champActif === 'nom' ? '1px solid #0B5E45' : '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', boxShadow: champActif === 'nom' ? '0 0 0 3px rgba(11,94,69,0.3)' : 'none' }}
                                />
                              </div>
                            </div>
                            
                            {/* Email */}
                            <div>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}><Mail size={16} /></div>
                                <input
                                  type="email"
                                  placeholder="vous@exemple.com"
                                  value={email}
                                  onChange={e => {
                                    setEmail(e.target.value);
                                    if (erreur) setErreur(null);
                                  }}
                                  onFocus={() => setChampActif('email')}
                                  onBlur={() => setChampActif(null)}
                                  className="w-full pl-9 rounded-xl outline-none transition-all duration-300"
                                  style={{ paddingTop: '7px', paddingBottom: '7px', paddingRight: '12px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', border: champActif === 'email' ? '1px solid #0B5E45' : '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', boxShadow: champActif === 'email' ? '0 0 0 3px rgba(11,94,69,0.3)' : 'none' }}
                                />
                              </div>
                            </div>

                            {/* Mot de passe */}
                            <div>
                              <div className="relative mb-1">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}><Lock size={16} /></div>
                                <input
                                  type={afficherMotDePasse ? 'text' : 'password'}
                                  placeholder="Min. 8 caractères"
                                  value={motDePasse}
                                  onChange={e => {
                                    setMotDePasse(e.target.value);
                                    if (erreur) setErreur(null);
                                  }}
                                  onFocus={() => setChampActif('password')}
                                  onBlur={() => setChampActif(null)}
                                  className="w-full pl-9 pr-10 rounded-xl outline-none transition-all duration-300"
                                  style={{ paddingTop: '7px', paddingBottom: '7px', paddingRight: '12px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', border: champActif === 'password' ? '1px solid #0B5E45' : '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', boxShadow: champActif === 'password' ? '0 0 0 3px rgba(11,94,69,0.3)' : 'none' }}
                                />
                                <button type="button" onClick={() => setAfficherMotDePasse(!afficherMotDePasse)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                  {afficherMotDePasse ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                              {/* Force du mot de passe */}
                              {motDePasse.length > 0 && (
                                <div className="flex gap-1 h-1 w-full rounded-full overflow-hidden">
                                  <div className="h-full transition-all duration-300" style={{ width: '33%', background: force >= 1 ? (force === 1 ? '#EF4444' : force === 2 ? '#F59E0B' : '#10B981') : 'rgba(255,255,255,0.1)' }} />
                                  <div className="h-full transition-all duration-300" style={{ width: '33%', background: force >= 2 ? (force === 2 ? '#F59E0B' : '#10B981') : 'rgba(255,255,255,0.1)' }} />
                                  <div className="h-full transition-all duration-300" style={{ width: '33%', background: force >= 3 ? '#10B981' : 'rgba(255,255,255,0.1)' }} />
                                </div>
                              )}
                            </div>

                            {/* Confirmer le mot de passe */}
                            <div>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}><ShieldCheck size={16} /></div>
                                <input
                                  type={afficherConfirmerMotDePasse ? 'text' : 'password'}
                                  placeholder="Répétez votre mot de passe"
                                  value={confirmerMotDePasse}
                                  onChange={e => {
                                    setConfirmerMotDePasse(e.target.value);
                                    if (erreur) setErreur(null);
                                  }}
                                  onFocus={() => setChampActif('confirmer')}
                                  onBlur={() => setChampActif(null)}
                                  className="w-full pl-9 pr-[60px] rounded-xl outline-none transition-all duration-300"
                                  style={{ paddingTop: '7px', paddingBottom: '7px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', border: champActif === 'confirmer' ? '1px solid #0B5E45' : '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', boxShadow: champActif === 'confirmer' ? '0 0 0 3px rgba(11,94,69,0.3)' : 'none' }}
                                />
                                <button type="button" onClick={() => setAfficherConfirmerMotDePasse(!afficherConfirmerMotDePasse)} className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                  {afficherConfirmerMotDePasse ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {confirmerMotDePasse.length > 0 && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {mdpIdentiques ? <Check size={16} color="#10B981" /> : <X size={16} color="#EF4444" />}
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={allerEtape2}
                              disabled={!etape1Valide}
                              className="w-full mt-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-[0_4px_20px_rgba(11,94,69,0.4)]"
                              style={{ padding: '9px', fontSize: '13px', background: 'linear-gradient(135deg, #0B5E45 0%, #B8923A 100%)', opacity: etape1Valide ? 1 : 0.5, cursor: etape1Valide ? 'pointer' : 'not-allowed' }}
                            >
                              Suivant →
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        // ─── ÉTAPE 2 ───
                        <motion.div
                          key="etape2"
                          custom={direction}
                          variants={pageVariants}
                          initial="entree"
                          animate="centre"
                          exit="sortie"
                          className="w-full flex flex-col h-full"
                        >
                          <div className="text-center mb-4">
                            <h1 className="font-bold mb-[1px] text-white" style={{ fontSize: '16px' }}>Vous êtes...</h1>
                          </div>

                          <div className="flex flex-row gap-3 mb-4">
                            {/* Carte Étudiant */}
                            <motion.button
                              type="button"
                              onClick={() => setRole('ELEVE')}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 flex flex-col justify-center items-center rounded-xl text-center transition-all relative overflow-hidden"
                              style={{
                                height: '80px',
                                padding: '10px',
                                background: role === 'ELEVE' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                                border: role === 'ELEVE' ? '2px solid #0B5E45' : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: role === 'ELEVE' ? '0 0 20px rgba(11,94,69,0.2)' : 'none',
                              }}
                            >
                              <GraduationCap size={24} color="#34D399" className="mb-1" />
                              <h3 className="font-semibold text-white text-[13px]">Étudiant</h3>
                            </motion.button>

                            {/* Carte Professeur */}
                            <motion.button
                              type="button"
                              onClick={() => setRole('PROFESSEUR')}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 flex flex-col justify-center items-center rounded-xl text-center transition-all relative overflow-hidden"
                              style={{
                                height: '80px',
                                padding: '10px',
                                background: role === 'PROFESSEUR' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                                border: role === 'PROFESSEUR' ? '2px solid #B8923A' : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: role === 'PROFESSEUR' ? '0 0 20px rgba(184,146,58,0.2)' : 'none',
                              }}
                            >
                              <BookOpen size={24} color="#FCD34D" className="mb-1" />
                              <h3 className="font-semibold text-white text-[13px]">Professeur</h3>
                            </motion.button>
                          </div>

                          <AnimatePresence>
                            {role === 'PROFESSEUR' && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-center mb-4 px-4"
                                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}
                              >
                                ⏳ Compte validé par l'administrateur avant activation
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {erreur && (
                              <motion.p
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="text-center px-3 py-2 rounded-lg mb-4"
                                style={{ color: '#fca5a5', background: 'rgba(185, 28, 28, 0.15)', border: '1px solid rgba(185, 28, 28, 0.25)', fontSize: '12px' }}
                              >
                                {erreur}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <div className="mt-auto flex items-center justify-between gap-4">
                            <button
                              type="button"
                              onClick={retourEtape1}
                              className="rounded-xl font-medium transition-colors"
                              style={{ color: 'rgba(255,255,255,0.7)', background: 'transparent', padding: '9px', fontSize: '13px' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                            >
                              ← Retour
                            </button>
                            <button
                              type="button"
                              onClick={soumettre}
                              disabled={!role || enChargement}
                              className="flex-1 rounded-xl font-semibold text-white transition-all duration-300 shadow-[0_4px_20px_rgba(11,94,69,0.4)]"
                              style={{ background: 'linear-gradient(135deg, #0B5E45 0%, #B8923A 100%)', opacity: !role || enChargement ? 0.5 : 1, padding: '9px', fontSize: '13px' }}
                            >
                              {enChargement ? (
                                <span className="flex items-center justify-center gap-2">
                                  <motion.svg width="16" height="16" viewBox="0 0 20 20" fill="none" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                    <circle cx="10" cy="10" r="8" stroke="#B8923A" strokeWidth="2" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" />
                                  </motion.svg>
                                  Création...
                                </span>
                              ) : (
                                'Créer mon compte'
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {/* Inscription & Liens */}
                  <motion.div variants={enfantStagger} className="mt-[8px] flex flex-col items-center gap-[8px] w-full text-[11px]">
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Déjà un compte ?{' '}
                      <Link href="/connexion" className="font-semibold transition-all duration-200 hover:underline" style={{ color: '#B8923A' }}>
                        Se connecter →
                      </Link>
                    </p>

                    <div className="flex items-center justify-between w-full mt-2">
                      <Link href="/" className="transition-all duration-200 hover:underline" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        ← Retour à l&apos;accueil
                      </Link>
                      <img 
                        src="/mascotte/logo_equran_accademy.png" 
                        alt="Logo E-Quran Academy" 
                        className="w-6 h-auto opacity-70" 
                      />
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            )}
          </div>
        </BordureAnimee>
      </motion.div>
    </div>
  );
}
