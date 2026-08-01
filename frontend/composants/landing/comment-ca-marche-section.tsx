'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const IconeLupe = () => (
  <svg viewBox="0 0 100 100" className="w-[80px] h-[80px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="42" cy="42" r="26" stroke="#D1B875" strokeWidth="8" fill="#FDFBF6" />
    <path d="M60 60 L80 80" stroke="#1F6948" strokeWidth="12" strokeLinecap="round" />
  </svg>
);

const IconeCalendrier = () => (
  <svg viewBox="0 0 100 100" className="w-[80px] h-[80px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="25" width="70" height="60" rx="12" fill="#EAE5D9" />
    <rect x="15" y="25" width="70" height="25" rx="12" fill="#FFFFFF" />
    <path d="M15 50 H85" stroke="#D3C9B3" strokeWidth="3" />
    <rect x="30" y="15" width="8" height="20" rx="4" fill="#998344" />
    <rect x="62" y="15" width="8" height="20" rx="4" fill="#998344" />
    
    <rect x="25" y="60" width="10" height="10" rx="2" fill="#C5BAA3" />
    <rect x="45" y="60" width="10" height="10" rx="2" fill="#C5BAA3" />
    <rect x="25" y="75" width="10" height="10" rx="2" fill="#C5BAA3" />
    <rect x="45" y="75" width="10" height="10" rx="2" fill="#C5BAA3" />
    
    <circle cx="75" cy="70" r="18" fill="#1F6948" />
    <path d="M66 70 L72 76 L84 64" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconeCoran = () => (
  <svg viewBox="0 0 100 100" className="w-[80px] h-[80px]" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 75 L50 60 L80 75 Z" fill="#9A7B54" />
    <rect x="46" y="60" width="8" height="20" rx="3" fill="#7A5C39" />
    <path d="M15 60 Q50 50 50 55 L50 25 Q50 20 25 30 L15 35 Q10 37 10 40 L10 65 Q10 67 15 60 Z" fill="#E8F1EC" />
    <path d="M15 58 Q50 48 50 53 L50 25 Q50 20 25 30 L15 35 Q10 37 10 40 L10 63 Q10 65 15 58 Z" fill="#1F6948" />
    
    <path d="M85 60 Q50 50 50 55 L50 25 Q50 20 75 30 L85 35 Q90 37 90 40 L90 65 Q90 67 85 60 Z" fill="#E8F1EC" />
    <path d="M85 58 Q50 48 50 53 L50 25 Q50 20 75 30 L85 35 Q90 37 90 40 L90 63 Q90 65 85 58 Z" fill="#2A7A58" />
    
    <path d="M25 40 Q40 37 45 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M25 48 Q40 45 45 50" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    
    <path d="M75 40 Q60 37 55 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M75 48 Q60 45 55 50" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const ETAPES = [
  {
    id: 1,
    titre: 'Trouvez un professeur',
    motCle: 'professeur',
    desc: 'Parcourez notre liste de professeurs certifiés et choisissez celui qui correspond à vos besoins.',
    icone: <IconeLupe />,
    badge: { icon: '👤', label: 'Professeurs certifiés' },
  },
  {
    id: 2,
    titre: 'Réservez un cours',
    motCle: 'cours',
    desc: 'Sélectionnez un créneau horaire disponible et réservez instantanément ou sur demande.',
    icone: <IconeCalendrier />,
    badge: { icon: '📅', label: 'Réservation facile' },
  },
  {
    id: 3,
    titre: 'Apprenez',
    motCle: null,
    desc: 'Rejoignez la salle de classe virtuelle interactive et commencez votre apprentissage du Coran.',
    icone: <IconeCoran />,
    badge: { icon: '👥', label: 'Classe virtuelle interactive' },
  },
];

const Connecteur = () => (
  <div className="hidden md:block absolute top-[80px] left-[50%] w-full h-[100px] -translate-x-1/2 pointer-events-none z-0">
    <svg width="100%" height="100" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 150 50 Q 300 10 500 50 Q 700 90 850 50" stroke="#D1C39A" strokeWidth="2" strokeDasharray="6 6" fill="none" />
      <circle cx="325" cy="30" r="4" fill="#D1C39A" />
      <circle cx="675" cy="70" r="4" fill="#D1C39A" />
    </svg>
  </div>
);

export function CommentCaMarcheSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="comment" className="pt-8 md:pt-12 pb-16 md:pb-24 px-4 md:px-6 bg-[#FDFBF6]">
      <div className="max-w-[1200px] mx-auto" ref={ref}>

        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[28px] md:text-[42px] font-extrabold text-[#222222] mb-3">
            Comment <span className="text-[#1F6948]">ça marche</span> ?
          </h2>
          <p className="text-[14px] md:text-[16px] text-[#666666]">
            Commencez votre voyage d&apos;apprentissage en 3 étapes simples.
          </p>
        </motion.div>

        <div className="relative mb-16 md:mb-24">
          <Connecteur />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 relative z-10">
            {ETAPES.map((etape, idx) => (
              <motion.div
                key={etape.id}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
              >
                <div className="relative mb-6 md:mb-8">
                  <div className="w-[110px] h-[110px] md:w-[160px] md:h-[160px] rounded-[24px] md:rounded-[32px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex items-center justify-center border border-[#F0EBE1]">
                    <div className="scale-75 md:scale-100">{etape.icone}</div>
                  </div>
                  <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#1F6948] text-white text-[12px] md:text-[14px] font-bold flex items-center justify-center">
                    {etape.id}
                  </div>
                </div>

                <h3 className="text-[18px] md:text-[20px] font-extrabold text-[#222222] mb-2 md:mb-3">
                  {etape.motCle ? (
                    <>
                      {etape.titre.split(etape.motCle)[0]}
                      <span className="text-[#1F6948]">{etape.motCle}</span>
                      {etape.titre.split(etape.motCle)[1]}
                    </>
                  ) : (
                    <span className="text-[#1F6948]">{etape.titre}</span>
                  )}
                </h3>

                <p className="text-[13px] md:text-[14px] text-[#777777] leading-relaxed max-w-[260px] mb-4 md:mb-6">
                  {etape.desc}
                </p>

                <div className="inline-flex items-center gap-1.5 md:gap-2 bg-[#F6F4EE] rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[11px] md:text-[13px] font-semibold text-[#444444]">
                  <span className="opacity-70">{etape.badge.icon}</span>
                  {etape.badge.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="rounded-[24px] md:rounded-[32px] bg-[#EBE4D5] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10"
        >
          <div className="w-[120px] md:w-[200px] shrink-0">
            <svg viewBox="0 0 200 150" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 150 L100 120 L70 150 Z" fill="#998344" />
              <path d="M160 150 L100 120 L130 150 Z" fill="#998344" />
              <path d="M40 130 Q100 120 100 130 L100 80 Q100 70 40 90 Z" fill="#FDFDFD" />
              <path d="M160 130 Q100 120 100 130 L100 80 Q100 70 160 90 Z" fill="#F4F4F4" />
              <path d="M100 130 V80" stroke="#EAE5D9" strokeWidth="4" />
              
              <path d="M160 150 Q170 100 150 50" stroke="#1F6948" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="160" cy="90" rx="8" ry="16" fill="#4ADE80" transform="rotate(30 160 90)" />
              <ellipse cx="145" cy="70" rx="6" ry="14" fill="#22C55E" transform="rotate(-40 145 70)" />
              <ellipse cx="150" cy="50" rx="7" ry="15" fill="#16A34A" transform="rotate(15 150 50)" />
            </svg>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1F6948] mx-auto md:mx-0 flex items-center justify-center mb-3 md:mb-4">
              <span className="text-white text-2xl md:text-3xl font-serif leading-none mt-2">"</span>
            </div>
            <p className="text-[16px] md:text-[24px] font-bold text-[#222222] leading-snug mb-2 md:mb-3">
              Le meilleur d&apos;entre vous est celui qui apprend le Coran et l&apos;enseigne.
            </p>
            <p className="text-[14px] md:text-[16px] text-[#1F6948] italic">
              – Prophète Muhammad ﷺ <span className="text-[#666666]">(Sahih al-Bukhari, 5027)</span>
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
