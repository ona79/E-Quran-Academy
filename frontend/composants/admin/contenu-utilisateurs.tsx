'use client';

// Contenu de la page utilisateurs (séparé pour la boundary Suspense).
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { Utilisateur, Role } from '@/lib/types';

const ROLES: Array<{ valeur: string; libelle: string }> = [
  { valeur: '', libelle: 'Tous' },
  { valeur: 'ELEVE', libelle: 'Étudiants' },
  { valeur: 'PROFESSEUR', libelle: 'Professeurs' },
  { valeur: 'ADMIN', libelle: 'Admins' },
];

const COULEUR_ROLE: Record<string, string> = {
  ELEVE: 'bg-emerald-100 text-emerald-800',
  PROFESSEUR: 'bg-amber-100 text-amber-800',
  ADMIN: 'bg-purple-100 text-purple-800',
};

const ROLES_SELECTABLE: Role[] = ['ELEVE', 'PROFESSEUR', 'ADMIN'];

interface ActionEnCours {
  id: string;
  type: 'role' | 'suspendre';
}

export function ContenuUtilisateurs() {
  const searchParams = useSearchParams();
  const [roleFiltre, setRoleFiltre] = useState(searchParams.get('role') ?? '');
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [actionEnCours, setActionEnCours] = useState<ActionEnCours | null>(null);
  const [messages, setMessages] = useState<Record<string, { type: 'succes' | 'erreur'; texte: string }>>({});
  const [menuOuvert, setMenuOuvert] = useState<string | null>(null);

  const charger = useCallback(async (silencieux = false) => {
    if (!silencieux) setChargement(true);
    try {
      const url = roleFiltre ? `/utilisateurs?role=${roleFiltre}` : '/utilisateurs';
      const data = await apiClient.get<Utilisateur[]>(url);
      setUtilisateurs(data);
    } catch {
      /* ignore */
    } finally {
      if (!silencieux) setChargement(false);
    }
  }, [roleFiltre]);

  useEffect(() => { charger(); }, [charger]);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    function gerer() { setMenuOuvert(null); }
    document.addEventListener('click', gerer);
    return () => document.removeEventListener('click', gerer);
  }, []);

  async function changerRole(id: string, nouveauRole: Role) {
    setActionEnCours({ id, type: 'role' });
    setMenuOuvert(null);
    try {
      await apiClient.patch(`/utilisateurs/${id}/role`, { role: nouveauRole });
      setMessages((p) => ({ ...p, [id]: { type: 'succes', texte: `✅ Rôle changé → ${nouveauRole}` } }));
      await charger(true);
    } catch (err) {
      setMessages((p) => ({
        ...p,
        [id]: { type: 'erreur', texte: err instanceof ErreurApi ? err.message : 'Erreur' },
      }));
    } finally {
      setActionEnCours(null);
    }
  }

  async function suspendre(id: string) {
    setActionEnCours({ id, type: 'suspendre' });
    setMenuOuvert(null);
    try {
      await apiClient.patch(`/utilisateurs/${id}/statut`, { statut: 'SUSPENDU' });
      setMessages((p) => ({ ...p, [id]: { type: 'succes', texte: '🔒 Compte suspendu' } }));
      await charger(true);
    } catch (err) {
      setMessages((p) => ({
        ...p,
        [id]: { type: 'erreur', texte: err instanceof ErreurApi ? err.message : 'Erreur' },
      }));
    } finally {
      setActionEnCours(null);
    }
  }

  const filtres = utilisateurs.filter((u) => {
    if (!recherche) return true;
    const q = recherche.toLowerCase();
    return u.nomComplet.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--texte)' }}>
          Utilisateurs
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--texte-secondaire)' }}>
          {utilisateurs.length} compte{utilisateurs.length > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex rounded-xl overflow-hidden border"
          style={{ borderColor: 'var(--bordure)' }}
        >
          {ROLES.map((r) => (
            <button
              key={r.valeur}
              onClick={() => setRoleFiltre(r.valeur)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: roleFiltre === r.valeur ? 'var(--primaire)' : 'var(--fond-surface)',
                color: roleFiltre === r.valeur ? 'white' : 'var(--texte)',
              }}
            >
              {r.libelle}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Rechercher par nom ou email…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="flex-1 min-w-48 rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 champ"
        />
      </div>

      {/* Tableau */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
      >
        {chargement ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-xl animate-pulse"
                style={{ backgroundColor: 'var(--fond)' }}
              />
            ))}
          </div>
        ) : filtres.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
              Aucun utilisateur trouvé.
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
                  <th className="px-5 py-3 font-medium">Rôle</th>
                  <th className="px-5 py-3 font-medium">Langue</th>
                  <th className="px-5 py-3 font-medium">Inscrit le</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--bordure)' }}>
                {filtres.map((u) => {
                  const enCours = actionEnCours?.id === u.id;
                  const msg = messages[u.id];
                  return (
                    <tr key={u.id} className="hover:bg-black/5 transition-colors">
                      <td className="px-5 py-3 font-medium" style={{ color: 'var(--texte)' }}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                            style={{ backgroundColor: 'var(--primaire)' }}
                          >
                            {u.nomComplet.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.nomComplet}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--texte-secondaire)' }}>
                        {u.email}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${COULEUR_ROLE[u.role] ?? ''}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--texte-secondaire)' }}>
                        {u.langue}
                      </td>
                      <td
                        className="px-5 py-3 whitespace-nowrap"
                        style={{ color: 'var(--texte-secondaire)' }}
                      >
                        {new Date(u.creeLe).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-3">
                        {msg && (
                          <span
                            className={`block text-xs mb-1 ${
                              msg.type === 'succes' ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {msg.texte}
                          </span>
                        )}
                        {enCours ? (
                          <span className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
                            En cours…
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {u.role === 'PROFESSEUR' && (
                              <Link
                                href={`/admin/professeurs/${u.id}`}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-colors hover:bg-black/5"
                                style={{ borderColor: 'var(--bordure)', color: 'var(--primaire)' }}
                              >
                                Voir
                              </Link>
                            )}
                            <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setMenuOuvert(menuOuvert === u.id ? null : u.id)}
                                className="rounded-lg p-1.5 text-xs font-medium border transition-colors hover:bg-black/5 flex items-center justify-center"
                                style={{ borderColor: 'var(--bordure)', color: 'var(--texte)', width: '32px', height: '32px' }}
                                title="Actions"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                              </button>
                              {menuOuvert === u.id && (
                                <div
                                  className="absolute right-0 top-full mt-1 z-50 rounded-xl border shadow-lg overflow-hidden w-44"
                                  style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                                >
                                  {u.role === 'PROFESSEUR' && (
                                    <Link
                                      href={`/admin/professeurs/${u.id}`}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 transition-colors font-semibold flex items-center gap-2"
                                      style={{ color: 'var(--texte)', borderBottom: '1px solid var(--bordure)' }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                      Voir profil
                                    </Link>
                                  )}
                                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--texte-secondaire)', borderBottom: '1px solid var(--bordure)' }}>
                                    Changer le rôle
                                  </p>
                                  {ROLES_SELECTABLE.filter((r) => r !== u.role).map((r) => (
                                    <button
                                      key={r}
                                      onClick={() => changerRole(u.id, r)}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 transition-colors"
                                      style={{ color: 'var(--texte)' }}
                                    >
                                      → {r}
                                    </button>
                                  ))}
                                  <div style={{ borderTop: '1px solid var(--bordure)' }}>
                                    <button
                                      onClick={() => suspendre(u.id)}
                                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                      Suspendre
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
  );
}
