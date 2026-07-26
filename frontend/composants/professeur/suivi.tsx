'use client';

// Suivi pédagogique : liste des notes rédigées + formulaire de fin de cours.
// Le professeur renseigne sourate mémorisée/révisée et points de tajwid.
import { useEffect, useState, type FormEvent } from 'react';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { NoteSession, Page } from '@/lib/types';
import { formaterDate } from '@/lib/fuseau-horaire';

export function SuiviProfesseur() {
  const [notes, setNotes] = useState<NoteSession[]>([]);
  const [seanceId, setSeanceId] = useState('');
  const [eleveId, setEleveId] = useState('');
  const [sourateMemorisee, setSourateMemorisee] = useState('');
  const [sourateRevisee, setSourateRevisee] = useState('');
  const [pointsTajwid, setPointsTajwid] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [enChargement, setEnChargement] = useState(true);

  const charger = () => {
    apiClient
      .get<Page<NoteSession>>('/suivi-pedagogique/notes/moi-professeur?page=1&taille=20')
      .then((p) => setNotes(p.donnees))
      .finally(() => setEnChargement(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setSucces(null);
    setEnEnvoi(true);
    try {
      await apiClient.post('/suivi-pedagogique/notes', {
        seanceId,
        eleveId,
        sourateMemorisee: sourateMemorisee || undefined,
        sourateRevisee: sourateRevisee || undefined,
        pointsTajwid: pointsTajwid || undefined,
        commentaire: commentaire || undefined,
      });
      setSucces('Note de fin de cours enregistrée.');
      setSeanceId('');
      setEleveId('');
      setSourateMemorisee('');
      setSourateRevisee('');
      setPointsTajwid('');
      setCommentaire('');
      charger();
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Échec');
    } finally {
      setEnEnvoi(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulaire de fin de cours */}
      <section className="carte max-w-2xl">
        <h2 className="font-semibold mb-1">Formulaire de fin de cours</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--texte-secondaire)' }}>
          Renseignez la progression de l'élève après chaque séance.
        </p>
        <form onSubmit={soumettre} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="seanceId" className="etiquette">Identifiant de la séance</label>
              <input id="seanceId" className="champ" value={seanceId} onChange={(e) => setSeanceId(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="eleveId" className="etiquette">Identifiant de l'élève</label>
              <input id="eleveId" className="champ" value={eleveId} onChange={(e) => setEleveId(e.target.value)} required />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="memorisee" className="etiquette">Sourate mémorisée</label>
              <input id="memorisee" className="champ" placeholder="Al-Fatiha" value={sourateMemorisee} onChange={(e) => setSourateMemorisee(e.target.value)} />
            </div>
            <div>
              <label htmlFor="revisee" className="etiquette">Sourate révisée</label>
              <input id="revisee" className="champ" placeholder="An-Nas" value={sourateRevisee} onChange={(e) => setSourateRevisee(e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor="tajwid" className="etiquette">Points de tajwid travaillés</label>
            <input id="tajwid" className="champ" placeholder="Règles de Noon Sakinah" value={pointsTajwid} onChange={(e) => setPointsTajwid(e.target.value)} />
          </div>

          <div>
            <label htmlFor="commentaire" className="etiquette">Commentaire</label>
            <textarea id="commentaire" className="champ" rows={3} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
          </div>

          {erreur && <p className="text-sm" style={{ color: 'var(--erreur)' }}>{erreur}</p>}
          {succes && <p className="text-sm" style={{ color: 'var(--primaire)' }}>{succes}</p>}

          <button type="submit" disabled={enEnvoi} className="btn-primaire">
            {enEnvoi ? 'Enregistrement…' : 'Enregistrer la note'}
          </button>
        </form>
      </section>

      {/* Historique des notes */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Notes rédigées</h2>
        {enChargement ? (
          <p style={{ color: 'var(--texte-secondaire)' }}>Chargement…</p>
        ) : notes.length === 0 ? (
          <p className="carte" style={{ color: 'var(--texte-secondaire)' }}>
            Aucune note pour l'instant.
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="carte">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{formaterDate(n.creeLe)}</p>
                  <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
                    Élève : {n.eleveId.slice(0, 8)}…
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  {n.sourateMemorisee && (
                    <p><span style={{ color: 'var(--texte-secondaire)' }}>Mémorisée :</span> {n.sourateMemorisee}</p>
                  )}
                  {n.sourateRevisee && (
                    <p><span style={{ color: 'var(--texte-secondaire)' }}>Révisée :</span> {n.sourateRevisee}</p>
                  )}
                  {n.pointsTajwid && (
                    <p className="sm:col-span-2"><span style={{ color: 'var(--texte-secondaire)' }}>Tajwid :</span> {n.pointsTajwid}</p>
                  )}
                  {n.commentaire && (
                    <p className="sm:col-span-2"><span style={{ color: 'var(--texte-secondaire)' }}>Commentaire :</span> {n.commentaire}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
