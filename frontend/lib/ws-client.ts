// Client WebSocket vers la gateway Mushaf du backend.
// Namespace : "classe-virtuelle" (cf. backend mushaf.gateway.ts).
// Authentification : jeton JWT passé en query au handshake.
import { io, type Socket } from 'socket.io-client';

const WS_BACKEND_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002';
const URL_WS = `${WS_BACKEND_URL}/classe-virtuelle`;

let socket: Socket | null = null;

/**
 * Retourne le singleton socket connecté à la gateway classe-virtuelle.
 * Le jeton est lu automatiquement via le cookie `jwt_access`.
 */
export function obtenirSocket(): Socket {
  if (socket && socket.connected) return socket;

  socket = io(URL_WS, {
    // Ne pas utiliser le proxy Next.js car il supprime les trailing slashes (308 Redirect)
    // ce qui casse la connexion avec Socket.io.
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
