// Représentation d'une note de session renvoyée par l'API.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NoteSessionReponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  seanceId!: string;

  @ApiProperty({ description: 'UUID de l’élève' })
  eleveId!: string;

  @ApiPropertyOptional({ description: 'Nom complet de l’élève' })
  nomEleve?: string;

  @ApiProperty({ description: 'UUID du professeur' })
  professeurId!: string;

  @ApiPropertyOptional({ nullable: true })
  sourateMemorisee?: string | null;

  @ApiPropertyOptional({ nullable: true })
  sourateRevisee?: string | null;

  @ApiPropertyOptional({ nullable: true })
  pointsTajwid?: string | null;

  @ApiPropertyOptional({ nullable: true })
  commentaire?: string | null;

  @ApiProperty({ example: '2024-09-02T11:00:00.000Z' })
  creeLe!: Date;
}
