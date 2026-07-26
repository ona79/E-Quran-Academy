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

    const dateLocale = prochaineDatePourJour(jour);

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
      setSucces('Félicitations ! Votre demande de réservation a été envoyée. Le professeur doit la confirmer.');
      setHeureChoisie('');
      setNote('');
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Échec de la réservation');
    } finally {
      setEnEnvoi(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 1. Cas : Professeur sélectionné -> afficher son panneau de réservation */}
      {professeurSelectionne ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="w-full max-w-xl rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                <h2 className="text-lg font-bold text-[#F0EDE6]">Réserver avec {professeurSelectionne.nomComplet}</h2>
                <p className="text-[11px] text-[#B8923A] mt-0.5">
                  Qiraat : {professeurSelectionne.qiraatParDefaut} · Tarif : {professeurSelectionne.tarifHoraire} FCFA/h
                </p>
              </div>
              <button
                type="button" onClick={annulerSelection}
                className="px-3 py-1.5 text-[10px] rounded-lg border transition-colors shrink-0"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(240,237,230,0.7)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B8923A'; e.currentTarget.style.color = '#B8923A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(240,237,230,0.7)'; }}
              >
                Changer de prof
              </button>
            </div>

            <form onSubmit={soumettre} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="jour" className="block text-[11px] font-medium mb-1.5 text-[#F0EDE6] opacity-70">Jour</label>
                  <select
                    id="jour"
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6' }}
                    onFocus={(e) => (e.currentTarget.style.border = '1px solid #0B5E45')}
                    onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
                    value={jour}
                    onChange={(e) => { setJour(e.target.value as JourSemaine); setHeureChoisie(''); }}
                  >
                    {JOURS.map((j) => <option key={j} value={j} className="bg-[#131F18]">{libelleJour(j)}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="heure" className="block text-[11px] font-medium mb-1.5 text-[#F0EDE6] opacity-70">
                    Heure ({fuseauNavigateur()})
                  </label>
                  {enChargementDispo ? (
                    <p className="text-[11px] py-2 text-[#F0EDE6] opacity-50">Chargement…</p>
                  ) : disposJour.length === 0 ? (
                    <p className="text-[11px] py-2 text-red-400 opacity-80">Aucune dispo</p>
                  ) : (
                    <select
                      id="heure"
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6' }}
                      onFocus={(e) => (e.currentTarget.style.border = '1px solid #0B5E45')}
                      onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
                      value={heureChoisie}
                      onChange={(e) => setHeureChoisie(e.target.value)}
                      required
                    >
                      <option value="" className="bg-[#131F18]">— Choisir —</option>
                      {disposJour.map((d) => (
                        <option key={d.id} value={d.heureDebut} className="bg-[#131F18]">{d.heureDebut} – {d.heureFin}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="note" className="block text-[11px] font-medium mb-1.5 text-[#F0EDE6] opacity-70">Objectif du cours (Optionnel)</label>
                <textarea
                  id="note"
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6' }}
                  onFocus={(e) => (e.currentTarget.style.border = '1px solid #0B5E45')}
                  onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
                  rows={2}
                  maxLength={500}
                  placeholder="Ex: Réviser Tajwid sourate Al-Mulk..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="pt-2 space-y-2">
                {erreur && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ color: '#fca5a5', background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.25)' }}>⚠️ {erreur}</p>}
                {succes && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ color: '#4ade80', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)' }}>✅ {succes}</p>}
                
                <button
                  type="submit" disabled={enEnvoi || !heureChoisie}
                  className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #0B5E45, #B8923A)', opacity: (enEnvoi || !heureChoisie) ? 0.5 : 1 }}
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
          <div className="flex flex-col sm:flex-row gap-3 items-end p-3 rounded-2xl shrink-0" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="qiraatFilter" className="block text-[10px] font-medium mb-1 text-[#F0EDE6] opacity-60">Qiraat</label>
              <select
                id="qiraatFilter"
                className="w-full rounded-lg px-2 py-1.5 text-xs outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6' }}
                value={qiraat}
                onChange={(e) => setQiraat(e.target.value as any)}
              >
                <option value="" className="bg-[#131F18]">Tous</option>
                <option value="HAFS" className="bg-[#131F18]">Hafs</option>
                <option value="WARSH" className="bg-[#131F18]">Warsh</option>
              </select>
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="tarifMaxFilter" className="block text-[10px] font-medium mb-1 text-[#F0EDE6] opacity-60">Tarif max (FCFA/h)</label>
              <input
                id="tarifMaxFilter"
                type="number" step="500" min="0" placeholder="Ex: 5000"
                className="w-full rounded-lg px-2 py-1.5 text-xs outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6' }}
                value={tarifMax}
                onChange={(e) => setTarifMax(e.target.value)}
              />
            </div>

            <button
              type="button" onClick={() => { setQiraat(''); setTarifMax(''); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border shrink-0 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#F0EDE6' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              Réinitialiser
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
            {enChargementProfs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                ))}
              </div>
            ) : professeurs.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border flex flex-col items-center justify-center" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                <p className="text-4xl mb-3 opacity-50">🔍</p>
                <p className="text-sm text-[#F0EDE6] opacity-60">Aucun professeur trouvé pour vos critères.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

/** Calcule la date ISO du prochain jour de la semaine donné. */
function prochaineDatePourJour(jour: JourSemaine): string {
  const cible = JOURS.indexOf(jour) + 1; // LUNDI=1 … DIMANCHE=7 (ISO)
  const aujourdhui = new Date();
  const courant = aujourdhui.getDay() === 0 ? 7 : aujourdhui.getDay();
  let delta = cible - courant;
  if (delta < 0) delta += 7;
  const cibleDate = new Date(aujourdhui);
  cibleDate.setDate(aujourdhui.getDate() + delta);
  return cibleDate.toISOString().slice(0, 10); // YYYY-MM-DD
}


