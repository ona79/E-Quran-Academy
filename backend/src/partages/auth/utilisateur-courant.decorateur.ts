// Décorateur qui extrait l'utilisateur authentifié du corps de la requête
// (renseigné par JwtStrategie) et l'injecte dans les paramètres du contrôleur.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadJwt } from './payload-jwt.interface';

export const UtilisateurCourant = createParamDecorator(
  (_donnees: unknown, contexte: ExecutionContext): PayloadJwt => {
    const requete = contexte.switchToHttp().getRequest();
    return requete.user as PayloadJwt;
  },
);
