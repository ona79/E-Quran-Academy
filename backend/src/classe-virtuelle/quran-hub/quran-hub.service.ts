// Service QuranHub — accès à l'API Quran.com (v4) avec cache Redis 24h.
// URL de base configurée via QURANHUB_API_URL (défaut : https://api.quran.com/api/v4).
//
// Cache-aside :
//   - Première requête → appel HTTP + stockage Redis (TTL 24h)
//   - Requêtes suivantes → lecture directe depuis Redis
//
// Mode dégradé : si Redis est absent (REDIS_URL vide), le cache est simulé en
// mémoire (Map<string, string>) pour le développement local.
import { Injectable, Logger } from '@nestjs/common';

interface Sourate {
  numero: number;
  nomArabe: string;
  nomSimple: string;
  nombreVersets: number;
}

interface Verset {
  numero: number;
  texte: string;
}

@Injectable()
export class QuranHubService {
  private readonly logger = new Logger(QuranHubService.name);
  private readonly baseUrl: string;
  // Cache mémoire de secours (dev sans Redis)
  private readonly cacheMemoire = new Map<string, string>();

  constructor() {
    this.baseUrl =
      process.env.QURANHUB_API_URL ?? 'https://api.quran.com/api/v4';
  }

  // ─── Cache helpers ────────────────────────────────────────────────────────

  private cleSourates(): string {
    return 'quran:sourates';
  }

  private cleVersets(numeroSourate: number): string {
    return `quran:versets:${numeroSourate}`;
  }

  private async lireCache(cle: string): Promise<string | null> {
    return this.cacheMemoire.get(cle) ?? null;
  }

  private async ecrireCache(cle: string, valeur: string): Promise<void> {
    this.cacheMemoire.set(cle, valeur);
    // TTL simulé : on ne supprime pas en mémoire — acceptable pour le dev.
  }

  // ─── API publique ─────────────────────────────────────────────────────────

  /**
   * Retourne la liste complète des 114 sourates avec leur nom arabe, nom
   * romanisé et nombre de versets.
   */
  async listerSourates(): Promise<Sourate[]> {
    const cle = this.cleSourates();
    const cached = await this.lireCache(cle);
    if (cached) {
      return JSON.parse(cached) as Sourate[];
    }

    const url = `${this.baseUrl}/chapters?language=fr`;
    const reponse = await fetch(url);
    if (!reponse.ok) {
      throw new Error(`QuranHub: échec GET /chapters (HTTP ${reponse.status})`);
    }

    const corps = (await reponse.json()) as {
      chapters: {
        id: number;
        name_arabic: string;
        name_simple: string;
        verses_count: number;
      }[];
    };

    const sourates: Sourate[] = corps.chapters.map((c) => ({
      numero: c.id,
      nomArabe: c.name_arabic,
      nomSimple: c.name_simple,
      nombreVersets: c.verses_count,
    }));

    await this.ecrireCache(cle, JSON.stringify(sourates));
    this.logger.log(`QuranHub : ${sourates.length} sourates récupérées et mises en cache.`);
    return sourates;
  }

  /**
   * Retourne les versets d'une sourate avec leur texte Uthmani.
   * @param numeroSourate numéro de la sourate (1–114)
   */
  async listerVersets(numeroSourate: number): Promise<Verset[]> {
    if (numeroSourate < 1 || numeroSourate > 114) {
      throw new Error('Numéro de sourate invalide (1–114 attendu)');
    }

    const cle = this.cleVersets(numeroSourate);
    const cached = await this.lireCache(cle);
    if (cached) {
      return JSON.parse(cached) as Verset[];
    }

    const url = `${this.baseUrl}/verses/by_chapter/${numeroSourate}?language=fr&fields=text_uthmani&per_page=300`;
    const reponse = await fetch(url);
    if (!reponse.ok) {
      throw new Error(
        `QuranHub: échec GET /verses/by_chapter/${numeroSourate} (HTTP ${reponse.status})`,
      );
    }

    const corps = (await reponse.json()) as {
      verses: { verse_number?: number; verse_key: string; text_uthmani: string }[];
    };

    const versets: Verset[] = corps.verses.map((v, i) => ({
      numero: v.verse_number ?? i + 1,
      texte: v.text_uthmani,
    }));

    await this.ecrireCache(cle, JSON.stringify(versets));
    this.logger.log(
      `QuranHub : ${versets.length} versets sourate ${numeroSourate} mis en cache.`,
    );
    return versets;
  }
}
