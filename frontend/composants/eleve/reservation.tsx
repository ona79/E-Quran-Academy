'use client';

// Réservation d'un cours : sélection visuelle du professeur, du jour, de l'heure.
// La conversion de fuseau horaire est gérée côté backend.
import { useEffect, useState, type FormEvent, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { Disponibilite, JourSemaine, ProfilProfesseur } from '@/lib/types';
import { fuseauNavigateur } from '@/lib/fuseau-horaire';
import { libelleJour } from '@/lib/jours';
import { CarteProf } from '@/composants/ui/carte-prof';
import { BoutonPrimaire, BoutonSecondaire } from '@/composants/ui/boutons';
import { toast } from 'sonner';

interface ProfilAvecNom extends ProfilProfesseur {
  nomComplet: string;
  noteMoyenne?: number;
}

const JOURS: JourSemaine[] = [
  'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE',
];

export function ReservationCours() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ID du professeur éventuellement passé dans l'URL (ex: depuis page d'accueil ou liste générale)
  const profIdUrl = searchParams.get('prof');
  
  const [professeurs, setProfesseurs] = useState<ProfilAvecNom[]>([]);
  const [professeurSelectionne, setProfesseurSelectionne] = useState<ProfilAvecNom | null>(null);
  
  // Filtres pour la recherche de professeur
  const [qiraat, setQiraat] = useState<'HAFS' | 'WARSH' | ''>('');
  const [tarifMax, setTarifMax] = useState('');
  const [enChargementProfs, setEnChargementProfs] = useState(false);

  // Disponibilités du prof sélectionné
  const [jour, setJour] = useState<JourSemaine>('LUNDI');
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([]);
  const [heureChoisie, setHeureChoisie] = useState<string>('');
  const [note, setNote] = useState('');
  
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [enChargementDispo, setEnChargementDispo] = useState(false);

  // 1. Charger la liste des professeurs
  const chargerProfesseurs = useCallback(async () => {
    setEnChargementProfs(true);
    try {
      const params = new URLSearchParams();
      if (qiraat) params.set('qiraat', qiraat);
      if (tarifMax) params.set('tarifMax', tarifMax);

      const res = await fetch(`/api-backend/utilisateurs/professeurs?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      const list: ProfilAvecNom[] = Array.isArray(data) ? data : (data.donnees ?? []);
      
      // Enrichir avec note moyenne
      const avecNotes = await Promise.all(
        list.map(async (p) => {
          try {
            const r = await fetch(`/api-backend/avis/professeurs/${p.userId}/moyenne`);
            if (r.ok) {
              const { moyenne } = await r.json();
              return { ...p, noteMoyenne: moyenne > 0 ? moyenne : undefined };
            }
          } catch { /* ignore */ }
          return p;
        })
      );
      setProfesseurs(avecNotes);
    } catch {
      /* ignore */
    } finally {
      setEnChargementProfs(false);
    }
  }, [qiraat, tarifMax]);

  useEffect(() => {
    chargerProfesseurs();
  }, [chargerProfesseurs]);

  // 2. Synchroniser le professeur sélectionné si l'ID change dans l'URL ou si la liste se charge
  useEffect(() => {
    if (profIdUrl) {
      const trouvé = professeurs.find((p) => p.userId === profIdUrl);
      if (trouvé) {
        setProfesseurSelectionne(trouvé);
      } else if (professeurs.length > 0) {
        // Si non trouvé dans la liste filtrée, on tente de le charger en direct
        apiClient.get<any>(`/utilisateurs/professeurs/${profIdUrl}`)
          .then((p) => {
            setProfesseurSelectionne(p);
          })
          .catch(() => {
            setProfesseurSelectionne(null);
          });
      }
    } else {
      setProfesseurSelectionne(null);
    }
  }, [profIdUrl, professeurs]);

  // 3. Charger les dispos du professeur sélectionné
  useEffect(() => {
    if (!professeurSelectionne) {
      setDisponibilites([]);
      return;
    }
    setEnChargementDispo(true);
    setErreur(null);
    apiClient
      .get<{ donnees: Disponibilite[] }>(
        `/reservations/professeurs/${professeurSelectionne.userId}/disponibilites?page=1&taille=50`,
      )
      .then((page) => setDisponibilites(page.donnees))
      .catch(() => setDisponibilites([]))
      .finally(() => setEnChargementDispo(false));
  }, [professeurSelectionne]);

  const disposJour = disponibilites.filter((d) => d.jour === jour);

  const selectionnerProfesseur = (p: ProfilAvecNom) => {
    setSucces(null);
    setErreur(null);
    setHeureChoisie('');
    setNote('');
    // Met à jour l'URL sans recharger la page
    const params = new URLSearchParams(window.location.search);
    params.set('prof', p.userId);
    router.replace(`/eleve/reserver?${params.toString()}`);
  };

  const annulerSelection = () => {
    setProfesseurSelectionne(null);
    const params = new URLSearchParams(window.location.search);
    params.delete('prof');
    router.replace(`/eleve/reserver?${params.toString()}`);
  };

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setSucces(null);

    if (!professeurSelectionne || !heureChoisie) {
      setErreur('Sélectionnez un créneau');
      return;
    }

    const dispoSelectionnee = disposJour.find(d => d.heureDebut === heureChoisie);
    if (!dispoSelectionnee) {
      setErreur('Créneau invalide');
      return;
    }

    const dateLocale = prochaineDatePourJour(jour, dispoSelectionnee.heureDebut);

    setEnEnvoi(true);
    try {
      await apiClient.post('/reservations', {
        professeurId: professeurSelectionne.userId,
        dateLocale,
        heureDebut: dispoSelectionnee.heureDebut,
        heureFin: dispoSelectionnee.heureFin,
        fuseauHoraireEleve: fuseauNavigateur(),
        noteEleve: note || undefined,
      });
      const messageSucces = 'Félicitations ! Votre demande de réservation a été envoyée au professeur.';
      setSucces(messageSucces);
      toast.success(messageSucces);
      setHeureChoisie('');
      setNote('');
    } catch (err) {
      const msgErr = err instanceof ErreurApi ? err.message : 'Échec de la réservation';
      setErreur(msgErr);
      toast.error(msgErr);
    } finally {
      setEnEnvoi(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* 1. Cas : Professeur sélectionné -> afficher son panneau de réservation */}
      {professeurSelectionne ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="w-full max-w-md rounded-2xl p-4 sm:p-5" style={{ background: '#FFFFFF', border: '1px solid var(--bordure)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 border-b pb-3" style={{ borderColor: 'var(--bordure)' }}>
              <div>
                <h2 className="text-base sm:text-lg font-bold" style={{ color: 'var(--texte)' }}>Réserver avec {professeurSelectionne.nomComplet}</h2>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--accent)' }}>
                  Qiraat : {professeurSelectionne.qiraatParDefaut} · Tarif : {professeurSelectionne.tarifHoraire} FCFA/h
                </p>
              </div>
              <button
                type="button" onClick={annulerSelection}
                className="btn-secondaire !text-[10px] !px-3 !py-1.5 w-full sm:w-auto"
              >
                Changer de prof
              </button>
            </div>

            <form onSubmit={soumettre} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label htmlFor="jour" className="etiquette !text-[10px]">Jour</label>
                  <select
                    id="jour"
                    className="champ !text-xs py-1.5"
                    value={jour}
                    onChange={(e) => { setJour(e.target.value as JourSemaine); setHeureChoisie(''); }}
                  >
                    {JOURS.map((j) => <option key={j} value={j}>{libelleJour(j)}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="heure" className="etiquette !text-[10px]">
                    Heure (Fuseau : <span className="font-bold text-[#0B5E45]">{fuseauNavigateur()}</span>)
                  </label>
                  <p className="text-[9px] mb-1.5 leading-tight" style={{ color: 'var(--texte-secondaire)' }}>
                    Converti automatiquement à votre heure.
                  </p>
                  {enChargementDispo ? (
                    <p className="text-[10px] py-1.5" style={{ color: 'var(--texte-secondaire)' }}>Chargement…</p>
                  ) : disposJour.length === 0 ? (
                    <p className="text-[10px] py-1.5" style={{ color: 'var(--erreur)' }}>Aucune dispo</p>
                  ) : (
                    <select
                      id="heure"
                      className="champ !text-xs py-1.5"
                      value={heureChoisie}
                      onChange={(e) => setHeureChoisie(e.target.value)}
                      required
                    >
                      <option value="">— Choisir —</option>
                      {disposJour.map((d) => (
                        <option key={d.id} value={d.heureDebut}>{d.heureDebut} – {d.heureFin}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="note" className="etiquette !text-[10px]">Objectif du cours (Optionnel)</label>
                <textarea
                  id="note"
                  className="champ !text-xs py-1.5 resize-none"
                  rows={2}
                  maxLength={500}
                  placeholder="Ex: Réviser Tajwid sourate Al-Mulk..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="pt-2 space-y-2">
                {erreur && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>⚠️ {erreur}</p>}
                {succes && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ color: '#16A34A', background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.15)' }}>✅ {succes}</p>}
                
                <button
                  type="submit" disabled={enEnvoi || !heureChoisie}
                  className="btn-primaire w-full !text-sm"
                >
                  {enEnvoi ? 'En cours…' : 'Confirmer la réservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // 2. Cas : Aucun professeur sélectionné -> Grille de professeurs avec filtres
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="flex flex-row gap-2 sm:gap-3 items-end p-3 rounded-2xl shrink-0 overflow-x-auto custom-scrollbar" style={{ background: '#FFFFFF', border: '1px solid var(--bordure)' }}>
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="qiraatFilter" className="etiquette !text-[10px]">Qiraat</label>
              <select
                id="qiraatFilter"
                className="champ !text-xs !rounded-lg !px-2 !py-1.5"
                value={qiraat}
                onChange={(e) => setQiraat(e.target.value as any)}
              >
                <option value="">Tous</option>
                <option value="HAFS">Hafs</option>
                <option value="WARSH">Warsh</option>
              </select>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="tarifMaxFilter" className="etiquette !text-[10px]">Tarif max (FCFA/h)</label>
              <input
                id="tarifMaxFilter"
                type="number" step="500" min="0" placeholder="Ex: 5000"
                className="champ !text-xs !rounded-lg !px-2 !py-1.5"
                value={tarifMax}
                onChange={(e) => setTarifMax(e.target.value)}
              />
            </div>

            <button
              type="button" onClick={() => { setQiraat(''); setTarifMax(''); }}
              className="btn-secondaire !text-xs !px-3 !py-1.5"
            >
              Réinitialiser
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
            {enChargementProfs ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--fond-surface-2)' }} />
                ))}
              </div>
            ) : professeurs.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border flex flex-col items-center justify-center" style={{ borderColor: 'var(--bordure)', background: '#FFFFFF' }}>
                <p className="text-4xl mb-3 opacity-50">🔍</p>
                <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>Aucun professeur trouvé pour vos critères.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {professeurs.map((prof) => (
                  <div 
                    key={prof.id} 
                    onClick={() => selectionnerProfesseur(prof)}
                    className="cursor-pointer group h-full"
                  >
                    <CarteProf 
                      profil={prof} 
                      nomComplet={prof.nomComplet} 
                      noteMoyenne={prof.noteMoyenne}
                      lienProfil={`/eleve/professeurs/${prof.userId}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Calcule la date ISO du prochain jour de la semaine donné. Si c'est aujourd'hui mais que l'heure est passée, passe à la semaine suivante. */
function prochaineDatePourJour(jour: JourSemaine, heureDebutStr?: string): string {
  const cible = JOURS.indexOf(jour) + 1; // LUNDI=1 … DIMANCHE=7 (ISO)
  const aujourdhui = new Date();
  const courant = aujourdhui.getDay() === 0 ? 7 : aujourdhui.getDay();
  let delta = cible - courant;
  
  if (delta <= 0) {
    // Si la cible est un jour précédent dans la semaine, c'est pour la semaine prochaine.
    // Si c'est aujourd'hui (delta === 0), on considère que c'est pour aujourd'hui (le backend rejettera si c'est dans le passé).
    if (delta < 0) {
      delta += 7;
    }
  }

  const cibleDate = new Date(aujourdhui);
  cibleDate.setDate(aujourdhui.getDate() + delta);
  const yyyy = cibleDate.getFullYear();
  const mm = String(cibleDate.getMonth() + 1).padStart(2, '0');
  const dd = String(cibleDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}


