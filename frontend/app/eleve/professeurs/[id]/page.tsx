'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import type { Avis, Disponibilite } from '@/lib/types';

interface ProfilComplet {
  id: string;
  userId: string;
  nomComplet: string;
  bio?: string | null;
  photoUrl?: string | null;
  ijazaUrl?: string | null;
  audioUrl?: string | null;
  tarifHoraire: number;
  qiraatParDefaut: 'HAFS' | 'WARSH';
  reservationInstantanee: boolean;
  valide: boolean;
  langue?: string;
  genre?: string | null;
}

interface AvisAvecNom extends Avis {
  nomEleve?: string;
}

function genererCreneaux7Jours(dispos: Disponibilite[]) {
  const jours = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
  const maintenant = new Date();
  const creneaux: Array<{ date: Date; hDebut: string; hFin: string }> = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(maintenant);
    date.setDate(date.getDate() + i);
    const jourNom = jours[date.getDay()];
    dispos.filter((d) => d.jour === jourNom).forEach((d) => {
      creneaux.push({ date, hDebut: d.heureDebut, hFin: d.heureFin });
    });
  }
  return creneaux;
}

const JOURS_COURTS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MOIS_COURTS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function Etoiles({ note, taille = 'md' }: { note: number; taille?: 'sm' | 'md' }) {
  const size = taille === 'sm' ? 'text-[13px]' : 'text-[16px]';
  return (
    <span className={`flex gap-0.5 ${size}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < Math.round(note) ? '#FBBF24' : '#E5E0D5' }}>★</span>
      ))}
    </span>
  );
}

/* ── Lecteur audio personnalisé ── */
function LecteurAudio({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enLecture, setEnLecture] = useState(false);
  const [progression, setProgression] = useState(0);
  const [dureeTotal, setDureeTotal] = useState(0);
  const [tempsActuel, setTempsActuel] = useState(0);

  const formaterTemps = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleLecture = () => {
    if (!audioRef.current) return;
    if (enLecture) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setEnLecture(!enLecture);
  };

  const clicProgression = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !dureeTotal) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * dureeTotal;
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-4 sm:p-5 shadow-sm">
      <audio
        ref={audioRef} src={src}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setTempsActuel(audioRef.current.currentTime);
            setProgression((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
          }
        }}
        onLoadedMetadata={() => audioRef.current && setDureeTotal(audioRef.current.duration)}
        onEnded={() => setEnLecture(false)}
      />
      <div className="flex items-center gap-4">
        {/* Bouton play */}
        <button
          onClick={toggleLecture}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-md transition-transform hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #0B5E45, #1A7A59)' }}
        >
          {enLecture ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        {/* Temps */}
        <span className="text-[13px] font-mono font-semibold text-[#6B7280] shrink-0">
          {formaterTemps(tempsActuel)} / {formaterTemps(dureeTotal)}
        </span>

        {/* Barre de progression */}
        <div className="flex-1 relative h-[4px] bg-[#E5E0D5] rounded-full cursor-pointer" onClick={clicProgression}>
          <div className="absolute top-0 left-0 h-full bg-[#0B5E45] rounded-full transition-all" style={{ width: `${progression}%` }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#0B5E45] shadow"
            style={{ left: `calc(${progression}% - 6px)` }}
          />
        </div>

        {/* Icône volume */}
        <svg className="w-5 h-5 text-[#6B7280] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />
        </svg>
      </div>
    </div>
  );
}

/* ── Carrousel avis ── */
function CarrouselAvis({ avis }: { avis: AvisAvecNom[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const defiler = (direction: 'gauche' | 'droite') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'droite' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  const displayAvis = avis;

  if (displayAvis.length === 0) {
    return <p className="text-[14px] text-[#6B7280] text-center py-6">Aucun avis pour le moment.</p>;
  }

  return (
    <div className="relative group">
      <div 
        ref={scrollRef}
        className="overflow-x-auto pb-4 flex gap-4 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
        {displayAvis.map((a, i) => (
          <div key={a.id} className="snap-start w-[75%] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] shrink-0 bg-white rounded-[16px] border border-[#E5E0D5] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#E8F5EF] text-[#0B5E45] text-[12px] font-bold flex items-center justify-center shrink-0">
                {(a.nomEleve ?? 'É').charAt(0)}
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#1A1A1A] leading-tight">{a.nomEleve ?? 'Étudiant'}</p>
                <Etoiles note={a.note} taille="sm" />
              </div>
            </div>
            <p className="text-[12px] text-[#4B5563] leading-relaxed line-clamp-3">
              {a.commentaire ?? 'Aucun commentaire.'}
            </p>
            <p className="text-[11px] text-[#9CA3AF] mt-2">
              {new Date(a.creeLe).toLocaleDateString('fr-FR')}
            </p>
          </div>
        ))}
      </div>
      {/* Flèches */}
      <button onClick={() => defiler('gauche')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white border border-[#E5E0D5] shadow-md items-center justify-center text-[#1A1A1A] hover:bg-gray-50 transition-colors z-10 opacity-0 group-hover:opacity-100">
        ‹
      </button>
      <button onClick={() => defiler('droite')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white border border-[#E5E0D5] shadow-md items-center justify-center text-[#1A1A1A] hover:bg-gray-50 transition-colors z-10 opacity-0 group-hover:opacity-100">
        ›
      </button>
    </div>
  );
}

/* ══════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════ */
export default function PageProfilProfesseurEleve() {
  const { id } = useParams<{ id: string }>();
  const [profil, setProfil] = useState<ProfilComplet | null>(null);
  const [noteMoyenne, setNoteMoyenne] = useState<{ moyenne: number; total: number } | null>(null);
  const [dispos, setDispos] = useState<Disponibilite[]>([]);
  const [avis, setAvis] = useState<AvisAvecNom[]>([]);
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [profilRes, noteRes, disposRes, avisRes] = await Promise.all([
          fetch(`/api-backend/utilisateurs/professeurs/${id}`),
          fetch(`/api-backend/avis/professeurs/${id}/moyenne`),
          fetch(`/api-backend/reservations/professeurs/${id}/disponibilites?page=1&taille=50`),
          fetch(`/api-backend/avis/professeurs/${id}?page=1&taille=12`),
        ]);
        if (!profilRes.ok) { setErreur(true); return; }
        const [profilData, noteData, disposData, avisData] = await Promise.all([
          profilRes.json(),
          noteRes.ok ? noteRes.json() : null,
          disposRes.ok ? disposRes.json() : null,
          avisRes.ok ? avisRes.json() : null,
        ]);
        setProfil(profilData);
        if (noteData) setNoteMoyenne(noteData);
        if (disposData) setDispos(disposData.donnees ?? []);
        if (avisData) setAvis(avisData.donnees ?? []);
      } catch { setErreur(true); }
      finally { setEnChargement(false); }
    })();
  }, [id]);

  const initiales = profil?.nomComplet?.split(' ').map((m: string) => m[0]).slice(0, 2).join('').toUpperCase() ?? '?';
  const creneaux = genererCreneaux7Jours(dispos);

  if (enChargement) return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte sansPadding>
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#FDFBF6]">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full animate-pulse mx-auto bg-[#E8F5EF]" />
            <p className="font-medium text-[#6B7280]">Chargement du profil…</p>
          </div>
        </div>
      </ShellConnecte>
    </GardeRoute>
  );

  if (erreur || !profil) return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte sansPadding>
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#FDFBF6] px-6">
          <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-[#E5E0D5] max-w-md w-full">
            <p className="text-5xl mb-4">😔</p>
            <h1 className="text-xl font-bold mb-2 text-[#1A1A1A]">Profil introuvable</h1>
            <p className="mb-6 text-[#6B7280] text-sm">Ce professeur n&apos;existe pas ou son profil n&apos;est pas encore disponible.</p>
            <Link href="/eleve/tableau-de-bord" className="rounded-full px-6 py-3 font-bold inline-block text-white text-sm" style={{ background: '#0B5E45' }}>
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </ShellConnecte>
    </GardeRoute>
  );

  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte sansPadding>
        <div className="min-h-full bg-[#FDFBF6] flex flex-col relative w-full">
          {/* ══ En-tête du profil ══ */}
          <section 
            className="relative w-full pt-12 pb-8 px-5 sm:px-8"
            style={{
              backgroundImage: 'url("/mascotte/image_fond_avant_footer.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              backgroundColor: '#FDFBF6'
            }}
          >
            <div className="absolute inset-0 bg-[#FDFBF6]/85 sm:bg-white/60 sm:backdrop-blur-[2px] z-0"></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FDFBF6] to-transparent z-10 pointer-events-none"></div>
            <div className="max-w-[1100px] mx-auto relative z-10">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-extrabold shrink-0 border-4 border-white shadow-lg bg-[#E8F5EF] text-[#08402F] overflow-hidden">
                  {profil.photoUrl ? (
                    <img src={profil.photoUrl.startsWith('/') ? `/api-backend${profil.photoUrl}` : profil.photoUrl} alt={`Photo de ${profil.nomComplet}`} className="w-full h-full object-cover" />
                  ) : (
                    initiales
                  )}
                </div>

                {/* Infos centrales */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-[22px] sm:text-[28px] font-extrabold text-[#1A1A1A]">{profil.nomComplet}</h1>
                    {profil.valide && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0B5E45" stroke="#0B5E45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                        <path stroke="#FFF" d="m9 12 2 2 4-4"/>
                      </svg>
                    )}
                  </div>
                  <span className="inline-block text-[12px] font-bold px-2.5 py-1 rounded-full bg-[#F7F4EE] text-[#0B5E45] mb-3">
                    {profil.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}
                  </span>
                  {profil.bio && (
                    <p className="text-[14px] text-[#6B7280] leading-relaxed mb-3 max-w-lg">{profil.bio}</p>
                  )}
                  {/* Stats en ligne */}
                  <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#6B7280]">
                    {noteMoyenne && noteMoyenne.total > 0 && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#FBBF24]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-bold text-[#1A1A1A]">{noteMoyenne.moyenne.toFixed(1)}</span>
                        <span>({noteMoyenne.total} avis)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      8 ans d&apos;expérience
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      Sénégal
                    </div>
                  </div>
                </div>

                {/* Boutons — desktop */}
                <div className="hidden sm:flex flex-col gap-2 shrink-0 w-44">
                  <Link href={`/eleve/reserver?prof=${profil.userId}`}
                    className="w-full text-center rounded-xl px-5 py-3 text-[14px] font-bold text-white shadow-md hover:scale-105 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #0B5E45, #9A7727)' }}>
                    Réserver un cours
                  </Link>
                  <Link href={`/eleve/reserver?prof=${profil.userId}&essai=1`}
                    className="w-full text-center rounded-xl px-5 py-3 text-[14px] font-bold border border-[#E5E0D5] bg-white text-[#1A1A1A] hover:bg-gray-50 transition-colors">
                    ✨ Cours d&apos;essai
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ══ Corps de la page ══ */}
          <div className="max-w-[1100px] w-full mx-auto px-5 sm:px-8 pt-4 pb-28 sm:pb-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start flex-1">

            {/* ─ Colonne principale (2/3) ─ */}
            <div className="lg:col-span-2 space-y-6">

              {/* Lecteur audio */}
              {profil.audioUrl && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[#0B5E45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <h2 className="font-bold text-[15px] text-[#1A1A1A]">Écouter la récitation</h2>
                  </div>
                  <LecteurAudio src={profil.audioUrl} />
                </section>
              )}

              {/* Disponibilités */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[#0B5E45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h2 className="font-bold text-[15px] text-[#1A1A1A]">Disponibilités — 7 prochains jours</h2>
                </div>
                <div className="bg-white rounded-[16px] border border-[#E5E0D5] p-5 shadow-sm">
                  {creneaux.length === 0 ? (
                    <p className="text-[14px] text-[#6B7280] text-center py-6">Aucun créneau disponible dans les 7 prochains jours.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {creneaux.slice(0, 4).map((c, i) => (
                        <Link key={i}
                          href={`/eleve/reserver?prof=${profil.userId}&date=${c.date.toISOString().split('T')[0]}&h=${c.hDebut}`}
                          className="flex flex-col gap-1 p-3 rounded-[12px] border border-[#E5E0D5] bg-[#FDFBF6] hover:border-[#0B5E45] hover:bg-white transition-all">
                          <span className="text-[11px] font-semibold text-[#6B7280]">
                            {JOURS_COURTS[c.date.getDay()]} {c.date.getDate()} {MOIS_COURTS[c.date.getMonth()]}
                          </span>
                          <span className="text-[12px] font-extrabold text-[#1A1A1A]">{c.hDebut} – {c.hFin}</span>
                          <span className="text-[10px] font-bold text-[#0B5E45] bg-[#E8F5EF] px-2 py-0.5 rounded-full w-fit">Disponible</span>
                        </Link>
                      ))}
                      {creneaux.length > 4 && (
                        <Link href={`/eleve/reserver?prof=${profil.userId}`}
                          className="flex flex-col items-center justify-center gap-1 p-3 rounded-[12px] border border-dashed border-[#D1C9B8] text-[#6B7280] hover:border-[#0B5E45] hover:text-[#0B5E45] transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-[12px] font-bold text-center">Voir plus</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Avis */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[#0B5E45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <h2 className="font-bold text-[15px] text-[#1A1A1A]">Avis des étudiants</h2>
                </div>
                <CarrouselAvis avis={avis} />
              </section>
            </div>

            {/* ─ Sidebar droite (1/3) ─ */}
            <aside className="space-y-4 sticky top-6">
              {/* Tarif + Réservation */}
              <div className="bg-white rounded-[18px] border border-[#E5E0D5] p-5 shadow-sm">
                <p className="text-[26px] font-extrabold text-[#B8923A] leading-tight">
                  {profil.tarifHoraire.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-[12px] text-[#6B7280] mb-5">par heure de cours</p>
                <div className="space-y-2">
                  <Link href={`/eleve/reserver?prof=${profil.userId}`}
                    className="w-full block text-center rounded-xl py-3 text-[14px] font-bold text-white shadow-md hover:scale-105 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #0B5E45, #9A7727)' }}>
                    Réserver un cours
                  </Link>
                  <Link href={`/eleve/reserver?prof=${profil.userId}&essai=1`}
                    className="w-full block text-center rounded-xl py-3 text-[14px] font-bold border border-[#E5E0D5] bg-white text-[#1A1A1A] hover:bg-gray-50 transition-colors">
                    ✨ Cours d&apos;essai
                  </Link>
                </div>
              </div>

              {/* Infos rapides */}
              <div className="bg-white rounded-[18px] border border-[#E5E0D5] p-5 shadow-sm space-y-0 text-[13px] divide-y divide-[#F0EDE7]">
                {[
                  { label: 'Qiraat', valeur: profil.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs' },
                  { label: 'Langues', valeur: profil.langue ? profil.langue.charAt(0).toUpperCase() + profil.langue.slice(1) : 'Français, Wolof' },
                  { label: 'Expérience', valeur: '8 ans' },
                  { label: 'Pays', valeur: 'Sénégal' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-3">
                    <span className="text-[#6B7280] font-medium">{row.label}</span>
                    <span className="font-bold text-[#1A1A1A] text-right">{row.valeur}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          {/* Bouton fixe mobile */}
          <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 flex gap-2 p-3 bg-white/95 backdrop-blur-md border-t border-[#E5E0D5] shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
            <Link href={`/eleve/reserver?prof=${profil.userId}&essai=1`}
              className="flex-1 text-center rounded-xl py-2.5 text-[12px] font-bold border border-[#E5E0D5] bg-white text-[#1A1A1A]">
              ✨ Essai
            </Link>
            <Link href={`/eleve/reserver?prof=${profil.userId}`}
              className="flex-[2] text-center rounded-xl py-2.5 text-[12px] font-bold text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #0B5E45, #9A7727)' }}>
              Réserver un cours
            </Link>
          </div>
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
