// Client WebSocket vers la gateway Mushaf du backend.
// Namespace : "classe-virtuelle" (cf. backend mushaf.gateway.ts).
// Authentification : jeton JWT passé en query au handshake.
import { io, type Socket } from 'socket.io-client';

const ObtenirUrlWs = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:3001`;
  }
  return 'http://localhost:3001';
};

let socket: Socket | null = null;

/**
 * Retourne le singleton socket connecté à la gateway classe-virtuelle.
 * Le jeton est lu automatiquement via le cookie `jwt_access` ou localStorage.
 */
export function obtenirSocket(): Socket {
  if (socket && socket.connected) return socket;

  const urlWs = `${ObtenirUrlWs()}/classe-virtuelle`;
  const jeton = typeof window !== 'undefined' ? localStorage.getItem('jeton_ws') : null;

  if (!socket) {
    socket = io(urlWs, {
      withCredentials: true,
      auth: { token: jeton },
      query: jeton ? { jeton } : undefined,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });
  } else if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

/** Déconnecte proprement le socket. */
export function fermerSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
