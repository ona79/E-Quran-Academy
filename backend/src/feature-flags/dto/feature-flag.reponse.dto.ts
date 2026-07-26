// Représentation d'un feature flag renvoyée par l'API.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeatureFlagReponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'paiement.actif' })
  cle!: string;

  @ApiProperty({ example: false })
  actif!: boolean;

  @ApiPropertyOptional({ nullable: true })
  description?: string | null;
}
