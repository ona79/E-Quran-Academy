// Création d'un créneau de disponibilité par un professeur.
// Les heures sont LOCALES au professeur (fuseau = users.fuseauHoraire).
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { JourSemaine, Recurrence } from '@prisma/client';

// Valide le format "HH:mm" (00:00 à 23:59).
const FORMAT_HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreerDisponibiliteDto {
  @ApiProperty({ enum: JourSemaine, enumName: 'JourSemaine', example: JourSemaine.LUNDI })
  @IsEnum(JourSemaine)
  jour!: JourSemaine;

  @ApiProperty({ example: '09:00', description: 'Heure de début locale (HH:mm)' })
  @IsString()
  @Matches(FORMAT_HH_MM, { message: "heureDebut doit être au format 'HH:mm'" })
  heureDebut!: string;

  @ApiProperty({ example: '11:00', description: 'Heure de fin locale (HH:mm)' })
  @IsString()
  @Matches(FORMAT_HH_MM, { message: "heureFin doit être au format 'HH:mm'" })
  heureFin!: string;

  @ApiPropertyOptional({ enum: Recurrence, enumName: 'Recurrence', default: Recurrence.HEBDOMADAIRE })
  @IsOptional()
  @IsEnum(Recurrence)
  recurrence?: Recurrence;

  @ApiPropertyOptional({ example: 'Disponible pour la révision du Coran', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
