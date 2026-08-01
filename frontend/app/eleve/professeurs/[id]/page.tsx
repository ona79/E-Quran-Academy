'use client';

import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProfilComplet {
  id: string;
  userId: string;
  nomComplet: string;
  bio?: string | null;
  ijazaUrl?: string | null;
  audioUrl?: string | null;
  tarifHoraire: number;
  qiraatParDefaut: 'HAFS' | 'WARSH';
  reservationInstantanee: boolean;
  valide: boolean;
  langue?: string;
  genre?: string | null;
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
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-3">
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
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm transition-transform hover:scale-105"
          style={{ backgroundColor: 'var(--primaire)' }}
        >
          {enLecture ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        {/* Barre de progression */}
        <div className="flex-1 relative h-1.5 bg-gray-200 rounded-full cursor-pointer" onClick={clicProgression}>
          <div className="absolute top-0 left-0 h-full rounded-full transition-all" style={{ width: `${progression}%`, backgroundColor: 'var(--primaire)' }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 shadow"
            style={{ left: `calc(${progression}% - 6px)`, borderColor: 'var(--primaire)' }}
          />
        </div>
        
        {/* Temps */}
        <span className="text-xs font-medium text-gray-500 shrink-0">
          {formaterTemps(tempsActuel)}
        </span>
      </div>
    </div>
  );
}

function Champ({ label, valeur }: { label: string; valeur: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--texte-secondaire)' }}>
        {label}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--texte)' }}>{valeur || '—'}</p>
    </div>
  );
}

export default function PageProfilProfesseurEleve() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profil, setProfil] = useState<ProfilComplet | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function charger() {
      try {
        const res = await fetch(`/api-backend/utilisateurs/professeurs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProfil(data);
        }
      } catch {
        // ignore
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [id]);

  // Simulation d'une liste d'avis vide (pour l'instant, l'API ne renvoie pas d'avis)
  const avis: any[] = [];

  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte sansPadding>
        <div 
          className="w-full min-h-full relative flex flex-col"
          style={{
            backgroundImage: 'url(/mascotte/image_fond_avant_footer.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundColor: '#FAFAFA',
            backgroundBlendMode: 'overlay'
          }}
        >
          {/* Contenu principal défilant naturellement */}
          <div className="flex-1 pb-10">
            <div className="max-w-6xl mx-auto w-full pt-6 px-4 sm:px-6">
              
              {/* Plus de bouton retour ici, on utilise l'espace complet */}

              {chargement ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl animate-pulse bg-white border" />
                  ))}
                </div>
              ) : !profil ? (
                <p className="bg-white p-6 rounded-xl border" style={{ color: 'var(--erreur)' }}>Professeur introuvable.</p>
              ) : (
                <div className="space-y-6">
                  {/* Hero du profil */}
                  <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      
                      <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
                        {/* Avatar */}
                        <div
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold shrink-0 border border-gray-100 shadow-sm"
                          style={{ backgroundColor: '#E5E7EB', color: '#4B5563' }}
                        >
                          {profil.nomComplet.charAt(0).toUpperCase()}
                        </div>

                        {/* Nom et Badges (Mobile) */}
                        <div className="flex-1 sm:hidden">
                          <h1 className="text-xl font-bold mb-1 leading-tight" style={{ color: 'var(--texte)' }}>
                            {profil.nomComplet}
                          </h1>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                              {profil.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}
                            </span>
                            {profil.valide && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                                ✓ Validé
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:block flex-1 text-left">
                        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--texte)' }}>
                          {profil.nomComplet}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                            {profil.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}
                          </span>
                          {profil.valide && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                              ✓ Validé
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-base font-bold" style={{ color: 'var(--primaire)' }}>
                          {profil.tarifHoraire ? `${profil.tarifHoraire.toLocaleString('fr-FR')} FCFA` : 'Tarif non défini'}
                          <span className="text-xs font-normal" style={{ color: 'var(--texte-secondaire)' }}> / heure</span>
                        </p>
                      </div>

                      {/* Actions : Réserver */}
                      <div className="shrink-0 w-full sm:w-auto flex items-center justify-between sm:block border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                        <div className="sm:hidden">
                          <p className="text-base font-bold" style={{ color: 'var(--primaire)' }}>
                            {profil.tarifHoraire ? `${profil.tarifHoraire.toLocaleString('fr-FR')} FCFA` : 'N/A'}
                            <span className="text-[10px] font-normal" style={{ color: 'var(--texte-secondaire)' }}> / h</span>
                          </p>
                        </div>
                        <Link
                          href={`/eleve/reserver?prof=${profil.userId}`}
                          className="btn-primaire text-center px-6 py-2.5 rounded-xl shadow-sm font-semibold text-sm w-auto"
                        >
                          Réserver
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Bloc fusionné : Infos + Bio + Audio */}
                  <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-5">
                    
                    {/* Colonne Informations (gauche) */}
                    <div className="sm:w-1/3 flex flex-col gap-4">
                      <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--texte-secondaire)' }}>
                          Informations
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
                          <Champ label="Langue" valeur={profil.langue ?? 'Français'} />
                          <Champ label="Genre" valeur={profil.genre === 'F' ? 'Femme' : profil.genre === 'M' ? 'Homme' : 'Non précisé'} />
                        </div>
                      </div>
                    </div>

                    {/* Séparateur */}
                    <div className="hidden sm:block w-px bg-gray-100 shrink-0" />
                    <div className="block sm:hidden h-px w-full bg-gray-100" />

                    {/* Colonne Biographie & Audio (droite) */}
                    <div className="sm:w-2/3 flex flex-col gap-5">
                      <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--texte-secondaire)' }}>
                          Biographie
                        </h3>
                        {profil.bio ? (
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--texte)' }}>
                            {profil.bio}
                          </p>
                        ) : (
                          <p className="text-[13px] italic" style={{ color: 'var(--texte-secondaire)' }}>
                            Aucune biographie renseignée.
                          </p>
                        )}
                      </div>

                      {profil.audioUrl && (
                        <div>
                          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--texte-secondaire)' }}>
                            Récitation audio
                          </h3>
                          <LecteurAudio src={profil.audioUrl} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Avis des élèves */}
                  <div className="rounded-2xl border bg-white p-4 shadow-sm mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--texte)' }}>
                      Avis des élèves
                    </h3>
                    
                    {avis.length === 0 ? (
                      <p className="text-sm italic" style={{ color: 'var(--texte-secondaire)' }}>
                        Aucun avis pour ce professeur pour le moment.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {avis.map((a, i) => (
                          <div key={i} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                              {a.nom.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-bold text-sm">{a.nom}</p>
                                <span className="text-[10px] text-gray-400">{a.date}</span>
                              </div>
                              <div className="flex text-yellow-400 text-xs mb-2">★★★★★</div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {a.commentaire}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
