// Nouveau statut à appliquer à une réservation (confirmation, annulation…).
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatutReservation } from '@prisma/client';

export class ChangerStatutDto {
  @ApiProperty({ enum: StatutReservation, enumName: 'StatutReservation', example: StatutReservation.CONFIRME })
  @IsEnum(StatutReservation)
  nouveauStatut!: StatutReservation;
}
