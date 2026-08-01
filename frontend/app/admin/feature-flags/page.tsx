'use client';

import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { apiClient, ErreurApi } from '@/lib/api-client';
import { useEffect, useState, useCallback } from 'react';
import type { FeatureFlag } from '@/lib/types';

interface Page<T> { donnees: T[]; total: number; page: number; taille: number; }

const CLE_PAIEMENTS = 'PAYMENTS_ENABLED';

export default function PageAdminFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});

  // Formulaire de création
  const [nouvelleCle, setNouvelleCle] = useState('');
  const [nouvelleDesc, setNouvelleDesc] = useState('');
  const [creation, setCreation] = useState(false);
  const [erreurCreation, setErreurCreation] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const data = await apiClient.get<Page<FeatureFlag>>('/feature-flags?taille=100');
      // Trier : PAYMENTS_ENABLED en premier, puis alphabétiquement
      const tries = [...data.donnees].sort((a, b) => {
        if (a.cle === CLE_PAIEMENTS) return -1;
        if (b.cle === CLE_PAIEMENTS) return 1;
        return a.cle.localeCompare(b.cle);
      });
      setFlags(tries);
    } catch {
      // ignore
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function basculer(flag: FeatureFlag) {
    setEnCours((p) => ({ ...p, [flag.cle]: true }));
    setMessages((p) => ({ ...p, [flag.cle]: '' }));
    
    // Mise à jour optimiste pour éviter le rechargement global (qui déforme la page)
    setFlags((prev) => prev.map((f) => f.cle === flag.cle ? { ...f, actif: !flag.actif } : f));

    try {
      await apiClient.patch(`/feature-flags/${flag.cle}`, { actif: !flag.actif });
      setMessages((p) => ({ ...p, [flag.cle]: !flag.actif ? '✅ Activé' : '⏸ Désactivé' }));
    } catch (err) {
      // Annuler en cas d'erreur
      setFlags((prev) => prev.map((f) => f.cle === flag.cle ? { ...f, actif: flag.actif } : f));
      setMessages((p) => ({
        ...p,
        [flag.cle]: err instanceof ErreurApi ? err.message : 'Erreur',
      }));
    } finally {
      setEnCours((p) => ({ ...p, [flag.cle]: false }));
    }
  }

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    if (!nouvelleCle.trim()) return;
    setCreation(true);
    setErreurCreation(null);
    try {
      await apiClient.post('/feature-flags', {
        cle: nouvelleCle.trim(),
        description: nouvelleDesc.trim() || undefined,
        actif: false,
      });
      setNouvelleCle('');
      setNouvelleDesc('');
      await charger();
    } catch (err) {
      setErreurCreation(err instanceof ErreurApi ? err.message : 'Erreur lors de la création');
    } finally {
      setCreation(false);
    }
  }

  const flagPaiements = flags.find((f) => f.cle === CLE_PAIEMENTS);
  const autresFlags = flags.filter((f) => f.cle !== CLE_PAIEMENTS);

  return (
    <GardeRoute rolesAutorises={['ADMIN']}>
      <ShellConnecte>
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--texte)' }}>
              Feature Flags
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--texte-secondaire)' }}>
              Activez ou désactivez des fonctionnalités sans redéploiement.
            </p>
          </div>

          {/* ── PAYMENTS_ENABLED — FLAG CRITIQUE MIS EN AVANT ── */}
          {chargement ? (
            <div className="h-28 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--fond-surface)' }} />
          ) : flagPaiements ? (
            <div
              className="rounded-2xl border-2 p-6"
              style={{
                borderColor: flagPaiements.actif ? '#059669' : '#d97706',
                backgroundColor: flagPaiements.actif ? '#f0fdf4' : '#fffbeb',
              }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">💳</span>
                    <p
                      className="font-mono text-base font-bold"
                      style={{ color: flagPaiements.actif ? '#065f46' : '#92400e' }}
                    >
                      {CLE_PAIEMENTS}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        flagPaiements.actif
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {flagPaiements.actif ? 'ACTIF' : 'INACTIF'}
                    </span>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: flagPaiements.actif ? '#065f46' : '#92400e' }}
                  >
                    Active/désactive le système de paiement complet
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: flagPaiements.actif ? '#047857' : '#b45309' }}
                  >
                    {flagPaiements.actif
                      ? '⚠️ Le système de paiement est actuellement actif. Les transactions réelles sont déclenchées.'
                      : 'ℹ️ Le paiement est désactivé. Les flux Stripe et CinetPay ne se déclenchent pas.'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {messages[CLE_PAIEMENTS] && (
                    <span className="text-xs font-medium" style={{ color: 'var(--texte-secondaire)' }}>
                      {messages[CLE_PAIEMENTS]}
                    </span>
                  )}
                  <button
                    onClick={() => basculer(flagPaiements)}
                    disabled={enCours[CLE_PAIEMENTS]}
                    aria-label={flagPaiements.actif ? 'Désactiver les paiements' : 'Activer les paiements'}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 ${
                      flagPaiements.actif ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        flagPaiements.actif ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Créer un flag */}
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--texte)' }}>
              Nouveau flag
            </h3>
            {erreurCreation && (
              <p className="text-xs mb-3 text-red-600">{erreurCreation}</p>
            )}
            <form onSubmit={creer} className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Clé (ex: FEATURE_X)"
                value={nouvelleCle}
                onChange={(e) => setNouvelleCle(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 min-w-40"
                style={{ backgroundColor: 'var(--fond)', borderColor: 'var(--bordure)', color: 'var(--texte)' }}
                required
              />
              <input
                type="text"
                placeholder="Description (optionnel)"
                value={nouvelleDesc}
                onChange={(e) => setNouvelleDesc(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 min-w-48"
                style={{ backgroundColor: 'var(--fond)', borderColor: 'var(--bordure)', color: 'var(--texte)' }}
              />
              <button
                type="submit"
                disabled={creation}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--primaire)' }}
              >
                {creation ? '…' : 'Créer'}
              </button>
            </form>
          </div>

          {/* Liste des autres flags */}
          {autresFlags.length > 0 && (
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
            >
              {chargement ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--fond)' }} />
                  ))}
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--bordure)' }}>
                  {autresFlags.map((flag) => (
                    <div key={flag.cle} className="flex items-center justify-between px-6 py-4 gap-4">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-medium" style={{ color: 'var(--texte)' }}>
                          {flag.cle}
                        </p>
                        {flag.description && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--texte-secondaire)' }}>
                            {flag.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {messages[flag.cle] && (
                          <span className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
                            {messages[flag.cle]}
                          </span>
                        )}
                        {/* Toggle switch */}
                        <button
                          onClick={() => basculer(flag)}
                          disabled={enCours[flag.cle]}
                          aria-label={flag.actif ? 'Désactiver' : 'Activer'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 ${
                            flag.actif ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              flag.actif ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${
                            flag.actif ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {flag.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!chargement && flags.length === 0 && (
            <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}>
              <p className="text-4xl mb-3">🚩</p>
              <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
                Aucun feature flag pour le moment.
              </p>
            </div>
          )}
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
