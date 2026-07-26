// Représentation d'une réservation renvoyée par l'API. Les créneaux sont en UTC
// (format ISO 8601) ; le client les projette dans le fuseau de l'utilisateur.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutReservation } from '@prisma/client';

export class ReservationReponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'UUID de l’élève' })
  eleveId!: string;

  @ApiProperty({ description: 'UUID du professeur' })
  professeurId!: string;

  @ApiProperty({ example: '2024-09-02T10:00:00.000Z', description: 'Début du créneau (UTC, ISO 8601)' })
  creneauDebut!: Date;

  @ApiProperty({ example: '2024-09-02T11:00:00.000Z', description: 'Fin du créneau (UTC, ISO 8601)' })
  creneauFin!: Date;

  @ApiProperty({ enum: StatutReservation, enumName: 'StatutReservation' })
  statut!: StatutReservation;

  @ApiPropertyOptional({ nullable: true })
  noteEleve?: string | null;
}
