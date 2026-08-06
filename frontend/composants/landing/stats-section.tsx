'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const DRAPEAUX = [
  { drapeau: '🇫🇷', nom: 'France' },
  { drapeau: '🇧🇪', nom: 'Belgique' },
  { drapeau: '🇨🇭', nom: 'Suisse' },
  { drapeau: '🇨🇦', nom: 'Canada' },
  { drapeau: '🇸🇳', nom: 'Sénégal' },
  { drapeau: '🇲🇱', nom: 'Mali' },
  { drapeau: '🇨🇮', nom: 'Côte d\'Ivoire' },
  { drapeau: '🇬🇳', nom: 'Guinée' },
  { drapeau: '🇲🇦', nom: 'Maroc' },
  { drapeau: '🇩🇿', nom: 'Algérie' },
  { drapeau: '🇺🇸', nom: 'États-Unis' },
  { drapeau: '🇬🇧', nom: 'Royaume-Uni' },
];

function NombreAnime({ valeurFinale, suffixe }: { valeurFinale: number; suffixe: string }) {
  const ref = useRef(null);
  const enVue = useInView(ref, { once: true, amount: 0.5 });
  const [valeurAffichee, setValeurAffichee] = useState("0");

  useEffect(() => {
    if (enVue) {
      const controles = animate(0, valeurFinale, {
        duration: 2.2,
        ease: "easeOut",
        onUpdate(valeur) {
          const estFlottant = valeurFinale % 1 !== 0;
          setValeurAffichee(estFlottant ? valeur.toFixed(1) : Math.round(valeur).toString());
        }
      });
      return controles.stop;
    }
  }, [valeurFinale, enVue]);

  return <span ref={ref}>{valeurAffichee}{suffixe}</span>;
}

const STATISTIQUES = [
  {
    icone: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    valeur: 500,
    suffixe: '+',
    libelle: 'Étudiants satisfaits',
    couleur: '#1F6948',
    bg: '#E8F5EF',
  },
  {
    icone: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    valeur: 50,
    suffixe: '+',
    libelle: 'Professeurs certifiés',
    couleur: '#B8923A',
    bg: '#FEF3E2',
  },
  {
    icone: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    valeur: 4.9,
    suffixe: '/5',
    libelle: 'Note moyenne',
    couleur: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    icone: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    valeur: 12,
    suffixe: '+',
    libelle: 'Pays représentés',
    couleur: '#0891B2',
    bg: '#E0F2FE',
  },
];

export function StatsSection() {
  const ref = useRef(null);
  const enVue = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-10 md:py-16 bg-[#FDFBF6] overflow-hidden" ref={ref}>
      {/* ── Conteneur restreint pour Badge et Stats ── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-6">

        {/* ── En-tête Badge ── */}
        <motion.div
          className="flex items-center justify-center mb-8 md:mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={enVue ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4C5A9] bg-white shadow-sm">
            <img src="/mascotte/logo_equran_accademy.png" alt="logo" className="w-5 h-5 object-contain" />
            <span className="text-[10px] md:text-[11px] font-bold text-[#B8923A] uppercase tracking-widest whitespace-nowrap">
              La confiance de notre communauté
            </span>
          </div>
        </motion.div>

        {/* ── Bloc Unique de Statistiques ("Ligne de bloc") ── */}
        <motion.div
          className="bg-white rounded-2xl md:rounded-[28px] border border-[#E8E2D5] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden"
          initial={{ opacity: 0, y: 25 }}
          animate={enVue ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#F0EBE1]">
            {STATISTIQUES.map((stat, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center justify-center text-center p-4 md:p-7 group hover:bg-[#FAF8F3]/70 transition-colors duration-300"
              >
                {/* Icône */}
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-2.5 md:mb-3 group-hover:scale-105 transition-transform duration-300"
                  style={{ background: stat.bg, color: stat.couleur }}
                >
                  {stat.icone}
                </div>

                {/* Chiffre */}
                <div
                  className="text-2xl md:text-4xl font-extrabold leading-none mb-1 md:mb-2 tabular-nums"
                  style={{ color: stat.couleur }}
                >
                  <NombreAnime valeurFinale={stat.valeur} suffixe={stat.suffixe} />
                </div>

                {/* Libellé */}
                <p className="text-xs md:text-sm text-[#666666] font-medium leading-snug">
                  {stat.libelle}
                </p>

                {/* Accent au survol */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] group-hover:w-full transition-all duration-300"
                  style={{ background: stat.couleur }}
                />
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* ── Défilé de drapeaux dans un conteneur circulaire sur toute la largeur ── */}
      <motion.div
        className="mt-10 md:mt-14 w-full px-3 md:px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={enVue ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Ligne circulaire englobante (Pill / Anneau arrondi pleine largeur) */}
        <div className="w-full p-[1.5px] rounded-full bg-gradient-to-r from-[#B8923A]/30 via-[#1F6948]/30 to-[#B8923A]/30 shadow-sm">
          <div className="relative bg-white/95 backdrop-blur-md rounded-full py-2.5 px-4 md:py-3.5 md:px-6 overflow-hidden border border-[#F0EBE1] group w-full">
            
            {/* Dégradés d'estompage latéral */}
            <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

            {/* Piste de défilement (pause au survol du conteneur groupe) */}
            <div className="flex w-fit animate-marquee group-hover:[animation-play-state:paused]">
              {[...DRAPEAUX, ...DRAPEAUX, ...DRAPEAUX].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 mx-1.5 bg-[#FAF8F3] rounded-full border border-[#EBE5D8] shadow-2xs whitespace-nowrap hover:border-[#1F6948] hover:bg-white hover:shadow-sm transition-all duration-200 cursor-default"
                >
                  <span className="text-lg md:text-xl">{item.drapeau}</span>
                  <span className="text-xs md:text-sm font-semibold text-[#333333]">{item.nom}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
      `}} />
    </section>
  );
}


