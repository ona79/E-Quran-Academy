'use client';

import { useState, useEffect, useCallback } from 'react';
import { ErreurApi } from '@/lib/api-client';
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';

interface LigneTransactions {
  id: string;
  eleveId: string;
  montant: number;
  statutEscrow: 'BLOQUE' | 'LIBERE' | 'REMBOURSE';
  methode: string;
  creeLe: string;
  reservation?: {
    creneauDebut: string;
    creneauFin: string;
    professeurId: string;
  };
}

async function apiGet<T>(chemin: string): Promise<T> {
  const r = await fetch(`/api-backend${chemin}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!r.ok) throw new ErreurApi(`Erreur ${r.status}`, r.status);
  return r.json();
}

async function apiPost<T>(chemin: string, corps: unknown): Promise<T> {
  const r = await fetch(`/api-backend${chemin}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(corps),
  });
  if (!r.ok) {
    const details = await r.json().catch(() => ({}));
    const msg = (details as { message?: string })?.message ?? `Erreur ${r.status}`;
    throw new ErreurApi(msg, r.status, details);
  }
  return r.json();
}

const COULEUR_STATUT: Record<string, string> = {
  BLOQUE: 'bg-amber-100 text-amber-800',
  LIBERE: 'bg-emerald-100 text-emerald-800',
  REMBOURSE: 'bg-sky-100 text-sky-800',
};

const LABEL_STATUT: Record<string, string> = {
  BLOQUE: 'Séquestré',
  LIBERE: 'Libéré',
  REMBOURSE: 'Remboursé',
};

const STATS_VIDES = { total: 0, libere: 0, rembourse: 0 };

function calculerStats(transactions: LigneTransactions[]) {
  return transactions.reduce((acc, tx) => {
    acc.total += tx.montant;
    if (tx.statutEscrow === 'LIBERE') acc.libere += tx.montant;
    if (tx.statutEscrow === 'REMBOURSE') acc.rembourse += tx.montant;
    return acc;
  }, { ...STATS_VIDES });
}

