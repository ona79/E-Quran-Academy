// DTO pour demander la réinitialisation de mot de passe par email.
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class DemandeReinitialisationDto {
  @ApiProperty({ example: 'eleve@example.com', description: 'Adresse e-mail du compte à réinitialiser' })
  @IsEmail()
  email!: string;
}
