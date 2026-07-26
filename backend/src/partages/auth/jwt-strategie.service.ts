// Stratégie JWT (passport-jwt) : valide le jeton reçu dans l'en-tête
// Authorization: Bearer <token> et reconstruit la charge utile.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayloadJwt } from './payload-jwt.interface';

type ChargeConfig = { secret: string };

/**
 * Récupère le secret JWT depuis la configuration. `JWT_SECRET` doit être défini
 * (voir .env.example) — jamais codé en dur.
 */
function chargerConfig(): ChargeConfig {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "Variable d'environnement JWT_SECRET manquante — voir .env.example",
    );
  }
  return { secret };
}

import { Request } from 'express';

const extraireCookieOuBearer = (req: Request): string | null => {
  let token: string | null = null;
  if (req && req.headers && req.headers.cookie) {
    const rawCookies = req.headers.cookie.split(';');
    for (const rawCookie of rawCookies) {
      const parties = rawCookie.split('=');
      const cle = parties[0]?.trim();
      const val = parties[1]?.trim();
      if (cle === 'jwt_access' && val) {
        token = val;
        break;
      }
    }
  }
  if (!token) {
    token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  }
  return token;
};

@Injectable()
export class JwtStrategie extends PassportStrategy(Strategy) {
  constructor() {
    const config = chargerConfig();
    super({
      jwtFromRequest: extraireCookieOuBearer,
      ignoreExpiration: false,
      secretOrKey: config.secret,
    });
  }

  /**
   * passport appelle cette méthode avec la charge utile décodée du jeton.
   * On la retourne telle quelle : elle deviendra `requete.user`.
   */
  validate(charge: PayloadJwt): PayloadJwt {
    if (!charge.sub || !charge.role) {
      throw new UnauthorizedException('Jeton invalide');
    }
    return charge;
  }
}
