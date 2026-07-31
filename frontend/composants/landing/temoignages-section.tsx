'use client';

import { motion } from 'framer-motion';

const TEMOIGNAGES = [
  { id: 1, nom: 'Fatima N.', avis: "J'ai énormément progressé dans ma lecture grâce à mon professeur. La pédagogie est excellente et la plateforme est très intuitive. Je recommande vivement pour tous ceux qui souhaitent apprendre à leur rythme.", note: 5 },
  { id: 2, nom: 'Omar D.', avis: "Les cours sont très bien structurés. Le système de réservation instantanée est un vrai plus quand on a un emploi du temps chargé. Mon Tajwid s'est beaucoup amélioré en quelques mois seulement.", note: 5 },
  { id: 3, nom: 'Aïssatou M.', avis: "La possibilité d'étudier la riwayat Warsh avec des professeurs qualifiés est exactement ce que je cherchais. L'interface est fluide et les paiements mobiles rendent tout plus simple.", note: 4.8 },
  { id: 4, nom: 'Youssef K.', avis: "Je prends des cours depuis la France et tout se passe à merveille. Le professeur est patient, professionnel et toujours à l'heure. Une excellente initiative de la part d'E-Quran Academy.", note: 5 },
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
  const temoignagesDoubles = [...TEMOIGNAGES, ...TEMOIGNAGES, ...TEMOIGNAGES];

  return (
    <section className="py-12 md:py-24 bg-gradient-to-b from-[#FDFBF6] to-[#F5F1E8] overflow-hidden relative">
      <div className="text-center mb-10 md:mb-16 px-4 md:px-6 relative z-10">
        <h2 className="text-[24px] md:text-[42px] font-extrabold text-[#222222] mb-2 md:mb-4">
          Ce que disent nos <span className="text-[#1F6948]">élèves</span>
        </h2>
        <p className="text-[14px] md:text-[16px] text-[#666666] max-w-xl mx-auto">
          Découvrez les expériences de ceux qui nous font confiance pour leur apprentissage.
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <motion.div
          className="flex gap-8 px-4 whitespace-nowrap"
          animate={{ x: ['0%', '-33.333333%'] }}
          transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
        >
          {temoignagesDoubles.map((t, idx) => (
            <div
              key={`${t.id}-${idx}`}
              className="w-[240px] md:w-[420px] shrink-0 bg-white rounded-[16px] md:rounded-[24px] p-4 md:p-8 whitespace-normal relative"
              style={{
                border: '1px solid #F0EBE1',
                boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
              }}
            >
              <div className="absolute top-3 right-3 md:top-8 md:right-8 text-[#E8F1EC] text-3xl md:text-6xl font-serif leading-none opacity-50 select-none">
                "
              </div>
              
              <div className="scale-90 md:scale-100 origin-left"><Etoiles /></div>
              
              <p className="text-[#555555] text-[12px] md:text-[15px] leading-relaxed italic line-clamp-4 relative z-10 min-h-[70px] md:min-h-[90px] mt-1 md:mt-0">
                "{t.avis}"
              </p>
              
              <div className="mt-4 md:mt-8 flex items-center gap-2.5 md:gap-4 pt-3 md:pt-6 border-t border-[#F0EBE1]">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#1F6948] text-white flex items-center justify-center font-bold text-sm md:text-lg shadow-inner">
                  {t.nom.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-[#222222] text-[13px] md:text-[16px]">{t.nom}</h4>
                  <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#1F6948]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-[10px] md:text-[12px] font-medium text-[#1F6948]">Élève vérifié</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Ombres de fondu sur les côtés */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[#F5F1E8] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#F5F1E8] to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}
