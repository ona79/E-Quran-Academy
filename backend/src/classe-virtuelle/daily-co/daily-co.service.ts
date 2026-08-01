// Intégration Daily.co via l'API REST (fetch), sans SDK lourd.
// Architecture SFU + bitrate adaptatif/simulcast côté Daily.co — adapté aux
// connexions faibles (cahier des charges).
//
// Mode dégradé : si DAILY_API_KEY n'est pas définie (ex : développement local
// sans compte), on renvoie un placeholder déterministe. Aucun flux réseau vers
// un tiers, la séance reste fonctionnelle pour les tests.
import { Injectable } from '@nestjs/common';

const API_BASE = 'https://api.daily.co/v1';

export interface SalleVisio {
  /// Nom unique de la salle côté Daily.co.
  nomSalle: string;
  /// URL de connexion à fournir au client (Daily.co room URL).
  url: string;
}

@Injectable()
export class DailyCoService {
  private get cleApi(): string | undefined {
    return process.env.DAILY_API_KEY;
  }

  /**
   * Crée une salle de visioconférence privée pour une séance.
   * @param seanceId identifiant de la séance (sert de suffixe au nom de salle)
   */
  async creerSalle(seanceId: string): Promise<SalleVisio> {
    // Mode dégradé sans clé : placeholder déterministe.
    if (!this.cleApi) {
      const nom = `seance-${seanceId}`;
      return {
        nomSalle: nom,
        url: `placeholder://${nom}`,
      };
    }

    const nomSalle = `seance-${seanceId}`;
    const reponse = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: this.enTetes(),
      body: JSON.stringify({
        name: nomSalle,
        // Salle privée : nécessite un token de réunion pour y entrer.
        privacy: 'private',
        properties: {
          // Bande passante adaptative, mode audio seul disponible.
          enable_video_processing_ui: false,
          enable_prejoin_ui: true, // Écran de choix de caméra activé pour éviter de rentrer sans caméra
          // Délai de 30 jours de rétention.
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
        },
      }),
    });

    if (!reponse.ok) {
      throw new Error(`Daily.co : échec de création de salle (HTTP ${reponse.status})`);
    }

    const corps = (await reponse.json()) as { url: string };
    return { nomSalle, url: corps.url };
  }

  /**
   * Génère un token de réunion pour un participant. En mode privé, sans ce
   * token, le client ne peut pas rejoindre la salle.
   * @param nomSalle   nom de la salle Daily.co
   * @param identifiant identifiant de l'utilisateur
   * @param estProprietaire true si professeur (owner) — sinon invité (élève)
   */
  async genererToken(
    nomSalle: string,
    identifiant: string,
    estProprietaire: boolean,
  ): Promise<string> {
    if (!this.cleApi) {
      // Mode dégradé : token factice mais stable.
      return `placeholder-token-${identifiant}-${estProprietaire ? 'prof' : 'eleve'}`;
    }

    const reponse = await fetch(`${API_BASE}/meeting-tokens`, {
      method: 'POST',
      headers: this.enTetes(),
      body: JSON.stringify({
        properties: {
          room_name: nomSalle,
          is_owner: estProprietaire,
          user_id: identifiant,
        },
      }),
    });

    if (!reponse.ok) {
      throw new Error(`Daily.co : échec de génération du token (HTTP ${reponse.status})`);
    }

    const corps = (await reponse.json()) as { token: string };
    return corps.token;
  }

  private enTetes(): HeadersInit {
    return {
      Authorization: `Bearer ${this.cleApi}`,
      'Content-Type': 'application/json',
    };
  }
}
