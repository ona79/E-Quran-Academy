'use client';

// Gestion des disponibilités récurrentes et ponctuelles : le professeur ajoute/supprime
// ses créneaux sur un calendrier hebdomadaire 7 jours.
// Toggle de réservation instantanée.
// Grille responsive : 7 colonnes sur desktop, onglets par jour sur mobile.
import { useEffect, useState, type FormEvent } from 'react';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { Disponibilite, JourSemaine, ProfilProfesseur } from '@/lib/types';
import { libelleJour } from '@/lib/jours';
import { BoutonPrimaire, BoutonSecondaire } from '@/composants/ui/boutons';

const JOURS: JourSemaine[] = [
  'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE',
];

export function DisponibilitesProfesseur() {
  const [dispos, setDispos] = useState<Disponibilite[]>([]);
  const [profil, setProfil] = useState<ProfilProfesseur | null>(null);
  
  // États de chargement et d'erreurs
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [enChargement, setEnChargement] = useState(true);

  // État de la modal d'ajout
  const [modalOuverte, setModalOuverte] = useState(false);
  const [modalJour, setModalJour] = useState<JourSemaine>('LUNDI');
  const [heureDebut, setHeureDebut] = useState('09:00');
  const [heureFin, setHeureFin] = useState('10:00');
  const [estRecurrent, setEstRecurrent] = useState(true);
  const [noteDispo, setNoteDispo] = useState('');

  // Jour actif pour la vue mobile (onglet sélectionné)
  const [jourActifMobile, setJourActifMobile] = useState<JourSemaine>('LUNDI');

  // État de la modal de suppression
  const [creneauASupprimer, setCreneauASupprimer] = useState<string | null>(null);
  const [enSuppression, setEnSuppression] = useState(false);

  const charger = () => {
    Promise.all([
      apiClient.get<{ donnees: Disponibilite[] }>('/reservations/professeurs/moi/disponibilites?page=1&taille=100').catch(() => null),
      apiClient.get<ProfilProfesseur>('/utilisateurs/professeurs/moi').catch(() => null),
    ])
      .then(([page, p]) => {
        if (page) setDispos(page.donnees);
        if (p) setProfil(p);
      })
      .finally(() => setEnChargement(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const ouvrirModalAjout = (j: JourSemaine) => {
    setModalJour(j);
    setModalOuverte(true);
    setSucces(null);
    setErreur(null);
  };

  const ajouterCreneau = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setSucces(null);
    setEnEnvoi(true);

    if (heureDebut >= heureFin) {
      setErreur('L\'heure de fin doit être postérieure à l\'heure de début.');
      setEnEnvoi(false);
      return;
    }

    try {
      await apiClient.post('/reservations/disponibilites', {
        jour: modalJour,
        heureDebut,
        heureFin,
        recurrence: estRecurrent ? 'HEBDOMADAIRE' : 'PONCTUELLE',
        note: noteDispo.trim() || undefined,
      });
      setSucces('Créneau de disponibilité ajouté avec succès !');
      setModalOuverte(false);
      setNoteDispo('');
      charger();
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Échec de l\'ajout du créneau');
    } finally {
      setEnEnvoi(false);
    }
  };

  const confirmerSuppression = (id: string) => {
    setCreneauASupprimer(id);
    setErreur(null);
    setSucces(null);
  };

  const supprimerCreneau = async () => {
    if (!creneauASupprimer) return;
    setEnSuppression(true);
    try {
      await apiClient.supprimer(`/reservations/disponibilites/${creneauASupprimer}`);
      setDispos((d) => d.filter((x) => x.id !== creneauASupprimer));
      setSucces('Créneau supprimé avec succès.');
      setCreneauASupprimer(null);
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Échec de la suppression');
    } finally {
      setEnSuppression(false);
    }
  };

  const basculerInstantanee = async (active: boolean) => {
    try {
      const maj = await apiClient.patch<ProfilProfesseur>(
        '/utilisateurs/professeurs/moi',
        { reservationInstantanee: active },
      );
      setProfil(maj);
    } catch {
      setErreur('Impossible de modifier la réservation instantanée');
    }
  };

  if (enChargement) {
    return (
      <div className="flex justify-center items-center py-12">
        <p style={{ color: 'var(--texte-secondaire)' }}>Chargement de vos créneaux…</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {erreur && (
        <div className="carte text-sm font-semibold shrink-0" style={{ color: '#fca5a5', background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.25)' }}>
          ⚠️ {erreur}
        </div>
      )}

      {/* Réservation instantanée */}
      <section className="rounded-2xl p-4 shrink-0 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="pr-4">
          <h2 className="font-bold text-sm text-[#F0EDE6]">Réservation instantanée</h2>
          <p className="text-[11px] mt-1 text-[#F0EDE6] opacity-50">
            Confirmations automatiques sans validation manuelle.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={profil?.reservationInstantanee ?? false}
          onClick={() => basculerInstantanee(!(profil?.reservationInstantanee ?? false))}
          className="relative w-11 h-6 rounded-full transition-all shrink-0"
          style={{
            backgroundColor: profil?.reservationInstantanee ? '#0B5E45' : 'rgba(255,255,255,0.1)',
          }}
        >
          <span
            className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform"
            style={{ transform: profil?.reservationInstantanee ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
      </section>

      {/* Calendrier 7 Jours */}
      <section className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#F0EDE6]">Calendrier hebdomadaire</h2>
            <p className="text-[11px] text-[#F0EDE6] opacity-50">
              Configurez vos créneaux. Cliquez pour supprimer.
            </p>
          </div>
        </div>

        {/* VUE DESKTOP : Grille 7 colonnes alignées en haut, scroll global si nécessaire */}
        <div className="hidden md:grid grid-cols-7 gap-2 flex-1 min-h-0 items-start overflow-y-auto pr-2 custom-scrollbar pb-4">
          {JOURS.map((j) => {
            const creneauxJour = dispos
              .filter((d) => d.jour === j)
              .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
            
            return (
              <div 
                key={j} 
                className="flex flex-col rounded-2xl p-2 h-fit"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="border-b pb-2 mb-2 text-center shrink-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="font-bold text-[11px] uppercase text-[#B8923A]">
                    {libelleJour(j).slice(0, 3)}
                  </p>
                  <p className="text-[9px] text-[#F0EDE6] opacity-40">
                    {creneauxJour.length} créneau{creneauxJour.length > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Créneaux */}
                <div className="flex flex-col space-y-1.5">
                  {creneauxJour.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => confirmerSuppression(c.id)}
                      className="w-full text-center py-1.5 rounded-lg text-[10px] font-semibold border transition-all hover:bg-red-900/30 hover:border-red-500 hover:text-red-300"
                      style={{
                        background: 'rgba(11,94,69,0.2)',
                        borderColor: 'rgba(11,94,69,0.5)',
                        color: '#F0EDE6'
                      }}
                      title="Cliquez pour supprimer"
                    >
                      {c.heureDebut} - {c.heureFin}
                      {c.recurrence === 'PONCTUELLE' && <span className="block text-[8px] opacity-60">Ponctuel</span>}
                    </button>
                  ))}
                </div>

                {/* Bouton d'ajout */}
                <button
                  type="button"
                  onClick={() => ouvrirModalAjout(j)}
                  className="w-full mt-2 py-1.5 rounded-lg border border-dashed text-[10px] font-medium transition-colors shrink-0"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#F0EDE6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B8923A'; e.currentTarget.style.color = '#B8923A'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#F0EDE6'; }}
                >
                  + Ajouter
                </button>
              </div>
            );
          })}
        </div>

        {/* VUE MOBILE : Liste par onglets (sans grille) */}
        <div className="md:hidden flex-1 flex flex-col min-h-0">
          {/* Sélecteur de jour horizontal (scroll) */}
          <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-none">
            {JOURS.map((j) => {
              const count = dispos.filter((d) => d.jour === j).length;
              const actif = jourActifMobile === j;
              return (
                <button
                  key={j}
                  type="button"
                  onClick={() => setJourActifMobile(j)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 transition-all"
                  style={{
                    background: actif ? '#0B5E45' : 'rgba(255,255,255,0.03)',
                    color: actif ? '#FFF' : 'rgba(240,237,230,0.6)',
                    borderColor: actif ? '#0B5E45' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {libelleJour(j).slice(0, 3)} ({count})
                </button>
              );
            })}
          </div>

          {/* Liste des créneaux pour le jour sélectionné */}
          <div className="flex-1 overflow-y-auto rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex justify-between items-center pb-2 border-b mb-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <span className="font-bold text-xs text-[#B8923A]">{libelleJour(jourActifMobile)}</span>
              <button 
                type="button" 
                onClick={() => ouvrirModalAjout(jourActifMobile)} 
                className="px-2 py-1 text-[10px] rounded bg-[#0B5E45] text-white"
              >
                + Ajouter
              </button>
            </div>

            {dispos.filter((d) => d.jour === jourActifMobile).length === 0 ? (
              <p className="text-xs italic text-center py-6 text-[#F0EDE6] opacity-40">
                Aucune disponibilité définie.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {dispos
                  .filter((d) => d.jour === jourActifMobile)
                  .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => confirmerSuppression(c.id)}
                      className="text-center p-2 rounded-xl text-[10px] font-bold border flex flex-col items-center justify-center transition-all hover:bg-red-900/30 hover:border-red-500 hover:text-red-300"
                      style={{
                        background: 'rgba(11,94,69,0.2)',
                        borderColor: 'rgba(11,94,69,0.5)',
                        color: '#F0EDE6'
                      }}
                    >
                      <span>{c.heureDebut} - {c.heureFin}</span>
                      {c.recurrence === 'PONCTUELLE' && <span className="text-[8px] opacity-60 font-normal">Ponctuel</span>}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal d'ajout de créneau */}
      {modalOuverte && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setModalOuverte(false)} aria-hidden />
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--fond-surface)', borderColor: 'var(--bordure)' }}
          >
            <h3 className="text-base font-bold mb-1">Ajouter une disponibilité</h3>
            <p className="text-[10px] mb-4" style={{ color: 'var(--texte-secondaire)' }}>
              Définissez une heure de début et de fin.
            </p>

            <form onSubmit={ajouterCreneau} className="space-y-4">
              <div>
                <label htmlFor="modalJour" className="etiquette">Jour</label>
                <select 
                  id="modalJour" 
                  className="champ text-xs" 
                  value={modalJour} 
                  onChange={(e) => setModalJour(e.target.value as JourSemaine)}
                  style={{ colorScheme: 'dark' }}
                >
                  {JOURS.map((j) => (
                    <option key={j} value={j} className="bg-[#131F18] text-[#F0EDE6]">
                      {libelleJour(j)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modalDebut" className="etiquette">Début</label>
                  <input 
                    id="modalDebut" 
                    type="time" 
                    className="champ text-xs" 
                    value={heureDebut} 
                    onChange={(e) => setHeureDebut(e.target.value)} 
                    required
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label htmlFor="modalFin" className="etiquette">Fin</label>
                  <input 
                    id="modalFin" 
                    type="time" 
                    className="champ text-xs" 
                    value={heureFin} 
                    onChange={(e) => setHeureFin(e.target.value)} 
                    required
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {/* Récurrent ou Ponctuel */}
              <div>
                <label className="etiquette">Type de créneau</label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setEstRecurrent(true)}
                    className="flex-1 py-1.5 border rounded-lg text-xs font-semibold"
                    style={{
                      borderColor: estRecurrent ? 'var(--couleur-primaire)' : 'var(--bordure)',
                      backgroundColor: estRecurrent ? 'rgba(11,94,69,0.05)' : 'transparent',
                      color: estRecurrent ? 'var(--couleur-primaire)' : 'var(--texte)'
                    }}
                  >
                    Récurrent
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstRecurrent(false)}
                    className="flex-1 py-1.5 border rounded-lg text-xs font-semibold"
                    style={{
                      borderColor: !estRecurrent ? 'var(--couleur-primaire)' : 'var(--bordure)',
                      backgroundColor: !estRecurrent ? 'rgba(11,94,69,0.05)' : 'transparent',
                      color: !estRecurrent ? 'var(--couleur-primaire)' : 'var(--texte)'
                    }}
                  >
                    Une seule fois
                  </button>
                </div>
              </div>

              {/* Note optionnelle */}
              <div>
                <label htmlFor="modalNote" className="etiquette">Note optionnelle</label>
                <input
                  id="modalNote"
                  className="champ text-xs"
                  placeholder="Ex: Uniquement pour récitation"
                  value={noteDispo}
                  onChange={(e) => setNoteDispo(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <BoutonSecondaire type="button" onClick={() => setModalOuverte(false)} className="flex-1 text-xs">
                  Annuler
                </BoutonSecondaire>
                <BoutonPrimaire type="submit" disabled={enEnvoi} className="flex-[2] text-xs">
                  {enEnvoi ? 'Envoi…' : 'Ajouter'}
                </BoutonPrimaire>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Modal de suppression de créneau */}
      {creneauASupprimer && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setCreneauASupprimer(null)} aria-hidden />
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm p-6 rounded-3xl text-center"
            style={{ 
              background: 'rgba(13,26,20,0.95)', 
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              🗑️
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#F0EDE6' }}>Supprimer ce créneau ?</h3>
            <p className="text-xs mb-6" style={{ color: 'rgba(240,237,230,0.6)' }}>
              Cette action retirera ce créneau de vos disponibilités. Les réservations existantes ne seront pas annulées.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCreneauASupprimer(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(240,237,230,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={supprimerCreneau}
                disabled={enSuppression}
                className="flex-[2] py-2.5 rounded-xl text-sm font-semibold transition-opacity shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444, #991b1b)', 
                  opacity: enSuppression ? 0.6 : 1,
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                }}
              >
                {enSuppression ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
