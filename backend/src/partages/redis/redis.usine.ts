// Fabrique de clients Redis (Upstash). Un seul adaptateur par application :
// crée une paire pub/sub pour @socket.io/redis-adapter.
//
// Upstash expose Redis sur TLS (rediss://). Le client `redis` (node-redis v4)
// gère nativement ce schéma. Si REDIS_URL est absente (ex : dev locale sans
// Upstash), on renvoie null et la gateway fonctionnera sans adaptateur
// (mono-instance uniquement — acceptable en développement).
import { createClient, type RedisClientType } from 'redis';

export interface PaireRedis {
  publier: RedisClientType;
  ecouter: RedisClientType;
}

let cache: PaireRedis | null | undefined;

/**
 * Construit (et connecte) la paire de clients Redis pour l'adaptateur.
 * @returns la paire, ou null si REDIS_URL n'est pas configurée.
 */
export async function obtenirPaireRedis(): Promise<PaireRedis | null> {
  if (cache !== undefined) return cache;

  const url = process.env.REDIS_URL;
  if (!url) {
    cache = null;
    return null;
  }

  // L'adaptateur socket.io exige deux clients distincts (pub + sub).
  const publier = createClient({ url }) as RedisClientType;
  const ecouter = createClient({ url }) as RedisClientType;

  await Promise.all([publier.connect(), ecouter.connect()]);

  cache = { publier, ecouter };
  return cache;
}
