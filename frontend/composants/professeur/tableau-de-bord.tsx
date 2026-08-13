'use client';

// Tableau de bord professeur : salutation, prochains cours à donner,
// demandes EN_ATTENTE à traiter, revenus du mois.
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient, ErreurApi } from '@/lib/api-client';
import { utiliserAuth } from '@/composants/auth/fournisseur-auth';
import type { Page, Reservation, ProfilProfesseur } from '@/lib/types';
import { Calendar, Bell, CheckCircle2, Wallet, Video, FileEdit, Clock, User, MessageSquare } from 'lucide-react';
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

      // Enrichir avec noms des étudiants
      const elevesIds = Array.from(new Set(page.donnees.map((r) => r.eleveId)));
      const cacheEleves: Record<string, string> = {};
      await Promise.all(
        elevesIds.map(async (id) => {
          try {
            const e = await apiClient.get<EleveInfo>(`/utilisateurs/${id}`);
            cacheEleves[id] = e.nomComplet;
          } catch {
            cacheEleves[id] = `Étudiant ${id.slice(0, 8)}`;
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
        style={{ background: '#FFFFFF', border: '1px solid var(--bordure)' }}>
        <Clock size={40} className="mx-auto text-amber-500" />
        <p className="text-lg font-semibold" style={{ color: 'var(--texte)' }}>Compte en cours de validation</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--texte-secondaire)' }}>
          Un administrateur doit valider votre profil avant que les étudiants puissent vous trouver.
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
    <div className="space-y-8 max-w-6xl w-full">
      {/* Salutation */}
      <div>
        <h1 className="text-2xl font-bold">Salamou llahi alaykoum, {prenom}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--texte-secondaire)' }}>
          Tableau de bord - espace enseignant.
        </p>
      </div>

      {erreur && <p className="carte text-sm" style={{ color: 'var(--erreur)' }}>{erreur}</p>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CarteStatistique etiquette="À venir" valeur={confirmes.length} icone={<Calendar size={20} />} />
        <CarteStatistique etiquette="À confirmer" valeur={enAttente.length} icone={<Bell size={20} />} />
        <CarteStatistique etiquette="Réalisés" valeur={realises.length} icone={<CheckCircle2 size={20} />} />
        <CarteStatistique
          etiquette={paiementActif ? 'Revenus FCFA' : 'Revenus (MVP)'}
          valeur={paiementActif ? revenusMois.toLocaleString('fr-FR') : '—'}
          icone={<Wallet size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Principale */}
        <div className="lg:col-span-2 space-y-8">
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
                <Calendar size={28} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
                  Aucun cours confirmé à venir. Attendez les confirmations d&apos;étudiants.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {confirmes.map((r) => {
                  const peutDem = peutDemarrer(r.creneauDebut);
                  return (
                    <div key={r.id} className="carte flex items-center justify-between gap-4"
                      style={{ borderLeft: '3px solid var(--primaire)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: 'rgba(27,94,59,0.1)', color: 'var(--primaire)' }}>
                          {(r.nomEleve ?? 'E').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{r.nomEleve ?? `Étudiant ${r.eleveId.slice(0, 8)}`}</p>
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--texte-secondaire)' }}>
                            <Clock size={12} />
                            {formaterDateHeure(r.creneauDebut)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <BadgeStatut statut={r.statut} />
                        {peutDem ? (
                          <Link href={`/professeur/classe/${r.id}`} className="btn-primaire text-xs !py-1.5 !px-3 flex items-center gap-1">
                            <Video size={14} /> Démarrer
                          </Link>
                        ) : (
                          <button disabled className="btn-primaire text-xs !py-1.5 !px-3 opacity-40 cursor-not-allowed flex items-center gap-1"
                            title="Disponible 15 min avant">
                            <Video size={14} /> Démarrer
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Cours passés */}
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
                    style={{ borderLeft: '3px solid var(--bordure)', opacity: 0.8 }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'var(--fond-surface-2)', color: 'var(--texte-secondaire)' }}>
                        {(r.nomEleve ?? 'E').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.nomEleve ?? `Étudiant ${r.eleveId.slice(0, 8)}`}</p>
                        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--texte-secondaire)' }}>
                          <Clock size={12} />
                          {formaterDateHeure(r.creneauDebut)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--fond-surface-2)', color: 'var(--texte-secondaire)' }}>
                        Terminé
                      </span>
                      {r.statut === 'REALISE' && (
                        <Link href={`/professeur/suivi/${r.id}`}
                          className="btn-secondaire text-xs !py-1 !px-2.5 flex items-center gap-1"
                          style={{ borderColor: 'var(--couleur-or)', color: 'var(--couleur-or)' }}>
                          <FileEdit size={12} /> Suivi
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Colonne Latérale */}
        <div className="space-y-8">
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
              <p className="carte text-sm flex items-center gap-1.5" style={{ color: 'var(--texte-secondaire)' }}>
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> Aucune demande en attente.
              </p>
            ) : (
              <div className="space-y-3">
                {enAttente.map((r) => (
                  <div key={r.id} className="carte" style={{ borderLeft: '3px solid #B8923A' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{r.nomEleve ?? `Étudiant ${r.eleveId.slice(0, 8)}`}</p>
                        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--texte-secondaire)' }}>
                          <Calendar size={12} /> {formaterDateHeure(r.creneauDebut)}
                        </p>
                        {r.noteEleve && (
                          <p className="text-xs italic mt-1 line-clamp-2" style={{ color: 'var(--texte-secondaire)' }}>
                            &quot;{r.noteEleve}&quot;
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => changerStatut(r.id, 'CONFIRME')}
                          className="btn-primaire text-xs !py-1.5 !px-3 w-full"
                        >
                          ✓ Accepter
                        </button>
                        <button
                          type="button"
                          onClick={() => changerStatut(r.id, 'ANNULE')}
                          className="btn-secondaire text-xs !py-1.5 !px-3 w-full"
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
              <div className="flex flex-col gap-2">
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
                  <span className="text-xs px-3 py-1 rounded-full w-fit mt-1"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--couleur-or) 15%, transparent)', color: 'var(--couleur-or)' }}>
                    Paiement désactivé
                  </span>
                )}
              </div>
              <Link href="/professeur/revenus" className="text-xs mt-4 inline-block hover:underline"
                style={{ color: 'var(--couleur-primaire)' }}>
                Voir le détail →
              </Link>
            </div>
          </section>

          {/* Raccourcis */}
          <section>
            <h2 className="text-base font-semibold mb-3">Raccourcis</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/professeur/disponibilites', icon: <Calendar size={20} className="text-emerald-700" />, label: 'Horaires' },
                { href: '/professeur/profil', icon: <User size={20} className="text-emerald-700" />, label: 'Profil' },
                { href: '/professeur/messages', icon: <MessageSquare size={20} className="text-emerald-700" />, label: 'Messages' },
              ].map((lien) => (
                <Link key={lien.href} href={lien.href}
                  className="carte cliquable flex flex-col items-center text-center gap-2 transition-all p-3">
                  <span className="p-2 rounded-xl bg-emerald-50">{lien.icon}</span>
                  <p className="font-semibold text-xs">{lien.label}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
