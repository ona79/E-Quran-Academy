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
   * Si seSouvenirDeMoi est vrai : 30 jours, sinon 1 jour (ou JWT_EXPIRES_IN par défaut).
   */
  genererJetons(payload: PayloadJwt, seSouvenirDeMoi?: boolean): string {
    const dromadaireDuree = seSouvenirDeMoi ? '30d' : (process.env.JWT_EXPIRES_IN ?? '1d');
    return this.jwt.sign(payload, {
      expiresIn: dromadaireDuree,
    });
  }
}
