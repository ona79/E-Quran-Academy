// Demande de réservation émise par un élève.
// Le créneau est fourni en heure LOCALE de l'élève + fuseau ; le service le
// convertit en UTC avant stockage.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, IsTimeZone, Matches, MaxLength } from 'class-validator';

const FORMAT_HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreerReservationDto {
  @ApiProperty({ description: 'Identifiant (UUID) du professeur réservé' })
  @IsString()
  @MaxLength(64)
  professeurId!: string;

  @ApiProperty({ example: '2024-09-02', description: "Date locale de l'élève (AAAA-MM-JJ)" })
  @IsISO8601({ strict: true })
  dateLocale!: string;

  @ApiProperty({ example: '10:00', description: "Heure de début locale de l'élève (HH:mm)" })
  @IsString()
  @Matches(FORMAT_HH_MM, { message: "heureDebut doit être au format 'HH:mm'" })
  heureDebut!: string;

  @ApiProperty({ example: '11:00', description: "Heure de fin locale de l'élève (HH:mm)" })
  @IsString()
  @Matches(FORMAT_HH_MM, { message: "heureFin doit être au format 'HH:mm'" })
  heureFin!: string;

  @ApiProperty({ example: 'Africa/Dakar', description: "Fuseau horaire IANA dans lequel l'élève saisit les heures" })
  @IsTimeZone()
  fuseauHoraireEleve!: string;

  @ApiPropertyOptional({ example: 'Premier cours — révision sourate Al-Fatiha', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  noteEleve?: string;
}
