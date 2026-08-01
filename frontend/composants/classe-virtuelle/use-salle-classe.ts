'use client';

// Hook de synchronisation de la salle de classe.
// Gère :
// - la connexion WebSocket et le rejoignage de la room (reconnexion sans perte) ;
// - l'état du Mushaf (réception des mises à jour du professeur) ;
// - le rôle (estProfesseur) qui détermine la lecture seule pour l'étudiant ;
// - le mode de repli audio ;
// - les erreurs remontées par le serveur.
import { useEffect, useRef, useState, useCallback } from 'react';
import { obtenirSocket, fermerSocket } from '@/lib/ws-client';
import type { EtatMushaf } from '@/lib/types';

interface UseSalleClasse {
  etatMushaf: EtatMushaf | null;
  estProfesseur: boolean;
  modeRepliActif: boolean;
  erreur: string | null;
  connecte: boolean;
  surligner: (etat: EtatMushaf) => void;
  signalerBandePassante: (niveau: 'BONNE' | 'FAIBLE') => void;
}

export function useSalleClasse(seanceId: string): UseSalleClasse {
  const [etatMushaf, setEtatMushaf] = useState<EtatMushaf | null>(null);
  const [estProfesseur, setEstProfesseur] = useState(false);
  const [modeRepliActif, setModeRepliActif] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [connecte, setConnecte] = useState(false);
  const socketRef = useRef<ReturnType<typeof obtenirSocket> | null>(null);

  useEffect(() => {
    const socket = obtenirSocket();
    socketRef.current = socket;

    const rejoindre = () => {
      // À la connexion (et à chaque reconnexion), on rejoint la room.
      // Le serveur renvoie l'état Mushaf courant → reconnexion sans perte.
      socket.emit('rejoindreSeance', { seanceId }, (reponse: { etatMushaf: EtatMushaf }) => {
        setEtatMushaf(reponse.etatMushaf);
      });
    };

    socket.on('connect', () => {
      setConnecte(true);
      setErreur(null);
      rejoindre();
    });

    socket.on('disconnect', () => setConnecte(false));

    socket.on('roleConfirme', ({ estProfesseur }: { estProfesseur: boolean }) => {
      setEstProfesseur(estProfesseur);
    });

    // Réception des mises à jour du Mushaf (broadcast du professeur).
    socket.on('mushafMisAJour', (etat: EtatMushaf) => {
      setEtatMushaf(etat);
    });

    socket.on('modeRepliMisAJour', ({ modeRepliActif }: { modeRepliActif: boolean }) => {
      setModeRepliActif(modeRepliActif);
    });

    socket.on('erreur', ({ message }: { message: string }) => {
      setErreur(message);
    });

    // Si déjà connecté (socket singleton persistant), on joint tout de suite.
    if (socket.connected) {
      setConnecte(true);
      rejoindre();
    }

    return () => {
      // On nettoie les listeners propres à cette instance du hook sans fermer
      // le socket singleton (pourrait être réutilisé).
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roleConfirme');
      socket.off('mushafMisAJour');
      socket.off('modeRepliMisAJour');
      socket.off('erreur');
      fermerSocket();
    };
  }, [seanceId]);

  /** Émet un surlignage (professeur uniquement côté serveur). */
  const surligner = useCallback(
    (etat: EtatMushaf) => {
      socketRef.current?.emit('surlignerMushaf', {
        numeroSourate: etat.numeroSourate,
        numeroVerset: etat.numeroVerset,
        plageSurlignage: etat.plageSurlignage ?? null,
      });
    },
    [],
  );

  /** Signale le niveau de bande passante (déclenche le mode repli si FAIBLE). */
  const signalerBandePassante = useCallback((niveau: 'BONNE' | 'FAIBLE') => {
    socketRef.current?.emit('signalerBandePassante', { niveau });
  }, []);

  return {
    etatMushaf,
    estProfesseur,
    modeRepliActif,
    erreur,
    connecte,
    surligner,
    signalerBandePassante,
  };
}
