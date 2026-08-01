'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeaderLanding } from '@/composants/landing/header-landing';
import type { ProfilProfesseur } from '@/lib/types';

interface ProfilAvecNom extends ProfilProfesseur {
  nomComplet: string;
  noteMoyenne?: number;
}

interface Filtres {
  qiraat: '' | 'HAFS' | 'WARSH';
  tarifMax: string;
  langue: string;
}

const FILTRES_INITIAUX: Filtres = { qiraat: '', tarifMax: '20000', langue: '' };


/* ─── Panneau Filtres ─── */
function PanneauFiltres({
  filtres, onChange, onReset,
}: { filtres: Filtres; onChange: (f: Partial<Filtres>) => void; onReset: () => void }) {
  return (
    <div className="flex flex-col gap-6">

      {/* Qiraat */}
      <div>
        <p className="text-[13px] font-bold mb-3 text-[#1A1A1A]">Qiraat</p>
        <div className="space-y-2">
          {(['', 'HAFS', 'WARSH'] as const).map((val) => (
            <label key={val} className="flex items-center gap-2.5 text-[13px] cursor-pointer text-[#4B5563]">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio" name="qiraat" value={val}
                  checked={filtres.qiraat === val}
                  onChange={() => onChange({ qiraat: val })}
                  className="peer appearance-none w-[17px] h-[17px] rounded-full border-2 border-[#D1C9B8] checked:border-[#0B5E45] transition-colors"
                />
                <div className="absolute w-[7px] h-[7px] rounded-full bg-[#0B5E45] scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              {val === '' ? 'Tous' : val === 'HAFS' ? 'Hafs' : 'Warsh'}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-[#E5E0D5]" />

      {/* Tarif max slider */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-[13px] font-bold text-[#1A1A1A]">Tarif max</p>
          <span className="text-[12px] font-bold text-[#0B5E45]">
            {filtres.tarifMax === '20000' ? '20 000+ FCFA' : `${filtres.tarifMax} FCFA`}
          </span>
        </div>
        <div className="relative w-full h-[3px] bg-[#E5E0D5] rounded-full mt-5 mb-1">
          <div
            className="absolute top-0 left-0 h-full bg-[#0B5E45] rounded-full"
            style={{ width: `${(parseInt(filtres.tarifMax || '20000') / 20000) * 100}%` }}
          />
          <input
            type="range" min="0" max="20000" step="1000"
            value={filtres.tarifMax || '20000'}
            onChange={(e) => onChange({ tarifMax: e.target.value })}
            className="absolute -top-[9px] left-0 w-full h-5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0B5E45] [&::-webkit-slider-thumb]:shadow-md"
          />
        </div>
        <div className="flex justify-between text-[11px] font-medium text-[#6B7280] mt-1">
          <span>0</span><span>20 000+</span>
        </div>
      </div>

      <hr className="border-[#E5E0D5]" />

      {/* Langue */}
      <div>
        <p className="text-[13px] font-bold mb-2 text-[#1A1A1A]">Langue</p>
        <select
          value={filtres.langue}
          onChange={(e) => onChange({ langue: e.target.value })}
          className="w-full rounded-xl px-3 py-2 text-[13px] outline-none bg-white border border-[#E5E0D5] focus:border-[#0B5E45] appearance-none text-[#1A1A1A]"
          style={{ backgroundImage:`url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center', backgroundSize:'13px' }}
        >
          <option value="">Toutes les langues</option>
          <option value="fr">Français</option>
          <option value="ar">Arabe</option>
          <option value="en">Anglais</option>
        </select>
      </div>

      {/* Disponibilité */}
      <div>
        <p className="text-[13px] font-bold mb-2 text-[#1A1A1A]">Disponibilité</p>
        <select
          className="w-full rounded-xl px-3 py-2 text-[13px] outline-none bg-white border border-[#E5E0D5] focus:border-[#0B5E45] appearance-none text-[#1A1A1A]"
          style={{ backgroundImage:`url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center', backgroundSize:'13px' }}
        >
          <option value="">Tous les créneaux</option>
          <option value="matin">Matin</option>
          <option value="apres_midi">Après-midi</option>
          <option value="soir">Soir</option>
        </select>
      </div>

    </div>
  );
}

/* ─── Filtres Horizontaux (Desktop) ─── */
function FiltresHorizontaux({
  filtres, onChange, onReset,
}: { filtres: Filtres; onChange: (f: Partial<Filtres>) => void; onReset: () => void }) {
  return (
    <div className="hidden lg:flex items-center gap-6 flex-wrap bg-white rounded-2xl p-4 border border-[#E5E0D5] shadow-sm mb-6">
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-bold text-[#1A1A1A]">Qiraat :</span>
        <select
          value={filtres.qiraat}
          onChange={(e) => onChange({ qiraat: e.target.value as any })}
          className="rounded-xl px-3 py-1.5 text-[13px] outline-none bg-[#FDFBF6] border border-[#E5E0D5] focus:border-[#0B5E45]"
        >
          <option value="">Tous</option>
          <option value="HAFS">Hafs</option>
          <option value="WARSH">Warsh</option>
        </select>
      </div>

      <div className="w-[1px] h-6 bg-[#E5E0D5]" />

      <div className="flex items-center gap-3">
        <span className="text-[13px] font-bold text-[#1A1A1A]">Tarif max :</span>
        <div className="flex items-center gap-2">
          <input
            type="range" min="0" max="20000" step="1000"
            value={filtres.tarifMax || '20000'}
            onChange={(e) => onChange({ tarifMax: e.target.value })}
            className="w-24 h-[4px] bg-[#E5E0D5] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0B5E45]"
          />
          <span className="text-[12px] font-bold text-[#0B5E45] w-16">
            {filtres.tarifMax === '20000' ? '20 000+' : filtres.tarifMax}
          </span>
        </div>
      </div>

      <div className="w-[1px] h-6 bg-[#E5E0D5]" />

      <div className="flex items-center gap-3">
        <span className="text-[13px] font-bold text-[#1A1A1A]">Langue :</span>
        <select
          value={filtres.langue}
          onChange={(e) => onChange({ langue: e.target.value })}
          className="rounded-xl px-3 py-1.5 text-[13px] outline-none bg-[#FDFBF6] border border-[#E5E0D5] focus:border-[#0B5E45]"
        >
          <option value="">Toutes</option>
          <option value="fr">Français</option>
          <option value="ar">Arabe</option>
          <option value="en">Anglais</option>
        </select>
      </div>

      <button type="button" onClick={onReset} className="text-[12px] font-bold text-[#B8923A] hover:text-[#92650A] ml-auto">
        Réinitialiser
      </button>
    </div>
  );
}

/* ─── Page principale ─── */
export default function PageProfesseurs() {
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_INITIAUX);
  const [profils, setProfils] = useState<ProfilAvecNom[]>([]);
  const [enChargement, setEnChargement] = useState(true);
  const [drawerOuvert, setDrawerOuvert] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [tri, setTri] = useState('recommandes');
  const [menuTriOuvert, setMenuTriOuvert] = useState(false);

  const mettreAJourFiltres = (partiel: Partial<Filtres>) =>
    setFiltres((prev) => ({ ...prev, ...partiel }));

  const charger = useCallback(async () => {
    setEnChargement(true);
    try {
      const params = new URLSearchParams();
      if (filtres.qiraat) params.set('qiraat', filtres.qiraat);
      if (filtres.tarifMax && filtres.tarifMax !== '20000') params.set('tarifMax', filtres.tarifMax);
      if (filtres.langue) params.set('langue', filtres.langue);

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

  const profilsFiltres = profils
    .filter(p => p.nomComplet.toLowerCase().includes(recherche.toLowerCase()))
    .sort((a, b) => {
      if (tri === 'prix_croissant') return a.tarifHoraire - b.tarifHoraire;
      if (tri === 'meilleures_notes') return (b.noteMoyenne ?? 0) - (a.noteMoyenne ?? 0);
      return 0; // recommandés (ordre par défaut)
    });

  return (
    <div className="min-h-screen bg-[#FDFBF6]">
      <HeaderLanding />

      <section className="relative w-full bg-gradient-to-b from-[#F5F1E8] to-[#FDFBF6] pt-16 lg:pt-20 pb-2 lg:pb-2 px-6 lg:px-8 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FDFBF6] to-transparent z-10 pointer-events-none"></div>
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-6">
          {/* Texte gauche */}
          <div className="relative z-10">
            <h1 className="text-[26px] lg:text-[38px] font-extrabold text-[#1A1A1A] leading-[1.15] mb-1 lg:mb-2">
              Trouvez votre{' '}
              <span className="text-[#0B5E45]">professeur</span> idéal
            </h1>
            <p className="hidden md:block text-[14px] text-[#6B7280] mb-4 max-w-md leading-relaxed">
              Parcourez notre liste de professeurs certifiés Ijaza et réservez votre premier cours d'essai.
            </p>
            <div className="hidden md:flex flex-wrap gap-2">
              {[
                { icon: '🎓', label: 'Professeurs certifiés' },
                { icon: '🤝', label: 'Cours personnalisés' },
                { icon: '✅', label: 'Apprentissage flexible' },
              ].map((b) => (
                <span key={b.label}
                  className="inline-flex items-center gap-1.5 bg-white border border-[#E5E0D5] text-[#4B5563] text-[12px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Illustration droite */}
          <div className="absolute top-0 right-0 w-3/4 h-full lg:relative lg:w-auto lg:h-[180px] flex justify-end items-center opacity-15 lg:opacity-95 pointer-events-none z-0 lg:z-auto">
            <img 
              src="/mascotte/image_fond_recherche.png" 
              alt="Coran et calligraphie" 
              className="w-full h-full object-cover object-right mix-blend-multiply"
              style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 70%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 70%)' }}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CORPS : Grille
      ══════════════════════════════════════ */}
      <div className="max-w-[1280px] mx-auto px-8 py-6">

        {/* ─ Contenu Principal ─ */}
        <div className="w-full">
          {/* Filtres Desktop horizontaux */}
          <FiltresHorizontaux
            filtres={filtres}
            onChange={mettreAJourFiltres}
            onReset={() => setFiltres(FILTRES_INITIAUX)}
          />

          {/* ─ Contrôles Mobile (Sur une seule ligne) ─ */}
          <div className="flex lg:hidden items-center gap-2 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full rounded-xl pl-9 pr-3 py-2 text-[13px] bg-white border border-[#E5E0D5] focus:border-[#0B5E45] focus:ring-4 focus:ring-[#0B5E45]/10 outline-none text-[#1A1A1A] placeholder-gray-400 shadow-sm"
              />
            </div>
            
            {/* Bouton Tri (Mobile) */}
            <div className="relative w-9 h-9 shrink-0">
              <button 
                type="button"
                onClick={() => setMenuTriOuvert(!menuTriOuvert)}
                className="w-full h-full flex items-center justify-center rounded-xl bg-white border border-[#E5E0D5] text-[#1A1A1A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E45]/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              
              {menuTriOuvert && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuTriOuvert(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E5E0D5] rounded-xl shadow-lg z-50 overflow-hidden text-[13px]">
                    {[
                      {id: 'recommandes', label: 'Recommandés'}, 
                      {id: 'prix_croissant', label: 'Prix croissant'}, 
                      {id: 'meilleures_notes', label: 'Meilleures notes'}
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`w-full text-left px-4 py-2.5 transition-colors ${tri === opt.id ? 'bg-[#0B5E45]/10 text-[#0B5E45] font-bold' : 'text-[#1A1A1A] hover:bg-gray-50'}`}
                        onClick={() => { setTri(opt.id); setMenuTriOuvert(false); }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bouton Filtres (Mobile) */}
            <button type="button" onClick={() => setDrawerOuvert(true)}
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-white border border-[#E5E0D5] text-[#1A1A1A] shadow-sm">
              ⚙️
            </button>
          </div>

          {/* ─ Contrôles Desktop ─ */}
          <div className="hidden lg:flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un professeur..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full rounded-full pl-10 pr-5 py-[10px] text-[14px] bg-white border border-[#E5E0D5] focus:border-[#0B5E45] focus:ring-4 focus:ring-[#0B5E45]/10 outline-none text-[#1A1A1A] placeholder-gray-400 shadow-sm"
              />
            </div>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuTriOuvert(!menuTriOuvert)}
                className="flex items-center justify-between min-w-[190px] rounded-full px-4 py-[10px] text-[13px] font-semibold bg-white border border-[#E5E0D5] text-[#1A1A1A] shadow-sm focus:outline-none focus:border-[#0B5E45]"
              >
                <span>Trier par : {tri === 'recommandes' ? 'Recommandés' : tri === 'prix_croissant' ? 'Prix croissant' : 'Meilleures notes'}</span>
                <svg className="w-4 h-4 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {menuTriOuvert && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuTriOuvert(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-full min-w-[190px] bg-white border border-[#E5E0D5] rounded-xl shadow-lg z-50 overflow-hidden text-[13px]">
                    {[
                      {id: 'recommandes', label: 'Recommandés'}, 
                      {id: 'prix_croissant', label: 'Prix croissant'}, 
                      {id: 'meilleures_notes', label: 'Meilleures notes'}
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`w-full text-left px-4 py-2.5 transition-colors ${tri === opt.id ? 'bg-[#0B5E45]/10 text-[#0B5E45] font-bold' : 'text-[#1A1A1A] hover:bg-gray-50'}`}
                        onClick={() => { setTri(opt.id); setMenuTriOuvert(false); }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Compteur */}
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6B7280] mb-5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {profilsFiltres.length} professeurs disponibles
          </div>

          {/* ─ Grille ─ */}
          {enChargement ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[180px] md:h-[230px] rounded-[14px] md:rounded-[18px] animate-pulse bg-white border border-[#E5E0D5]" />
              ))}
            </div>
          ) : profilsFiltres.length === 0 ? (
            <div className="text-center py-16 rounded-[18px] bg-white border border-[#E5E0D5]">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-bold text-lg mb-2 text-[#1A1A1A]">Aucun professeur trouvé</p>
              <p className="text-sm mb-5 text-[#6B7280]">Essayez de modifier vos critères ou votre recherche.</p>
              <button type="button" onClick={() => { setFiltres(FILTRES_INITIAUX); setRecherche(''); }}
                className="rounded-full px-6 py-2.5 text-sm font-bold bg-gray-100 text-[#1A1A1A] hover:bg-gray-200">
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {profilsFiltres.map((prof, idx) => (
                <motion.div
                  key={prof.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="rounded-[14px] md:rounded-[18px] p-3 md:p-5 flex flex-col bg-white border border-[#E5E0D5] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#0B5E45]/40 hover:shadow-[0_6px_20px_rgba(11,94,69,0.08)] transition-all relative"
                >
                  {/* Favoris */}
                  <button className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-300 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Avatar + Nom */}
                  <div className="flex gap-2 md:gap-3 mb-2 md:mb-3 pr-5 md:pr-7">
                    <div className="w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center font-bold text-[13px] md:text-[17px] shrink-0 bg-[#E8F5EF] text-[#0B5E45]">
                      {prof.nomComplet.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-[12px] md:text-[15px] text-[#1A1A1A] truncate">{prof.nomComplet}</h3>
                      <span className="inline-block text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full bg-[#F7F4EE] text-[#0B5E45] mt-0.5">
                        {prof.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[10px] md:text-[13px] line-clamp-2 mb-2 md:mb-3 text-[#6B7280] leading-snug md:leading-relaxed flex-1">
                    {prof.bio || 'Professeur certifié en lecture coranique avec plusieurs années d\'expérience pédagogique.'}
                  </p>

                  {/* Note */}
                  <div className="flex items-center gap-1 md:gap-1.5 mb-2">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-[#FBBF24]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[11px] md:text-[13px] font-bold text-[#1A1A1A]">{prof.noteMoyenne?.toFixed(1) ?? '5.0'}</span>
                    <span className="text-[9px] md:text-[12px] text-[#9CA3AF]">(32 avis)</span>
                  </div>

                  {/* Prix */}
                  <div className="mb-3 md:mb-4">
                    <span className="text-[12px] md:text-[16px] font-extrabold text-[#1A1A1A]">
                      {prof.tarifHoraire.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span className="text-[9px] md:text-[12px] text-[#9CA3AF] ml-1">/h</span>
                    <div className="flex items-center gap-1 mt-0.5 text-[#6B7280] text-[10px] md:text-[12px]">
                      <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Sénégal
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex flex-col md:flex-row gap-1.5 md:gap-2">
                    <Link href={`/professeurs/${prof.userId}`}
                      className="w-full md:flex-1 text-center text-[10px] md:text-[13px] font-bold px-2 py-1.5 md:px-3 md:py-2 rounded-[8px] md:rounded-xl bg-[#F7F4EE] text-[#1A1A1A] hover:bg-[#E5E0D5] transition-colors">
                      Profil
                    </Link>
                    <Link href={`/eleve/reserver?prof=${prof.userId}`}
                      className="w-full md:flex-1 text-center text-[10px] md:text-[13px] font-bold px-2 py-1.5 md:px-3 md:py-2 rounded-[8px] md:rounded-xl text-white hover:scale-105 transition-transform"
                      style={{ background: 'linear-gradient(135deg, #0B5E45, #9A7727)', boxShadow: '0 3px 8px rgba(11,94,69,0.2)' }}>
                      Réserver
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer mobile */}
      {drawerOuvert && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOuvert(false)} />
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-[260px] max-w-[85vw] h-full flex flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E0D5] shrink-0">
              <h2 className="font-extrabold text-[13px] uppercase tracking-widest text-[#1A1A1A]">Filtres</h2>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setFiltres(FILTRES_INITIAUX)} className="text-[12px] font-bold text-[#B8923A] hover:text-[#92650A]">
                  Réinitialiser
                </button>
                <button type="button" onClick={() => setDrawerOuvert(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-[#6B7280] hover:bg-gray-200">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <PanneauFiltres filtres={filtres} onChange={mettreAJourFiltres} onReset={() => setFiltres(FILTRES_INITIAUX)} />
              
              {/* Bouton de validation pour mobile */}
              <button 
                type="button" 
                onClick={() => setDrawerOuvert(false)}
                className="w-full mt-8 py-3 rounded-xl bg-[#0B5E45] text-white font-bold text-[14px] shadow-md active:scale-95 transition-transform"
              >
                Voir les résultats
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
