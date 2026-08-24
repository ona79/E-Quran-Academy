'use client';

// Formulaire de suivi pédagogique pour une session donnée.
// Compact (1 écran mobile) — le professeur remplit après chaque cours.
import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ErreurApi } from '@/lib/api-client';
import { BoutonPrimaire } from '@/composants/ui/boutons';

interface Props {
  reservationId: string; // ID de la réservation (pas la séance visio)
  eleveId?: string;
  seanceId?: string;
}

export function FormulaireSuivi({ reservationId, eleveId, seanceId }: Props) {
  const router = useRouter();
  const [sourateMemorisee, setSourateMemorisee] = useState('');
  const [sourateRevisee, setSourateRevisee] = useState('');
  const [pointsTajwid, setPointsTajwid] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [noteGlobale, setNoteGlobale] = useState<number>(5);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [eleveIdAuto, setEleveIdAuto] = useState<string | null>(eleveId ?? null);
  const [seanceIdAuto, setSeanceIdAuto] = useState<string | null>(seanceId ?? null);
  const [nomEleve, setNomEleve] = useState<string | null>(null);

  useEffect(() => {
    const chargerInfos = async () => {
      let targetEleveId = eleveIdAuto;
      let targetSeanceId = seanceIdAuto;

      // 1. Tenter via l'API classe virtuelle (marche que reservationId soit un seanceId ou reservationId)
      if (reservationId) {
        try {
          const seanceInfo = await apiClient.get<{ id: string; eleveId: string }>(
            `/classe-virtuelle/seances/${reservationId}`
          );
          if (seanceInfo) {
            if (!targetSeanceId) {
              targetSeanceId = seanceInfo.id;
              setSeanceIdAuto(seanceInfo.id);
            }
            if (!targetEleveId) {
              targetEleveId = seanceInfo.eleveId;
              setEleveIdAuto(seanceInfo.eleveId);
            }
          }
        } catch {
          /* ignore */
        }
      }

      // 2. Si l'élève n'est pas encore trouvé, tenter via l'API réservation
      if (!targetEleveId && reservationId) {
        try {
          const resInfo = await apiClient.get<{ eleveId: string }>(`/reservations/${reservationId}`);
          if (resInfo?.eleveId) {
            targetEleveId = resInfo.eleveId;
            setEleveIdAuto(resInfo.eleveId);
          }
        } catch {
          /* ignore */
        }
      }

      // 3. Charger le nom de l'élève
      if (targetEleveId) {
        try {
          const eleve = await apiClient.get<{ nomComplet: string }>(`/utilisateurs/${targetEleveId}`);
          setNomEleve(eleve.nomComplet);
        } catch {
          setNomEleve('Étudiant');
        }
      }
    };
    chargerInfos();
  }, [reservationId]);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setSucces(null);
    setEnEnvoi(true);
    try {
      const idFinalEleve = eleveIdAuto || eleveId;
      const idFinalSeance = seanceIdAuto || seanceId || reservationId;

      if (!idFinalEleve) {
        throw new Error("Impossible d'identifier l'élève de cette séance.");
      }

      await apiClient.post('/suivi-pedagogique/notes', {
        seanceId: idFinalSeance,
        eleveId: idFinalEleve,
        sourateMemorisee: sourateMemorisee.trim() || undefined,
        sourateRevisee: sourateRevisee.trim() || undefined,
        pointsTajwid: pointsTajwid.trim() || undefined,
        commentaire: commentaire.trim() || undefined,
      });
      setSucces('Suivi enregistré avec succès ! 🎉');
      setTimeout(() => router.push('/professeur/cours'), 1500);
    } catch (err) {
      setErreur(
        err instanceof Error 
          ? err.message 
          : err instanceof ErreurApi 
            ? err.message 
            : 'Impossible d\'enregistrer le suivi'
      );
    } finally {
      setEnEnvoi(false);
    }
  };

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden p-4 sm:p-5 shadow-2xl transition-all duration-300" 
      style={{ backgroundColor: 'var(--fond-surface)', border: '1px solid var(--bordure)' }}
    >
      {/* Éléments décoratifs (glassmorphism/glow) */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#0B5E45] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#B8923A] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-1 tracking-tight" style={{ color: 'var(--texte)' }}>
            Bilan de la séance ✨
          </h2>
          {nomEleve && (
            <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mt-1">
              👤 Élève : {nomEleve}
            </p>
          )}
        </div>

        <form onSubmit={soumettre} className="space-y-5">
          {/* Section Sourates */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="memorisee" className="etiquette !text-[10px] uppercase tracking-wider mb-1 opacity-80 flex items-center gap-1.5">
                📖 Nouvelle Sourate
              </label>
              <input
                id="memorisee"
                className="champ !text-xs !py-1.5 focus:ring-2 transition-shadow"
                style={{ borderColor: 'var(--bordure)' }}
                placeholder="Ex: Al-Fatiha"
                value={sourateMemorisee}
                onChange={(e) => setSourateMemorisee(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="revisee" className="etiquette !text-[10px] uppercase tracking-wider mb-1 opacity-80 flex items-center gap-1.5">
                📖 Sourate Révisée
              </label>
              <input
                id="revisee"
                className="champ !text-xs !py-1.5 focus:ring-2 transition-shadow"
                style={{ borderColor: 'var(--bordure)' }}
                placeholder="Ex: An-Nas"
                value={sourateRevisee}
                onChange={(e) => setSourateRevisee(e.target.value)}
              />
            </div>
          </div>

          {/* Tajwid & Commentaires */}
          <div className="space-y-4">
            <div>
              <label htmlFor="tajwid" className="etiquette !text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1 opacity-80">
                🎯 Points de Tajwid
              </label>
              <textarea
                id="tajwid"
                className="champ !text-xs !py-1.5 resize-none focus:ring-2 transition-shadow"
                rows={1}
                placeholder="Ex: Revoir les règles de Noon Sakinah..."
                value={pointsTajwid}
                onChange={(e) => setPointsTajwid(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="commentaire" className="etiquette !text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1 opacity-80">
                📝 Commentaire général
              </label>
              <textarea
                id="commentaire"
                className="champ !text-xs !py-1.5 resize-none focus:ring-2 transition-shadow"
                rows={1}
                placeholder="Progression, encouragements..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </div>
          </div>

          {/* Note globale en étoiles */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--texte)' }}>Évaluation globale :</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setNoteGlobale(val)}
                  className="text-2xl transition-all duration-300 hover:scale-125 focus:outline-none"
                  style={{ 
                    color: val <= noteGlobale ? '#B8923A' : 'var(--bordure)',
                    filter: val <= noteGlobale ? 'drop-shadow(0 0 5px rgba(184, 146, 58, 0.4))' : 'none'
                  }}
                  aria-label={`${val} étoile${val > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Messages de retour */}
          {erreur && (
            <div className="p-2 rounded-lg border flex items-center gap-2" style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', borderColor: 'rgba(220, 38, 38, 0.2)', color: '#DC2626' }}>
              <span className="text-sm">⚠️</span>
              <p className="text-xs font-medium">{erreur}</p>
            </div>
          )}
          {succes && (
            <div className="p-2 rounded-lg border flex items-center gap-2 animate-pulse" style={{ backgroundColor: 'rgba(22, 163, 74, 0.05)', borderColor: 'rgba(22, 163, 74, 0.2)', color: '#16A34A' }}>
              <span className="text-sm">✅</span>
              <p className="text-xs font-medium">{succes}</p>
            </div>
          )}

          {/* Bouton de soumission */}
          <div className="pt-1">
            <BoutonPrimaire 
              type="submit" 
              disabled={enEnvoi} 
              pleineLargeur 
            >
              <div className="py-0.5 text-sm font-semibold">
                {enEnvoi ? 'Enregistrement...' : 'Valider le suivi'}
              </div>
            </BoutonPrimaire>
          </div>
        </form>
      </div>
    </div>
  );
}
