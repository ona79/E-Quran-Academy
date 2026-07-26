'use client';

import { motion } from 'framer-motion';

export function TarifsSection() {
  return (
    <section id="tarifs" className="py-[80px] px-6">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-extrabold" style={{ color: '#F0EDE6' }}>
            Tarifs transparents
          </h2>
          <div
            className="h-[3px] w-[40px] mx-auto mt-3 mb-2 rounded-full"
            style={{ background: '#B8923A' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte 1 */}
          <motion.div
            className="rounded-[20px] p-[28px] flex flex-col"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ color: '#F0EDE6' }}>Cours à la carte</h3>
            <p className="text-[13px] mb-4" style={{ color: 'rgba(240,237,230,0.5)' }}>Idéal pour essayer</p>
            <div
              className="text-[28px] font-extrabold mb-6"
              style={{
                background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              À partir de<br />1 500 FCFA
            </div>
            <ul className="text-[14px] space-y-3 mb-8 flex-1" style={{ color: 'rgba(240,237,230,0.7)' }}>
              <li>✓ 1 heure de cours</li>
              <li>✓ Professeur certifié</li>
              <li>✓ Suivi pédagogique inclus</li>
            </ul>
            <button
              type="button"
              className="w-full py-3 rounded-xl font-semibold text-sm transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#F0EDE6',
              }}
            >
              Commencer
            </button>
          </motion.div>

          {/* Carte 2 (Recommandée) */}
          <motion.div
            className="rounded-[20px] p-[28px] flex flex-col relative"
            style={{
              background: 'rgba(11,94,69,0.15)',
              border: '2px solid rgba(11,94,69,0.5)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className="absolute -top-3 right-6 text-[11px] font-bold px-3 py-1 rounded-full"
              style={{ background: '#B8923A', color: '#0D1A14' }}
            >
              Populaire
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#F0EDE6' }}>Pack 5 cours</h3>
            <p className="text-[13px] mb-4" style={{ color: 'rgba(240,237,230,0.5)' }}>Le meilleur rapport qualité/prix</p>
            <div
              className="text-[28px] font-extrabold mb-2"
              style={{
                background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              À partir de<br />6 500 FCFA
            </div>
            <div className="mb-6">
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(34,197,94,0.2)', color: '#4ADE80' }}
              >
                Économisez 13%
              </span>
            </div>
            <ul className="text-[14px] space-y-3 mb-8 flex-1" style={{ color: 'rgba(240,237,230,0.8)' }}>
              <li>✓ 5 heures de cours</li>
              <li>✓ Économisez 13%</li>
              <li>✓ Suivi pédagogique inclus</li>
              <li>✓ Priorité de réservation</li>
            </ul>
            <button
              type="button"
              className="w-full py-3 rounded-xl font-semibold text-sm transition-transform"
              style={{
                background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
                color: 'white',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Choisir ce pack
            </button>
          </motion.div>

          {/* Carte 3 */}
          <motion.div
            className="rounded-[20px] p-[28px] flex flex-col relative"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div
              className="absolute -top-3 right-6 text-[11px] font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(240,237,230,0.1)', color: 'rgba(240,237,230,0.6)' }}
            >
              Bientôt
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#F0EDE6' }}>Abonnement</h3>
            <p className="text-[13px] mb-4" style={{ color: 'rgba(240,237,230,0.5)' }}>Pour un suivi régulier</p>
            <div className="text-[28px] font-extrabold mb-6" style={{ color: 'rgba(240,237,230,0.8)' }}>
              Sur devis
            </div>
            <ul className="text-[14px] space-y-3 mb-8 flex-1" style={{ color: 'rgba(240,237,230,0.7)' }}>
              <li>✓ Cours illimités</li>
              <li>✓ Professeur dédié</li>
              <li>✓ Tableau de bord famille</li>
            </ul>
            <button
              type="button"
              disabled
              className="w-full py-3 rounded-xl font-semibold text-sm opacity-50 cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#F0EDE6',
              }}
            >
              Bientôt disponible
            </button>
          </motion.div>
        </div>

        <p className="text-center text-[13px] mt-8" style={{ color: 'rgba(240,237,230,0.45)' }}>
          💳 Paiement Mobile Money, virement et carte bancaire acceptés. Paiement sécurisé.
        </p>
      </div>
    </section>
  );
}