export default function PageAdminPaiements() {
  const [transactions, setTransactions] = useState<LigneTransactions[]>([]);
  const [chargement, setChargement] = useState(true);
  const [emailCredit, setEmailCredit] = useState('');
  const [montantCredit, setMontantCredit] = useState('');
  const [creditEnCours, setCreditEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: 'succes' | 'erreur'; texte: string } | null>(null);
  const [filtre, setFiltre] = useState<'TOUS' | 'BLOQUE' | 'LIBERE' | 'REMBOURSE'>('TOUS');

  const charger = useCallback(async (silencieux = false) => {
    if (!silencieux) setChargement(true);
    try {
      const data = await apiGet<LigneTransactions[]>('/paiement/historique');
      setTransactions(data);
    } catch {
      setMessage({ type: 'erreur', texte: 'Impossible de charger les transactions.' });
    } finally {
      if (!silencieux) setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function crediterCompte(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(montantCredit, 10);
    if (!emailCredit || !val || val <= 0) {
      setMessage({ type: 'erreur', texte: 'Veuillez remplir tous les champs.' });
      return;
    }
    setCreditEnCours(true);
    setMessage(null);
    try {
      const res = await apiPost<{ solde: number }>('/paiement/admin/crediter', {
        email: emailCredit,
        montant: val,
      });
      setMessage({
        type: 'succes',
        texte: `Compte crédité. Nouveau solde : ${res.solde.toLocaleString('fr-FR')} FCFA`,
      });
      setEmailCredit('');
      setMontantCredit('');
      await charger(true);
    } catch (err) {
      setMessage({
        type: 'erreur',
        texte: err instanceof ErreurApi ? err.message : 'Erreur lors du crédit.',
      });
    } finally {
      setCreditEnCours(false);
    }
  }

  const stats = calculerStats(transactions);
  const transactionsFiltrees = filtre === 'TOUS'
    ? transactions
    : transactions.filter((tx) => tx.statutEscrow === filtre);

  return (
    <GardeRoute rolesAutorises={['ADMIN']}>
      <ShellConnecte>
        <div className="space-y-8">
          {/* En-tête */}
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--texte)' }}>
              Gestion des Paiements
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--texte-secondaire)' }}>
              Vue globale des transactions et créditement manuel des comptes.
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Volume total', valeur: stats.total, couleur: 'var(--primaire)' },
              { label: 'Fonds libérés', valeur: stats.libere, couleur: '#059669' },
              { label: 'Remboursements', valeur: stats.rembourse, couleur: '#0284c7' },
            ].map(({ label, valeur, couleur }) => (
              <div
                key={label}
                className="rounded-2xl p-5 shadow-sm border"
                style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
              >
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--texte-secondaire)' }}>
                  {label}
                </p>
                {chargement ? (
                  <div className="h-8 w-32 mt-2 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bordure)' }} />
                ) : (
                  <p className="text-2xl font-extrabold mt-1" style={{ color: couleur }}>
                    {valeur.toLocaleString('fr-FR')} FCFA
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Créditement manuel */}
          <div
            className="rounded-2xl p-6 shadow-sm border"
            style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--texte)' }}>
              Créditer manuellement un compte
            </h2>

            {message && (
              <div
                className={`mb-4 rounded-xl p-3 text-sm border ${
                  message.type === 'succes'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {message.texte}
              </div>
            )}

            <form onSubmit={crediterCompte} className="flex flex-col sm:flex-row gap-3">
              <input
                id="email-credit"
                type="email"
                placeholder="Email de l'élève"
                value={emailCredit}
                onChange={(e) => setEmailCredit(e.target.value)}
                className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--fond)', borderColor: 'var(--bordure)', color: 'var(--texte)' }}
                required
              />
              <input
                id="montant-credit"
                type="number"
                min="100"
                step="100"
                placeholder="Montant FCFA"
                value={montantCredit}
                onChange={(e) => setMontantCredit(e.target.value)}
                className="w-40 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--fond)', borderColor: 'var(--bordure)', color: 'var(--texte)' }}
                required
              />
              <button
                type="submit"
                disabled={creditEnCours}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 text-white"
                style={{ backgroundColor: 'var(--primaire)' }}
              >
                {creditEnCours ? 'En cours…' : 'Créditer'}
              </button>
            </form>
          </div>

          {/* Tableau des transactions */}
          <div
            className="rounded-2xl shadow-sm border overflow-hidden"
            style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
          >
            {/* Barre filtres */}
            <div className="px-6 py-4 border-b flex flex-wrap items-center gap-2" style={{ borderColor: 'var(--bordure)' }}>
              <h2 className="text-lg font-semibold mr-auto" style={{ color: 'var(--texte)' }}>
                Toutes les transactions ({transactionsFiltrees.length})
              </h2>
              {(['TOUS', 'BLOQUE', 'LIBERE', 'REMBOURSE'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltre(f)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filtre === f
                      ? 'text-white'
                      : 'opacity-60 hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: filtre === f ? 'var(--primaire)' : 'var(--bordure)',
                    color: filtre === f ? 'white' : 'var(--texte)',
                  }}
                >
                  {f === 'TOUS' ? 'Tous' : LABEL_STATUT[f]}
                </button>
              ))}
            </div>

            {chargement ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--fond)' }} />
                ))}
              </div>
            ) : transactionsFiltrees.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>Aucune transaction.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className="text-left text-xs uppercase tracking-wide"
                      style={{ backgroundColor: 'var(--fond)', color: 'var(--texte-secondaire)' }}
                    >
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Élève</th>
                      <th className="px-6 py-3 font-medium">Cours</th>
                      <th className="px-6 py-3 font-medium">Méthode</th>
                      <th className="px-6 py-3 font-medium">Statut</th>
                      <th className="px-6 py-3 font-medium text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--bordure)' }}>
                    {transactionsFiltrees.map((tx) => (
                      <tr key={tx.id} className="hover:bg-black/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'var(--texte-secondaire)' }}>
                          {new Date(tx.creeLe).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs" style={{ color: 'var(--texte)' }}>
                          {tx.eleveId.slice(0, 8)}…
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--texte-secondaire)' }}>
                          {tx.reservation
                            ? new Date(tx.reservation.creneauDebut).toLocaleString('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '—'}
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--texte)' }}>
                          {tx.methode}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${COULEUR_STATUT[tx.statutEscrow] ?? ''}`}
                          >
                            {LABEL_STATUT[tx.statutEscrow] ?? tx.statutEscrow}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold" style={{ color: 'var(--primaire)' }}>
                          {tx.montant.toLocaleString('fr-FR')} FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
