'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const TEMOIGNAGES = [
  { id: 1, nom: 'Fatima N.', avis: "J'ai énormément progressé dans ma lecture grâce à mon professeur. La pédagogie est excellente et la plateforme est très intuitive. Je recommande vivement pour tous ceux qui souhaitent apprendre à leur rythme.", note: 5 },
  { id: 2, nom: 'Omar D.', avis: "Les cours sont très bien structurés. Le système de réservation instantanée est un vrai plus quand on a un emploi du temps chargé. Mon Tajwid s'est beaucoup amélioré en quelques mois seulement.", note: 5 },
  { id: 3, nom: 'Aïssatou M.', avis: "La possibilité d'étudier la riwayat Warsh avec des professeurs qualifiés est exactement ce que je cherchais. L'interface est fluide et les paiements mobiles rendent tout plus simple.", note: 4.8 },
  { id: 4, nom: 'Youssef K.', avis: "Je prends des cours depuis la France et tout se passe à merveille. Le professeur est patient, professionnel et toujours à l'heure. Une excellente initiative de la part d'E-Quran Academy.", note: 5 },
  { id: 5, nom: 'Mariam S.', avis: "Je suis ravie des progrès de mes enfants. Les enseignants sont très pédagogues et savent capter leur attention. C'est un réel soulagement de trouver des cours de cette qualité.", note: 5 },
];

function Etoiles() {
  return (
    <div className="flex gap-0.5 md:gap-1 mb-2 md:mb-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-4 h-4 md:w-5 md:h-5 text-[#D1B875]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TemoignagesSection() {
  const [indexActif, setIndexActif] = useState(0);
  const [enPause, setEnPause] = useState(false);

  const suivant = useCallback(() => {
    setIndexActif((prev) => (prev + 1) % TEMOIGNAGES.length);
  }, []);

  const precedent = useCallback(() => {
    setIndexActif((prev) => (prev - 1 + TEMOIGNAGES.length) % TEMOIGNAGES.length);
  }, []);

  // Défilement automatique
  useEffect(() => {
    if (enPause) return;
    const interval = setInterval(suivant, 5000); // Défile toutes les 5 secondes
    return () => clearInterval(interval);
  }, [enPause, suivant]);

  const getStylesPosition = (index: number) => {
    const total = TEMOIGNAGES.length;
    let diff = index - indexActif;
    
    if (diff < -Math.floor(total / 2)) diff += total;
    if (diff > Math.floor(total / 2)) diff -= total;

    // Ajout de y: '-50%' car framer-motion écrase les classes tailwind de translation (-translate-y-1/2)
    if (diff === 0) {
      return { x: '-50%', y: '-50%', scale: 1, opacity: 1, zIndex: 30 };
    } else if (diff === 1) {
      return { x: '5%', y: '-50%', scale: 0.85, opacity: 0.4, zIndex: 20 };
    } else if (diff === -1) {
      return { x: '-105%', y: '-50%', scale: 0.85, opacity: 0.4, zIndex: 20 };
    } else {
      return { x: diff > 0 ? '50%' : '-150%', y: '-50%', scale: 0.7, opacity: 0, zIndex: 10 };
    }
  };

  return (
    <section className="pt-6 pb-12 md:pt-8 md:pb-16 bg-gradient-to-b from-[#FDFBF6] to-[#F5F1E8] overflow-hidden relative">
      <div className="text-center mb-6 md:mb-12 px-4 md:px-6 relative z-10">
        <h2 className="text-[24px] md:text-[42px] font-extrabold text-[#222222] mb-1 md:mb-4">
          Ce que disent nos <span className="text-[#1F6948]">étudiants</span>
        </h2>
        <p className="text-[14px] md:text-[16px] text-[#666666] max-w-xl mx-auto">
          Découvrez les expériences de ceux qui nous font confiance pour leur apprentissage.
        </p>
      </div>

      <div 
        className="relative w-full max-w-6xl mx-auto h-[320px] md:h-[360px] flex items-center justify-center"
        onMouseEnter={() => setEnPause(true)}
        onMouseLeave={() => setEnPause(false)}
      >
        
        {/* Bouton Précédent */}
        <button 
          onClick={precedent}
          className="absolute left-2 md:left-8 z-40 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors border border-gray-100"
          aria-label="Témoignage précédent"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Carousel */}
        <div className="relative w-full h-full">
          {TEMOIGNAGES.map((t, idx) => (
            <motion.div
              key={t.id}
              className="absolute top-1/2 left-1/2 w-[280px] md:w-[420px] bg-white rounded-[24px] p-6 md:p-8"
              style={{
                border: '1px solid #F0EBE1',
                boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                transformOrigin: 'center center',
              }}
              initial={false}
              animate={getStylesPosition(idx)}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="absolute top-4 right-4 md:top-8 md:right-8 text-[#E8F1EC] text-4xl md:text-6xl font-serif leading-none opacity-50 select-none">
                "
              </div>
              
              <Etoiles />
              
              <p className="text-[#555555] text-[13px] md:text-[15px] leading-relaxed italic line-clamp-4 relative z-10 min-h-[80px] md:min-h-[100px]">
                "{t.avis}"
              </p>
              
              <div className="mt-6 md:mt-8 flex items-center gap-3 md:gap-4 pt-4 md:pt-6 border-t border-[#F0EBE1]">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1F6948] text-white flex items-center justify-center font-bold text-base md:text-lg shadow-inner">
                  {t.nom.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-[#222222] text-[14px] md:text-[16px]">{t.nom}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#1F6948]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[11px] md:text-[12px] font-medium text-[#1F6948]">Étudiant vérifié</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bouton Suivant */}
        <button 
          onClick={suivant}
          className="absolute right-2 md:right-8 z-40 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors border border-gray-100"
          aria-label="Témoignage suivant"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </section>
  );
}
