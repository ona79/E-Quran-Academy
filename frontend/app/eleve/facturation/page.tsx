'use client';

import { useState, useEffect, useCallback } from 'react';
import { ErreurApi } from '@/lib/api-client';
import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';

interface Transaction {
  id: string;
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
  BLOQUE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  LIBERE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  REMBOURSE: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
};

const LABEL_STATUT: Record<string, string> = {
  BLOQUE: 'Séquestré',
  LIBERE: 'Libéré',
  REMBOURSE: 'Remboursé',
};

export default function PageFacturationEleve() {
  const [solde, setSolde] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [montant, setMontant] = useState('');
  const [chargement, setChargement] = useState(true);
  const [rechargeEnCours, setRechargeEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  const charger = useCallback(async (silencieux = false) => {
    if (!silencieux) setChargement(true);
    try {
      const [soldData, txData] = await Promise.all([
        apiGet<{ solde: number }>('/paiement/solde'),
        apiGet<Transaction[]>('/paiement/historique'),
      ]);
      setSolde(soldData.solde);
      setTransactions(txData);
    } catch {
      setErreur('Impossible de charger vos données de facturation.');
    } finally {
      if (!silencieux) setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function simulerRecharge(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(montant, 10);
    if (!val || val <= 0) {
      setErreur('Montant invalide.');
      return;
    }
    setRechargeEnCours(true);
    setErreur(null);
    setSucces(null);
    try {
      const res = await apiPost<{ solde: number }>('/paiement/recharge-simulee', { montant: val });
      setSolde(res.solde);
      setMontant('');
      setSucces(`Solde rechargé avec succès ! Nouveau solde : ${res.solde.toLocaleString('fr-FR')} FCFA`);
      await charger(true);
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Erreur lors de la recharge.');
    } finally {
      setRechargeEnCours(false);
    }
  }

  return (
    <GardeRoute rolesAutorises={['ELEVE']}>
      <ShellConnecte>
        <div className="space-y-8">
          {/* En-tête */}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--texte)' }}>
              Facturation & Portefeuille
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--texte-secondaire)' }}>
              Gérez votre solde et consultez l'historique de vos paiements.
            </p>
          </div>

          {/* Solde */}
          <div
            className="rounded-2xl p-8 flex items-center justify-between shadow-md"
            style={{ background: 'linear-gradient(135deg, var(--primaire) 0%, #0a4a36 100%)' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>Solde disponible</p>
              {chargement ? (
                <div className="h-10 w-40 mt-1 rounded-lg animate-pulse bg-white/20" />
              ) : (
                <p className="text-4xl font-extrabold text-white mt-1">
                  {solde !== null ? solde.toLocaleString('fr-FR') : '—'}{' '}
                  <span className="text-xl font-semibold opacity-80">FCFA</span>
                </p>
              )}
            </div>
            <div className="text-6xl select-none opacity-20">🏦</div>
          </div>

          {/* Recharge simulée */}
          <div
            className="rounded-2xl p-6 shadow-sm border"
            style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--texte)' }}>
              Recharger mon solde <span className="text-xs font-normal opacity-60">(simulation dev)</span>
            </h2>

            {erreur && (
              <div className="mb-4 rounded-xl p-3 text-sm bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300">
                {erreur}
              </div>
            )}
            {succes && (
              <div className="mb-4 rounded-xl p-3 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300">
                {succes}
              </div>
            )}

            <form onSubmit={simulerRecharge} className="flex gap-3">
              <input
                id="montant-recharge"
                type="number"
                min="100"
                step="100"
                placeholder="Ex : 5000"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--fond)',
                  borderColor: 'var(--bordure)',
                  color: 'var(--texte)',
                }}
                required
              />
              <span className="flex items-center text-sm font-medium" style={{ color: 'var(--texte-secondaire)' }}>FCFA</span>
              <button
                type="submit"
                disabled={rechargeEnCours}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              >
                {rechargeEnCours ? 'Chargement…' : 'Recharger'}
              </button>
            </form>
          </div>

          {/* Historique des transactions */}
          <div
            className="rounded-2xl shadow-sm border overflow-hidden"
            style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--bordure)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--texte)' }}>Historique des transactions</h2>
            </div>

            {chargement ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--fond)' }} />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">📄</p>
                <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>Aucune transaction pour le moment.</p>
              </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--bordure)' }}>
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--texte)' }}>
                      Cours du{' '}
                      {tx.reservation
                        ? new Date(tx.reservation.creneauDebut).toLocaleString('fr-FR', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--texte-secondaire)' }}>
                      {new Date(tx.creeLe).toLocaleDateString('fr-FR')} · {tx.methode}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${COULEUR_STATUT[tx.statutEscrow] ?? ''}`}
                    >
                      {LABEL_STATUT[tx.statutEscrow] ?? tx.statutEscrow}
                    </span>
                    <span className="text-base font-bold" style={{ color: 'var(--primaire)' }}>
                      {tx.montant.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
