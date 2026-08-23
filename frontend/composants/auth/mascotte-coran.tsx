'use client';

// Mascotte animée de Quran-Academy.
// Charge les 5 versions d'images PNG personnalisées fournies par l'utilisateur (normale, cacher, espionner, joyeux, triste)
// et applique des transitions fluides de fondu (cross-fade) couplées à des mouvements physiques Framer Motion.

import { AnimatePresence, motion, Variants } from 'framer-motion';

export type EtatMascotte =
  | 'idle'
  | 'cacher'
  | 'espionner'
  | 'surpris'
  | 'heureux'
  | 'ecrire'
  | 'pouce'
  | 'decu'
  | 'eleve'
  | 'professeur';

interface PropsMascotte {
  etat: EtatMascotte;
  taille?: number;
}

const IMAGES_MASCOTTE = {
  normale: '/mascotte/normale.png',
  cacher: '/mascotte/cacher.png',
  espionner: '/mascotte/espionner.png',
  joyeux: '/mascotte/joyeux.png',
  triste: '/mascotte/triste.png',
};

export function MascotteCoran({ etat }: PropsMascotte) {
  // --- Sélection de l'image active en fonction de l'état ---
  let activeImageKey: keyof typeof IMAGES_MASCOTTE = 'normale';
  if (etat === 'cacher') {
    activeImageKey = 'cacher';
  } else if (etat === 'espionner') {
    activeImageKey = 'espionner';
  } else if (['heureux', 'pouce'].includes(etat)) {
    activeImageKey = 'joyeux';
  } else if (etat === 'decu') {
    activeImageKey = 'triste';
  }

  // --- Animation physique de flottement et réaction du conteneur (Bobbing, saut, secousse) ---
  const containerVariants: Variants = {
    idle: {
      y: [0, -5, 0],
      rotate: 0,
      scale: 1,
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    ecrire: {
      y: 3,
      rotate: -1.5,
      scale: 1.01,
      transition: { duration: 0.25 },
    },
    cacher: {
      y: 1,
      scale: 0.98,
      rotate: 0,
      transition: { duration: 0.25 },
    },
    espionner: {
      y: 1,
      scale: 0.98,
      rotate: 0,
      transition: { duration: 0.25 },
    },
    surpris: {
      y: [0, -6, 0],
      scale: 1.04,
      transition: { duration: 0.3 },
    },
    heureux: {
      y: [0, -8, 0],
      scale: [1, 1.05, 1],
      rotate: [0, -2, 2, -2, 0],
      transition: {
        y: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' },
        rotate: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' },
      },
    },
    pouce: {
      y: [0, -3, 0],
      scale: 1.02,
      transition: { duration: 0.4 },
    },
    decu: {
      y: 4,
      rotate: 2,
      scale: 0.98,
      x: [0, -3, 3, -3, 3, -1.5, 1.5, 0],
      transition: {
        x: { duration: 0.4 },
        y: { duration: 0.25 },
      },
    },
    eleve: {
      y: [0, -4, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    professeur: {
      y: [0, -4, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  // --- Animation de l'ombre au sol ---
  const shadowVariants: Variants = {
    idle: {
      scaleX: [1, 0.92, 1],
      opacity: [0.25, 0.16, 0.25],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    ecrire: { scaleX: 1.01, opacity: 0.3, transition: { duration: 0.25 } },
    cacher: { scaleX: 0.98, opacity: 0.3, transition: { duration: 0.25 } },
    espionner: { scaleX: 0.98, opacity: 0.3, transition: { duration: 0.25 } },
    surpris: { scaleX: 0.92, opacity: 0.15, transition: { duration: 0.3 } },
    heureux: {
      scaleX: [1, 0.8, 1],
      opacity: [0.25, 0.12, 0.25],
      transition: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' },
    },
    pouce: { scaleX: 1.02, opacity: 0.2, transition: { duration: 0.4 } },
    decu: { scaleX: 0.98, opacity: 0.35, transition: { duration: 0.25 } },
    eleve: {
      scaleX: [1, 0.94, 1],
      opacity: [0.25, 0.18, 0.25],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    professeur: {
      scaleX: [1, 0.94, 1],
      opacity: [0.25, 0.18, 0.25],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return (
    <div className="relative w-fit mx-auto mb-2 h-[120px] sm:h-[140px] flex flex-col justify-center items-center">
      {/* Halo lumineux émeraude et or en arrière-plan */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100px 80px at center, rgba(11,94,69,0.18) 0%, rgba(184,146,58,0.05) 50%, transparent 80%)',
        }}
      />

      {/* Wrapper principal de la mascotte */}
      <div className="relative w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] z-10">
        
        {/* Conteneur de la mascotte animé en bobbing, rotation et échelle */}
        <motion.div
          variants={containerVariants}
          animate={etat}
          initial="idle"
          className="w-full h-full relative"
        >
          {/* Rendu superposé des images avec fondu croisé (préchargement complet) */}
          {Object.entries(IMAGES_MASCOTTE).map(([key, src]) => {
            const isActive = activeImageKey === key;
            return (
              <motion.img
                key={key}
                src={src}
                alt={`Mascotte ${key}`}
                className="absolute inset-0 w-full h-full object-contain block"
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Ombre au sol animée (indépendante du conteneur pour l'effet de flottement) */}
      <svg width="100" height="10" viewBox="0 0 100 10" className="absolute bottom-0 z-0 select-none pointer-events-none">
        <motion.ellipse
          cx="50"
          cy="5"
          rx="32"
          ry="4"
          fill="rgba(0, 0, 0, 0.22)"
          variants={shadowVariants}
          animate={etat}
          initial="idle"
        />
      </svg>

      {/* Particules étoiles scintillantes pour l'état joyeux/heureux */}
      <AnimatePresence>
        {(etat === 'heureux' || etat === 'pouce') && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[
              { top: '15%', left: '15%', delay: 0 },
              { top: '25%', right: '15%', delay: 0.1 },
              { top: '5%', left: '50%', delay: 0.2 },
              { bottom: '20%', left: '20%', delay: 0.35 },
              { bottom: '25%', right: '20%', delay: 0.15 },
            ].map((star, i) => (
              <motion.span
                key={i}
                className="absolute text-yellow-400 text-sm select-none"
                style={{
                  top: star.top,
                  left: star.left,
                  right: star.right,
                  bottom: star.bottom,
                }}
                initial={{ y: 15, opacity: 0, scale: 0.4, rotate: 0 }}
                animate={{ y: -25, opacity: [0, 1, 0], scale: [0.6, 1.1, 0.6], rotate: 360 }}
                transition={{ duration: 0.9, delay: star.delay, ease: 'easeOut', repeat: Infinity }}
              >
                ✨
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
