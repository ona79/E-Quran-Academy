// Garde de rôles : lit les métadonnées posées par @Roles(...) et vérifie
// que l'utilisateur authentifié possède l'un des rôles requis.
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { CLES_ROLES } from './roles.decorateur';

@Injectable()
export class RolesGarde implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexte: ExecutionContext): boolean {
    const rolesRequis = this.reflector.getAllAndOverride<Role[]>(CLES_ROLES, [
      contexte.getHandler(),
      contexte.getClass(),
    ]);

    // Pas de @Roles() => endpoint ouvert à tout utilisateur authentifié.
    if (!rolesRequis || rolesRequis.length === 0) {
      return true;
    }

    const requete = contexte.switchToHttp().getRequest();
    const utilisateur = requete.user;

    return rolesRequis.includes(utilisateur?.role as Role);
  }
}
