'use client';

// Suivi pédagogique : liste des notes rédigées + formulaire de fin de cours.
import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { NoteSession, Page, Reservation } from '@/lib/types';
import { formaterDate, formaterDateHeure } from '@/lib/fuseau-horaire';

interface EleveInfo {
  nomComplet: string;
  id: string;
}

type ReservationAvecEleve = Reservation & { nomEleve?: string };

export function SuiviProfesseur() {
  const [notes, setNotes] = useState<NoteSession[]>([]);
  const [reservations, setReservations] = useState<ReservationAvecEleve[]>([]);
  const [eleves, setEleves] = useState<{ id: string; nom: string }[]>([]);

  // Form states
  const [seanceId, setSeanceId] = useState('');
  const [eleveId, setEleveId] = useState('');
  const [sourateMemorisee, setSourateMemorisee] = useState('');
  const [sourateRevisee, setSourateRevisee] = useState('');
  const [pointsTajwid, setPointsTajwid] = useState('');
  const [commentaire, setCommentaire] = useState('');
  
  // Filter state
  const [filtreHistoriqueEleve, setFiltreHistoriqueEleve] = useState('');

  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [enChargement, setEnChargement] = useState(true);

  const chargerDonnees = useCallback(async () => {
    try {
      setEnChargement(true);
      const [notesPage, resPage] = await Promise.all([
        apiClient.get<Page<NoteSession>>('/suivi-pedagogique/notes/moi-professeur?page=1&taille=50').catch(() => ({ donnees: [] as NoteSession[] })),
        apiClient.get<Page<Reservation>>('/reservations/moi-professeur?page=1&taille=100').catch(() => ({ donnees: [] as Reservation[] })),
      ]);
      setNotes(notesPage.donnees);

      // Extraire les étudiants uniques (des réservations ET des notes)
      const elevesIds = Array.from(new Set([
        ...resPage.donnees.map((r) => r.eleveId),
        ...notesPage.donnees.map((n) => n.eleveId)
      ]));
      const cacheEleves: Record<string, string> = {};
      await Promise.all(
        elevesIds.map(async (id) => {
          try {
            const e = await apiClient.get<EleveInfo>(`/utilisateurs/${id}`);
            cacheEleves[id] = e.nomComplet;
          } catch {
            cacheEleves[id] = id.slice(0, 8);
          }
        })
      );

      const resEnrichies = resPage.donnees.map((r) => ({ ...r, nomEleve: cacheEleves[r.eleveId] }));
      setReservations(resEnrichies);
      setEleves(Object.entries(cacheEleves).map(([id, nom]) => ({ id, nom })));
    } catch (err) {
      console.error('Erreur lors du chargement des données', err);
    } finally {
      setEnChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

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
      setSucces('Note de fin de cours enregistrée avec succès 🎉');
      setSeanceId('');
      setEleveId('');
      setSourateMemorisee('');
      setSourateRevisee('');
      setPointsTajwid('');
      setCommentaire('');
      chargerDonnees();
      
      // Masquer le succès après 3 secondes
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Échec de l\'enregistrement de la note.');
    } finally {
      setEnEnvoi(false);
    }
  };

  const seancesFiltrees = reservations
    .filter((r) => r.eleveId === eleveId)
    .sort((a, b) => new Date(b.creneauDebut).getTime() - new Date(a.creneauDebut).getTime());

  const notesFiltrees = filtreHistoriqueEleve 
    ? notes.filter(n => {
        const query = filtreHistoriqueEleve.toLowerCase();
        const nomEleve = eleves.find(e => e.id === n.eleveId)?.nom.toLowerCase() || '';
        return nomEleve.includes(query) || n.eleveId.toLowerCase().includes(query);
      })
    : notes;

  return (
    <div className="space-y-8 w-full">
      {/* Formulaire de fin de cours (Horizontal) */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border" style={{ borderColor: 'var(--bordure)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: 'rgba(27,94,59,0.1)', color: 'var(--primaire)' }}>
              📝
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--texte)' }}>Nouveau Suivi</h2>
              <p className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
                Renseignez la progression après le cours.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {erreur && (
              <span className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600">⚠️ {erreur}</span>
            )}
            {succes && (
              <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700">✅ {succes}</span>
            )}
          </div>
        </div>

        <form onSubmit={soumettre} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
            
            <div className="lg:col-span-1">
              <label htmlFor="eleveId" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Étudiant</label>
              <select
                id="eleveId"
                className="champ text-sm py-2 px-2 h-10 w-full bg-white"
                value={eleveId}
                onChange={(e) => {
                  setEleveId(e.target.value);
                  setSeanceId('');
                }}
                required
                disabled={enChargement}
              >
                <option value="" disabled>-- Choisir --</option>
                {eleves.map((e) => (
                  <option key={e.id} value={e.id}>{e.id.slice(0, 8)}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-1">
              <label htmlFor="seanceId" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Séance</label>
              <select
                id="seanceId"
                className="champ text-sm py-2 px-2 h-10 w-full bg-white disabled:opacity-50"
                value={seanceId}
                onChange={(e) => setSeanceId(e.target.value)}
                required
                disabled={!eleveId || enChargement}
              >
                <option value="" disabled>-- Choisir --</option>
                {seancesFiltrees.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formaterDateHeure(r.creneauDebut).split(' à ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-1">
              <label htmlFor="memorisee" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Mémorisée</label>
              <input
                id="memorisee"
                className="champ text-sm py-2 px-2 h-10 w-full"
                placeholder="Ex: Al-Fatiha"
                value={sourateMemorisee}
                onChange={(e) => setSourateMemorisee(e.target.value)}
              />
            </div>

            <div className="lg:col-span-1">
              <label htmlFor="revisee" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Révisée</label>
              <input
                id="revisee"
                className="champ text-sm py-2 px-2 h-10 w-full"
                placeholder="Ex: An-Nas"
                value={sourateRevisee}
                onChange={(e) => setSourateRevisee(e.target.value)}
              />
            </div>

            <div className="lg:col-span-1">
              <label htmlFor="tajwid" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tajwid</label>
              <input
                id="tajwid"
                className="champ text-sm py-2 px-2 h-10 w-full"
                placeholder="Ex: Qalqalah"
                value={pointsTajwid}
                onChange={(e) => setPointsTajwid(e.target.value)}
              />
            </div>

            <div className="lg:col-span-1">
              <label htmlFor="commentaire" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Commentaire</label>
              <input
                id="commentaire"
                className="champ text-sm py-2 px-2 h-10 w-full"
                placeholder="Courte note..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </div>

            <div className="lg:col-span-1 h-10 flex items-end">
              <button 
                type="submit" 
                disabled={enEnvoi || !eleveId || !seanceId} 
                className="btn-primaire w-full h-10 flex items-center justify-center text-sm px-2 shrink-0 transition-transform active:scale-95"
              >
                {enEnvoi ? '⏳' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Historique des notes avec Filtre */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-8 pb-3" style={{ borderBottom: '1px solid var(--bordure)' }}>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--texte)' }}>
            📚 Historique des suivis
          </h2>
          
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm group focus-within:border-[#0B5E45]" style={{ borderColor: 'var(--bordure)', transition: 'border-color 0.2s' }}>
            <span className="text-gray-400 group-focus-within:text-[#0B5E45] transition-colors text-sm">🔍</span>
            <input
              type="text"
              placeholder="Nom ou ID de l'étudiant..."
              className="champ text-sm py-1 border-none bg-transparent min-w-[180px] sm:min-w-[220px] h-auto focus:ring-0 outline-none w-full"
              value={filtreHistoriqueEleve}
              onChange={(e) => setFiltreHistoriqueEleve(e.target.value)}
            />
          </div>
        </div>

        {enChargement ? (
          <div className="flex justify-center p-8">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primaire)', borderTopColor: 'transparent' }} />
          </div>
        ) : notes.length === 0 ? (
          <div className="carte text-center py-10" style={{ color: 'var(--texte-secondaire)' }}>
            <span className="text-4xl mb-3 block">📭</span>
            Aucune note de suivi enregistrée pour l'instant.
          </div>
        ) : notesFiltrees.length === 0 ? (
          <div className="carte text-center py-10" style={{ color: 'var(--texte-secondaire)' }}>
            <span className="text-4xl mb-3 block">🔍</span>
            Aucun historique trouvé pour cet étudiant.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notesFiltrees.map((n) => (
              <div key={n.id} className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" style={{ borderColor: 'var(--bordure)' }}>
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: 'var(--primaire)' }}></div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--texte)' }}>
                      {(() => {
                        const nom = eleves.find(e => e.id === n.eleveId)?.nom;
                        const isJustId = nom === n.eleveId.slice(0, 8);
                        return isJustId || !nom ? n.eleveId.slice(0, 8) : `${nom} (${n.eleveId.slice(0, 8)})`;
                      })()}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--texte-secondaire)' }}>
                      📝 {formaterDate(n.creeLe)}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 mt-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {n.sourateMemorisee && (
                    <div className="flex items-start gap-1.5">
                      <span className="shrink-0 opacity-60">📖</span>
                      <p><span className="font-medium text-gray-700">Mémorisée:</span> {n.sourateMemorisee}</p>
                    </div>
                  )}
                  {n.sourateRevisee && (
                    <div className="flex items-start gap-1.5">
                      <span className="shrink-0 opacity-60">🔄</span>
                      <p><span className="font-medium text-gray-700">Révisée:</span> {n.sourateRevisee}</p>
                    </div>
                  )}
                  {n.pointsTajwid && (
                    <div className="flex items-start gap-1.5">
                      <span className="shrink-0 opacity-60">🎯</span>
                      <p><span className="font-medium text-gray-700">Tajwid:</span> {n.pointsTajwid}</p>
                    </div>
                  )}
                  {n.commentaire && (
                    <div className="flex items-start gap-1.5 mt-1.5 pt-1.5 border-t border-gray-200">
                      <span className="shrink-0 opacity-60">💡</span>
                      <p className="italic text-gray-600 line-clamp-2" title={n.commentaire}>{n.commentaire}</p>
                    </div>
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
