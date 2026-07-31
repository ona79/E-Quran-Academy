'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="
      min-h-[100vh]
      flex flex-col items-center justify-start
      pt-20 md:pt-24 pb-10 md:pb-16 px-4 md:px-8
      relative overflow-hidden
      bg-fixed
    "
    style={{
      backgroundImage: "url('/mascotte/image_fond.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'top center',
      backgroundRepeat: 'no-repeat'
    }}>

      {/* ── Main Content ── */}
      <div className="max-w-[800px] mx-auto w-full flex flex-col items-center text-center relative z-10">
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-4xl lg:text-[50px] font-bold text-[#1F6948] leading-tight mt-10 md:mt-16 mb-2 md:mb-3"
          style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", direction: 'rtl' }}
        >
          خَيْرُكُمْ مَنْ <span className="text-[#222222]">تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[10px] md:text-[15px] text-[#B8923A] font-bold mb-4 md:mb-6"
        >
          Prophète Muhammad ﷺ <span className="text-[#999999] font-medium">(Sahih al-Bukhari, 5027)</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[11px] md:text-[15px] text-[#666666] max-w-2xl leading-relaxed mb-4 md:mb-8"
        >
          Des cours particuliers en ligne adaptés à votre rythme. Récitations Hafs et Warsh, <br className="hidden md:block" />
          Mushaf interactif et suivi personnalisé pour la diaspora francophone.
        </motion.p>

        {/* Features Badges Row */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-1.5 md:gap-3 mb-5 md:mb-8"
        >
          {[
            { icon: '🏅', title: 'Professeurs', sub: 'certifiés Ijaza' },
            { icon: '🎁', title: 'Premier cours', sub: "d'essai offert" },
            { icon: '📖', title: 'Récitations', sub: 'Hafs & Warsh' },
            { icon: '🛡️', title: 'Paiement sécurisé', sub: 'Mobile Money' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-1 md:gap-2 bg-white/90 backdrop-blur-sm px-1.5 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-[12px] border border-[#F0EBE1] shadow-sm">
              <span className="text-[10px] md:text-sm">{badge.icon}</span>
              <div className="text-left leading-tight">
                <div className="text-[8px] md:text-[11px] font-bold text-[#222222]">{badge.title}</div>
                <div className="text-[7px] md:text-[10px] text-[#777777]">{badge.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-2 md:gap-3"
        >
          <Link href="/professeurs"
            className="px-4 py-2 md:px-6 md:py-2.5 text-[12px] md:text-[14px] font-bold text-white rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(184,146,58,0.4)] flex items-center justify-center gap-1.5 md:gap-2 shadow-[0_0_12px_rgba(31,105,72,0.4)]"
            style={{ background: 'linear-gradient(135deg, #1F6948, #B8923A)' }}>
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Trouver un professeur
          </Link>
          <a href="#comment"
            className="px-4 py-2 md:px-6 md:py-2.5 text-[12px] md:text-[14px] font-bold rounded-full transition-colors flex items-center justify-center gap-1.5 md:gap-2 bg-white text-[#1F6948] border border-[#F0EBE1] hover:bg-[#F5F1E8] shadow-sm">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            Comment ça marche
          </a>
        </motion.div>
      </div>

      {/* ── Aperçu de la classe virtuelle Overlay ── */}
      <motion.div 
        className="w-full max-w-[700px] mt-6 md:mt-10 relative z-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <div className="w-full rounded-[16px] md:rounded-[24px] p-3 md:p-5 bg-white/95 backdrop-blur-md border border-[#F0EBE1] shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
          
          {/* Header Card */}
          <div className="flex justify-between items-center gap-2 mb-3 md:mb-5">
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-[#1F6948] text-[10px] md:text-sm">👥</span>
              <span className="text-[9px] md:text-[12px] font-extrabold text-[#222222] uppercase tracking-wide">Aperçu de la classe virtuelle</span>
            </div>
            <span className="flex items-center gap-1 text-[8px] md:text-[11px] font-bold text-[#1F6948] bg-[#E8F1EC] px-2 md:px-3 py-0.5 md:py-1 rounded-full">
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              Séance en direct
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-4 mb-3 md:mb-5">
            {/* Profil Prof */}
            <div className="flex items-center gap-2 md:gap-3 flex-[0.9]">
              <div className="relative">
                <div className="w-8 h-8 md:w-14 md:h-14 rounded-full bg-[#EAE5D9] overflow-hidden border-2 border-white shadow-sm flex items-end justify-center">
                  <svg className="w-6 h-6 md:w-10 md:h-10 text-[#998344]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z" /></svg>
                </div>
                <div className="absolute bottom-0 md:bottom-0.5 right-0 w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#22C55E] border border-white"></div>
              </div>
              
              <div>
                <h3 className="font-extrabold text-[#222222] text-[11px] md:text-[15px] mb-0.5 md:mb-1">Oustadh Ahmad</h3>
                <div className="flex flex-wrap gap-1 md:gap-1.5 mb-1 md:mb-1.5">
                  <span className="text-[7px] md:text-[9px] font-bold text-[#1F6948] bg-[#E8F1EC] px-1 md:px-1.5 py-0.5 rounded-full">Hafs</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] md:text-[11px] font-medium text-[#666666] flex items-center gap-1"><span className="text-[#B8923A] text-[8px] md:text-xs">🏅</span> Professeur certifié Ijaza</p>
                  <p className="text-[8px] md:text-[11px] font-medium text-[#666666] flex items-center gap-1"><span className="text-[#B8923A] text-[8px] md:text-xs">🎓</span> 8 ans d&apos;expérience</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                  <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#D1B875]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-[10px] md:text-[12px] font-bold text-[#222222]">4.9</span>
                  <span className="text-[9px] md:text-[11px] text-[#999999]">(128 avis)</span>
                </div>
              </div>
            </div>

            {/* Zone Coran */}
            <div className="bg-[#F6F4EE] rounded-[10px] md:rounded-[16px] p-2 md:p-4 flex-[1.1] flex flex-col justify-center">
              <p className="text-[8px] md:text-[11px] font-extrabold text-[#222222] mb-1.5 md:mb-2">Sourate Al-Baqarah</p>
              <p className="text-[13px] md:text-[18px] text-[#1F6948] font-bold text-center leading-relaxed mb-1 md:mb-2" style={{ fontFamily: "'Amiri', serif", direction: 'rtl' }}>
                ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ
              </p>
              <p className="text-[8px] md:text-[11px] text-[#666666]">Verset 2</p>
            </div>
          </div>

          {/* Mini Features Footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 pt-3 md:pt-4 border-t border-[#F0EBE1]">
            {[
              { icon: '🖥️', title: 'Classe interactive', sub: 'Audio, vidéo et partage' },
              { icon: '📖', title: 'Mushaf interactif', sub: 'Suivez efficacement' },
              { icon: '📋', title: 'Suivi personnalisé', sub: 'Rapports réguliers' },
              { icon: '🎧', title: 'Support dédié', sub: 'Assistance réactive' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-1 md:gap-2">
                <span className="text-[10px] md:text-sm mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-[8px] md:text-[11px] font-bold text-[#222222] mb-0.5">{f.title}</p>
                  <p className="text-[7px] md:text-[9.5px] text-[#777777] leading-snug">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </motion.div>
    </section>
  );
}
