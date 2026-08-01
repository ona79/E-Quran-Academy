'use client';

import { motion } from 'framer-motion';

export function TarifsSection() {
  return (
    <section id="tarifs" className="pt-12 pb-6 md:pt-[80px] md:pb-[40px] px-4 md:px-6 bg-[#FDFBF6]">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-[22px] md:text-[32px] font-extrabold text-[#1A1A1A]">
            Tarifs transparents
          </h2>
          <div
            className="h-[3px] w-[30px] md:w-[40px] mx-auto mt-2 md:mt-3 mb-2 rounded-full"
            style={{ background: '#B8923A' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          {/* Carte 1 */}
          <motion.div
            className="rounded-[16px] md:rounded-[20px] p-4 md:p-[28px] flex flex-col bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
            style={{
              border: '1px solid #E5E0D5',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-sm md:text-lg font-bold mb-1 text-[#1A1A1A]">Cours à la carte</h3>
            <p className="text-[10px] md:text-[13px] mb-2 md:mb-4 text-[#6B7280]">Idéal pour essayer</p>
            <div
              className="text-[18px] md:text-[28px] font-extrabold mb-3 md:mb-6"
              style={{
                background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              À partir de<br />1 500 FCFA
            </div>
            <ul className="text-[11px] md:text-[14px] space-y-1.5 md:space-y-3 mb-4 md:mb-8 flex-1 text-[#4B5563]">
              <li>✓ 1 heure de cours</li>
              <li>✓ Professeur certifié</li>
              <li>✓ Suivi pédagogique inclus</li>
            </ul>
            <button
              type="button"
              className="w-full py-2 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-colors border text-[#1A1A1A] hover:bg-gray-50"
              style={{ borderColor: '#E5E0D5' }}
            >
              Commencer
            </button>
          </motion.div>

          {/* Carte 2 (Recommandée) */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1F6948] via-[#B8923A] to-[#1F6948] rounded-[20px] md:rounded-[24px] blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse" />
            <motion.div
              className="rounded-[16px] md:rounded-[20px] p-4 md:p-[28px] flex flex-col relative bg-white transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full"
            style={{
              border: '2px solid #0B5E45',
              boxShadow: '0 8px 32px rgba(11,94,69,0.08)'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className="absolute -top-2.5 right-3 md:right-6 text-[8px] md:text-[11px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full"
              style={{ background: '#B8923A', color: '#FFF' }}
            >
              Populaire
            </div>
            <h3 className="text-sm md:text-lg font-bold mb-1 text-[#1A1A1A]">Pack 5 cours</h3>
            <p className="text-[10px] md:text-[13px] mb-2 md:mb-4 text-[#6B7280]">Le meilleur rapport qualité/prix</p>
            <div
              className="text-[18px] md:text-[28px] font-extrabold mb-1 md:mb-2"
              style={{
                background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              À partir de<br />6 500 FCFA
            </div>
            <div className="mb-3 md:mb-6">
              <span
                className="text-[8px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: '#E8F5EF', color: '#0B5E45' }}
              >
                Économisez 13%
              </span>
            </div>
            <ul className="text-[11px] md:text-[14px] space-y-1.5 md:space-y-3 mb-4 md:mb-8 flex-1 text-[#4B5563]">
              <li>✓ 5 heures de cours</li>
              <li>✓ Économisez 13%</li>
              <li>✓ Suivi pédagogique inclus</li>
              <li>✓ Priorité de réservation</li>
            </ul>
            <button
              type="button"
              className="w-full py-2 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-transform text-white"
              style={{ background: 'linear-gradient(135deg, #0B5E45, #B8923A)' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Choisir ce pack
            </button>
          </motion.div>
          </div>

          {/* Carte 3 */}
          <motion.div
            className="rounded-[16px] md:rounded-[20px] p-4 md:p-[28px] flex flex-col relative bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            style={{
              border: '1px solid #E5E0D5',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div
              className="absolute -top-2.5 right-3 md:right-6 text-[8px] md:text-[11px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-gray-100 text-gray-500"
            >
              Bientôt
            </div>
            <h3 className="text-sm md:text-lg font-bold mb-1 text-[#1A1A1A]">Abonnement</h3>
            <p className="text-[10px] md:text-[13px] mb-2 md:mb-4 text-[#6B7280]">Pour un suivi régulier</p>
            <div className="text-[18px] md:text-[28px] font-extrabold mb-3 md:mb-6 text-gray-400">
              Sur devis
            </div>
            <ul className="text-[11px] md:text-[14px] space-y-1.5 md:space-y-3 mb-4 md:mb-8 flex-1 text-[#9CA3AF]">
              <li>✓ Cours illimités</li>
              <li>✓ Professeur dédié</li>
              <li>✓ Tableau de bord famille</li>
            </ul>
            <button
              type="button"
              disabled
              className="w-full py-2 md:py-3 rounded-xl font-semibold text-xs md:text-sm opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border border-gray-200"
            >
              Bientôt disponible
            </button>
          </motion.div>
        </div>

        <p className="text-center text-[9px] md:text-[13px] mt-4 md:mt-8 text-[#6B7280]">
          💳 Paiement Mobile Money, virement et carte bancaire acceptés. Paiement sécurisé.
        </p>
      </div>
    </section>
  );
}
