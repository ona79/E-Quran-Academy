'use client';

// /professeurs/[id] — Profil public d'un professeur.
// Photo/avatar, bio, lecteur audio, calendrier 7 jours, avis, bouton réserver.
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { EnteteGlobal } from '@/composants/layout/entete-global';
import { Separateur } from '@/composants/ui/separateur';
import { MotifIslamique } from '@/composants/ui/motif-islamique';
import type { Avis, Disponibilite } from '@/lib/types';

interface ProfilComplet {
  id: string;
  userId: string;
  nomComplet: string;
  bio?: string | null;
  ijazaUrl?: string | null;
  audioUrl?: string | null;
  tarifHoraire: number;
  qiraatParDefaut: 'HAFS' | 'WARSH';
  reservationInstantanee: boolean;
  valide: boolean;
  langue?: string;
  genre?: string | null;
}

interface AvisAvecNom extends Avis {
  nomEleve?: string;
}

// Génère les créneaux des 7 prochains jours à partir des disponibilités récurrentes
function genererCreneaux7Jours(dispos: Disponibilite[]): Array<{ date: Date; hDebut: string; hFin: string }> {
  const jours = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
  const maintenant = new Date();
  const creneaux: Array<{ date: Date; hDebut: string; hFin: string }> = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(maintenant);
    date.setDate(date.getDate() + i);
    const jourNom = jours[date.getDay()];
    const disposDuJour = dispos.filter((d) => d.jour === jourNom);
    disposDuJour.forEach((d) => {
      creneaux.push({ date, hDebut: d.heureDebut, hFin: d.heureFin });
    });
  }
  return creneaux;
}

