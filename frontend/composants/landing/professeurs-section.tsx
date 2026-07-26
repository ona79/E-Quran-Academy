'use client';

import { useEffect, useState } from 'react';
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

export function ProfesseursSection() {
  const [professeurs, setProfesseurs] = useState<ProfilProfesseur[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      try {
        const res = await fetch('/api-backend/utilisateurs/professeurs?taille=6');
        if (!res.ok) throw new Error('Erreur chargement');
        const data = await res.json();
        const base = Array.isArray(data) ? data : (data.donnees ?? []);
        
        // Charger les notes moyennes en parallèle
        const profsAvecNotes = await Promise.all(
          base.slice(0, 6).map(async (p: ProfilProfesseur) => {
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
        
        setProfesseurs(profsAvecNotes);
      } catch (error) {
        console.error('Erreur :', error);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  return (
    <section className="py-[80px] px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-[32px] font-extrabold" style={{ color: '#F0EDE6' }}>Nos professeurs</h2>
          <div
            className="h-[3px] w-[40px] mt-3 mb-2 rounded-full"
            style={{ background: '#B8923A' }}
          />
          <p className="text-sm mt-3" style={{ color: 'rgba(240,237,230,0.55)' }}>
            Des enseignants certifiés Ijaza, disponibles maintenant
          </p>
        </div>
        <Link
          href="/professeurs"
          className="text-sm font-semibold transition-all hover:underline"
          style={{ color: '#B8923A' }}
        >
          Voir tous →
        </Link>
      </div>

      {chargement ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[200px] rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }} />
          ))}
        </div>
      ) : professeurs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-4xl mb-3">📚</p>
          <p style={{ color: 'rgba(240,237,230,0.5)' }}>Les professeurs arrivent bientôt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {professeurs.map((prof, idx) => (
            <motion.div
              key={prof.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="rounded-2xl p-5 flex flex-col transition-all duration-200 group relative"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: '3px solid #0B5E45',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderLeftColor = '#B8923A';
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderLeftColor = '#0B5E45';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex gap-4 mb-4">
                <div
                  className="w-[50px] h-[50px] rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                  style={{ background: '#0B5E45', color: '#F0EDE6' }}
                >
                  {prof.nomComplet.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-base" style={{ color: '#F0EDE6' }}>{prof.nomComplet}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {(prof.qiraats || []).slice(0, 2).map((q) => (
                      <span
                        key={q}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,237,230,0.8)' }}
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[13px] line-clamp-2 mb-4 flex-1" style={{ color: 'rgba(240,237,230,0.6)' }}>
                {prof.bioCourte || 'Professeur certifié de lecture coranique.'}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div>
                  <div className="text-[15px] font-bold" style={{ color: '#B8923A' }}>
                    {prof.tarifHoraire} FCFA <span className="text-[10px] font-normal" style={{ color: 'rgba(240,237,230,0.5)' }}>/h</span>
                  </div>
                  {prof.noteMoyenne ? (
                    <div className="text-[12px] mt-0.5" style={{ color: '#B8923A' }}>
                      ★ {prof.noteMoyenne.toFixed(1)}
                    </div>
                  ) : (
                    <div className="text-[12px] mt-0.5 opacity-50" style={{ color: 'rgba(240,237,230,0.5)' }}>
                      Nouveau
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/professeurs/${prof.userId}`}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: '#F0EDE6',
                    }}
                  >
                    Profil
                  </Link>
                  <Link
                    href={`/professeurs/${prof.userId}`}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
                      color: 'white',
                    }}
                  >
                    Réserver
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
