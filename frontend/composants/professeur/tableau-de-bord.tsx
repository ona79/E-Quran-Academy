'use client';

// Tableau de bord professeur : salutation, prochains cours à donner,
// demandes EN_ATTENTE à traiter, revenus du mois.
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient, ErreurApi } from '@/lib/api-client';
import { utiliserAuth } from '@/composants/auth/fournisseur-auth';
import type { Page, Reservation, ProfilProfesseur } from '@/lib/types';
import { BadgeStatut } from '@/composants/ui/badge-statut';
import { CarteStatistique } from '@/composants/ui/carte-statistique';
import { formaterDateHeure } from '@/lib/fuseau-horaire';

interface EleveInfo {
  nomComplet: string;
  id: string;
}

type ReservationAvecEleve = Reservation & { nomEleve?: string };

function peutDemarrer(creneauDebut: string): boolean {
  const now = Date.now();
  const debut = new Date(creneauDebut).getTime();
  return debut - now <= 15 * 60 * 1000 && debut > now - 2 * 60 * 60 * 1000;
}

export function TableauDeBordProfesseur() {
  const { utilisateur } = utiliserAuth();
  const prenom = utilisateur?.nomComplet?.split(' ')[0] ?? 'vous';

  const [reservations, setReservations] = useState<ReservationAvecEleve[]>([]);
  const [profil, setProfil] = useState<ProfilProfesseur | null>(null);
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const [page, p] = await Promise.all([
        apiClient.get<Page<Reservation>>('/reservations/moi-professeur?page=1&taille=50'),
        apiClient.get<ProfilProfesseur>('/utilisateurs/professeurs/moi').catch(() => null),
      ]);
      setProfil(p);

      // Enrichir avec noms des élèves
      const elevesIds = Array.from(new Set(page.donnees.map((r) => r.eleveId)));
      const cacheEleves: Record<string, string> = {};
      await Promise.all(
        elevesIds.map(async (id) => {
          try {
            const e = await apiClient.get<EleveInfo>(`/utilisateurs/${id}`);
            cacheEleves[id] = e.nomComplet;
          } catch {
            cacheEleves[id] = `Élève ${id.slice(0, 8)}`;
          }
        })
      );

      setReservations(page.donnees.map((r) => ({ ...r, nomEleve: cacheEleves[r.eleveId] })));
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'Erreur de chargement');
    } finally {
      setEnChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const changerStatut = async (id: string, nouveauStatut: string) => {
    try {
      const maj = await apiClient.patch<Reservation>(`/reservations/${id}/statut`, { nouveauStatut });
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, statut: maj.statut } : r)));
    } catch (e) {
      alert(e instanceof ErreurApi ? e.message : 'Erreur de changement de statut');
    }
  };

  if (enChargement) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--fond-surface)' }} />
        ))}
      </div>
    );
  }

  // Professeur non encore validé
  if (profil !== null && !profil.valide) {
    return (
      <div className="max-w-md mx-auto mt-10 rounded-2xl p-8 text-center space-y-4"
        style={{ background: '#131F18', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-5xl">⏳</p>
        <p className="text-lg font-semibold" style={{ color: '#F0EDE6' }}>Compte en cours de validation</p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,230,0.55)' }}>
          Un administrateur doit valider votre profil avant que les élèves puissent vous trouver.
        </p>
        <Link href="/professeur/profil" className="btn-primaire inline-block">
          Compléter mon profil →
        </Link>
      </div>
    );
  }

  const maintenant = Date.now();
  const enAttente = reservations.filter((r) => r.statut === 'EN_ATTENTE');
  // Cours confirmés dont la date de fin estimée (creneauDebut + 1h) est dans le futur
  const confirmes = reservations
    .filter((r) => r.statut === 'CONFIRME' && new Date(r.creneauDebut).getTime() + 60 * 60 * 1000 > maintenant)
    .sort((a, b) => new Date(a.creneauDebut).getTime() - new Date(b.creneauDebut).getTime())
    .slice(0, 3);
  // Cours confirmés mais dont la date est passée (en attente de marquage REALISE par le backend)
  const confirmesPasses = reservations
    .filter((r) => r.statut === 'CONFIRME' && new Date(r.creneauDebut).getTime() + 60 * 60 * 1000 <= maintenant)
    .sort((a, b) => new Date(b.creneauDebut).getTime() - new Date(a.creneauDebut).getTime());
  const realises = reservations.filter((r) => r.statut === 'REALISE');

  // Revenus du mois courant
  const debut = new Date(); debut.setDate(1); debut.setHours(0, 0, 0, 0);
  const realisesMonth = realises.filter((r) => new Date(r.creneauDebut) >= debut);
  const revenusMois = realisesMonth.length * (profil?.tarifHoraire ?? 0);
  const paiementActif = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Salutation */}
      <div>
        <h1 className="text-2xl font-bold">🕌 Wa alaykum assalam, {prenom}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--texte-secondaire)' }}>
          Tableau de bord de votre espace enseignant.
        </p>
      </div>

      {erreur && <p className="carte text-sm" style={{ color: 'var(--erreur)' }}>{erreur}</p>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CarteStatistique etiquette="À venir" valeur={confirmes.length} icone="📅" />
        <CarteStatistique etiquette="À confirmer" valeur={enAttente.length} icone="🔔" />
        <CarteStatistique etiquette="Réalisés" valeur={realises.length} icone="✅" />
        <CarteStatistique
          etiquette={paiementActif ? 'Revenus FCFA' : 'Revenus (MVP)'}
          valeur={paiementActif ? revenusMois.toLocaleString('fr-FR') : '—'}
          icone="💰"
        />
      </div>

      {/* Prochains cours à donner */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Prochains cours à donner</h2>
          <Link href="/professeur/cours" className="text-xs hover:underline" style={{ color: 'var(--couleur-primaire)' }}>
            Voir tous →
          </Link>
        </div>
        {confirmes.length === 0 ? (
          <div className="carte text-center py-8">
            <p className="text-3xl mb-2">🗓️</p>
            <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
              Aucun cours confirmé à venir. Attendez les confirmations d&apos;élèves.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {confirmes.map((r) => {
              const peutDem = peutDemarrer(r.creneauDebut);
              return (
                <div key={r.id} className="carte flex items-center justify-between gap-4"
                  style={{ borderLeft: '3px solid #0B5E45' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'rgba(11,94,69,0.25)', color: '#33997A' }}>
                      {(r.nomEleve ?? 'E').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.nomEleve ?? `Élève ${r.eleveId.slice(0, 8)}`}</p>
                      <p className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
                        {formaterDateHeure(r.creneauDebut)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <BadgeStatut statut={r.statut} />
                    {peutDem ? (
                      <Link href={`/professeur/classe/${r.id}`} className="btn-primaire text-xs !py-1.5 !px-3">
                        🎥 Démarrer
                      </Link>
                    ) : (
                      <button disabled className="btn-primaire text-xs !py-1.5 !px-3 opacity-40 cursor-not-allowed"
                        title="Disponible 15 min avant">
                        🎥 Démarrer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cours passés (confirmés mais date dépassée, en attente de marquage REALISE) */}
      {(confirmesPasses.length > 0 || realises.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Cours passés</h2>
            <Link href="/professeur/cours" className="text-xs hover:underline" style={{ color: 'var(--couleur-primaire)' }}>
              Voir tous →
            </Link>
          </div>
          <div className="space-y-3">
            {[...confirmesPasses, ...realises.slice(0, 3)].slice(0, 5).map((r) => (
              <div key={r.id} className="carte flex items-center justify-between gap-4"
                style={{ borderLeft: '3px solid rgba(255,255,255,0.15)', opacity: 0.8 }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(240,237,230,0.5)' }}>
                    {(r.nomEleve ?? 'E').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{r.nomEleve ?? `Élève ${r.eleveId.slice(0, 8)}`}</p>
                    <p className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
                      {formaterDateHeure(r.creneauDebut)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(240,237,230,0.5)' }}>
                    Terminé
                  </span>
                  {r.statut === 'REALISE' && (
                    <Link href={`/professeur/suivi/${r.id}`}
                      className="btn-secondaire text-xs !py-1 !px-2.5"
                      style={{ borderColor: 'var(--couleur-or)', color: 'var(--couleur-or)' }}>
                      📝 Suivi
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Demandes EN_ATTENTE */}
      <section>
        <h2 className="text-base font-semibold mb-3">
          Demandes à traiter
          {enAttente.length > 0 && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: 'var(--couleur-primaire)' }}>
              {enAttente.length}
            </span>
          )}
        </h2>
        {enAttente.length === 0 ? (
          <p className="carte text-sm" style={{ color: 'rgba(240,237,230,0.55)' }}>
            Aucune demande en attente. ✅
          </p>
        ) : (
          <div className="space-y-3">
            {enAttente.map((r) => (
              <div key={r.id} className="carte" style={{ borderLeft: '3px solid #B8923A' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{r.nomEleve ?? `Élève ${r.eleveId.slice(0, 8)}`}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--texte-secondaire)' }}>
                      📅 {formaterDateHeure(r.creneauDebut)}
                    </p>
                    {r.noteEleve && (
                      <p className="text-xs italic mt-1 line-clamp-2" style={{ color: 'var(--texte-secondaire)' }}>
                        🎯 &quot;{r.noteEleve}&quot;
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => changerStatut(r.id, 'CONFIRME')}
                      className="btn-primaire text-xs !py-1.5 !px-3"
                    >
                      ✓ Accepter
                    </button>
                    <button
                      type="button"
                      onClick={() => changerStatut(r.id, 'ANNULE')}
                      className="btn-secondaire text-xs !py-1.5 !px-3"
                      style={{ borderColor: 'var(--erreur)', color: 'var(--erreur)' }}
                    >
                      ✗ Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Revenus du mois */}
      <section>
        <div className="carte" style={{ borderLeft: '3px solid var(--couleur-or)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Revenus du mois</h2>
              <p className="text-3xl font-bold mt-1">
                {paiementActif ? `${revenusMois.toLocaleString('fr-FR')} FCFA` : '—'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--texte-secondaire)' }}>
                Basé sur {realisesMonth.length} cours réalisé{realisesMonth.length > 1 ? 's' : ''} ce mois
              </p>
            </div>
            {!paiementActif && (
              <span className="text-xs px-3 py-1 rounded-full"
                style={{ backgroundColor: 'color-mix(in srgb, var(--couleur-or) 15%, transparent)', color: 'var(--couleur-or)' }}>
                Paiement désactivé (MVP)
              </span>
            )}
          </div>
          <Link href="/professeur/revenus" className="text-xs mt-2 inline-block hover:underline"
            style={{ color: 'var(--couleur-primaire)' }}>
            Voir le détail des revenus →
          </Link>
        </div>
      </section>

      {/* Raccourcis */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/professeur/disponibilites', icon: '🗓️', label: 'Disponibilités', desc: 'Gérer vos créneaux' },
          { href: '/professeur/profil', icon: '👤', label: 'Mon profil', desc: 'Bio, Ijaza, tarif' },
          { href: '/professeur/messages', icon: '💬', label: 'Messages', desc: 'Vos élèves vous écrivent' },
        ].map((lien) => (
          <Link key={lien.href} href={lien.href}
            className="carte flex flex-col gap-2 hover:shadow-elevee transition-all"
            style={{ borderColor: 'var(--bordure)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--couleur-primaire)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bordure)'; }}>
            <span className="text-2xl">{lien.icon}</span>
            <p className="font-semibold text-sm">{lien.label}</p>
            <p className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>{lien.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
