// Client HTTP vers le backend. Factorise :
// - l'URL de base (proxy /api-backend -> backend, cf. next.config.mjs) ;
// - l'injection du jeton JWT (localStorage) ;
// - la gestion normalisée et traduite des erreurs (anti-chiffres/codes bruts pour les utilisateurs).

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

/**
 * Traduit un code de statut HTTP en une phrase claire et compréhensible en français.
 * Évite d'afficher des numéros bruts ("Erreur 500", "Erreur 404") à l'utilisateur final.
 */
function traduireStatutHttp(statut: number): string {
  switch (statut) {
    case 400:
      return 'Les informations envoyées sont invalides. Veuillez vérifier votre saisie.';
    case 401:
      return 'Votre session a expiré ou vous n’êtes pas connecté. Veuillez vous connecter.';
    case 403:
      return 'Vous n’avez pas les droits nécessaires pour effectuer cette action.';
    case 404:
      return 'La ressource ou la page demandée est introuvable.';
    case 409:
      return 'Cette opération entre en conflit avec des données existantes.';
    case 429:
      return 'Trop de tentatives effectuées. Veuillez patienter une minute avant de réessayer.';
    case 500:
      return 'Une erreur interne du serveur est survenue. Veuillez réessayer ultérieurement.';
    case 502:
    case 503:
    case 504:
      return 'Le serveur est temporairement indisponible ou en maintenance. Veuillez réessayer dans quelques instants.';
    default:
      return `Impossible d’effectuer l’opération (Code ${statut}). Veuillez réessayer.`;
  }
}

/**
 * Extrait un message d'erreur lisible à partir de la réponse JSON du backend (NestJS).
 */
function extraireMessageBackend(details: unknown): string | undefined {
  if (!details || typeof details !== 'object') return undefined;
  const msg = (details as { message?: string | string[] }).message;

  if (Array.isArray(msg)) {
    return msg.join('. ');
  }
  if (typeof msg === 'string' && msg.trim() !== '') {
    return msg;
  }
  return undefined;
}

async function requete<T>(
  chemin: string,
  options: RequestInit = {},
): Promise<T> {
  const enTetes: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  let reponse: Response;
  try {
    reponse = await fetch(`${URL_BASE}${chemin}`, {
      ...options,
      credentials: 'include',
      headers: enTetes,
    });
  } catch (err) {
    // Interception des erreurs de réseau (ex: pas d'internet, serveur indisponible)
    throw new ErreurApi(
      'Impossible de contacter le serveur. Veuillez vérifier votre connexion Internet.',
      0,
      err,
    );
  }

  if (!reponse.ok) {
    let details: unknown;
    try {
      details = await reponse.json();
    } catch {
      details = undefined;
    }

    const messageBackend = extraireMessageBackend(details);
    const messageFinal = messageBackend || traduireStatutHttp(reponse.status);

    throw new ErreurApi(messageFinal, reponse.status, details);
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
  delete: <T>(chemin: string) => requete<T>(chemin, { method: 'DELETE' }),
};
