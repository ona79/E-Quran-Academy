// Création d'un feature flag (réservé à l'administrateur).
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

// Clé normalisée "domaine.fonctionnalité" (ex: "paiement.actif").
const FORMAT_CLE = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/;

export class CreerFeatureFlagDto {
  @ApiProperty({ example: 'paiement.actif', description: 'Clé normalisée "domaine.fonctionnalité"' })
  @IsString()
  @Matches(FORMAT_CLE, {
    message: "La clé doit être au format 'domaine.fonctionnalité' (ex: 'paiement.actif')",
  })
  @MaxLength(100)
  cle!: string;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  actif!: boolean;

  @ApiPropertyOptional({ example: 'Active le flux de paiement réel', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
