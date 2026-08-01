'use client';

// Salle de classe virtuelle complète — E-Quran Academy.
// Layout : Vidéo gauche 60% + Mushaf droite 40% (desktop)
//          Onglets "Vidéo" / "Mushaf" (mobile)
//
// Rôle étudiant : surlignage Mushaf en lecture seule, bouton "Mode audio seul",
//              bouton "Terminer le cours" avec modal de confirmation.
// Rôle professeur : contrôles de surlignage actifs, bouton "Terminer" →
//                   /professeur/suivi/[sessionId].
//
// Vocabulaire métier 100% en français (SKILL.md).

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { Reservation, SeanceCours, EtatMushaf, Role } from '@/lib/types';
import { useSalleClasse } from './use-salle-classe';
import { MushafInteractif } from './mushaf-interactif';
import { utiliserAuth } from '@/composants/auth/fournisseur-auth';

// ─── Types locaux ──────────────────────────────────────────────────────────

type OngletMobile = 'VIDEO' | 'MUSHAF';
type StatutConnexion = 'connecte' | 'reconnexion' | 'deconnecte';

// ─── Composant modal de confirmation ──────────────────────────────────────

function ModalConfirmation({
  titre,
  message,
  boutonConfirmer,
  couleurConfirmer,
  onConfirmer,
  onAnnuler,
}: {
  titre: string;
  message: string;
  boutonConfirmer: string;
  couleurConfirmer: string;
  onConfirmer: () => void;
  onAnnuler: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onAnnuler}
        aria-hidden
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm p-6 rounded-2xl border shadow-xl"
        style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
      >
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--texte)' }}>
          {titre}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--texte-secondaire)' }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onAnnuler}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium border transition-colors"
            style={{ borderColor: 'var(--bordure)', color: 'var(--texte)' }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirmer}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: couleurConfirmer }}
          >
            {boutonConfirmer}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Indicateur de connexion ────────────────────────────────────────────────

