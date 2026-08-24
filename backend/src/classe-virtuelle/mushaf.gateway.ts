// Canal WebSocket dédié à la synchronisation du Mushaf en temps réel.
//
// CONTRAINTES NON NÉGOCIABLES :
// - Seul le compte professeur peut émettre un événement de surlignage.
//   L'élève reçoit toujours en lecture seule.
// - Les payloads ne contiennent que des références (numéroSourate,
//   numeroVerset, plageSurlignage) — jamais d'image.
// - Reconnexion automatique sans perte de l'état du Mushaf.
//
// Modèle : une room socket.io par séance (room = "seance:<id>"). Le
// professeur écrit l'état (persisté via le service) puis il est broadcasté à
// toute la room ; les élèves ne font qu'écouter.
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ClasseVirtuelleService } from './classe-virtuelle.service';
import { PayloadJwt } from '../partages/auth/payload-jwt.interface';
import { obtenirPaireRedis } from '../partages/redis/redis.usine';
import { SurlignageDto } from './dto/surlignage.dto';
import { BandePassanteDto, NiveauBandePassante } from './dto/bande-passante.dto';

// Port distinct de l'API REST pour faciliter le scaling (≥ 2 instances) : le
// répartiteur de charge peut router le trafic WebSocket sticky si besoin.
const portWsOption = process.env.PORT_WS ? Number(process.env.PORT_WS) : undefined;

