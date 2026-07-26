// Représentation SÛRE d'un utilisateur renvoyée par l'API : jamais de
// `motDePasse` ni d'identifiant interne exposé directement. On conserve
// l'`id` (UUID opaque) car le client en a besoin pour appeler les autres
// modules (réservations, suivi…).
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UtilisateurReponseDto {
  @ApiProperty({ example: 'b3f1c2a4-…-9d8e' })
  id!: string;

  @ApiProperty({ example: 'aminata.diallo@example.com' })
  email!: string;

  @ApiProperty({ example: 'Aminata Diallo' })
  nomComplet!: string;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role!: Role;

  @ApiProperty({ example: 'fr' })
  langue!: string;

  @ApiProperty({ example: 'Africa/Dakar' })
  fuseauHoraire!: string;

  @ApiProperty({ example: '2024-09-01T10:00:00.000Z' })
  creeLe!: Date;
}
