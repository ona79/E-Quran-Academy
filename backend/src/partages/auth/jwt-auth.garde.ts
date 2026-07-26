// Garde d'authentification : bloque toute requête sans jeton JWT valide.
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGarde extends AuthGuard('jwt') {}
