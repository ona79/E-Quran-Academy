'use client';

// Accès cours : liste les séances de l'étudiant par onglets (À venir, En attente, Passés).
// Permet d'annuler un cours (> 12h avant) ou de laisser un avis sur un cours passé.
import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { Page, Reservation } from '@/lib/types';
import { CarteCoursEleve } from './carte-cours-eleve';
import { ModalConfirmation } from '@/composants/ui/modal-confirmation';
import { toast } from 'sonner';

interface ProfInfo {
  nomComplet: string;
  userId: string;
}

type ReservationAvecProf = Reservation & { nomProf?: string };

type Onglet = 'A_VENIR' | 'EN_ATTENTE' | 'PASSES';

export function AccesClasseEleve() {
  const [reservations, setReservations] = useState<ReservationAvecProf[]>([]);
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ongletActif, setOngletActif] = useState<Onglet>('A_VENIR');

  // Modal de suppression cours
  const [coursASupprimer, setCoursASupprimer] = useState<string | null>(null);
  const [enSuppression, setEnSuppression] = useState(false);

  // État pour la modal d'avis
  const [avisTarget, setAvisTarget] = useState<ReservationAvecProf | null>(null);
  const [note, setNote] = useState<number>(5);
  const [commentaire, setCommentaire] = useState('');
  const [envoiAvis, setEnvoiAvis] = useState(false);
  const [succesAvis, setSuccesAvis] = useState<string | null>(null);
  const [erreurAvis, setErreurAvis] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setEnChargement(true);
    try {
      const page = await apiClient.get<Page<Reservation>>('/reservations/moi?page=1&taille=100');
      const donnees = page.donnees;

      // Récupérer les noms des profs uniques pour limiter les requêtes
      const profsIds = Array.from(new Set(donnees.map((r) => r.professeurId)));
      const cacheProfs: Record<string, string> = {};
      
      await Promise.all(
        profsIds.map(async (id) => {
          try {
            const prof = await apiClient.get<ProfInfo>(`/utilisateurs/professeurs/${id}`);
            cacheProfs[id] = prof.nomComplet;
          } catch {
            cacheProfs[id] = `Professeur ${id.slice(0, 8)}`;
          }
        })
      );

      const enrichies = donnees.map((r) => ({
        ...r,
        nomProf: cacheProfs[r.professeurId]
      }));

      setReservations(enrichies);
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'Erreur de chargement');
    } finally {
      setEnChargement(false);
    }
  }, []);

  const meChangerSupprimer = async () => {
    if (!coursASupprimer) return;
    setEnSuppression(true);
    try {
      await apiClient.delete(`/reservations/${coursASupprimer}`);
      setReservations((prev) => prev.filter((r) => r.id !== coursASupprimer));
      toast.success('Cours supprimé définitivement');
    } catch {
      toast.error('Erreur lors de la suppression du cours');
    } finally {
      setEnSuppression(false);
      setCoursASupprimer(null);
    }
  };

  useEffect(() => {
    charger();
  }, [charger]);

  // Action annuler
  const gererAnnuler = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce cours ? (Cette action est irréversible)')) return;
    try {
      await apiClient.patch(`/reservations/${id}/statut`, {
        nouveauStatut: 'ANNULE',
      });
      alert('Cours annulé avec succès.');
      charger();
    } catch (e) {
      alert(e instanceof ErreurApi ? e.message : 'Impossible d\'annuler le cours');
    }
  };

  // Soumettre avis
  const soumettreAvis = async (e: FormEvent) => {
    e.preventDefault();
    if (!avisTarget) return;
    setEnvoiAvis(true);
    setSuccesAvis(null);
    setErreurAvis(null);
    try {
      await apiClient.post('/avis', {
        professeurId: avisTarget.professeurId,
        note,
        commentaire: commentaire.trim() || undefined,
      });
      setSuccesAvis('Merci ! Votre avis a été enregistré.');
      setCommentaire('');
      setNote(5);
      setTimeout(() => {
        setAvisTarget(null);
        setSuccesAvis(null);
        setErreurAvis(null);
      }, 1500);
    } catch (err) {
      setErreurAvis(err instanceof ErreurApi ? err.message : 'Impossible d\'enregistrer l\'avis');
    } finally {
      setEnvoiAvis(false);
    }
  };

  // Filtrage par onglet
  const aVenir = reservations.filter((r) => r.statut === 'CONFIRME');
  const enAttente = reservations.filter((r) => r.statut === 'EN_ATTENTE');
  const passes = reservations.filter((r) => r.statut === 'REALISE' || r.statut === 'ABSENT' || r.statut === 'ANNULE');

  const listeAffichee = 
    ongletActif === 'A_VENIR' ? aVenir :
    ongletActif === 'EN_ATTENTE' ? enAttente : passes;

  if (enChargement) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--fond-surface)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModalConfirmation
        ouvert={!!coursASupprimer}
        titre="Supprimer définitivement le cours :"
        libelleConfirmer="Supprimer"
        enChargement={enSuppression}
        surConfirmation={meChangerSupprimer}
        surFermeture={() => setCoursASupprimer(null)}
      />

      {erreur && (
        <p className="carte" style={{ color: 'var(--erreur)' }}>{erreur}</p>
      )}

      {/* Onglets */}
      <div className="flex border-b" style={{ borderColor: 'var(--bordure)' }}>
        {[
          { key: 'A_VENIR', libelle: 'À venir', count: aVenir.length },
          { key: 'EN_ATTENTE', libelle: 'En attente', count: enAttente.length },
          { key: 'PASSES', libelle: 'Passés', count: passes.length },
        ].map((o) => (
          <button
            key={o.key}
            onClick={() => setOngletActif(o.key as Onglet)}
            className="flex-1 py-3 text-sm font-semibold border-b-2 transition-all"
            style={{
              borderColor: ongletActif === o.key ? 'var(--couleur-primaire)' : 'transparent',
              color: ongletActif === o.key ? 'var(--couleur-primaire)' : 'var(--texte-secondaire)',
            }}
          >
            {o.libelle} ({o.count})
          </button>
        ))}
      </div>

      {/* Liste des cours de l'onglet actif */}
      {listeAffichee.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border" style={{ borderColor: 'var(--bordure)' }}>
          <p className="text-4xl mb-2">🎓</p>
          <p style={{ color: 'var(--texte-secondaire)' }}>Aucun cours dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listeAffichee.map((r) => (
            <CarteCoursEleve
              key={r.id}
              reservation={r}
              nomProf={r.nomProf}
              onAnnuler={gererAnnuler}
              onAvis={(res) => setAvisTarget(res as any)}
              onSupprimer={(id) => setCoursASupprimer(id)}
            />
          ))}
        </div>
      )}

      {/* Modal pour laisser un avis */}
      {avisTarget && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={() => setAvisTarget(null)}
            aria-hidden
          />
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-7 rounded-3xl"
            style={{ 
              background: '#FFFFFF', 
              border: '1px solid var(--bordure)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            }}
          >
            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--texte)' }}>Évaluer le cours</h3>
            <p className="text-xs mb-6" style={{ color: 'var(--texte-secondaire)' }}>
              Partagez votre expérience avec {avisTarget.nomProf}
            </p>

            {succesAvis ? (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center text-xl" style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', color: '#16A34A' }}>
                  ✓
                </div>
                <p className="text-sm font-medium" style={{ color: '#16A34A' }}>
                  {succesAvis}
                </p>
              </div>
            ) : (
              <form onSubmit={soumettreAvis} className="space-y-5">
                <div>
                  <label className="etiquette">Note globale</label>
                  <div className="flex gap-2 text-3xl">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNote(val)}
                        className="transition-transform hover:scale-110"
                        style={{ 
                          color: val <= note ? '#B8923A' : '#E5E0D5',
                          textShadow: val <= note ? '0 0 12px rgba(184,146,58,0.3)' : 'none'
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {erreurAvis && (
                  <div className="p-3 rounded-lg text-sm font-medium" style={{ background: 'rgba(220,38,38,0.06)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>
                    {erreurAvis}
                  </div>
                )}

                <div>
                  <label htmlFor="commentaire" className="etiquette">
                    Commentaire <span className="opacity-50">(Optionnel)</span>
                  </label>
                  <textarea
                    id="commentaire"
                    className="champ resize-none"
                    rows={3}
                    placeholder="Qu'avez-vous pensé de la pédagogie ?"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAvisTarget(null)}
                    className="btn-secondaire flex-1"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={envoiAvis}
                    className="btn-primaire flex-[2]"
                  >
                    {envoiAvis ? 'Envoi...' : "Envoyer l'avis"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
