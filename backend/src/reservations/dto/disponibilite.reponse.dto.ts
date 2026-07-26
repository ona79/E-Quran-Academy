// Représentation d'une disponibilité renvoyée par l'API. Les heures restent
// locales au professeur (telles qu'il les a saisies).
import { ApiProperty } from '@nestjs/swagger';
import { JourSemaine, Recurrence } from '@prisma/client';

export class DisponibiliteReponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: JourSemaine, enumName: 'JourSemaine' })
  jour!: JourSemaine;

  @ApiProperty({ example: '09:00' })
  heureDebut!: string;

  @ApiProperty({ example: '11:00' })
  heureFin!: string;

  @ApiProperty({ enum: Recurrence, enumName: 'Recurrence' })
  recurrence!: Recurrence;
}
