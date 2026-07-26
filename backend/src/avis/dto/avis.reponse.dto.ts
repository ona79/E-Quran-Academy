// Représentation d'un avis renvoyée par l'API.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AvisReponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'UUID du professeur' })
  professeurId!: string;

  @ApiProperty({ description: 'UUID de l’élève auteur' })
  eleveId!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  note!: number;

  @ApiPropertyOptional({ nullable: true })
  commentaire?: string | null;

  @ApiProperty({ example: '2024-09-02T11:00:00.000Z' })
  creeLe!: Date;
}

export class AuteurAvisDto {
  @ApiProperty()
  prenom!: string;

  @ApiProperty()
  nom!: string;

  @ApiPropertyOptional({ nullable: true })
  pays?: string | null;
}

export class AvisRecentReponseDto extends AvisReponseDto {
  @ApiProperty()
  auteur!: AuteurAvisDto;
}

