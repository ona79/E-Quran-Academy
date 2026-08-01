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
          initial={{ opacity: 0, x: -30 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            backgroundPosition: ['0% center', '200% center']
          }}
          transition={{ 
            opacity: { duration: 0.8 },
            x: { duration: 0.8 },
            backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' }
          }}
          className="text-3xl md:text-5xl lg:text-[64px] font-bold leading-normal py-4 mt-10 md:mt-16 mb-2 md:mb-3"
          style={{ 
            fontFamily: "'Amiri', 'Traditional Arabic', serif", 
            direction: 'rtl',
            wordSpacing: '0.15em',
            backgroundImage: 'linear-gradient(to right, #1F6948, #B8923A, #222222, #1F6948)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1.6' // Permet d'éviter que les harakat soient coupés par le backgroundClip
          }}
        >
          خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
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
        className="w-full max-w-[750px] mt-4 md:mt-10 relative z-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <div className="w-full rounded-[16px] md:rounded-[28px] p-3 md:p-6 bg-white/98 backdrop-blur-xl shadow-2xl border border-white/50">
          
          {/* Header Card */}
          <div className="flex justify-between items-center mb-3 md:mb-5">
            <span className="text-[9px] md:text-[12px] font-extrabold text-[#1A1A1A] uppercase tracking-wide">APERÇU DE LA CLASSE VIRTUELLE</span>
            <span className="flex items-center gap-1.5 text-[8px] md:text-[11px] font-bold text-[#1F6948] bg-[#E8F1EC] px-2 py-0.5 md:px-2.5 md:py-1 rounded-full border border-[#1F6948]/10">
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22C55E]"></span>
              Séance en direct
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-6 mb-4 md:mb-6">
            {/* Professeur & Suivi */}
            <div className="flex-[0.8]">
              <h4 className="text-[8px] md:text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-2 md:mb-3">PROFESSEUR & SUIVI</h4>
              <div className="flex items-center gap-2.5 md:gap-3">
                <div className="relative">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#E8F1EC]">
                    {/* Placeholder Oustadh photo */}
                    <img src="https://randomuser.me/api/portraits/men/33.jpg" alt="Professeur" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-[#1A1A1A] text-[12px] md:text-[16px] mb-0.5 md:mb-1">Oustadh Ahmad</h3>
                  <div className="flex flex-wrap gap-1 md:gap-1.5 mb-1 md:mb-1.5">
                    <span className="text-[8px] md:text-[10px] font-bold text-[#1F6948] bg-[#E8F1EC] px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full border border-[#1F6948]/10">Hafs</span>
                  </div>
                  <div className="space-y-0 md:space-y-0.5">
                    <p className="text-[9px] md:text-[11px] font-medium text-[#666666] flex items-center gap-1 md:gap-1.5">
                      <span className="text-[10px] md:text-[12px]">🏅</span>
                      Professeur certifié
                    </p>
                    <div className="flex items-center gap-1 md:gap-1.5 mt-0.5">
                      <span className="text-[10px] md:text-[12px]">⭐</span>
                      <span className="text-[9px] md:text-[11px] font-extrabold text-[#1A1A1A]">Top noté</span>
                      <span className="text-[9px] md:text-[11px] text-[#999999]">(Avis vérifiés)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Classe & Matière */}
            <div className="flex-[1.2]">
              <h4 className="text-[8px] md:text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-2 md:mb-3">CLASSE & MATIÈRE</h4>
              <div className="bg-[#F7F5F0] rounded-[10px] md:rounded-[14px] p-2.5 md:p-5 flex flex-col justify-center h-[calc(100%-20px)] md:h-[calc(100%-24px)] border border-[#EAE5D9]">
                <p className="text-[9px] md:text-[11px] font-extrabold text-[#1A1A1A] mb-1.5 md:mb-2">Sourate Al-Baqarah</p>
                <p className="text-[14px] md:text-[20px] text-[#1F6948] leading-relaxed mb-1.5 md:mb-2 font-normal" style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", direction: 'rtl' }}>
                  ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ
                </p>
                <p className="text-[8px] md:text-[11px] text-[#888888] font-medium">Verset 2</p>
              </div>
            </div>
          </div>

          {/* Mini Features Footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 pt-3 md:pt-4 border-t border-[#F0EBE1]">
            {[
              { 
                icon: (
                  <div className="flex gap-1 justify-center items-center h-5 md:h-6">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </div>
                ), 
                title: 'Classe interactive', 
                sub: 'Interactive' 
              },
              { 
                icon: (
                  <div className="flex justify-center items-center h-5 md:h-6 relative">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                      <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#0EA5E9]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
                    </div>
                  </div>
                ), 
                title: 'Mushaf interactif', 
                sub: 'Mushaf' 
              },
              { 
                icon: (
                  <div className="flex gap-0.5 justify-center items-center h-5 md:h-6">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5 mt-1 md:mt-1.5 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                ), 
                title: 'Suivi personnalisé', 
                sub: 'Suivi' 
              },
              { 
                icon: (
                  <div className="flex justify-center items-center h-5 md:h-6 relative">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"/></svg>
                    <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-white rounded-full">
                      <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  </div>
                ), 
                title: 'Support dédié', 
                sub: 'Support' 
              },
            ].map((f, i) => (
              <div key={i} className={`flex flex-col items-center justify-center gap-0.5 md:gap-1 px-1 md:px-2 ${i !== 3 ? 'md:border-r md:border-[#F0EBE1]' : ''}`}>
                <div className="relative mb-0.5">
                  {f.icon}
                </div>
                <div className="text-center">
                  <p className="text-[9px] md:text-[11px] font-extrabold text-[#1A1A1A]">{f.title}</p>
                  <p className="text-[8px] md:text-[10px] font-medium text-[#888888]">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </motion.div>

      {/* ── Gradient Fade at bottom to blend into next section ── */}
      <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 bg-gradient-to-t from-[#FDFBF6] to-transparent z-10 pointer-events-none" />
    </section>
  );
}