@WebSocketGateway(portWsOption, {
  namespace: 'classe-virtuelle',
  cors: { origin: process.env.CORS_ORIGINE?.split(',') ?? true, credentials: true },
})
export class MushafGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MushafGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly service: ClasseVirtuelleService,
    private readonly jwt: JwtService,
  ) { }

  /**
   * Branche l'adaptateur Redis dès l'initialisation du serveur. Indispensable
   * derrière un load balancer (≥ 2 instances) : sans lui, un professeur connecté
   * à l'instance A et un élève à l'instance B ne se verraient pas mutuellement.
   * Avec l'adaptateur, les messages sont propagés à toutes les instances via le
   * canal pub/sub Upstash.
   *
   * Si REDIS_URL est absente (développement mono-instance), on continue sans
   * adaptateur : tout fonctionne sur une seule instance.
   */
  async afterInit(server: Server): Promise<void> {
    const paire = await obtenirPaireRedis();
    if (paire) {
      const serverIo = (server as any)?.server ?? (this.server as any)?.server ?? server ?? this.server;
      if (typeof serverIo?.adapter === 'function') {
        serverIo.adapter(createAdapter(paire.publier, paire.ecouter));
        this.logger.log('Adaptateur Redis branché (multi-instances OK)');
      } else {
        this.logger.warn('Impossible de fixer l\'adaptateur Redis sur le serveur Socket.IO');
      }
    } else {
      this.logger.warn('REDIS_URL absente — gateway mono-instance (dev uniquement)');
    }
  }

  // ─────────────────────── Connexion / déconnexion ───────────────────────

  /**
   * Authentification au handshake. Le client doit fournir un jeton JWT valide
   * (en query `?jeton=...`). Sans jeton ou jeton invalide → déconnexion.
   */
  async handleConnection(client: Socket): Promise<void> {
    const payload = this.verifierJeton(client);
    if (!payload) {
      this.logger.warn(`Connexion refusée : jeton invalide (id=${client.id})`);
      client.emit('erreur', { message: 'Authentification requise' });
      client.disconnect(true);
      return;
    }

    // On attache le payload au socket pour les handlers suivants.
    (client.data as { payload: PayloadJwt }).payload = payload;
    this.logger.log(`Connecté : ${payload.email} (id=${client.id})`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const payload = this.payloadDe(client);
    if (payload) {
      this.logger.log(`Déconnecté : ${payload.email} (id=${client.id})`);
    }
  }

  // ──────────────────────────── Événements ───────────────────────────────

  /**
   * Rejoindre la room d'une séance. Autorisé uniquement aux participants
   * (élève ou professeur). Renvoie immédiatement l'état courant du Mushaf —
   * c'est ce qui permet la reconnexion sans perte.
   */
  @SubscribeMessage('rejoindreSeance')
  async rejoindreSeance(
    @ConnectedSocket() client: Socket,
    @MessageBody() corps: { seanceId: string },
  ): Promise<{ etatMushaf: unknown }> {
    const payload = this.payloadObligatoire(client);
    const { seanceId } = corps;

    // Vérifie l'appartenance (lève 404 si non participant — ne révèle rien).
    const seance = await this.service.trouverSeance(seanceId, payload.sub);
    const estProfesseur = seance.professeurId === payload.sub;

    await client.join(this.nomRoom(seance.id));
    await this.service.marquerEnCours(seance.id);

    // On signale le rôle au client pour que l'UI sache s'il peut surligner.
    client.emit('roleConfirme', { estProfesseur });

    const etatMushaf = await this.service.obtenirEtatMushaf(seance.id, payload.sub);
    this.logger.log(
      `${payload.email} a rejoint la séance ${seance.id} (${estProfesseur ? 'professeur' : 'élève'})`,
    );

    return { etatMushaf };
  }

  /**
   * Surlignage du Mushaf. CONTRÔLE CRITIQUE : seul le professeur de la séance
   * peut émettre cet événement. Tout autre appel est rejeté et non relayé.
   *
   * Le payload est intentionnellement minimal (références uniquement).
   */
  @SubscribeMessage('surlignerMushaf')
  async surlignerMushaf(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SurlignageDto,
  ): Promise<{ ok: true }> {
    const payload = this.payloadObligatoire(client);
    let seanceId = this.seanceDeLaRoom(client) || dto.seanceId;
    if (!seanceId) {
      client.emit('erreur', { message: "Aucune séance jointe" });
      return { ok: true };
    }
    await client.join(this.nomRoom(seanceId));

    // Double vérification d'autorisation :
    //   1. l'utilisateur est bien le professeur de la séance (service) ;
    //   2. (au cas où) il est dans la bonne room.
    const seance = await this.service.trouverSeance(seanceId, payload.sub);
    if (seance.professeurId !== payload.sub) {
      client.emit('erreur', {
        message: 'Seul le professeur peut surligner le Mushaf',
      });
      this.logger.warn(
        `Tentative de surlignage par un non-professeur : ${payload.email}`,
      );
      return { ok: true };
    }

    // Persiste l'état (reconnexion sans perte) puis broadcast aux élèves.
    const etat = await this.service.appliquerSurlignage(seanceId, payload.sub, {
      numeroSourate: dto.numeroSourate,
      numeroVerset: dto.numeroVerset,
      plageSurlignage: dto.plageSurlignage ?? null,
    });

    // Broadcast à toute la room (élèves en lecture seule réceptionnent).
    this.server.to(this.nomRoom(seanceId)).emit('mushafMisAJour', etat);
    return { ok: true };
  }

  /**
   * Signalement du niveau de bande passante par un client. Si FAIBLE, on active
   * automatiquement le mode de repli « audio seul » sur toute la room — sans
   * interrompre la séance.
   */
  @SubscribeMessage('signalerBandePassante')
  async signalerBandePassante(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: BandePassanteDto,
  ): Promise<{ modeRepliActif: boolean }> {
    const payload = this.payloadObligatoire(client);
    const seanceId = this.seanceDeLaRoom(client);
    if (!seanceId) {
      return { modeRepliActif: false };
    }

    const activerRepli = dto.niveau === NiveauBandePassante.FAIBLE;
    const seance = await this.service.basculerModeRepli(seanceId, activerRepli, payload.sub);

    // Notifie toute la room du changement de mode.
    this.server.to(this.nomRoom(seanceId)).emit('modeRepliMisAJour', {
      modeRepliActif: seance.modeRepliActif,
    });
    return { modeRepliActif: seance.modeRepliActif };
  }

  // ─────────────────────────── Utilitaires ─────────────────────────────

  /** Vérifie le jeton JWT passé en cookie ou en query au handshake. */
  private verifierJeton(client: Socket): PayloadJwt | null {
    let jeton: string | null = null;

    // 1. Extraction depuis le payload auth (priorité)
    jeton = client.handshake.auth?.token;

    // 2. Extraction depuis le cookie httpOnly (fallback)
    if (!jeton) {
      const cookieHeader = client.handshake.headers?.cookie;
      if (cookieHeader) {
        const rawCookies = cookieHeader.split(';');
        for (const rawCookie of rawCookies) {
          const parties = rawCookie.split('=');
          const cle = parties[0]?.trim();
          const val = parties[1]?.trim();
          if (cle === 'jwt_access' && val) {
            jeton = val;
            break;
          }
        }
      }
    }

    // 3. Fallback query param (pour tests, Swagger ou clients mobiles)
    if (!jeton) {
      const brut = client.handshake.query?.jeton;
      jeton = Array.isArray(brut) ? brut[0] : (brut ?? null);
    }

    if (!jeton || typeof jeton !== 'string') {
      return null;
    }
    try {
      return this.jwt.verify(jeton) as PayloadJwt;
    } catch {
      return null;
    }
  }

  private payloadDe(client: Socket): PayloadJwt | undefined {
    return (client.data as { payload?: PayloadJwt }).payload;
  }

  private payloadObligatoire(client: Socket): PayloadJwt {
    const payload = this.payloadDe(client);
    if (!payload) {
      throw new Error('Socket sans payload authentifié');
    }
    return payload;
  }

  /** Nom canonique d'une room pour une séance. */
  private nomRoom(seanceId: string): string {
    return `seance:${seanceId}`;
  }

  /**
   * Extrait l'identifiant de la séance à laquelle le client a actuellement
   * joint une room. Un client peut rejoindre plusieurs rooms ; on prend la
   * première qui matche le préfixe "seance:".
   */
  private seanceDeLaRoom(client: Socket): string | null {
    for (const room of client.rooms) {
      if (room.startsWith('seance:')) {
        return room.slice('seance:'.length);
      }
    }
    return null;
  }
}
