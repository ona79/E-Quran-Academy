'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const badgeAnim: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function HeroSection() {
  const router = useRouter();
  const [recherche, setRecherche] = useState('');

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    const params = recherche.trim()
      ? `/professeurs?q=${encodeURIComponent(recherche)}`
      : '/professeurs';
    router.push(params);
  };

  return (
    <section className="relative flex items-center justify-center min-h-screen px-6 overflow-hidden pb-16">
      {/* Contenu principal */}
      <motion.div
        className="relative z-10 max-w-[700px] text-center flex flex-col items-center"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div
          variants={badgeAnim}
          className="mb-6 px-4 py-1.5 rounded-full text-[13px] font-medium"
          style={{
            background: 'rgba(184,146,58,0.15)',
            border: '1px solid rgba(184,146,58,0.3)',
            color: '#E0B954',
          }}
        >
          ✨ Plateforme coranique nouvelle génération
        </motion.div>

        {/* Titre principal */}
        <motion.h1
          variants={fadeUp}
          className="text-[clamp(36px,6vw,64px)] font-extrabold leading-[1.15] mb-5"
          style={{ color: '#F0EDE6' }}
        >
          Apprenez le Coran avec des <br className="hidden sm:block" />
          <span
            style={{
              background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            professeurs certifiés
          </span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          variants={fadeUp}
          className="text-[17px] leading-[1.7] mb-9"
          style={{ color: 'rgba(240,237,230,0.65)' }}
        >
          Récitations Hafs et Warsh · Salle de classe virtuelle interactive ·<br className="hidden md:block" />
          Suivi pédagogique personnalisé · Pensé pour la diaspora francophone
        </motion.p>

        {/* Barre de recherche */}
        <motion.form
          variants={fadeUp}
          onSubmit={soumettre}
          className="flex items-center gap-2 w-full max-w-[520px] rounded-2xl p-2 pl-5 mx-auto mb-8 transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = '1px solid rgba(184,146,58,0.4)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
        >
          <span className="text-xl opacity-50">🔍</span>
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[15px]"
            style={{ color: '#F0EDE6' }}
            placeholder="Rechercher un professeur..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <button
            type="submit"
            className="font-semibold text-sm rounded-xl px-5 py-2.5 transition-transform duration-200"
            style={{
              background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
              color: 'white',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Trouver →
          </button>
        </motion.form>

        {/* Ligne de réassurance */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap justify-center gap-3"
        >
          {['✓ Professeurs certifiés Ijaza', '✓ Lectures Hafs & Warsh', '✓ Premier cours d\'essai', '✓ Mobile Money accepté'].map((texte, idx) => (
            <span
              key={idx}
              className="text-[12px] px-3.5 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(240,237,230,0.6)',
              }}
            >
              {texte}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-2xl"
        style={{ color: 'rgba(240,237,230,0.3)' }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        ↓
      </motion.div>
    </section>
  );
}
