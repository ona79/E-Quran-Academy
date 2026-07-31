'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProfilProfesseur {
  id: string;
  userId: string;
  nomComplet: string;
  bioCourte?: string;
  qiraats: string[];
  tarifHoraire: number;
  noteMoyenne?: number;
}

const DUMMY_PROFS: ProfilProfesseur[] = [
  { id: '1', userId: 'u1', nomComplet: 'Malick Diallo', bioCourte: "Professeur certifié Ijaza en lecture coranique avec plus de 10 ans d'expérience pédagogique.", qiraats: ['Hafs'], tarifHoraire: 10000, noteMoyenne: 5.0 },
  { id: '2', userId: 'u2', nomComplet: 'Moussa Kouyaté', bioCourte: "Hafiz certifié, spécialisé dans la récitation Warsh. Approche douce et méthodique.", qiraats: ['Warsh'], tarifHoraire: 1500, noteMoyenne: 5.0 },
  { id: '3', userId: 'u3', nomComplet: 'Aïssatou Fall', bioCourte: "Professeure passionnée avec une approche personnalisée, idéale pour les débutants.", qiraats: ['Hafs'], tarifHoraire: 2000, noteMoyenne: 4.9 },
  { id: '4', userId: 'u4', nomComplet: 'Ousmane Ba', bioCourte: "Spécialiste en Tajweed et Makhraj avec une méthode interactive et efficace.", qiraats: ['Hafs', 'Warsh'], tarifHoraire: 1000, noteMoyenne: 4.8 },
];

const AVATAR_COLORS = [
  { bg: '#E8F1EC', text: '#1F6948', ring: '#1F6948' },
  { bg: '#FEF3E2', text: '#B8923A', ring: '#B8923A' },
  { bg: '#EEF2FF', text: '#4F46E5', ring: '#4F46E5' },
  { bg: '#FEE2E2', text: '#DC2626', ring: '#DC2626' },
];

