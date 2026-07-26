'use client';

import { AccueilRedirection } from '@/composants/auth/accueil-redirection';
import { HeaderLanding } from '@/composants/landing/header-landing';
import { HeroSection } from '@/composants/landing/hero-section';
import { StatsSection } from '@/composants/landing/stats-section';
import { ProfesseursSection } from '@/composants/landing/professeurs-section';
import { CommentCaMarcheSection } from '@/composants/landing/comment-ca-marche-section';
import { TarifsSection } from '@/composants/landing/tarifs-section';
import { TemoignagesSection } from '@/composants/landing/temoignages-section';
import { CtaSection } from '@/composants/landing/cta-section';
import { FooterLanding } from '@/composants/landing/footer-landing';
import { MotifIslamique } from '@/composants/ui/motif-islamique';
import { motion } from 'framer-motion';

export default function PageAccueil() {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#0D1A14' }}
    >
      <AccueilRedirection />

      {/* Motif SVG global (fixé) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <MotifIslamique opacite={0.03} couleur="#F0EDE6" taille={400} />
      </div>

      {/* Blobs animés globaux (Framer Motion) */}
      <motion.div
        className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: '#0B5E45', filter: 'blur(120px)', opacity: 0.2 }}
        animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.05, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed top-[40%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: '#B8923A', filter: 'blur(120px)', opacity: 0.2 }}
        animate={{ x: [0, -40, 20, 0], y: [0, 40, -20, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="fixed bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{ background: '#08402F', filter: 'blur(120px)', opacity: 0.2 }}
        animate={{ x: [0, 50, -30, 0], y: [0, -20, 30, 0], scale: [1, 0.95, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Contenu de la Landing Page */}
      <div className="relative z-10 flex-1 flex flex-col">
        <HeaderLanding />
        
        <main>
          <HeroSection />
          <StatsSection />
          <ProfesseursSection />
          <CommentCaMarcheSection />
          <TarifsSection />
          <TemoignagesSection />
          <CtaSection />
        </main>

        <FooterLanding />
      </div>
    </div>
  );
}
