'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeaderLanding } from '@/composants/landing/header-landing';
import { FooterLanding } from '@/composants/landing/footer-landing';
import { MotifIslamique } from '@/composants/ui/motif-islamique';
import type { ProfilProfesseur } from '@/lib/types';

interface ProfilAvecNom extends ProfilProfesseur {
  nomComplet: string;
  noteMoyenne?: number;
}

interface Filtres {
  qiraat: '' | 'HAFS' | 'WARSH';
  tarifMax: string;
  langue: string;
  genre: '' | 'HOMME' | 'FEMME';
}

const FILTRES_INITIAUX: Filtres = { qiraat: '', tarifMax: '', langue: '', genre: '' };

function PanneauFiltres({
  filtres,
  onChange,
  onReset,
}: {
  filtres: Filtres;
  onChange: (f: Partial<Filtres>) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm" style={{ color: '#F0EDE6' }}>
          FILTRES
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs transition-colors hover:text-white"
          style={{ color: '#B8923A' }}
        >
          Réinitialiser
        </button>
      </div>

      {/* Qiraat */}
      <fieldset>
        <legend className="text-sm font-medium mb-3" style={{ color: 'rgba(240,237,230,0.8)' }}>Qiraat</legend>
        <div className="space-y-2">
          {(['', 'HAFS', 'WARSH'] as const).map((val) => (
            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'rgba(240,237,230,0.7)' }}>
              <input
                type="radio"
                name="qiraat"
                value={val}
                checked={filtres.qiraat === val}
                onChange={() => onChange({ qiraat: val })}
                className="accent-[#0B5E45]"
              />
              {val === '' ? 'Tous' : val === 'HAFS' ? 'Hafs' : 'Warsh'}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Tarif max */}
      <div>
        <label htmlFor="tarifMax" className="block text-sm font-medium mb-2" style={{ color: 'rgba(240,237,230,0.8)' }}>Tarif max (FCFA/h)</label>
        <input
          id="tarifMax"
          type="number"
          min="0"
          step="500"
          placeholder="ex: 10000"
          value={filtres.tarifMax}
          onChange={(e) => onChange({ tarifMax: e.target.value })}
          className="w-full rounded-xl px-4 py-2 text-sm outline-none transition-all bg-transparent"
          style={{
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#F0EDE6',
          }}
          onFocus={(e) => (e.currentTarget.style.border = '1px solid #B8923A')}
          onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
        />
      </div>

      {/* Langue */}
      <div>
        <label htmlFor="langue" className="block text-sm font-medium mb-2" style={{ color: 'rgba(240,237,230,0.8)' }}>Langue</label>
        <select
          id="langue"
          value={filtres.langue}
          onChange={(e) => onChange({ langue: e.target.value })}
          className="w-full rounded-xl px-4 py-2 text-sm outline-none transition-all bg-transparent appearance-none"
          style={{
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#F0EDE6',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F0EDE6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
          }}
          onFocus={(e) => (e.currentTarget.style.border = '1px solid #B8923A')}
          onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
        >
          <option value="" className="bg-[#131F18]">Toutes</option>
          <option value="fr" className="bg-[#131F18]">Français</option>
          <option value="ar" className="bg-[#131F18]">Arabe</option>
          <option value="en" className="bg-[#131F18]">Anglais</option>
          <option value="wo" className="bg-[#131F18]">Wolof</option>
        </select>
      </div>

      {/* Genre */}
      <fieldset>
        <legend className="text-sm font-medium mb-3" style={{ color: 'rgba(240,237,230,0.8)' }}>Genre</legend>
        <div className="space-y-2">
          {(['', 'HOMME', 'FEMME'] as const).map((val) => (
            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'rgba(240,237,230,0.7)' }}>
              <input
                type="radio"
                name="genre"
                value={val}
                checked={filtres.genre === val}
                onChange={() => onChange({ genre: val })}
                className="accent-[#0B5E45]"
              />
              {val === '' ? 'Tous' : val === 'HOMME' ? 'Homme' : 'Femme'}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export default function PageProfesseurs() {
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_INITIAUX);
  const [profils, setProfils] = useState<ProfilAvecNom[]>([]);
  const [enChargement, setEnChargement] = useState(true);
  const [drawerOuvert, setDrawerOuvert] = useState(false);

  const mettreAJourFiltres = (partiel: Partial<Filtres>) => {
    setFiltres((prev) => ({ ...prev, ...partiel }));
  };

  const charger = useCallback(async () => {
    setEnChargement(true);
    try {
      const params = new URLSearchParams();
      if (filtres.qiraat) params.set('qiraat', filtres.qiraat);
      if (filtres.tarifMax) params.set('tarifMax', filtres.tarifMax);
      if (filtres.langue) params.set('langue', filtres.langue);
      if (filtres.genre) params.set('genre', filtres.genre);

      const res = await fetch(`/api-backend/utilisateurs/professeurs?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      const donneesBase: ProfilAvecNom[] = Array.isArray(data) ? data : (data.donnees ?? []);

      const avecNotes = await Promise.all(
        donneesBase.map(async (p) => {
          try {
            const r = await fetch(`/api-backend/avis/professeurs/${p.userId}/moyenne`);
            if (r.ok) {
              const { moyenne } = await r.json();
              return { ...p, noteMoyenne: moyenne > 0 ? moyenne : undefined };
            }
          } catch { /* ignore */ }
          return p;
        })
      );
      setProfils(avecNotes);
    } catch { /* ignore */ }
    finally { setEnChargement(false); }
  }, [filtres]);

  useEffect(() => { charger(); }, [charger]);

  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#0D1A14' }}>
      {/* Motif SVG global (fixé) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <MotifIslamique opacite={0.03} couleur="#F0EDE6" taille={400} />
      </div>

      {/* Blobs animés globaux (Framer Motion) */}
      <motion.div
        className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: '#0B5E45', filter: 'blur(120px)', opacity: 0.15 }}
        animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.05, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed top-[40%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: '#B8923A', filter: 'blur(120px)', opacity: 0.15 }}
        animate={{ x: [0, -40, 20, 0], y: [0, 40, -20, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="relative z-10 flex flex-col flex-1">
        <HeaderLanding />

        {/* Hero Compact */}
        <div className="pt-6 pb-2 px-6 text-center shrink-0">
          <h1 className="text-[28px] sm:text-[36px] font-extrabold" style={{ color: '#F0EDE6' }}>
            Trouvez votre <span style={{ background: 'linear-gradient(135deg, #0B5E45, #B8923A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>professeur</span>
          </h1>
          <p className="mt-2 text-sm max-w-xl mx-auto hidden sm:block" style={{ color: 'rgba(240,237,230,0.65)' }}>
            Parcourez notre liste d'enseignants certifiés Ijaza et réservez votre premier cours d'essai.
          </p>
        </div>

        <div className="flex-1 min-h-0 max-w-7xl mx-auto w-full px-6 py-4 flex flex-col lg:flex-row gap-6">
          {/* Sidebar filtres — desktop */}
          <aside
            className="hidden lg:block w-64 shrink-0 rounded-2xl p-5 self-start overflow-y-auto max-h-full"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <PanneauFiltres
              filtres={filtres}
              onChange={mettreAJourFiltres}
              onReset={() => setFiltres(FILTRES_INITIAUX)}
            />
          </aside>

          {/* Contenu principal scrollable */}
          <div className="flex-1 min-w-0 flex flex-col min-h-0">
            {/* Bouton filtres — mobile */}
            <button
              type="button"
              onClick={() => setDrawerOuvert(true)}
              className="lg:hidden mb-6 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all w-full justify-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#F0EDE6',
              }}
            >
              <span>⚙️</span> Filtrer les professeurs
              {Object.values(filtres).some(Boolean) && (
                <span
                  className="ml-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#B8923A' }}
                />
              )}
            </button>

            {/* Grille */}
            <div className="flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
              {enChargement ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[160px] rounded-2xl animate-pulse"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    />
                  ))}
                </div>
              ) : profils.length === 0 ? (
                <div
                  className="text-center py-16 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.1)',
                  }}
                >
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-bold text-base mb-1" style={{ color: '#F0EDE6' }}>Aucun professeur trouvé</p>
                  <p className="text-xs mb-4" style={{ color: 'rgba(240,237,230,0.5)' }}>
                    Essayez de modifier vos critères de recherche.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFiltres(FILTRES_INITIAUX)}
                    className="rounded-xl px-5 py-2 text-xs font-semibold transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#F0EDE6',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  >
                    Réinitialiser
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {profils.map((prof, idx) => (
                  <motion.div
                    key={prof.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="rounded-2xl p-4 flex flex-col transition-all duration-200 group relative"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderLeft: '3px solid #0B5E45',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderLeftColor = '#B8923A';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderLeftColor = '#0B5E45';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="flex gap-3 mb-3">
                      <div
                        className="w-[40px] h-[40px] rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ background: '#0B5E45', color: '#F0EDE6' }}
                      >
                        {prof.nomComplet.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[15px] truncate" style={{ color: '#F0EDE6' }}>{prof.nomComplet}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,237,230,0.8)' }}
                          >
                            {prof.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs line-clamp-2 mb-3 flex-1" style={{ color: 'rgba(240,237,230,0.6)' }}>
                      {prof.bio || 'Professeur certifié de lecture coranique.'}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <div>
                        <div className="text-[14px] font-bold" style={{ color: '#B8923A' }}>
                          {prof.tarifHoraire.toLocaleString('fr-FR')} FCFA <span className="text-[9px] font-normal" style={{ color: 'rgba(240,237,230,0.5)' }}>/h</span>
                        </div>
                        {prof.noteMoyenne !== undefined ? (
                          <div className="text-[11px] mt-0.5" style={{ color: '#B8923A' }}>
                            ★ {prof.noteMoyenne.toFixed(1)}
                          </div>
                        ) : (
                          <div className="text-[11px] mt-0.5 opacity-50" style={{ color: 'rgba(240,237,230,0.5)' }}>
                            Nouveau
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Link
                          href={`/professeurs/${prof.userId}`}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: '#F0EDE6',
                          }}
                        >
                          Profil
                        </Link>
                        <Link
                          href={`/eleve/reserver?prof=${prof.userId}`}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-transform hover:scale-105"
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
            </div>
          </div>
        </div>
      </div>

      {/* Drawer filtres — mobile */}
      {drawerOuvert && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOuvert(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-72 max-w-full h-full p-6 flex flex-col"
            style={{
              background: 'rgba(13,26,20,0.95)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-lg" style={{ color: '#F0EDE6' }}>Filtres</h2>
              <button
                type="button"
                onClick={() => setDrawerOuvert(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#F0EDE6' }}
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <PanneauFiltres
                filtres={filtres}
                onChange={mettreAJourFiltres}
                onReset={() => setFiltres(FILTRES_INITIAUX)}
              />
            </div>

            <button
              type="button"
              onClick={() => setDrawerOuvert(false)}
              className="mt-6 w-full rounded-xl py-3.5 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #0B5E45, #B8923A)' }}
            >
              Appliquer les filtres
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