function EtoileNote({ note }: { note: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(note) ? 'text-[#D1B875]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

export function ProfesseursSection() {
  const [professeurs, setProfesseurs] = useState<ProfilProfesseur[]>([]);
  const [chargement, setChargement] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function charger() {
      try {
        const res = await fetch('/api-backend/utilisateurs/professeurs?taille=4');
        if (!res.ok) throw new Error('Erreur chargement');
        const data = await res.json();
        const base = Array.isArray(data) ? data : (data.donnees ?? []);
        
        const profsAvecNotes = await Promise.all(
          base.slice(0, 4).map(async (p: ProfilProfesseur) => {
            try {
              const r = await fetch(`/api-backend/avis/professeurs/${p.userId}/moyenne`);
              if (r.ok) {
                const { moyenne } = await r.json();
                return { ...p, noteMoyenne: moyenne };
              }
            } catch (err) {
              console.error(err);
            }
            return p;
          })
        );
        
        setProfesseurs(profsAvecNotes.length === 0 ? DUMMY_PROFS : profsAvecNotes);
      } catch {
        setProfesseurs(DUMMY_PROFS);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  return (
    <section className="py-16 md:py-24 px-4 md:px-6 bg-[#FDFBF6] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1F6948]/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#B8923A]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* ── Section Header ── */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-[#D4C5A9] bg-white/80 shadow-sm">
            <span className="text-sm">🎓</span>
            <span className="text-[11px] font-bold text-[#B8923A] uppercase tracking-widest">Nos enseignants</span>
          </div>

          <h2 className="text-[28px] md:text-[40px] font-extrabold text-[#1A1A1A] mb-3 leading-tight">
            Apprenez avec les <span className="text-[#1F6948]">meilleurs</span>
          </h2>
          <p className="text-[13px] md:text-[15px] text-[#888888] max-w-lg mx-auto">
            Des professeurs certifiés Ijaza, passionnés et disponibles pour vous guider dans votre parcours coranique.
          </p>
        </motion.div>

        {/* ── Cards Grid ── */}
        {chargement ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-[280px] md:h-[360px] rounded-[16px] md:rounded-[20px] animate-pulse bg-white border border-[#F0EBE1]" />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5"
          >
            {professeurs.map((prof, idx) => {
              const colors = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const initiales = prof.nomComplet.split(' ').map(n => n[0]).join('').slice(0, 2);
              return (
                <motion.div
                  key={prof.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative flex flex-col rounded-[16px] md:rounded-[20px] bg-white border border-[#F0EBE1] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(31,105,72,0.10)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                >
                  {/* Top colored band */}
                  <div
                    className="h-[60px] md:h-[80px] w-full relative flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${colors.ring}22, ${colors.ring}08)` }}
                  >
                    {/* Online indicator */}
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 md:gap-1.5 bg-white/80 backdrop-blur-sm rounded-full px-1.5 py-0.5 md:px-2 md:py-1 text-[7px] md:text-[9px] font-bold text-[#1F6948]">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                      Disponible
                    </div>
                  </div>

                  {/* Avatar — overlapping the band */}
                  <div className="px-3 pb-3 md:px-5 md:pb-5 flex flex-col flex-1 -mt-6 md:-mt-9">
                    <div
                      className="w-[44px] h-[44px] md:w-[60px] md:h-[60px] rounded-xl md:rounded-2xl flex items-center justify-center font-extrabold text-[16px] md:text-[22px] mb-2 md:mb-3 shadow-md border-2 md:border-4 border-white"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {initiales}
                    </div>

                    <h3 className="font-extrabold text-[12px] md:text-[15px] text-[#1A1A1A] mb-1 truncate">{prof.nomComplet}</h3>
                    
                    {/* Qiraats badges */}
                    <div className="flex flex-wrap gap-1 mb-1.5 md:mb-2">
                      {(prof.qiraats?.length > 0 ? prof.qiraats : ['Hafs']).map(q => (
                        <span key={q} className="text-[7px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded-full bg-[#E8F1EC] text-[#1F6948]">{q}</span>
                      ))}
                    </div>

                    <p className="text-[10px] md:text-[12px] text-[#888888] leading-snug md:leading-relaxed line-clamp-2 mb-2 md:mb-3 flex-1">
                      {prof.bioCourte || "Professeur certifié en lecture coranique avec plusieurs années d'expérience."}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                      <div className="scale-75 md:scale-100 origin-left"><EtoileNote note={prof.noteMoyenne ?? 5} /></div>
                      <span className="text-[10px] md:text-[12px] font-bold text-[#1A1A1A]">{(prof.noteMoyenne ?? 5).toFixed(1)}</span>
                      <span className="text-[9px] md:text-[11px] text-[#BBBBBB]">(32 avis)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-2 md:mb-4 px-2 md:px-3 py-1.5 md:py-2 bg-[#F7F5F0] rounded-[8px] md:rounded-xl">
                      <span className="text-[12px] md:text-[16px] font-extrabold text-[#1A1A1A]">{prof.tarifHoraire.toLocaleString('fr-FR')}</span>
                      <span className="text-[8px] md:text-[11px] font-bold text-[#888888]">FCFA / h</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row gap-1.5 md:gap-2 mt-auto">
                      <Link
                        href={`/professeurs/${prof.userId}`}
                        className="w-full md:flex-1 text-center text-[10px] md:text-[12px] font-bold py-1.5 md:py-2 rounded-[8px] md:rounded-xl border border-[#E8E3D9] text-[#555555] hover:bg-[#F5F1E8] transition-colors"
                      >
                        Profil
                      </Link>
                      <Link
                        href={`/eleve/reserver?prof=${prof.userId}`}
                        className="w-full md:flex-[1.4] text-center text-[10px] md:text-[12px] font-bold py-1.5 md:py-2 rounded-[8px] md:rounded-xl text-white transition-transform hover:scale-105 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #1F6948, #B8923A)' }}
                      >
                        Réserver
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── CTA bas ── */}
        <motion.div
          className="mt-10 md:mt-14 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/professeurs"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-[14px] border-2 border-[#1F6948] text-[#1F6948] hover:bg-[#1F6948] hover:text-white transition-all duration-300 hover:shadow-[0_4px_20px_rgba(31,105,72,0.2)]"
          >
            Explorer tous nos professeurs
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
