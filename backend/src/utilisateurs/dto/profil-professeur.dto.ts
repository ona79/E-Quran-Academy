// Mise à jour du profil professeur (par le professeur lui-même).
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Qiraat } from '@prisma/client';

import { EstUrlExterneSecurisee } from '../../partages/validation/est-url-externe-securisee';

export class MettreAJourProfilProfesseurDto {
  @ApiPropertyOptional({ example: 'Hafiz certifié, 15 ans d’enseignement.', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ example: '/uploads/profils/avatar.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional({ example: 'https://r2.example.com/ijaza.pdf' })
  @IsOptional()
  @EstUrlExterneSecurisee()
  ijazaUrl?: string;

  @ApiPropertyOptional({ example: 'https://r2.example.com/audio.mp3' })
  @IsOptional()
  @EstUrlExterneSecurisee()
  audioUrl?: string;

  @ApiPropertyOptional({ example: 5000, minimum: 0, description: 'Tarif horaire en FCFA' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  tarifHoraire?: number;

  @ApiPropertyOptional({ enum: Qiraat, enumName: 'Qiraat' })
  @IsOptional()
  @IsEnum(Qiraat)
  qiraatParDefaut?: Qiraat;

  @ApiPropertyOptional({ default: false, description: 'Active la réservation instantanée' })
  @IsOptional()
  @IsBoolean()
  reservationInstantanee?: boolean;
}

export class ProfilProfesseurReponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ nullable: true })
  bio?: string | null;

  @ApiPropertyOptional({ nullable: true })
  photoUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  ijazaUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  audioUrl?: string | null;

  @ApiProperty()
  tarifHoraire!: number;

  @ApiProperty({ enum: Qiraat, enumName: 'Qiraat' })
  qiraatParDefaut!: Qiraat;

  @ApiProperty()
  reservationInstantanee!: boolean;

  @ApiProperty({ description: 'Profil validé par l’administrateur' })
  valide!: boolean;
}
