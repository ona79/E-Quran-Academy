'use client';

import { motion } from 'framer-motion';

const stats = [
  { valeur: '500+', label: 'Élèves actifs' },
  { valeur: '50+', label: 'Professeurs certifiés' },
  { valeur: '4.9', label: 'Note moyenne' },
  { valeur: '12+', label: 'Pays représentés' },
];

export function StatsSection() {
  return (
    <section
      className="py-[60px] px-6"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <div
              className="text-4xl font-extrabold mb-2"
              style={{
                background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {stat.valeur}
            </div>
            <div className="text-sm" style={{ color: 'rgba(240,237,230,0.55)' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
