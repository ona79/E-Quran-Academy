'use client';

import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { apiClient, ErreurApi } from '@/lib/api-client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Utilisateur, ProfilProfesseur } from '@/lib/types';

interface ProfesseurAvecProfil extends Utilisateur {
  profil: ProfilProfesseur | null;
}

type StatutFiltre = 'TOUS' | 'VALIDE' | 'EN_ATTENTE' | 'SUSPENDU';

const BADGE_STATUT: Record<string, { label: string; classe: string }> = {
  VALIDE: { label: 'Validé', classe: 'bg-emerald-100 text-emerald-800' },
  EN_ATTENTE: { label: 'En attente', classe: 'bg-amber-100 text-amber-800' },
  SUSPENDU: { label: 'Suspendu', classe: 'bg-red-100 text-red-800' },
};

function statutProfesseur(prof: ProfesseurAvecProfil): 'VALIDE' | 'EN_ATTENTE' | 'SUSPENDU' {
  if (!prof.profil) return 'EN_ATTENTE';
  if (prof.profil.valide) return 'VALIDE';
  return 'EN_ATTENTE';
}

export default function PageAdminProfesseurs() {
  const [professeurs, setProfesseurs] = useState<ProfesseurAvecProfil[]>([]);
  const [chargement, setChargement] = useState(true);
  const [actions, setActions] = useState<Record<string, 'valider' | 'rejeter' | null>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [filtreStatut, setFiltreStatut] = useState<StatutFiltre>('TOUS');

  const charger = useCallback(async (silencieux = false) => {
    if (!silencieux) setChargement(true);
    try {
      const tous = await apiClient.get<Utilisateur[]>('/utilisateurs?role=PROFESSEUR');
      // Récupérer les profils en parallèle
      const avecProfils = await Promise.all(
        tous.map(async (u) => {
          try {
            const profil = await apiClient.get<ProfilProfesseur>(`/utilisateurs/professeurs/${u.id}`);
            return { ...u, profil };
          } catch {
            return { ...u, profil: null };
          }
        })
      );
      setProfesseurs(avecProfils);
    } catch {
      // ignore
    } finally {
      if (!silencieux) setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function agir(id: string, action: 'valider' | 'rejeter') {
    setActions((p) => ({ ...p, [id]: action }));
    setMessages((p) => ({ ...p, [id]: '' }));
    try {
      await apiClient.patch(`/utilisateurs/${id}/${action}-professeur`);
      setMessages((p) => ({
        ...p,
        [id]: action === 'valider' ? '✅ Validé' : '🚫 Rejeté',
      }));
      await charger(true);
    } catch (err) {
      setMessages((p) => ({
        ...p,
        [id]: err instanceof ErreurApi ? err.message : 'Erreur',
      }));
    } finally {
      setActions((p) => ({ ...p, [id]: null }));
    }
  }

  const professeursEnAttente = professeurs.filter(
    (p) => statutProfesseur(p) === 'EN_ATTENTE'
  );

  const professeursFiltres = professeurs.filter((p) => {
    if (filtreStatut === 'TOUS') return true;
    return statutProfesseur(p) === filtreStatut;
  });

  function CarteEnAttente({ prof }: { prof: ProfesseurAvecProfil }) {
    return (
      <div
        className="rounded-2xl border-2 p-5 flex flex-wrap items-center justify-between gap-4"
        style={{ backgroundColor: '#fffbeb', borderColor: '#f59e0b' }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shrink-0 text-white"
            style={{ backgroundColor: '#d97706' }}
          >
            {prof.nomComplet.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate text-amber-900">{prof.nomComplet}</p>
            <p className="text-sm truncate text-amber-700">{prof.email}</p>
            {prof.profil && (
              <p className="text-xs mt-0.5 text-amber-600">
                {prof.profil.qiraatParDefaut} · {prof.profil.tarifHoraire} FCFA/h
              </p>
            )}
            <p className="text-xs text-amber-600 mt-0.5">
              Inscrit le {new Date(prof.creeLe).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {messages[prof.id] && (
            <span className="text-sm font-medium text-amber-800">{messages[prof.id]}</span>
          )}
          <Link
            href={`/admin/professeurs/${prof.id}`}
            className="rounded-xl px-3 py-2 text-sm font-medium border transition-colors"
            style={{ borderColor: '#d97706', color: '#92400e', backgroundColor: '#fef3c7' }}
          >
            Voir profil
          </Link>
          <button
            onClick={() => agir(prof.id, 'rejeter')}
            disabled={actions[prof.id] != null}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {actions[prof.id] === 'rejeter' ? '…' : '✗ Rejeter'}
          </button>
          <button
            onClick={() => agir(prof.id, 'valider')}
            disabled={actions[prof.id] != null}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {actions[prof.id] === 'valider' ? '…' : '✓ Valider'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <GardeRoute rolesAutorises={['ADMIN']}>
      <ShellConnecte>
        <div className="space-y-8">
          {/* En-tête */}
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--texte)' }}>
              Gestion des professeurs
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--texte-secondaire)' }}>
              {professeurs.length} professeur{professeurs.length > 1 ? 's' : ''} au total ·{' '}
              {professeursEnAttente.length} en attente de validation
            </p>
          </div>

          {/* ── Section EN ATTENTE (priorité, fond or) ── */}
          {chargement ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: '#fef3c7' }} />
              ))}
            </div>
          ) : professeursEnAttente.length === 0 ? (
            <div
              className="rounded-2xl border p-8 text-center"
              style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
            >
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-medium" style={{ color: 'var(--texte)' }}>
                Aucun professeur en attente de validation
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--texte-secondaire)' }}>
                Toutes les demandes ont été traitées.
              </p>
            </div>
          ) : (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold" style={{ color: '#92400e' }}>
                  ⏳ En attente de validation
                </h3>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white bg-red-500">
                  {professeursEnAttente.length}
                </span>
              </div>
              {professeursEnAttente.map((prof) => (
                <CarteEnAttente key={prof.id} prof={prof} />
              ))}
            </section>
          )}

          {/* ── Section TOUS LES PROFESSEURS ── */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold" style={{ color: 'var(--texte)' }}>
                Tous les professeurs
              </h3>
              {/* Filtre statut */}
              <div
                className="flex rounded-xl overflow-hidden border text-sm"
                style={{ borderColor: 'var(--bordure)' }}
              >
                {(['TOUS', 'VALIDE', 'EN_ATTENTE', 'SUSPENDU'] as StatutFiltre[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFiltreStatut(s)}
                    className="px-3 py-1.5 font-medium transition-colors"
                    style={{
                      backgroundColor: filtreStatut === s ? 'var(--primaire)' : 'var(--fond-surface)',
                      color: filtreStatut === s ? 'white' : 'var(--texte)',
                    }}
                  >
                    {s === 'TOUS' ? 'Tous' : s === 'VALIDE' ? 'Validés' : s === 'EN_ATTENTE' ? 'En attente' : 'Suspendus'}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
            >
              {chargement ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--fond)' }} />
                  ))}
                </div>
              ) : professeursFiltres.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
                    Aucun professeur dans cette catégorie.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="text-left text-xs uppercase tracking-wide"
                        style={{ backgroundColor: 'var(--fond)', color: 'var(--texte-secondaire)' }}
                      >
                        <th className="px-5 py-3 font-medium">Nom</th>
                        <th className="px-5 py-3 font-medium">Email</th>
                        <th className="px-5 py-3 font-medium">Qiraat</th>
                        <th className="px-5 py-3 font-medium">Tarif</th>
                        <th className="px-5 py-3 font-medium">Statut</th>
                        <th className="px-5 py-3 font-medium">Inscrit le</th>
                        <th className="px-5 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--bordure)' }}>
                      {professeursFiltres.map((prof) => {
                        const statut = statutProfesseur(prof);
                        const badge = BADGE_STATUT[statut];
                        return (
                          <tr
                            key={prof.id}
                            className="hover:bg-black/5 transition-colors"
                          >
                            <td className="px-5 py-3 font-medium" style={{ color: 'var(--texte)' }}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                                  style={{ backgroundColor: 'var(--primaire)' }}
                                >
                                  {prof.nomComplet.charAt(0).toUpperCase()}
                                </div>
                                {prof.nomComplet}
                              </div>
                            </td>
                            <td className="px-5 py-3" style={{ color: 'var(--texte-secondaire)' }}>
                              {prof.email}
                            </td>
                            <td className="px-5 py-3" style={{ color: 'var(--texte-secondaire)' }}>
                              {prof.profil?.qiraatParDefaut ?? '—'}
                            </td>
                            <td className="px-5 py-3" style={{ color: 'var(--texte)' }}>
                              {prof.profil ? `${prof.profil.tarifHoraire} F/h` : '—'}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classe}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap" style={{ color: 'var(--texte-secondaire)' }}>
                              {new Date(prof.creeLe).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <Link
                                href={`/admin/professeurs/${prof.id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all hover:opacity-80"
                                style={{
                                  borderColor: 'var(--primaire)',
                                  color: 'var(--primaire)',
                                  backgroundColor: 'rgba(11,94,69,0.08)',
                                }}
                              >
                                Voir le profil →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
