// Représentation d'une séance renvoyée par l'API REST.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutSession } from '@prisma/client';

export class SeanceReponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'UUID de la réservation rattachée' })
  reservationId!: string;

  @ApiProperty({ description: 'UUID de l’élève' })
  eleveId!: string;

  @ApiProperty({ description: 'UUID du professeur' })
  professeurId!: string;

  @ApiProperty({ enum: StatutSession, enumName: 'StatutSession' })
  statut!: StatutSession;

  @ApiPropertyOptional({ description: 'URL de la salle Daily.co (null si non créée)' })
  lienVisio?: string | null;

  @ApiPropertyOptional({ description: 'Token de réunion Daily.co (professeur = owner)' })
  tokenVisio?: string;

  @ApiProperty({ description: 'Mode de repli « audio seul » actif' })
  modeRepliActif!: boolean;

  @ApiProperty({ description: 'Consentement parental à l’enregistrement' })
  enregistrementConsente!: boolean;

  @ApiProperty({ description: 'Enregistrement actuellement en cours' })
  enregistrementActif!: boolean;

  @ApiPropertyOptional({ description: 'URL de l’enregistrement traité (30 jours de rétention)' })
  enregistrementUrl?: string | null;
}
