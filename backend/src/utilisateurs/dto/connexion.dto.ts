// Identifiants de connexion. L'authentification échoue de façon identique
// (message générique) que l'e-mail n'existe pas ou que le mot de passe soit
// erroné — pour ne pas révéler qu'un compte existe.
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class ConnexionDto {
  @ApiProperty({ example: 'aminata.diallo@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MotDePasseFort!2024' })
  @IsString()
  @Length(1, 72)
  motDePasse!: string;
}
