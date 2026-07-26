'use client';

// Tableau de bord élève : salutation, prochains cours (max 3) avec nom du prof,
// bouton Rejoindre actif 15min avant, stats du mois, raccourcis.
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { utiliserAuth } from '@/composants/auth/fournisseur-auth';
import type { Page, Reservation, NoteSession } from '@/lib/types';
import { CarteCoursEleve } from './carte-cours-eleve';
import { CarteStatistique } from '@/composants/ui/carte-statistique';

interface ProfInfo {
  nomComplet: string;
  userId: string;
}

type ReservationAvecProf = Reservation & { nomProf?: string };

// Calcule les stats du mois courant à partir des notes pédagogiques
interface StatsMois {
  souratesMemorisees: number;
  heuresCours: number;
  coursRealises: number;
}

function calculerStats(reservations: Reservation[], notes: NoteSession[]): StatsMois {
  const debut = new Date();
  debut.setDate(1);
  debut.setHours(0, 0, 0, 0);

  const coursMois = reservations.filter(
    (r) => r.statut === 'REALISE' && new Date(r.creneauDebut) >= debut,
  );
  const notesMois = notes.filter(
    (n) => new Date(n.creeLe) >= debut,
  );

  const souratesMemorisees = notesMois.filter((n) => n.sourateMemorisee).length;
  // Estimation 1h par cours
  const heuresCours = coursMois.length;

  return { souratesMemorisees, heuresCours, coursRealises: coursMois.length };
}

export function TableauDeBordEleve() {
  const { utilisateur } = utiliserAuth();
  const prenom = utilisateur?.nomComplet?.split(' ')[0] ?? 'vous';

  const [reservations, setReservations] = useState<ReservationAvecProf[]>([]);
  const [stats, setStats] = useState<StatsMois>({ souratesMemorisees: 0, heuresCours: 0, coursRealises: 0 });
  const [enChargement, setEnChargement] = useState(true);

  const charger = useCallback(async () => {
    try {
      const [pageRes, notesRes] = await Promise.all([
        apiClient.get<Page<Reservation>>('/reservations/moi?page=1&taille=20'),
        apiClient.get<NoteSession[]>('/suivi-pedagogique/moi').catch(() => [] as NoteSession[]),
      ]);

      const toutesRes = pageRes.donnees;
      const statsCalc = calculerStats(toutesRes, notesRes as NoteSession[]);
      setStats(statsCalc);

      // Enrichir avec les noms des profs en parallèle (max 3 à venir)
      const aVenir = toutesRes
        .filter((r) => r.statut === 'EN_ATTENTE' || r.statut === 'CONFIRME')
        .sort((a, b) => new Date(a.creneauDebut).getTime() - new Date(b.creneauDebut).getTime())
        .slice(0, 3);

      const avecNoms = await Promise.all(
        aVenir.map(async (r) => {
          try {
            const prof = await apiClient.get<ProfInfo>(`/utilisateurs/professeurs/${r.professeurId}`);
            return { ...r, nomProf: prof.nomComplet };
          } catch {
            return r;
          }
        }),
      );

      setReservations(avecNoms);
    } catch {
      /* ignore */
    } finally {
      setEnChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  if (enChargement) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl animate-pulse"
            style={{ backgroundColor: 'var(--fond-surface)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Salutation */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F0EDE6' }}>
          🌙 Assalamu alaykum, {prenom}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(240,237,230,0.55)' }}>
          Bienvenue dans votre espace d&apos;apprentissage coranique.
        </p>
      </div>

      {/* Statistiques du mois */}
      <section>
        <h2 className="text-base font-semibold mb-3">Ce mois-ci</h2>
        <div className="grid grid-cols-3 gap-3">
          <CarteStatistique
            etiquette="Cours réalisés"
            valeur={stats.coursRealises}
            icone="✅"
          />
          <CarteStatistique
            etiquette="Heures de cours"
            valeur={stats.heuresCours}
            icone="⏱️"
          />
          <CarteStatistique
            etiquette="Soûrates mémorisées"
            valeur={stats.souratesMemorisees}
            icone="📖"
          />
        </div>
      </section>

      {/* Prochains cours */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Prochains cours</h2>
          <Link
            href="/eleve/classe"
            className="text-xs hover:underline"
            style={{ color: 'var(--couleur-primaire)' }}
          >
            Voir tous →
          </Link>
        </div>

        {reservations.length === 0 ? (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#131F18' }}
          >
            <p className="text-3xl mb-2">🗓️</p>
            <p className="font-medium mb-1">Aucun cours à venir</p>
            <p className="text-sm mb-4" style={{ color: 'var(--texte-secondaire)' }}>
              Réservez votre premier cours avec un professeur certifié Ijaza.
            </p>
            <Link href="/eleve/reserver"
              className="btn-primaire text-sm"
            >
              Réserver un cours
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <CarteCoursEleve
                key={r.id}
                reservation={r}
                nomProf={r.nomProf}
              />
            ))}
          </div>
        )}
      </section>

      {/* Raccourcis */}
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: '#F0EDE6' }}>Accès rapide</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/eleve/reserver"
            className="carte cliquable flex flex-col gap-2"
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(11,94,69,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >
            <span className="text-2xl">🗓️</span>
            <p className="font-semibold text-sm">Réserver un cours</p>
            <p className="text-xs" style={{ color: 'rgba(240,237,230,0.55)' }}>
              Trouver un professeur et un créneau.
            </p>
          </Link>
          <Link
            href="/eleve/messages"
            className="carte cliquable flex flex-col gap-2"
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(11,94,69,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >
            <span className="text-2xl">💬</span>
            <p className="font-semibold text-sm">Mes messages</p>
            <p className="text-xs" style={{ color: 'rgba(240,237,230,0.55)' }}>
              Échangez avec vos professeurs.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
