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

  useEffect(() => {
    if (!eleveIdAuto) {
      apiClient.get<{ eleveId: string }>(`/reservations/${reservationId}`)
        .then(res => setEleveIdAuto(res.eleveId))
        .catch(() => {});
    }
  }, [reservationId, eleveIdAuto]);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setSucces(null);
    setEnEnvoi(true);
    try {
      // L'API de suivi attend un seanceId. On tente d'abord de récupérer
      // la séance liée à la réservation, sinon on utilise le reservationId directement.
      let idSeance = seanceId ?? '';
      if (!idSeance) {
        try {
          const seance = await apiClient.get<{ id: string }>(`/classe-virtuelle/seances/${reservationId}`);
          idSeance = seance.id;
        } catch {
          throw new Error('Impossible de récupérer la séance, veuillez réessayer.');
        }
      }

      await apiClient.post('/suivi-pedagogique/notes', {
        seanceId: idSeance,
        eleveId: eleveIdAuto ?? reservationId, // Fallback ultime
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
    <form onSubmit={soumettre} className="space-y-5">
      {/* Sourates */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="memorisee" className="etiquette">Sourate mémorisée</label>
          <input
            id="memorisee"
            className="champ"
            placeholder="Ex: Al-Fatiha"
            value={sourateMemorisee}
            onChange={(e) => setSourateMemorisee(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="revisee" className="etiquette">Sourate révisée</label>
          <input
            id="revisee"
            className="champ"
            placeholder="Ex: An-Nas"
            value={sourateRevisee}
            onChange={(e) => setSourateRevisee(e.target.value)}
          />
        </div>
      </div>

      {/* Tajwid */}
      <div>
        <label htmlFor="tajwid" className="etiquette">Points de Tajwid à améliorer</label>
        <textarea
          id="tajwid"
          className="champ"
          rows={2}
          placeholder="Ex: Règles de Noon Sakinah, Idghaam..."
          value={pointsTajwid}
          onChange={(e) => setPointsTajwid(e.target.value)}
        />
      </div>

      {/* Commentaire général */}
      <div>
        <label htmlFor="commentaire" className="etiquette">Commentaire général</label>
        <textarea
          id="commentaire"
          className="champ"
          rows={3}
          placeholder="Progression globale, points forts, recommandations..."
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
        />
      </div>

      {/* Note globale en étoiles */}
      <div>
        <span className="etiquette block mb-2">Note globale de la séance</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setNoteGlobale(val)}
              className="text-3xl transition-transform hover:scale-110"
              style={{ color: val <= noteGlobale ? 'var(--accent)' : 'var(--bordure)' }}
              aria-label={`${val} étoile${val > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
          <span className="self-center text-sm ml-2" style={{ color: 'var(--texte-secondaire)' }}>
            ({noteGlobale}/5)
          </span>
        </div>
      </div>

      {erreur && <p className="text-sm font-medium" role="alert" style={{ color: 'var(--erreur)' }}>{erreur}</p>}
      {succes && <p className="text-sm font-medium" role="status" style={{ color: 'var(--primaire)' }}>{succes}</p>}

      <BoutonPrimaire type="submit" disabled={enEnvoi} pleineLargeur>
        {enEnvoi ? 'Enregistrement…' : 'Enregistrer le suivi'}
      </BoutonPrimaire>
    </form>
  );
}
