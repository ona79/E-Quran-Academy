// Données attendues pour créer un compte. Le rôle n'est PAS pilotable ici :
// toute inscription crée un compte ELEVE. La promotion à PROFESSEUR/ADMIN est
// réservée à un administrateur (endpoint dédié) — on évite ainsi l'auto-
// élévation de privilèges.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsLocale,
  IsOptional,
  IsString,
  IsTimeZone,
  Length,
  MaxLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class InscriptionDto {
  @ApiProperty({ example: 'aminata.diallo@example.com', description: 'Adresse e-mail du compte' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MotDePasseFort!2024', minLength: 8, description: 'Mot de passe (haché en base)' })
  @IsString()
  @Length(8, 72)
  motDePasse!: string;

  @ApiProperty({ example: 'Aminata Diallo', description: 'Nom complet affiché' })
  @IsString()
  @MaxLength(120)
  nomComplet!: string;

  @ApiPropertyOptional({ example: 'fr', default: 'fr', description: 'Code langue préféré (BCP 47)' })
  @IsLocale()
  langue?: string;

  @ApiPropertyOptional({
    example: 'Africa/Dakar',
    default: 'Africa/Dakar',
    description: 'Fuseau horaire IANA — sert à la conversion des créneaux de cours',
  })
  @IsTimeZone()
  fuseauHoraire?: string;

  @ApiPropertyOptional({
    enum: ['ELEVE', 'PROFESSEUR'],
    default: 'ELEVE',
    description: 'Rôle demandé : ELEVE (défaut) ou PROFESSEUR (compte en attente de validation admin)',
  })
  @IsOptional()
  @IsEnum(['ELEVE', 'PROFESSEUR'])
  role?: 'ELEVE' | 'PROFESSEUR';
}
