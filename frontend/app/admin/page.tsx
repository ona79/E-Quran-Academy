'use client';

import { GardeRoute } from '@/composants/auth/garde-route';
import { ShellConnecte } from '@/composants/layout/shell-connecte';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Utilisateur, Reservation, ProfilProfesseur } from '@/lib/types';

interface Stats {
  totalEleves: number;
  totalProfesseurs: number;
  professeursEnAttente: number;
  coursAujourdhui: number;
  revenusTotal: number;
}

interface LigneTransaction {
  montant: number;
  statutEscrow: string;
}

function StatCard({
  icone,
  valeur,
  libelle,
  href,
  couleur,
  badge,
}: {
  icone: string;
  valeur: number | string;
  libelle: string;
  href?: string;
  couleur: string;
  badge?: boolean;
}) {
  const contenu = (
    <div
      className="rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 relative overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: badge ? '1px solid var(--accent)' : '1px solid var(--bordure)',
      }}
    >
      {badge && (
        <span
          className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ background: '#EF4444' }}
        />
      )}
      <div
        className="shrink-0 rounded-xl flex items-center justify-center text-lg"
        style={{ width: 40, height: 40, background: 'rgba(11,94,69,0.2)', color: '#33997A' }}
      >
        {icone}
      </div>
      <div>
        <p className="font-extrabold leading-none" style={{ fontSize: 28, color: couleur }}>
          {valeur}
        </p>
        <p className="text-xs mt-1 font-medium" style={{ color: 'var(--texte-secondaire)' }}>
          {libelle}
        </p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{contenu}</Link> : <div>{contenu}</div>;
}

function Squelette() {
    <div className="rounded-2xl h-24 animate-pulse" style={{ background: '#FFFFFF', border: '1px solid var(--bordure)' }} />
}

