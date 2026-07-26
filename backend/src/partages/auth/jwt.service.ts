// Service de génération des jetons JWT. Stateles : aucune persistance, le jeton
// contient tout ce qu'il faut pour autoriser les requêtes suivantes.
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { PayloadJwt } from './payload-jwt.interface';

@Injectable()
export class JwtService {
  constructor(private readonly jwt: NestJwtService) {}

  /**
   * Émet un jeton signé pour la charge utile donnée.
   * Durée : 7 jours (configurable via JWT_EXPIRES_IN).
   */
  genererJetons(payload: PayloadJwt): string {
    return this.jwt.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    });
  }
}
