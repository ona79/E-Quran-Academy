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

export default function PageAccueil() {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-[#FDFBF6]"
    >
      <AccueilRedirection />

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