const JOURS_COURTS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MOIS_COURTS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function EtoilesNote({ note }: { note: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < Math.round(note) ? 'var(--couleur-or)' : 'var(--bordure)' }}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function PageProfilProfesseur() {
  const { id } = useParams<{ id: string }>();
  const [profil, setProfil] = useState<ProfilComplet | null>(null);
  const [noteMoyenne, setNoteMoyenne] = useState<{ moyenne: number; total: number } | null>(null);
  const [dispos, setDispos] = useState<Disponibilite[]>([]);
  const [avis, setAvis] = useState<AvisAvecNom[]>([]);
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    if (!id) return;
    const charger = async () => {
      try {
        const [profilRes, noteRes, disposRes, avisRes] = await Promise.all([
          fetch(`/api-backend/utilisateurs/professeurs/${id}`),
          fetch(`/api-backend/avis/professeurs/${id}/moyenne`),
          fetch(`/api-backend/reservations/professeurs/${id}/disponibilites?page=1&taille=50`),
          fetch(`/api-backend/avis/professeurs/${id}?page=1&taille=10`),
        ]);

        if (!profilRes.ok) { setErreur(true); return; }

        const [profilData, noteData, disposData, avisData] = await Promise.all([
          profilRes.json(),
          noteRes.ok ? noteRes.json() : null,
          disposRes.ok ? disposRes.json() : null,
          avisRes.ok ? avisRes.json() : null,
        ]);

        setProfil(profilData);
        if (noteData) setNoteMoyenne(noteData);
        if (disposData) setDispos(disposData.donnees ?? []);
        if (avisData) setAvis(avisData.donnees ?? []);
      } catch {
        setErreur(true);
      } finally {
        setEnChargement(false);
      }
    };
    charger();
  }, [id]);

  const initiales = profil?.nomComplet
    ?.split(' ')
    .map((m: string) => m[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  const creneaux = genererCreneaux7Jours(dispos);

  if (enChargement) {
    return (
      <div className="min-h-screen flex flex-col">
        <EnteteGlobal />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full animate-pulse mx-auto" style={{ backgroundColor: 'var(--fond-surface)' }} />
            <p style={{ color: 'var(--texte-secondaire)' }}>Chargement du profil…</p>
          </div>
        </div>
      </div>
    );
  }

  if (erreur || !profil) {
    return (
      <div className="min-h-screen flex flex-col">
        <EnteteGlobal />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-5xl mb-4">😔</p>
            <h1 className="text-xl font-semibold mb-2">Profil introuvable</h1>
            <p className="mb-6" style={{ color: 'var(--texte-secondaire)' }}>
              Ce professeur n&apos;existe pas ou son profil n&apos;est pas encore disponible.
            </p>
            <Link
              href="/professeurs"
              className="rounded-xl px-5 py-2.5 text-sm font-medium"
              style={{ backgroundColor: 'var(--couleur-primaire)', color: '#FFF' }}
            >
              Voir tous les professeurs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <EnteteGlobal />

      {/* Hero du profil */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #08402F 0%, #0B5E45 100%)' }}
      >
        <MotifIslamique
          opacite={0.05}
          couleur="#F7F3E9"
          taille={500}
          className="absolute -right-20 -top-20 pointer-events-none"
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl font-bold shrink-0 border-4"
              style={{
                backgroundColor: 'var(--couleur-primaire-profond)',
                color: '#EFE3C2',
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              {initiales}
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                {profil.nomComplet}
              </h1>

              {/* Note + qiraat + tarif */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-2">
                {noteMoyenne && noteMoyenne.total > 0 && (
                  <div className="flex items-center gap-1.5">
                    <EtoilesNote note={noteMoyenne.moyenne} />
                    <span className="text-sm font-medium" style={{ color: '#EFE3C2' }}>
                      {noteMoyenne.moyenne.toFixed(1)} ({noteMoyenne.total} avis)
                    </span>
                  </div>
                )}

                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: '#EFE3C2', color: '#08402F' }}
                >
                  {profil.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}
                </span>

                {profil.reservationInstantanee && (
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ backgroundColor: '#B8923A', color: '#FFFFFF' }}
                  >
                    ⚡ Réservation instantanée
                  </span>
                )}
              </div>

              {/* Tarif */}
              <p className="mt-3 text-lg font-bold" style={{ color: '#EFE3C2' }}>
                {profil.tarifHoraire.toLocaleString('fr-FR')} FCFA
                <span className="text-sm font-normal opacity-75">/heure</span>
              </p>
            </div>

            {/* Bouton réserver — desktop */}
            <div className="hidden sm:flex flex-col gap-2 shrink-0">
              <Link
                href={`/eleve/reserver?prof=${profil.userId}`}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-center transition-all"
                style={{ backgroundColor: '#B8923A', color: '#FFFFFF' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#9c7a2c'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#B8923A'; }}
              >
                Réserver un cours
              </Link>
              <Link
                href={`/eleve/reserver?prof=${profil.userId}&essai=1`}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-center border transition-all"
                style={{ borderColor: '#EFE3C2', color: '#EFE3C2', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                ✨ Cours d&apos;essai
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 pb-28 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">

            {/* Lecteur audio */}
            {profil.audioUrl && (
              <section>
                <h2 className="font-semibold text-base mb-3">Écouter la récitation</h2>
                <div
                  className="p-4 rounded-xl border"
                  style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                >
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio controls className="w-full" src={profil.audioUrl}>
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                </div>
              </section>
            )}

            {/* Bio */}
            {profil.bio && (
              <section>
                <h2 className="font-semibold text-base mb-3">Présentation</h2>
                <div
                  className="p-5 rounded-xl border"
                  style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{profil.bio}</p>

                  {profil.ijazaUrl && (
                    <a
                      href={profil.ijazaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium transition-opacity hover:opacity-70"
                      style={{ color: 'var(--couleur-primaire)' }}
                    >
                      🎓 Voir l&apos;Ijaza (certificat)
                    </a>
                  )}
                </div>
              </section>
            )}

            <Separateur />

            {/* Calendrier disponibilités */}
            <section>
              <h2 className="font-semibold text-base mb-4">
                Disponibilités — 7 prochains jours
              </h2>
              {creneaux.length === 0 ? (
                <div
                  className="text-center py-10 rounded-xl border"
                  style={{ borderColor: 'var(--bordure)', backgroundColor: 'var(--fond-surface)' }}
                >
                  <p className="text-2xl mb-2">🗓️</p>
                  <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
                    Aucun créneau disponible dans les 7 prochains jours.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {creneaux.map((c, i) => (
                    <Link
                      key={i}
                      href={`/eleve/reserver?prof=${profil.userId}&date=${c.date.toISOString().split('T')[0]}&h=${c.hDebut}`}
                      className="flex flex-col p-3.5 rounded-xl border transition-all hover:shadow-carte group"
                      style={{ borderColor: 'var(--bordure)', backgroundColor: 'var(--fond-surface)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--couleur-primaire)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bordure)'; }}
                    >
                      <span className="text-xs font-medium mb-1" style={{ color: 'var(--texte-secondaire)' }}>
                        {JOURS_COURTS[c.date.getDay()]} {c.date.getDate()} {MOIS_COURTS[c.date.getMonth()]}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: 'var(--couleur-primaire)' }}>
                        {c.hDebut} – {c.hFin}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <Separateur />

            {/* Avis */}
            <section>
              <h2 className="font-semibold text-base mb-4">
                Avis des élèves
                {noteMoyenne && noteMoyenne.total > 0 && (
                  <span className="ml-2 text-sm font-normal" style={{ color: 'var(--texte-secondaire)' }}>
                    ({noteMoyenne.total} avis)
                  </span>
                )}
              </h2>

              {avis.length === 0 ? (
                <div
                  className="text-center py-10 rounded-xl border"
                  style={{ borderColor: 'var(--bordure)', backgroundColor: 'var(--fond-surface)' }}
                >
                  <p className="text-2xl mb-2">💬</p>
                  <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
                    Aucun avis pour le moment. Soyez le premier !
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {avis.map((a) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-xl border"
                      style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <EtoilesNote note={a.note} />
                        <span className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
                          {new Date(a.creeLe).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      {a.commentaire && (
                        <p className="text-sm leading-relaxed">{a.commentaire}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Colonne latérale — desktop uniquement */}
          <aside className="hidden lg:block space-y-4 self-start sticky top-20">
            <div
              className="p-5 rounded-2xl border"
              style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
            >
              <p className="text-2xl font-bold mb-1">
                {profil.tarifHoraire.toLocaleString('fr-FR')} FCFA
              </p>
              <p className="text-xs mb-5" style={{ color: 'var(--texte-secondaire)' }}>par heure de cours</p>

              <div className="space-y-2">
                <Link
                  href={`/eleve/reserver?prof=${profil.userId}`}
                  className="w-full block text-center rounded-xl px-5 py-3 text-sm font-semibold transition-all"
                  style={{ backgroundColor: 'var(--couleur-primaire)', color: '#FFF' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--couleur-primaire-profond)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--couleur-primaire)'; }}
                >
                  Réserver un cours
                </Link>
                <Link
                  href={`/eleve/reserver?prof=${profil.userId}&essai=1`}
                  className="w-full block text-center rounded-xl px-5 py-3 text-sm font-semibold border transition-all"
                  style={{ borderColor: 'var(--couleur-or)', color: 'var(--couleur-or)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(184,146,58,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  ✨ Cours d&apos;essai
                </Link>
              </div>
            </div>

            {/* Infos rapides */}
            <div
              className="p-5 rounded-2xl border space-y-3 text-sm"
              style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
            >
              <div className="flex justify-between">
                <span style={{ color: 'var(--texte-secondaire)' }}>Qiraat</span>
                <span className="font-medium">{profil.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}</span>
              </div>
              {profil.langue && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--texte-secondaire)' }}>Langue</span>
                  <span className="font-medium capitalize">{profil.langue}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: 'var(--texte-secondaire)' }}>Réservation</span>
                <span className="font-medium">
                  {profil.reservationInstantanee ? '⚡ Instantanée' : 'Sur demande'}
                </span>
              </div>
              {noteMoyenne && noteMoyenne.total > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--texte-secondaire)' }}>Note</span>
                  <span className="font-medium">{noteMoyenne.moyenne.toFixed(1)} / 5</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Bouton réserver fixe — mobile */}
      <div
        className="sm:hidden fixed bottom-0 inset-x-0 z-30 flex gap-2 p-3 border-t"
        style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
      >
        <Link
          href={`/eleve/reserver?prof=${profil.userId}&essai=1`}
          className="flex-1 text-center rounded-xl py-3 text-sm font-semibold border transition-all"
          style={{ borderColor: 'var(--couleur-or)', color: 'var(--couleur-or)' }}
        >
          ✨ Essai
        </Link>
        <Link
          href={`/eleve/reserver?prof=${profil.userId}`}
          className="flex-[2] text-center rounded-xl py-3 text-sm font-semibold transition-all"
          style={{ backgroundColor: 'var(--couleur-primaire)', color: '#FFF' }}
        >
          Réserver un cours
        </Link>
      </div>
    </div>
  );
}
