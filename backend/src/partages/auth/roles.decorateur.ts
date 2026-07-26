// Décorateur de rôles : pose sur un endpoint la liste des rôles autorisés.
// À combiner avec RolesGarde.
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const CLES_ROLES = 'roles';

export const Roles = (...roles: Role[]): MethodDecorator =>
  SetMetadata(CLES_ROLES, roles);
