// DTO pour appliquer la réinitialisation de mot de passe avec jeton unique.
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ReinitialiserMotDePasseDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6...', description: 'Jeton de réinitialisation sécurisé reçu par e-mail' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'NouveauMotDePasseSecurise!2026', description: 'Nouveau mot de passe (au moins 8 caractères)' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  nouveauMotDePasse!: string;
}
