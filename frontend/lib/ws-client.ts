// Client WebSocket vers la gateway Mushaf du backend.
// Namespace : "classe-virtuelle" (cf. backend mushaf.gateway.ts).
// Authentification : jeton JWT passé en query au handshake.
import { io, type Socket } from 'socket.io-client';

const URL_WS = '/classe-virtuelle';

let socket: Socket | null = null;

/**
 * Retourne le singleton socket connecté à la gateway classe-virtuelle.
 * Le jeton est lu automatiquement via le cookie `jwt_access` grâce au proxy.
 */
export function obtenirSocket(): Socket {
  if (socket && socket.connected) return socket;

  socket = io(URL_WS, {
    path: '/ws-backend/socket.io', // Le proxy Next.js redirige vers le port 3002
    withCredentials: true,
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
