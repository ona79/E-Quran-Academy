// Client HTTP vers le backend. Factorise :
// - l'URL de base (proxy /api-backend -> backend, cf. next.config.mjs) ;
// - l'injection du jeton JWT (localStorage) ;
// - la gestion normalisée des erreurs.
//
// Côté serveur (Server Components) on utilise l'URL directe ; côté client on
// passe par le proxy pour éviter les problèmes CORS et exposer NEXT_PUBLIC_API_URL.

const URL_BASE = '/api-backend';

export class ErreurApi extends Error {
  constructor(
    message: string,
    public statut: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ErreurApi';
  }
}

async function requete<T>(
  chemin: string,
  options: RequestInit = {},
): Promise<T> {
  const enTetes: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const reponse = await fetch(`${URL_BASE}${chemin}`, {
    ...options,
    credentials: 'include',
    headers: enTetes,
  });

  if (!reponse.ok) {
    let details: unknown;
    try {
      details = await reponse.json();
    } catch {
      details = undefined;
    }
    const message =
      (details as { message?: string })?.message ??
      `Erreur ${reponse.status}`;
    throw new ErreurApi(message, reponse.status, details);
  }

  // 204 No Content
  if (reponse.status === 204) {
    return undefined as T;
  }

  return reponse.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(chemin: string) => requete<T>(chemin, { method: 'GET' }),
  post: <T>(chemin: string, corps?: unknown) =>
    requete<T>(chemin, { method: 'POST', body: corps ? JSON.stringify(corps) : undefined }),
  patch: <T>(chemin: string, corps?: unknown) =>
    requete<T>(chemin, { method: 'PATCH', body: corps ? JSON.stringify(corps) : undefined }),
  supprimer: <T>(chemin: string) => requete<T>(chemin, { method: 'DELETE' }),
};
