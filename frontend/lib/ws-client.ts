// Client WebSocket vers la gateway Mushaf du backend.
// Namespace : "classe-virtuelle" (cf. backend mushaf.gateway.ts).
// Authentification : jeton JWT passé en query au handshake.
import { io, type Socket } from 'socket.io-client';

const URL_WS = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3002';

let socket: Socket | null = null;

/**
 * Retourne le singleton socket connecté à la gateway classe-virtuelle.
 * Le jeton est lu en localStorage à l'appel.
 */
export function obtenirSocket(): Socket {
  if (socket && socket.connected) return socket;

  // On récupère le cookie manuellement si on est sur le même domaine,
  // ou on l'extrait. Cependant, pour utiliser auth: { token }, il faut un token.
  const jeton = typeof window !== 'undefined' ? localStorage.getItem('jeton_ws') : null;

  socket = io(`${URL_WS}/classe-virtuelle`, {
    withCredentials: true,
    auth: { token: jeton },
    // Reconnexion automatique sans perte : le serveur renvoie l'état Mushaf
    // à chaque "rejoindreSeance", donc un client qui se reconnecte récupère
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket'],
  });

  return socket;
}

/** Déconnecte proprement le socket (à la sortie de la salle). */
export function fermerSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
