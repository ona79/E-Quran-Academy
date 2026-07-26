// Avis laissé par un élève sur un professeur.
// Un élève ne laisse qu'un seul avis par professeur (contrainte d'unicité en base).
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreerAvisDto {
  @ApiProperty({ description: 'UUID du professeur évalué' })
  @IsString()
  @MaxLength(64)
  professeurId!: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5, description: 'Note en étoiles (1 à 5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  note!: number;

  @ApiPropertyOptional({ example: 'Professeur patient et pédagogue.', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  commentaire?: string;
}
