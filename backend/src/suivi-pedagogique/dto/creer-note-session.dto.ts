// Formulaire de fin de cours rempli par le professeur.
// Identité (eleveId, professeurId) fournie par le contrôleur depuis le JWT,
// ce module ne lit pas la table seances_cours.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreerNoteSessionDto {
  @ApiProperty({ description: 'Identifiant de la séance concernée' })
  @IsString()
  @MaxLength(64)
  seanceId!: string;

  @ApiProperty({ description: 'UUID de l’élève (fourni explicitement pour le découplage)' })
  @IsString()
  @MaxLength(64)
  eleveId!: string;

  @ApiPropertyOptional({ example: 'Al-Fatiha', description: 'Sourate(s) mémorisée(s)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sourateMemorisee?: string;

  @ApiPropertyOptional({ example: 'An-Nas', description: 'Sourate(s) révisée(s)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sourateRevisee?: string;

  @ApiPropertyOptional({ example: 'Règles de Noon Sakinah', description: 'Points de tajwid travaillés' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pointsTajwid?: string;

  @ApiPropertyOptional({ example: 'Bonne progression, à continuer.', description: 'Commentaire libre' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  commentaire?: string;
}
