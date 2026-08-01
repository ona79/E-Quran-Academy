'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function CtaSection() {
  return (
    <section className="relative py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-[#F5F1E8] to-[#FDFBF6] overflow-hidden">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[32px] md:rounded-[48px] overflow-hidden p-10 md:p-24 text-center shadow-lg"
          style={{
            backgroundImage: 'url(/mascotte/image_fond_avant_footer.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#F8F5E6'
          }}
        >
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <span className="inline-block text-[#9C7C38] text-[12px] md:text-[14px] font-bold tracking-widest uppercase mb-4">
              Rejoignez l'excellence
            </span>
            
            <motion.h2 
              initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="text-[48px] md:text-[64px] font-normal mb-4 text-[#8B6E32] leading-tight" 
              dir="rtl"
            >
              وَقُل رَّبِّ زِدْنِي عِلْمًا
            </motion.h2>
            
            <motion.h3 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="text-[28px] md:text-[36px] font-serif mb-6 text-[#9C7C38]"
            >
              Seigneur, accrois mon savoir.
            </motion.h3>

            <p className="text-[16px] md:text-[18px] mb-10 text-[#333333] max-w-xl mx-auto leading-relaxed font-medium">
              Rejoignez notre communauté pour explorer la<br className="hidden md:block"/> profondeur de la science sacrée.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full sm:w-auto">
              <Link
                href="/inscription"
                className="group relative w-full sm:w-auto text-center text-[15px] md:text-[16px] font-bold py-4 px-10 rounded-full text-[#1A1A1A] bg-[#D6B56E] overflow-hidden shadow-md transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative z-10">Créer un compte gratuit</span>
              </Link>
              <Link
                href="/professeurs"
                className="w-full sm:w-auto text-center text-[15px] md:text-[16px] font-bold py-4 px-10 rounded-full transition-all text-white bg-[#1F5540] shadow-md hover:bg-[#153D2E] hover:scale-105"
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
