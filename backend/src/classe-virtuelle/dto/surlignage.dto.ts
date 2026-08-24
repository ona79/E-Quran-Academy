// Payload de synchronisation du Mushaf — volontairement minimal.
// CONTRAINTE NON NÉGOCIABLE : ne contenir que des références, jamais d'image.
// Cela garde le payload léger sur connexion faible.
export interface PayloadSurlignage {
  /// Numéro de sourate (1 à 114).
  numeroSourate: number;
  /// Numéro du verset courant (1-based).
  numeroVerset: number;
  /// Plage de surlignage au format "debut-fin" (ex: "5-9"), ou null/absent.
  plageSurlignage?: string | null;
}

// DTO de validation d'un événement de surlignage émis par le professeur.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

// "5-9" ou "5" (verset unique) ; null autorisé pour lever le surlignage.
const FORMAT_PLAGE = /^\d+(-\d+)?$/;

export class SurlignageDto implements PayloadSurlignage {
  @ApiPropertyOptional({ description: 'Identifiant de la séance' })
  @IsOptional()
  @IsString()
  seanceId?: string;

  @ApiProperty({ minimum: 1, maximum: 114, example: 1, description: 'Numéro de sourate' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(114)
  numeroSourate!: number;

  @ApiProperty({ minimum: 1, example: 3, description: 'Numéro du verset courant' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numeroVerset!: number;

  @ApiPropertyOptional({
    example: '5-9',
    description: 'Plage de versets surlignés ("debut-fin" ou "5"), ou null pour effacer',
  })
  @IsOptional()
  plageSurlignage?: string | null;
}
