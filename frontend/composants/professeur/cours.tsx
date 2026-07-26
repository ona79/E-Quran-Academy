'use client';

// Gestion des cours professeur : onglets À venir / Passés.
// Passés → bouton "Remplir le suivi pédagogique" → /professeur/suivi/[seanceId].
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { Page, Reservation } from '@/lib/types';
import { BadgeStatut } from '@/composants/ui/badge-statut';
import { formaterDateHeure } from '@/lib/fuseau-horaire';

interface EleveInfo { nomComplet: string; id: string; }
type ReservationAvecEleve = Reservation & { nomEleve?: string };

type Onglet = 'A_VENIR' | 'PASSES';

function peutDemarrer(creneauDebut: string): boolean {
  const now = Date.now();
  const debut = new Date(creneauDebut).getTime();
  return debut - now <= 15 * 60 * 1000 && debut > now - 2 * 60 * 60 * 1000;
}

export function CoursProfesseur() {
  const [reservations, setReservations] = useState<ReservationAvecEleve[]>([]);
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<Onglet>('A_VENIR');

  const charger = useCallback(async () => {
    setEnChargement(true);
    try {
      const page = await apiClient.get<Page<Reservation>>('/reservations/moi-professeur?page=1&taille=100');
      const ids = Array.from(new Set(page.donnees.map((r) => r.eleveId)));
      const cache: Record<string, string> = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const e = await apiClient.get<EleveInfo>(`/utilisateurs/${id}`);
            cache[id] = e.nomComplet;
          } catch {
            cache[id] = `Élève ${id.slice(0, 8)}`;
          }
        })
      );
      setReservations(page.donnees.map((r) => ({ ...r, nomEleve: cache[r.eleveId] })));
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'Erreur de chargement');
    } finally {
      setEnChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const aVenir = reservations
    .filter((r) => r.statut === 'CONFIRME' || r.statut === 'EN_ATTENTE')
    .sort((a, b) => new Date(a.creneauDebut).getTime() - new Date(b.creneauDebut).getTime());

  const passes = reservations
    .filter((r) => r.statut === 'REALISE' || r.statut === 'ABSENT' || r.statut === 'ANNULE')
    .sort((a, b) => new Date(b.creneauDebut).getTime() - new Date(a.creneauDebut).getTime());

  const listeAffichee = onglet === 'A_VENIR' ? aVenir : passes;

  if (enChargement) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--fond-surface)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {erreur && <p className="carte text-sm" style={{ color: 'var(--erreur)' }}>{erreur}</p>}

      {/* Onglets */}
      <div className="flex border-b" style={{ borderColor: 'var(--bordure)' }}>
        {[
          { key: 'A_VENIR', libelle: 'À venir', count: aVenir.length },
          { key: 'PASSES', libelle: 'Passés', count: passes.length },
        ].map((o) => (
          <button
            key={o.key}
            onClick={() => setOnglet(o.key as Onglet)}
            className="flex-1 py-3 text-sm font-semibold border-b-2 transition-all"
            style={{
              borderColor: onglet === o.key ? 'var(--couleur-primaire)' : 'transparent',
              color: onglet === o.key ? 'var(--couleur-primaire)' : 'var(--texte-secondaire)',
            }}
          >
            {o.libelle} ({o.count})
          </button>
        ))}
      </div>

      {listeAffichee.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border" style={{ borderColor: 'var(--bordure)' }}>
          <p className="text-4xl mb-2">🎓</p>
          <p style={{ color: 'var(--texte-secondaire)' }}>Aucun cours dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listeAffichee.map((r) => {
            const demarrable = r.statut === 'CONFIRME' && peutDemarrer(r.creneauDebut);
            return (
              <div key={r.id} className="carte flex items-center justify-between gap-4"
                style={{ borderLeft: '3px solid var(--couleur-primaire)' }}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: 'var(--couleur-or-clair)', color: 'var(--couleur-primaire-profond)' }}>
                    {(r.nomEleve ?? 'E').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{r.nomEleve ?? `Élève ${r.eleveId.slice(0, 8)}`}</p>
                    <p className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
                      {formaterDateHeure(r.creneauDebut)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <BadgeStatut statut={r.statut} />
                  {onglet === 'A_VENIR' && r.statut === 'CONFIRME' && (
                    demarrable ? (
                      <Link href={`/professeur/classe/${r.id}`} className="btn-primaire text-xs !py-1.5 !px-3">
                        🎥 Démarrer
                      </Link>
                    ) : (
                      <button disabled className="btn-primaire text-xs !py-1.5 !px-3 opacity-40 cursor-not-allowed"
                        title="Disponible 15 min avant">
                        🎥 Démarrer
                      </button>
                    )
                  )}
                  {onglet === 'PASSES' && r.statut === 'REALISE' && (
                    <Link
                      href={`/professeur/suivi/${r.id}`}
                      className="btn-secondaire text-xs !py-1.5 !px-3"
                      style={{ borderColor: 'var(--couleur-or)', color: 'var(--couleur-or)' }}
                    >
                      📝 Suivi pédagogique
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