function IndicateurConnexion({ statut, modeRepli }: { statut: StatutConnexion; modeRepli: boolean }) {
  const config = {
    connecte: { couleur: '#22c55e', label: 'Synchronisé', pulse: true },
    reconnexion: { couleur: '#f59e0b', label: 'Reconnexion…', pulse: true },
    deconnecte: { couleur: '#ef4444', label: 'Déconnecté', pulse: false },
  }[statut];

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
      style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
    >
      <span
        className={`w-2 h-2 rounded-full ${config.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: config.couleur }}
      />
      <span style={{ color: 'var(--texte)' }}>{config.label}</span>
      {modeRepli && (
        <span className="ml-1 font-bold text-amber-600">📻 Audio seul</span>
      )}
    </div>
  );
}

// ─── Composant principal ────────────────────────────────────────────────────

export function SalleDeClasse({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const { utilisateur } = utiliserAuth();

  // Données chargées
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [seance, setSeance] = useState<SeanceCours | null>(null);
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [utilisateurId, setUtilisateurId] = useState<string | null>(null);

  // UI
  const [ongletMobile, setOngletMobile] = useState<OngletMobile>('VIDEO');
  const [modeAudioSeul, setModeAudioSeul] = useState(false);
  const [modalTerminer, setModalTerminer] = useState(false);
  const [terminaison, setTerminaison] = useState(false);

  // Visio simulée
  const [camActive, setCamActive] = useState(true);
  const [microActif, setMicroActif] = useState(true);
  const [indicateurParole, setIndicateurParole] = useState(false);

  const dailyContainerRef = useRef<HTMLDivElement>(null);
  const dailyInstanceRef = useRef<any>(null);

  // ── 1. Décodage JWT ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!utilisateur) return;
    setRole(utilisateur.role);
    setUtilisateurId(utilisateur.id);
  }, [utilisateur]);

  // ── 2. Chargement réservation + séance ───────────────────────────────────
  useEffect(() => {
    if (!utilisateurId || !role) return;
    let timerId: NodeJS.Timeout;

    const charger = async () => {
      try {
        const res = await apiClient.get<Reservation>(`/reservations/${reservationId}`);
        setReservation(res);
        try {
          const sea = await apiClient.get<SeanceCours>(`/classe-virtuelle/seances/${reservationId}`);
          setSeance(sea);
          setEnChargement(false);
        } catch (err: any) {
          if (err?.statut === 404) {
            if (role === 'PROFESSEUR') {
              const nouvelleSeance = await apiClient.post<SeanceCours>('/classe-virtuelle/seances', {
                reservationId,
                eleveId: res.eleveId,
              });
              setSeance(nouvelleSeance);
              setEnChargement(false);
            } else {
              // Si la séance n'existe pas encore, l'élève attend (polling)
              timerId = setTimeout(charger, 4000);
            }
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        setErreur(err?.message || 'Erreur de chargement');
        setEnChargement(false);
      }
    };

    charger();
    return () => { if (timerId) clearTimeout(timerId); };
  }, [reservationId, utilisateurId, role]);

  // ── 3. WebSocket Mushaf ───────────────────────────────────────────────────
  const {
    etatMushaf,
    estProfesseur,
    modeRepliActif,
    connecte: wsConnecte,
    surligner,
    signalerBandePassante,
  } = useSalleClasse(seance?.id ?? '');

  const statutConnexion: StatutConnexion = !wsConnecte
    ? 'deconnecte'
    : seance
    ? 'connecte'
    : 'reconnexion';

  // ── 4. Intégration Daily.co ──────────────────────────────────────────────
  useEffect(() => {
    if (!seance?.lienVisio || seance.lienVisio.startsWith('placeholder://')) return;
    if (typeof window === 'undefined' || !(window as any).DailyIframe) return;
    const container = dailyContainerRef.current;
    if (!container) return;
    if (dailyInstanceRef.current) dailyInstanceRef.current.destroy();
    try {
      const callFrame = (window as any).DailyIframe.createFrame(container, {
        iframeStyle: { width: '100%', height: '100%', border: 'none', borderRadius: '12px', backgroundColor: '#101a22' },
        showLeaveButton: false,
        theme: {
          colors: {
            accent: '#0B5E45',
            background: '#101a22',
            backgroundAccent: '#1b2b35',
            baseText: '#ffffff',
            border: '#1b2b35',
            mainAreaBg: '#101a22',
            mainAreaBgAccent: '#1b2b35',
            mainAreaText: '#ffffff',
            supportiveText: '#9ca3af',
          },
        },
      });
      dailyInstanceRef.current = callFrame;
      const optionsJoin: any = { url: seance.lienVisio };
      if (seance.tokenVisio) {
        optionsJoin.token = seance.tokenVisio;
      }
      callFrame.join(optionsJoin);
      callFrame.on('network-quality-change', (evt: any) => {
        signalerBandePassante(evt.threshold === 'low' ? 'FAIBLE' : 'BONNE');
      });
      return () => { callFrame.destroy(); dailyInstanceRef.current = null; };
    } catch (e) { console.error('DailyIframe:', e); }
  }, [seance, signalerBandePassante]);

  // ── 5. Indicateur de parole simulé ──────────────────────────────────────
  useEffect(() => {
    if (!microActif || modeRepliActif || modeAudioSeul) { setIndicateurParole(false); return; }
    const id = setInterval(() => setIndicateurParole(Math.random() > 0.6), 1200);
    return () => clearInterval(id);
  }, [microActif, modeRepliActif, modeAudioSeul]);

  // ── 6. Sondage de fin de cours (pour déconnecter l'élève) ───────────────
  useEffect(() => {
    if (role === 'PROFESSEUR' || !seance) return;
    const interval = setInterval(async () => {
      try {
        const sea = await apiClient.get<SeanceCours>(`/classe-virtuelle/seances/${reservationId}`);
        if (sea.statut === 'TERMINEE') {
          router.push('/eleve/tableau-de-bord');
        }
      } catch (e) {
        // Ignorer les erreurs réseau temporaires
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [seance, role, reservationId, router]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const terminerLeCours = useCallback(async () => {
    if (!seance) return;
    setTerminaison(true);
    try {
      await apiClient.post(`/classe-virtuelle/seances/${seance.id}/terminer`);
      if (role === 'PROFESSEUR') {
        router.push(`/professeur/suivi/${seance.id}`);
      } else {
        router.push('/eleve/classe');
      }
    } catch (err: any) {
      alert(err instanceof ErreurApi ? err.message : 'Erreur de clôture');
      setTerminaison(false);
    }
  }, [seance, role, router]);

  const basculerEnregistrement = useCallback(async () => {
    if (!seance || role !== 'PROFESSEUR') return;
    if (!seance.enregistrementConsente) {
      const ok = confirm("Confirmez-vous avoir obtenu le consentement parental pour enregistrer cet étudiant ?");
      if (!ok) return;
      try {
        const maj = await apiClient.post<SeanceCours>(
          `/classe-virtuelle/seances/${seance.id}/consentement-enregistrement`,
          { consentementParental: true }
        );
        setSeance(maj);
      } catch { return; }
    }
    try {
      const maj = await apiClient.patch<SeanceCours>(`/classe-virtuelle/seances/${seance.id}/enregistrement`, {
        actif: !seance.enregistrementActif,
      });
      setSeance(maj);
    } catch (err: any) {
      alert(err instanceof ErreurApi ? err.message : 'Erreur enregistrement');
    }
  }, [seance, role]);

  const activerPleinEcran = useCallback(() => {
    if (dailyContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        dailyContainerRef.current.requestFullscreen().catch((err) => {
          console.error("Erreur plein écran:", err);
        });
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Rendus états de chargement / erreur
  // ─────────────────────────────────────────────────────────────────────────

  if (erreur) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center">
        <div className="rounded-2xl border p-8 space-y-4" style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-bold text-red-800">Erreur</h2>
          <p className="text-sm text-red-600">{erreur}</p>
          <button onClick={() => router.push('/')} className="btn-secondaire">
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  if (enChargement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />
        <p className="text-base font-medium" style={{ color: 'var(--texte-secondaire)' }}>
          {role === 'ELEVE' ? 'En attente du professeur…' : 'Initialisation de la salle…'}
        </p>
        {role === 'ELEVE' && (
          <p className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
            La connexion s&apos;établira automatiquement dès que le professeur se connecte.
          </p>
        )}
      </div>
    );
  }

  const estModeSimule = !seance?.lienVisio || seance.lienVisio.startsWith('placeholder://');
  const videoMasquee = modeAudioSeul || modeRepliActif;

  // ─────────────────────────────────────────────────────────────────────────
  // Panneau Vidéo
  // ─────────────────────────────────────────────────────────────────────────

  const panneauVideo = (
    <div className="flex flex-col gap-3 h-full">
      {/* Cadre vidéo agrandi */}
      <div
        className="flex-1 relative rounded-2xl overflow-hidden border min-h-[350px] lg:min-h-[400px]"
        style={{ backgroundColor: '#0a1217', borderColor: 'var(--bordure)' }}
      >
        {/* Daily.co réel (le conteneur doit toujours rester dans le DOM pour le son) */}
        {!estModeSimule && (
          <div 
            ref={dailyContainerRef} 
            className="absolute inset-0 w-full h-full bg-[#101a22]"
            style={{ display: videoMasquee ? 'none' : 'block' }}
          />
        )}
        
        {/* Bouton Plein écran superposé */}
        {!estModeSimule && !videoMasquee && (
          <button
            onClick={activerPleinEcran}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm transition-colors text-xs font-semibold flex items-center gap-2"
            title="Plein écran"
          >
            <span>⛶</span>
            <span className="hidden sm:inline">Plein écran</span>
          </button>
        )}

        {/* Placeholder connexion en cours / Audio seul */}
        {!estModeSimule && videoMasquee && (
          <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center gap-3 text-white" style={{ backgroundColor: '#0a1217' }}>
            <span className="text-4xl">📻</span>
            <p className="text-sm font-medium text-amber-400">Mode audio seul</p>
          </div>
        )}

        {/* Mode simulé */}
        {estModeSimule && (
          <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#16242e] to-[#0a1217] text-white p-4">
            {/* Badge simulation */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs px-2 py-1 rounded bg-black/50 border border-white/10">
                {seance?.lienVisio ? 'Daily.co' : 'Connexion en cours…'}
              </span>
              {videoMasquee && (
                <span className="text-xs px-2 py-1 rounded bg-amber-600 font-bold animate-pulse">
                  📻 Audio seul
                </span>
              )}
            </div>

            {/* Flux simulés */}
            {!videoMasquee ? (
              <div className="flex-1 grid grid-cols-2 gap-3 items-center">
                {/* Professeur */}
                <div className="relative aspect-video rounded-xl bg-[#1b2b35] border border-gray-700 flex flex-col items-center justify-center overflow-hidden">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all ${
                      indicateurParole ? 'ring-4 ring-green-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: '#0B5E45' }}
                  >
                    PR
                  </div>
                  <span className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 rounded">
                    Professeur
                  </span>
                  {indicateurParole && (
                    <span className="absolute top-1 right-1 text-[10px] bg-green-500 px-1 rounded-full font-bold">
                      🎙
                    </span>
                  )}
                </div>

                {/* Étudiant */}
                <div className="relative aspect-video rounded-xl bg-[#1b2b35] border border-gray-700 flex flex-col items-center justify-center overflow-hidden">
                  {camActive ? (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                      style={{ backgroundColor: '#B8923A' }}
                    >
                      EL
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Caméra off</span>
                  )}
                  <span className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 rounded">
                    {role === 'ELEVE' ? 'Moi' : 'Étudiant'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-4 bg-black/40 rounded-xl border border-amber-500/30">
                  <span className="text-3xl">📻</span>
                  <p className="text-xs text-amber-400 mt-2 font-semibold">Audio uniquement actif</p>
                  <p className="text-[10px] text-gray-300 mt-1">Vidéo suspendue pour économiser la bande passante</p>
                </div>
              </div>
            )}

            {/* Contrôles simulés */}
            {!videoMasquee && (
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  onClick={() => setMicroActif(!microActif)}
                  className={`p-2 rounded-full text-sm transition-colors ${microActif ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}
                  title={microActif ? 'Couper micro' : 'Activer micro'}
                >
                  {microActif ? '🎙️' : '🔇'}
                </button>
                <button
                  onClick={() => setCamActive(!camActive)}
                  className={`p-2 rounded-full text-sm transition-colors ${camActive ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}
                  title={camActive ? 'Couper caméra' : 'Activer caméra'}
                >
                  {camActive ? '📹' : '📷'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barre de contrôles du cours */}
      <div
        className="rounded-2xl border p-4 space-y-3"
        style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
      >
        {/* Mode audio seul (étudiant) */}
        {role === 'ELEVE' && (
          <button
            onClick={() => setModeAudioSeul(!modeAudioSeul)}
            className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium border transition-colors ${
              modeAudioSeul
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'border-[var(--bordure)] text-[var(--texte)]'
            }`}
          >
            {modeAudioSeul ? '📹 Réactiver la vidéo' : '📻 Mode audio seul'}
          </button>
        )}

        {/* Enregistrement (professeur) */}
        {role === 'PROFESSEUR' && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--texte)' }}>
                Enregistrement
              </p>
              <p className="text-[10px]" style={{ color: 'var(--texte-secondaire)' }}>
                {!seance?.enregistrementConsente
                  ? 'Consentement requis'
                  : seance.enregistrementActif
                  ? '● En cours'
                  : 'Prêt'}
              </p>
            </div>
            <button
              onClick={basculerEnregistrement}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                seance?.enregistrementActif ? 'bg-red-600 text-white animate-pulse' : 'btn-secondaire'
              }`}
            >
              {seance?.enregistrementActif ? '⏹ Arrêter' : '▶ Démarrer'}
            </button>
          </div>
        )}

        {/* Rappels pour l'étudiant */}
        {role === 'ELEVE' && (
          <div className="rounded-lg p-3 text-xs space-y-1" style={{ backgroundColor: 'var(--fond)', color: 'var(--texte-secondaire)' }}>
            <p className="font-semibold" style={{ color: 'var(--texte)' }}>Rappels :</p>
            <p>• Seul le professeur contrôle le surlignage du Mushaf</p>
            <p>• En cas de coupure, restez sur la page — reconnexion automatique</p>
          </div>
        )}

        {/* Terminer le cours (seulement pour le professeur) */}
        {role === 'PROFESSEUR' && (
          <button
            onClick={() => setModalTerminer(true)}
            disabled={terminaison}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 transition-colors"
          >
            {terminaison ? 'Clôture en cours…' : '🚪 Terminer le cours'}
          </button>
        )}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Panneau Mushaf
  // ─────────────────────────────────────────────────────────────────────────

  const panneauMushaf = (
    <div className="h-full flex flex-col">
      {/* Badge lecture seule pour l'étudiant */}
      {role === 'ELEVE' && (
        <div
          className="mb-2 px-3 py-2 rounded-xl text-xs font-medium border"
          style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}
        >
          👁 Lecture seule — le professeur contrôle le surlignage
        </div>
      )}
      <div className="flex-1">
        <MushafInteractif
          etat={etatMushaf}
          estProfesseur={estProfesseur}
          surSurlignage={surligner}
        />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Rendu principal
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Script Daily.co */}
      {!estModeSimule && (
        <Script
          src="https://unpkg.com/@daily-co/daily-js"
          strategy="afterInteractive"
          onLoad={() => setSeance((prev) => (prev ? { ...prev } : null))}
        />
      )}

      {/* Barre supérieure */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <IndicateurConnexion statut={statutConnexion} modeRepli={modeRepliActif || modeAudioSeul} />
        <div className="text-xs font-mono" style={{ color: 'var(--texte-secondaire)' }}>
          {reservation ? (
            <>
              {new Date(reservation.creneauDebut).toLocaleString('fr-FR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
              {' → '}
              {new Date(reservation.creneauFin).toLocaleTimeString('fr-FR', { timeStyle: 'short' })}
            </>
          ) : null}
        </div>
      </div>

      {/* ── Onglets MOBILE ─────────────────────────────────────────────── */}
      <div className="lg:hidden flex border-b" style={{ borderColor: 'var(--bordure)' }}>
        {(['VIDEO', 'MUSHAF'] as OngletMobile[]).map((onglet) => (
          <button
            key={onglet}
            onClick={() => setOngletMobile(onglet)}
            className="flex-1 py-2.5 text-sm font-semibold border-b-2 transition-all"
            style={{
              borderColor: ongletMobile === onglet ? '#0B5E45' : 'transparent',
              color: ongletMobile === onglet ? '#0B5E45' : 'var(--texte-secondaire)',
            }}
          >
            {onglet === 'VIDEO' ? '📹 Vidéo' : '📖 Mushaf'}
          </button>
        ))}
      </div>

      {/* ── Layout UNIQUE Responsive ───────────────────────────────────── */}
      <div
        className="flex flex-col lg:flex-row gap-4 w-full"
        style={{ height: 'calc(100dvh - 100px)', minHeight: '500px' }}
      >
        {/* Vidéo — 100% sur mobile (si onglet actif), 60% sur desktop */}
        <div className={`w-full lg:w-[60%] flex-col gap-3 ${ongletMobile === 'VIDEO' ? 'flex flex-1' : 'hidden lg:flex'}`}>
          {panneauVideo}
        </div>

        {/* Mushaf — 100% sur mobile (si onglet actif), 40% sur desktop */}
        <div className={`w-full lg:w-[40%] flex-col ${ongletMobile === 'MUSHAF' ? 'flex flex-1 h-full overflow-hidden' : 'hidden lg:flex overflow-hidden'}`}>
          {panneauMushaf}
        </div>
      </div>

      {/* Modal confirmation terminer */}
      {modalTerminer && (
        <ModalConfirmation
          titre="Terminer le cours ?"
          message={
            role === 'PROFESSEUR'
              ? 'Vous allez clôturer la séance et être redirigé vers le formulaire de suivi pédagogique.'
              : 'Vous allez quitter la salle de classe. Cette action ne peut pas être annulée.'
          }
          boutonConfirmer={terminaison ? 'Clôture…' : 'Terminer'}
          couleurConfirmer="#dc2626"
          onConfirmer={() => { setModalTerminer(false); terminerLeCours(); }}
          onAnnuler={() => setModalTerminer(false)}
        />
      )}
    </div>
  );
}
