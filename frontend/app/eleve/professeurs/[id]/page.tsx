'use client';

import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { useEffect, useState } from 'react';
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

  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte>
        <div className="max-w-6xl w-full h-full flex flex-col mx-auto">
          {/* Retour */}
          <div className="flex items-center justify-between flex-wrap gap-3 shrink-0 mb-4">
            <button
              onClick={() => router.back()}
              className="text-sm flex items-center gap-1 hover:underline"
              style={{ color: 'var(--primaire)' }}
            >
              ← Retour à la liste
            </button>
          </div>

          {/* Contenu principal défilant */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
            {chargement ? (
              <div className="space-y-4 px-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--fond-surface)' }} />
                ))}
              </div>
            ) : !profil ? (
              <p className="px-6" style={{ color: 'var(--erreur)' }}>Professeur introuvable.</p>
            ) : (
              <div className="space-y-8">
                {/* Hero du profil */}
                <div
                  className="relative overflow-hidden rounded-b-3xl sm:rounded-3xl mx-0 sm:mx-6 border"
                  style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                >
                  <div className="px-6 py-10 relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl font-bold shrink-0 border-4"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: '#FFFFFF',
                        borderColor: 'var(--bordure)',
                      }}
                    >
                      {profil.nomComplet.charAt(0).toUpperCase()}
                    </div>

                    <div className="text-center sm:text-left flex-1">
                      <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--texte)' }}>
                        {profil.nomComplet}
                      </h1>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-4">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}
                        >
                          {profil.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}
                        </span>
                        {profil.valide && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                            ✓ Validé
                          </span>
                        )}
                      </div>

                      <p className="mt-4 text-lg font-bold" style={{ color: 'var(--primaire)' }}>
                        {profil.tarifHoraire ? `${profil.tarifHoraire.toLocaleString('fr-FR')} FCFA` : 'Tarif non défini'}
                        <span className="text-sm font-normal" style={{ color: 'var(--texte-secondaire)' }}> / heure</span>
                      </p>
                    </div>

                    {/* Actions : Réserver */}
                    <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                      <Link
                        href={`/eleve/reserver?prof=${profil.userId}`}
                        className="btn-primaire w-full text-center"
                      >
                        Réserver un cours
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Colonne Gauche : Infos & Medias */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Infos compte */}
                    <div
                      className="rounded-2xl border p-6 space-y-5"
                      style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                    >
                      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--texte)' }}>
                        Informations
                      </h3>
                      <Champ label="Langue parlée" valeur={profil.langue ?? 'Français'} />
                      <Champ label="Genre" valeur={profil.genre === 'F' ? 'Femme' : profil.genre === 'M' ? 'Homme' : 'Non précisé'} />
                    </div>

                    {/* Documents */}
                    {(profil.ijazaUrl || profil.audioUrl) && (
                      <div
                        className="rounded-2xl border p-6 space-y-5"
                        style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                      >
                        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--texte)' }}>
                          Documents & Médias
                        </h3>
                        {profil.audioUrl && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--texte-secondaire)' }}>
                              Récitation audio
                            </p>
                            <audio controls src={profil.audioUrl} className="w-full h-10" />
                          </div>
                        )}
                        {profil.ijazaUrl && (
                          <div className={profil.audioUrl ? 'mt-4' : ''}>
                            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--texte-secondaire)' }}>
                              Ijaza
                            </p>
                            <a
                              href={profil.ijazaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium transition-opacity hover:opacity-70 flex items-center gap-1"
                              style={{ color: 'var(--primaire)' }}
                            >
                              🎓 Voir le certificat ↗
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Colonne Droite : Bio */}
                  <div className="lg:col-span-2 space-y-6">
                    {profil.bio ? (
                      <div
                        className="rounded-2xl border p-6"
                        style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                      >
                        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--texte)' }}>
                          Biographie
                        </h3>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--texte)' }}>
                          {profil.bio}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="rounded-2xl border p-6 text-center"
                        style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                      >
                        <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
                          Aucune biographie renseignée.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