export default function PageAdmin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      try {
        const [utilisateurs, reservations, transactions] = await Promise.allSettled([
          apiClient.get<Utilisateur[]>('/utilisateurs'),
          apiClient.get<Reservation[]>('/reservations'),
          apiClient.get<LigneTransaction[]>('/paiement/historique'),
        ]);

        const listeUtilisateurs = utilisateurs.status === 'fulfilled' ? utilisateurs.value : [];
        const listeReservations = reservations.status === 'fulfilled' ? reservations.value : [];
        const listeTransactions = transactions.status === 'fulfilled' ? transactions.value : [];

        const eleves = listeUtilisateurs.filter((u) => u.role === 'ELEVE');
        const professeurs = listeUtilisateurs.filter((u) => u.role === 'PROFESSEUR');

        // Compter les professeurs EN_ATTENTE via leurs profils
        let enAttente = 0;
        try {
          const profils = await Promise.allSettled(
            professeurs.slice(0, 20).map((p) =>
              apiClient.get<ProfilProfesseur>(`/utilisateurs/professeurs/${p.id}`)
            )
          );
          enAttente = profils.filter(
            (r) => r.status === 'fulfilled' && !r.value.valide
          ).length;
        } catch {
          enAttente = 0;
        }

        // Cours aujourd'hui
        const debut = new Date();
        debut.setHours(0, 0, 0, 0);
        const fin = new Date();
        fin.setHours(23, 59, 59, 999);
        const coursAujourdhui = listeReservations.filter((r) => {
          const d = new Date(r.creneauDebut);
          return d >= debut && d <= fin;
        }).length;

        // Revenus totaux libérés
        const revenusTotal = listeTransactions
          .filter((tx) => tx.statutEscrow === 'LIBERE')
          .reduce((acc, tx) => acc + tx.montant, 0);

        setStats({
          totalEleves: eleves.length,
          totalProfesseurs: professeurs.length,
          professeursEnAttente: enAttente,
          coursAujourdhui,
          revenusTotal,
        });
      } catch {
        // ignore — affiche des tirets
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  const enAttente = stats?.professeursEnAttente ?? 0;

  return (
    <GardeRoute rolesAutorises={['ADMIN']}>
      <ShellConnecte>
        <div className="space-y-8">
          {/* En-tête */}
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--texte)' }}>
              Tableau de bord
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--texte-secondaire)' }}>
              Vue d&apos;ensemble de la plateforme E-Quran Academy.
            </p>
          </div>

          {/* Alerte professeurs EN_ATTENTE */}
          {!chargement && enAttente > 0 && (
            <Link href="/admin/professeurs">
              <div
                className="rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 cursor-pointer"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--accent)',
                }}
              >
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--texte)' }}>
                    {enAttente} professeur{enAttente > 1 ? 's' : ''} en attente de validation
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--texte-secondaire)' }}>
                    Cliquez pour examiner et approuver les demandes →
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-sm font-bold"
                  style={{ background: 'rgba(239,68,68,0.2)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  {enAttente}
                </span>
              </div>
            </Link>
          )}

          {/* Cartes stats — 5 cartes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {chargement ? (
              [...Array(5)].map((_, i) => <Squelette key={i} />)
            ) : (
              <>
                  <StatCard icone="🎓" valeur={stats?.totalEleves ?? '—'} libelle="Étudiants inscrits" href="/admin/utilisateurs?role=ELEVE" couleur="var(--primaire)" />
                  <StatCard icone="📖" valeur={stats?.totalProfesseurs ?? '—'} libelle="Professeurs actifs" href="/admin/professeurs" couleur="var(--accent)" />
                  <StatCard icone="⏳" valeur={stats?.professeursEnAttente ?? '—'} libelle="En attente validation" href="/admin/professeurs" couleur="var(--accent)" badge={(stats?.professeursEnAttente ?? 0) > 0} />
                  <StatCard icone="📅" valeur={stats?.coursAujourdhui ?? '—'} libelle="Cours aujourd'hui" couleur="var(--texte)" />
                  <StatCard icone="💰" valeur={stats ? `${stats.revenusTotal.toLocaleString('fr-FR')} F` : '—'} libelle="Revenus totaux" href="/admin/paiements" couleur="var(--primaire)" />
              </>
            )}
          </div>

          {/* Raccourcis */}
          <div>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--texte)' }}>
              Accès rapides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  href: '/admin/professeurs',
                  icone: '✅',
                  titre: 'Valider les professeurs',
                  desc: 'Examiner et approuver les demandes en attente',
                  urgence: enAttente > 0,
                },
                {
                  href: '/admin/utilisateurs',
                  icone: '👥',
                  titre: 'Gérer les utilisateurs',
                  desc: 'Voir tous les comptes, filtrer par rôle, changer les statuts',
                  urgence: false,
                },
                {
                  href: '/admin/feature-flags',
                  icone: '🚩',
                  titre: 'Feature flags',
                  desc: 'Activer ou désactiver des fonctionnalités sans redéploiement',
                  urgence: false,
                },
                {
                  href: '/admin/paiements',
                  icone: '💳',
                  titre: 'Paiements',
                  desc: 'Transactions, revenus et créditement manuel des comptes',
                  urgence: false,
                },
              ].map((lien) => (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className="rounded-2xl p-5 flex items-start gap-3 transition-all duration-200"
                  style={{
                    background: '#FFFFFF',
                    border: lien.urgence ? '1px solid var(--accent)' : '1px solid var(--bordure)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--fond-page)';
                    e.currentTarget.style.borderColor = lien.urgence ? 'var(--accent)' : 'var(--primaire)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = lien.urgence ? 'var(--accent)' : 'var(--bordure)';
                  }}
                >
                  <span className="text-2xl">{lien.icone}</span>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--texte)' }}>
                      {lien.titre}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--texte-secondaire)' }}>
                      {lien.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ShellConnecte>
    </GardeRoute>
  );
}
