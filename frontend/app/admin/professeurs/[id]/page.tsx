'use client';

import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { apiClient, ErreurApi } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Utilisateur, ProfilProfesseur, Reservation } from '@/lib/types';

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

const STATUT_RESA: Record<string, { label: string; classe: string }> = {
  EN_ATTENTE: { label: 'En attente', classe: 'bg-amber-100 text-amber-800' },
  CONFIRME: { label: 'Confirmé', classe: 'bg-blue-100 text-blue-800' },
  REALISE: { label: 'Réalisé', classe: 'bg-emerald-100 text-emerald-800' },
  ANNULE: { label: 'Annulé', classe: 'bg-red-100 text-red-800' },
  ABSENT: { label: 'Absent', classe: 'bg-gray-100 text-gray-600' },
};

export default function PageDetailProfesseur({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [profil, setProfil] = useState<ProfilProfesseur | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [action, setAction] = useState<'valider' | 'rejeter' | 'suspendre' | null>(null);
  const [message, setMessage] = useState<{ type: 'succes' | 'erreur'; texte: string } | null>(null);

  useEffect(() => {
    async function charger() {
      try {
        const [liste, profC, resaC] = await Promise.allSettled([
          apiClient.get<Utilisateur[]>('/utilisateurs'),
          apiClient.get<ProfilProfesseur>(`/utilisateurs/professeurs/${id}`),
          apiClient.get<Reservation[]>(`/reservations?professeurId=${id}`),
        ]);

        if (liste.status === 'fulfilled') {
          setUtilisateur(liste.value.find((u) => u.id === id) ?? null);
        }
        if (profC.status === 'fulfilled') setProfil(profC.value);
        if (resaC.status === 'fulfilled') setReservations(resaC.value);
      } catch {
        // ignore
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [id]);

  async function agir(act: 'valider' | 'rejeter' | 'suspendre') {
    setAction(act);
    setMessage(null);
    try {
      if (act === 'suspendre') {
        await apiClient.patch(`/utilisateurs/${id}/statut`, { statut: 'SUSPENDU' });
        setMessage({ type: 'succes', texte: '🔒 Compte suspendu avec succès' });
      } else {
        await apiClient.patch(`/utilisateurs/${id}/${act}-professeur`);
        setMessage({
          type: 'succes',
          texte:
            act === 'valider'
              ? '✅ Compte validé avec succès'
              : '🚫 Compte rejeté — l\'utilisateur est repassé en étudiant',
        });
      }
    } catch (err) {
      setMessage({
        type: 'erreur',
        texte: err instanceof ErreurApi ? err.message : 'Erreur lors de l\'action',
      });
    } finally {
      setAction(null);
    }
  }

  const estValide = profil?.valide === true;

  return (
    <GardeRoute rolesAutorises={['ADMIN']}>
      <ShellConnecte>
        <div className="max-w-6xl w-full h-full flex flex-col mx-auto">
          {/* Retour + lien profil public (Fixe en haut) */}
          <div className="flex items-center justify-between flex-wrap gap-3 shrink-0 mb-4">
            <button
              onClick={() => router.back()}
              className="text-sm flex items-center gap-1 hover:underline"
              style={{ color: 'var(--primaire)' }}
            >
              ← Retour à la liste
            </button>
            {profil && (
              <Link
                href={`/professeurs/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors hover:bg-black/5"
                style={{ borderColor: 'var(--bordure)', color: 'var(--texte)' }}
              >
                Voir le profil public ↗
              </Link>
            )}
          </div>

          {/* Contenu principal défilant */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
            {chargement ? (
              <div className="space-y-4 px-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--fond-surface)' }} />
                ))}
              </div>
            ) : !utilisateur ? (
              <p className="px-6" style={{ color: 'var(--erreur)' }}>Professeur introuvable.</p>
            ) : (
              <div className="space-y-8">
                {/* Hero du profil (Style public) */}
                <div
                  className="relative overflow-hidden rounded-b-3xl sm:rounded-3xl mx-0 sm:mx-6"
                  style={{ background: 'linear-gradient(135deg, #08402F 0%, #0B5E45 100%)' }}
                >
                  <div className="px-6 py-10 relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl font-bold shrink-0 border-4 overflow-hidden"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: '#FFFFFF',
                        borderColor: 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {profil?.photoUrl ? (
                        <img src={profil.photoUrl.startsWith('/') ? `/api-backend${profil.photoUrl}` : profil.photoUrl} alt={utilisateur.nomComplet} className="w-full h-full object-cover" />
                      ) : (
                        utilisateur.nomComplet.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="text-center sm:text-left flex-1">
                      <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                        {utilisateur.nomComplet}
                      </h1>
                      <p className="text-sm opacity-90 mb-3" style={{ color: '#EFE3C2' }}>
                        {utilisateur.email}
                      </p>

                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-2">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ backgroundColor: '#EFE3C2', color: '#08402F' }}
                        >
                          PROFESSEUR
                        </span>
                        {profil && (
                          <>
                            <span
                              className="text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}
                            >
                              {profil.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}
                            </span>
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                estValide ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                              }`}
                            >
                              {estValide ? '✓ Validé' : '⏳ En attente'}
                            </span>
                          </>
                        )}
                      </div>

                      {profil && (
                        <p className="mt-4 text-lg font-bold" style={{ color: '#EFE3C2' }}>
                          {profil.tarifHoraire ? `${profil.tarifHoraire.toLocaleString('fr-FR')} FCFA` : 'Tarif non défini'}
                          <span className="text-sm font-normal opacity-75">/heure</span>
                        </p>
                      )}
                    </div>

                    {/* Actions d'administration directes dans le Hero */}
                    <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                      <button
                        onClick={() => agir('valider')}
                        disabled={action != null || estValide}
                        className="rounded-xl px-6 py-3 text-sm font-semibold text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#B8923A', color: '#FFFFFF' }}
                        onMouseEnter={(e) => { if (!estValide) e.currentTarget.style.backgroundColor = '#9c7a2c'; }}
                        onMouseLeave={(e) => { if (!estValide) e.currentTarget.style.backgroundColor = '#B8923A'; }}
                      >
                        {action === 'valider' ? 'Validation…' : '✓ Valider le profil'}
                      </button>
                      <button
                        onClick={() => agir('suspendre')}
                        disabled={action != null}
                        className="rounded-xl px-6 py-3 text-sm font-semibold text-center border transition-all disabled:opacity-50"
                        style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF', backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {action === 'suspendre' ? 'Suspension…' : '🔒 Suspendre'}
                      </button>
                      <button
                        onClick={() => agir('rejeter')}
                        disabled={action != null}
                        className="rounded-xl px-6 py-3 text-sm font-semibold text-center border border-red-500/50 text-red-200 transition-all hover:bg-red-500/10 disabled:opacity-50 mt-2"
                      >
                        {action === 'rejeter' ? 'Rejet…' : '✗ Rejeter (repasse étudiant)'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Colonne Gauche : Infos */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Message résultat */}
                    {message && (
                      <div
                        className={`rounded-xl p-4 text-sm font-medium border ${
                          message.type === 'succes'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {message.texte}
                      </div>
                    )}

                    {/* Infos compte */}
                    <div
                      className="rounded-2xl border p-6 space-y-5"
                      style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                    >
                      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--texte)' }}>
                        Informations système
                      </h3>
                      <Champ label="Langue" valeur={utilisateur.langue} />
                      <Champ label="Fuseau horaire" valeur={utilisateur.fuseauHoraire} />
                      <Champ
                        label="Inscrit le"
                        valeur={new Date(utilisateur.creeLe).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                      />
                      <Champ
                        label="Identifiant"
                        valeur={<span className="font-mono text-xs">{utilisateur.id.slice(0, 12)}…</span>}
                      />
                    </div>

                    {/* Documents */}
                    {profil && (profil.ijazaUrl || profil.audioUrl) && (
                      <div
                        className="rounded-2xl border p-6 space-y-5"
                        style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                      >
                        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--texte)' }}>
                          Documents & Médias
                        </h3>
                        {profil.ijazaUrl && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--texte-secondaire)' }}>
                              Ijaza
                            </p>
                            <a
                              href={profil.ijazaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium transition-opacity hover:opacity-70"
                              style={{ color: 'var(--primaire)' }}
                            >
                              🎓 Voir le certificat ↗
                            </a>
                          </div>
                        )}
                        {profil.audioUrl && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--texte-secondaire)' }}>
                              Récitation audio
                            </p>
                            <audio controls src={profil.audioUrl} className="w-full h-10" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Colonne Droite : Bio et Historique */}
                  <div className="lg:col-span-2 space-y-6">
                    {profil?.bio && (
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
                    )}

                    {/* Historique des cours */}
                    <div
                      className="rounded-2xl border overflow-hidden flex flex-col"
                      style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)', maxHeight: '600px' }}
                    >
                      <div className="p-5 border-b shrink-0" style={{ borderColor: 'var(--bordure)' }}>
                        <h3 className="text-base font-semibold" style={{ color: 'var(--texte)' }}>
                          Historique des cours ({reservations.length})
                        </h3>
                      </div>
                      
                      {reservations.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
                            Aucun cours enregistré pour ce professeur.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-y-auto custom-scrollbar">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--fond)' }}>
                              <tr
                                className="text-left text-xs uppercase tracking-wide border-b"
                                style={{ color: 'var(--texte-secondaire)', borderColor: 'var(--bordure)' }}
                              >
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-5 py-3 font-medium">Durée</th>
                                <th className="px-5 py-3 font-medium">Statut</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--bordure)' }}>
                              {reservations.slice(0, 50).map((r) => {
                                const badge = STATUT_RESA[r.statut] ?? { label: r.statut, classe: 'bg-gray-100 text-gray-600' };
                                const debut = new Date(r.creneauDebut);
                                const fin = new Date(r.creneauFin);
                                const dureeMin = Math.round((fin.getTime() - debut.getTime()) / 60000);
                                return (
                                  <tr key={r.id} className="hover:bg-black/5 transition-colors">
                                    <td className="px-5 py-3" style={{ color: 'var(--texte)' }}>
                                      {debut.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                    </td>
                                    <td className="px-5 py-3" style={{ color: 'var(--texte-secondaire)' }}>
                                      {dureeMin} min
                                    </td>
                                    <td className="px-5 py-3">
                                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classe}`}>
                                        {badge.label}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
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
