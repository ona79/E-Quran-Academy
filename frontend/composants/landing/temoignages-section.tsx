'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { utiliserAuth } from '@/composants/auth/fournisseur-auth';

interface AvisRecent {
  id: string;
  note: number;
  commentaire: string;
  auteur: {
    prenom: string;
    nom: string;
    pays?: string;
  };
}

export function TemoignagesSection() {
  const [avis, setAvis] = useState<AvisRecent[]>([]);
  const [chargement, setChargement] = useState(true);
  const router = useRouter();
  const { utilisateur, enChargement: authChargement } = utiliserAuth();
  const estConnecte = !!utilisateur;

  useEffect(() => {
    async function charger() {
      try {
        const res = await fetch('/api-backend/avis/recents');
        if (res.ok) {
          const data = await res.json();
          setAvis(data);
        }
      } catch (err) {
        console.error('Erreur chargement avis:', err);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  const gererDonnerAvis = () => {
    if (authChargement) return;
    if (estConnecte) {
      router.push('/eleve/cours'); // Redirige vers ses cours pour évaluer un professeur
    } else {
      router.push('/connexion');
    }
  };

  return (
    <section className="py-[80px] px-6 max-w-6xl mx-auto" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-[32px] font-extrabold" style={{ color: '#F0EDE6' }}>
            Ce que disent nos élèves
          </h2>
          <div
            className="h-[3px] w-[40px] mt-3 mb-2 rounded-full"
            style={{ background: '#B8923A' }}
          />
        </div>
        <button
          type="button"
          onClick={gererDonnerAvis}
          className="text-sm font-semibold transition-all hover:opacity-90 px-5 py-2.5 rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
            color: 'white',
          }}
        >
          Donner son avis
        </button>
      </div>

      {chargement ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[150px] rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
          ))}
        </div>
      ) : avis.length === 0 ? (
        <div className="text-center py-10 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-2xl mb-2">⭐</p>
          <p style={{ color: 'rgba(240,237,230,0.5)' }}>Aucun avis pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {avis.map((a, idx) => (
            <motion.div
              key={a.id}
              className="rounded-2xl p-6 flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className="flex text-lg mb-4" style={{ color: '#B8923A' }}>
                {'★'.repeat(a.note)}
                {'☆'.repeat(5 - a.note)}
              </div>
              <p className="italic text-[15px] leading-[1.7] mb-6 flex-1" style={{ color: 'rgba(240,237,230,0.8)' }}>
                « {a.commentaire} »
              </p>
              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="w-[36px] h-[36px] rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: '#0B5E45', color: '#F0EDE6' }}
                >
                  {a.auteur.prenom.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#F0EDE6' }}>
                    {a.auteur.prenom} {a.auteur.nom.charAt(0)}.
                  </div>
                  {a.auteur.pays && (
                    <div className="text-[11px]" style={{ color: 'rgba(240,237,230,0.5)' }}>
                      {a.auteur.pays}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
