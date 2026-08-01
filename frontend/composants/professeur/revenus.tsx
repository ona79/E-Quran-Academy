'use client';

// Page Revenus professeur : solde disponible, tableau des cours réalisés.
import { useEffect, useState, useCallback } from 'react';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { Page, Reservation, ProfilProfesseur } from '@/lib/types';
import { formaterDateHeure } from '@/lib/fuseau-horaire';

interface EleveInfo { nomComplet: string; id: string; }
type ReservationAvecEleve = Reservation & { nomEleve?: string };

export function RevenusProfesseur() {
  const [realises, setRealises] = useState<ReservationAvecEleve[]>([]);
  const [profil, setProfil] = useState<ProfilProfesseur | null>(null);
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const paiementActif = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

  const charger = useCallback(async () => {
    try {
      const [page, p] = await Promise.all([
        apiClient.get<Page<Reservation>>('/reservations/moi-professeur?page=1&taille=100'),
        apiClient.get<ProfilProfesseur>('/utilisateurs/professeurs/moi').catch(() => null),
      ]);
      setProfil(p);
      const filtres = page.donnees.filter((r) => r.statut === 'REALISE');

      const ids = Array.from(new Set(filtres.map((r) => r.eleveId)));
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
      setRealises(filtres.map((r) => ({ ...r, nomEleve: cache[r.eleveId] })));
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'Erreur de chargement');
    } finally {
      setEnChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const tarifHoraire = profil?.tarifHoraire ?? 0;
  const totalBrut = realises.length * tarifHoraire;

  // Revenus du mois courant
  const debut = new Date(); debut.setDate(1); debut.setHours(0, 0, 0, 0);
  const revenusMois = realises
    .filter((r) => new Date(r.creneauDebut) >= debut)
    .length * tarifHoraire;

  if (enChargement) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--fond-surface)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {erreur && <p className="carte text-sm" style={{ color: 'var(--erreur)' }}>{erreur}</p>}

      <div className="carte" style={{ borderLeft: '4px solid var(--accent)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--texte-secondaire)' }}>
              Solde total disponible
            </p>
            <p className="text-4xl font-bold mt-1">
              {paiementActif ? `${totalBrut.toLocaleString('fr-FR')} FCFA` : '—'}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--texte-secondaire)' }}>
              Ce mois : {paiementActif ? `${revenusMois.toLocaleString('fr-FR')} FCFA` : '—'}
              &nbsp;·&nbsp;{realises.length} cours réalisés au total
            </p>
          </div>
          {!paiementActif && (
            <span className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
              Paiement désactivé (MVP)
            </span>
          )}
        </div>
      </div>

      {/* Tableau des cours réalisés */}
      <section>
        <h2 className="text-base font-semibold mb-3">Détail des cours réalisés</h2>
        {realises.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border" style={{ borderColor: 'var(--bordure)' }}>
            <p className="text-4xl mb-2">💰</p>
            <p style={{ color: 'var(--texte-secondaire)' }}>Aucun cours réalisé pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="carte overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--texte-secondaire)' }}>
                  <th className="text-left pb-3 pr-4">Date</th>
                  <th className="text-left pb-3 pr-4">Élève</th>
                  <th className="text-right pb-3">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--bordure)' }}>
                {realises.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: 'var(--bordure)' }}>
                    <td className="py-3 pr-4">{formaterDateHeure(r.creneauDebut)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: 'var(--accent)' }}>
                          {(r.nomEleve ?? 'E').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <span>{r.nomEleve ?? `Élève ${r.eleveId.slice(0, 8)}`}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {paiementActif
                        ? `${tarifHoraire.toLocaleString('fr-FR')} FCFA`
                        : <span style={{ color: 'var(--texte-secondaire)' }}>—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
              {paiementActif && (
                <tfoot>
                  <tr className="border-t font-bold" style={{ borderColor: 'var(--bordure)' }}>
                    <td className="pt-3" colSpan={2}>Total</td>
                    <td className="pt-3 text-right">{totalBrut.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
