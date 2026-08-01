'use client';

// Messagerie asynchrone : boîte de réception + conversation.
// L'étudiant voit les messages, ouvre une conversation et peut répondre.
// Gère l'affichage responsive (liste seule -> clic -> conversation sur mobile).
import { useEffect, useRef, useState, type FormEvent, useCallback } from 'react';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { Message, Page } from '@/lib/types';
import { formaterDateHeure } from '@/lib/fuseau-horaire';
import { utiliserAuth } from '@/composants/auth/fournisseur-auth';

interface ProfInfo {
  nomComplet: string;
  userId: string;
}

export function MessagerieEleve() {
  const { utilisateur } = utiliserAuth();
  const monId = utilisateur?.id ?? '';

  const [boiteReception, setBoiteReception] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [interlocuteurId, setInterlocuteurId] = useState<string | null>(null);
  const [cacheNoms, setCacheNoms] = useState<Record<string, string>>({});
  const [contenu, setContenu] = useState('');
  const [enChargement, setEnChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const basRef = useRef<HTMLDivElement>(null);

  // Charger le nom d'un professeur et le mettre en cache
  const chargerNomProf = useCallback(async (id: string) => {
    if (cacheNoms[id]) return cacheNoms[id];
    try {
      const prof = await apiClient.get<ProfInfo>(`/utilisateurs/professeurs/${id}`);
      setCacheNoms((prev) => ({ ...prev, [id]: prof.nomComplet }));
      return prof.nomComplet;
    } catch {
      const nomF = `Professeur ${id.slice(0, 8)}`;
      setCacheNoms((prev) => ({ ...prev, [id]: nomF }));
      return nomF;
    }
  }, [cacheNoms]);

  // Charger la boîte de réception
  const chargerBoite = useCallback(async (silencieux = false) => {
    if (!silencieux) setEnChargement(true);
    try {
      const page = await apiClient.get<Page<Message>>('/messagerie/messages/recus?page=1&taille=50');
      setBoiteReception(page.donnees);
      
      // Charger les noms des profs en arrière plan
      const idsUniques = Array.from(new Set(page.donnees.map((m) => m.expediteurId)));
      idsUniques.forEach((id) => chargerNomProf(id));
    } catch (e) {
      if (!silencieux) {
        setErreur(e instanceof ErreurApi ? e.message : 'Erreur de chargement');
      }
    } finally {
      if (!silencieux) setEnChargement(false);
    }
  }, [chargerNomProf]);

  // Charger la conversation active
  const chargerConversation = useCallback(async (idDest: string) => {
    try {
      const page = await apiClient.get<Page<Message>>(`/messagerie/conversations/${idDest}?page=1&taille=100`);
      // Le message le plus ancien d'abord pour l'affichage chronologique
      const trie = page.donnees.sort((a, b) => new Date(a.horodatage).getTime() - new Date(b.horodatage).getTime());
      setConversation(trie);
      
      // Marquer comme lus les messages reçus de cet interlocuteur
      const nonLus = trie.filter((m) => m.destinataireId === monId && !m.lu);
      if (nonLus.length > 0) {
        await Promise.all(
          nonLus.map((m) => apiClient.patch(`/messagerie/messages/${m.id}/lu`))
        );
        // Mettre à jour la boîte
        const majBoite = await apiClient.get<Page<Message>>('/messagerie/messages/recus?page=1&taille=50');
        setBoiteReception(majBoite.donnees);
      }
    } catch {
      // ignore
    }
  }, [monId]);

  // Polling de la boîte de réception toutes les 30 secondes
  useEffect(() => {
    chargerBoite();
    const intervalle = setInterval(() => {
      chargerBoite(true);
    }, 30000);
    return () => clearInterval(intervalle);
  }, [chargerBoite]);

  // Polling de la conversation active toutes les 30 secondes
  useEffect(() => {
    if (!interlocuteurId) return;

    chargerConversation(interlocuteurId);
    setTimeout(() => {
      basRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const intervalle = setInterval(() => {
      chargerConversation(interlocuteurId);
    }, 30000);

    return () => clearInterval(intervalle);
  }, [interlocuteurId, chargerConversation]);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    if (!interlocuteurId || !contenu.trim()) return;
    setEnEnvoi(true);
    setErreur(null);
    try {
      const message = await apiClient.post<Message>('/messagerie/messages', {
        destinataireId: interlocuteurId,
        contenu: contenu.trim(),
      });
      setConversation((c) => [...c, message]);
      setContenu('');
      setTimeout(() => {
        basRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Échec de l\'envoi');
    } finally {
      setEnEnvoi(false);
    }
  };

  // Interlocuteurs uniques déduits de la boîte de réception
  const interlocuteurs = Array.from(
    new Set(boiteReception.map((m) => m.expediteurId)),
  );

  if (enChargement) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <p style={{ color: 'var(--texte-secondaire)' }}>Chargement de la messagerie…</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[75vh]">
      {/* 1. Liste des conversations */}
      <aside
        className={`overflow-y-auto flex flex-col rounded-2xl p-4 ${
          interlocuteurId ? 'hidden md:flex' : 'flex'
        }`}
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--bordure)',
        }}
      >
        <h2 className="font-bold text-xs uppercase tracking-widest mb-4 px-1" style={{ color: 'var(--texte-secondaire)' }}>
          Conversations
        </h2>
        {interlocuteurs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-2xl mb-1">💬</p>
            <p className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>
              Aucun message pour le moment.
            </p>
          </div>
        ) : (
          <ul className="space-y-1 flex-1">
            {interlocuteurs.map((id) => {
              const dernier = boiteReception.find((m) => m.expediteurId === id);
              const nonLus = boiteReception.filter(
                (m) => m.expediteurId === id && !m.lu,
              ).length;
              const nom = cacheNoms[id] || `Professeur ${id.slice(0, 8)}`;

              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setInterlocuteurId(id)}
                    className="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150"
                    style={{
                      background: interlocuteurId === id ? 'rgba(27,94,59,0.08)' : 'transparent',
                      borderLeft: interlocuteurId === id ? '3px solid var(--primaire)' : '3px solid transparent',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate" style={{ color: 'var(--texte)' }}>{nom}</span>
                      {nonLus > 0 && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 shrink-0"
                          style={{ background: 'var(--accent)', color: '#FFFFFF' }}
                        >
                          {nonLus}
                        </span>
                      )}
                    </div>
                    {dernier && (
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--texte-secondaire)' }}>
                        {dernier.contenu}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* 2. Conversation active */}
      <section
        className={`md:col-span-2 flex flex-col h-full overflow-hidden rounded-2xl ${
          interlocuteurId ? 'flex' : 'hidden md:flex'
        }`}
        style={{ background: '#FFFFFF', border: '1px solid var(--bordure)' }}
      >
        {!interlocuteurId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <span className="text-4xl mb-3">💬</span>
            <p className="font-medium" style={{ color: 'var(--texte)' }}>Messagerie</p>
            <p className="text-xs mt-1" style={{ color: 'var(--texte-secondaire)' }}>
              Sélectionnez une conversation pour voir vos messages.
            </p>
          </div>
        ) : (
          <>
            {/* Topbar conversation */}
            <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--bordure)' }}>
              <button
                type="button"
                onClick={() => setInterlocuteurId(null)}
                className="md:hidden btn-secondaire !text-xs !py-1 !px-2"
              >
                ← Retour
              </button>
              <div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--texte)' }}>
                  {cacheNoms[interlocuteurId] || `Professeur ${interlocuteurId.slice(0, 8)}`}
                </h3>
                <p className="text-[10px]" style={{ color: 'var(--texte-secondaire)' }}>
                  En ligne ou asynchrone
                </p>
              </div>
            </div>

            {/* Zone de messages défilante */}
            <div className="flex-1 overflow-y-auto space-y-3 px-4 py-2" style={{ background: 'var(--fond-page)' }}>
              {conversation.length === 0 ? (
                <p className="text-xs text-center py-6 italic" style={{ color: 'var(--texte-secondaire)' }}>
                  Début de la conversation. Envoyez un message pour commencer.
                </p>
              ) : (
                conversation.map((m) => {
                  const envoye = m.expediteurId === monId;
                  return (
                    <div
                      key={m.id}
                      className={`max-w-[80%] flex flex-col gap-1 ${
                        envoye ? 'ml-auto items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className="px-4 py-2.5 text-sm leading-relaxed"
                        style={{
                          background: envoye
                            ? 'var(--primaire)'
                            : '#FFFFFF',
                          color: envoye ? '#FFFFFF' : 'var(--texte)',
                          border: envoye ? 'none' : '1px solid var(--bordure)',
                          borderRadius: envoye ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          boxShadow: envoye ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        <p className="whitespace-pre-wrap">{m.contenu}</p>
                      </div>
                      <span className="text-[10px] px-1" style={{ color: 'var(--texte-secondaire)' }}>
                        {formaterDateHeure(m.horodatage)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={basRef} />
            </div>

            {erreur && (
              <p className="text-xs py-1 px-4" style={{ color: 'var(--erreur)' }}>{erreur}</p>
            )}

            {/* Saisie fixe en bas */}
            <form
              onSubmit={envoyer}
              className="flex gap-2 px-4 py-3"
              style={{ borderTop: '1px solid var(--bordure)' }}
            >
              <input
                className="flex-1 text-sm outline-none px-4 py-2.5"
                style={{
                  background: 'var(--fond-page)',
                  border: '1px solid var(--bordure)',
                  borderRadius: 24,
                  color: 'var(--texte)',
                }}
                placeholder="Écrire un message…"
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                maxLength={2000}
                required
              />
              <button
                type="submit"
                disabled={enEnvoi || !contenu.trim()}
                className="btn-primaire text-sm !py-2 !px-4 shrink-0"
              >
                {enEnvoi ? '…' : 'Envoyer'}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
