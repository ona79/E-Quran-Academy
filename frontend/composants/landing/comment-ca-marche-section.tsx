'use client';

import { motion } from 'framer-motion';

const etapes = [
  {
    id: '01',
    icone: '🔍',
    titre: 'Choisir un professeur',
    desc: 'Parcourez les profils, écoutez les récitations et choisissez votre professeur (Hafs ou Warsh).',
  },
  {
    id: '02',
    icone: '📅',
    titre: 'Réserver un créneau',
    desc: 'Sélectionnez un créneau dans votre fuseau horaire. La conversion est automatique où que vous soyez.',
  },
  {
    id: '03',
    icone: '📖',
    titre: 'Apprendre en direct',
    desc: 'Rejoignez la salle de classe avec Mushaf interactif synchronisé. Le professeur guide votre récitation en temps réel.',
  },
];

export function CommentCaMarcheSection() {
  return (
    <section
      id="comment"
      className="py-[80px] px-6"
      style={{
        background: 'rgba(11,94,69,0.05)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-extrabold" style={{ color: '#F0EDE6' }}>
            Comment ça marche
          </h2>
          <div
            className="h-[3px] w-[40px] mx-auto mt-3 mb-2 rounded-full"
            style={{ background: '#B8923A' }}
          />
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {/* Ligne pointillée décorative desktop */}
          <div
            className="hidden md:block absolute top-[28px] left-[16%] right-[16%] h-[2px]"
            style={{
              borderTop: '2px dashed rgba(184,146,58,0.3)',
              zIndex: 0,
            }}
          />

          {etapes.map((etape, idx) => (
            <motion.div
              key={etape.id}
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
            >
              <div
                className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-[24px] mb-6 relative"
                style={{
                  background: 'rgba(11,94,69,0.2)',
                  border: '1px solid rgba(11,94,69,0.4)',
                }}
              >
                {etape.icone}
                <div
                  className="absolute -top-2 -right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: '#B8923A',
                    color: '#0D1A14',
                  }}
                >
                  {etape.id}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#F0EDE6' }}>
                {etape.titre}
              </h3>
              <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(240,237,230,0.6)' }}>
                {etape.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
