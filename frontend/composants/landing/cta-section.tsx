'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function CtaSection() {
  return (
    <section className="relative py-20 md:py-32 px-4 md:px-6 bg-[#FDFBF6] overflow-hidden">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[32px] md:rounded-[48px] overflow-hidden p-10 md:p-24 text-center border border-[#1F6948]/20"
          style={{
            background: 'linear-gradient(145deg, #134B31 0%, #1F6948 100%)',
            boxShadow: '0 30px 60px -15px rgba(31, 105, 72, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)'
          }}
        >
          {/* Animated Orbs */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-64 h-64 bg-[#D1B875] rounded-full mix-blend-screen filter blur-[80px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 right-0 w-80 h-80 bg-[#4ADE80] rounded-full mix-blend-screen filter blur-[100px]" 
          />

          {/* Pattern Overlay */}
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-[#D1B875] text-[12px] md:text-[14px] font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
              Rejoignez l'excellence
            </span>
            <h2 className="text-[32px] md:text-[56px] font-extrabold mb-6 text-white leading-[1.1] tracking-tight">
              Prêt à commencer <br />
              votre <span className="text-[#D1B875] relative inline-block">voyage <motion.span className="absolute -bottom-2 left-0 w-full h-[4px] bg-[#D1B875] rounded-full" initial={{ width: 0 }} whileInView={{ width: "100%" }} transition={{ delay: 0.5, duration: 0.8 }} /></span> ?
            </h2>
            <p className="text-[15px] md:text-[18px] mb-10 text-[#E8F1EC]/90 max-w-xl mx-auto leading-relaxed font-medium">
              Rejoignez des centaines d&apos;élèves de la diaspora francophone. Premier cours d&apos;essai disponible sans engagement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full sm:w-auto">
              <Link
                href="/inscription"
                className="group relative w-full sm:w-auto text-center text-[15px] md:text-[16px] font-bold py-4 px-10 rounded-full text-[#1A1A1A] bg-[#D1B875] overflow-hidden shadow-[0_8px_20px_rgba(209,184,117,0.4)] transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative z-10">Créer un compte gratuit</span>
              </Link>
              <Link
                href="/professeurs"
                className="w-full sm:w-auto text-center text-[15px] md:text-[16px] font-bold py-4 px-10 rounded-full transition-all text-white border-2 border-white/20 hover:border-white hover:bg-white/10 backdrop-blur-sm"
              >
                Voir les professeurs
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
