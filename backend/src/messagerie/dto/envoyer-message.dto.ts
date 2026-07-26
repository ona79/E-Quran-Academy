// Envoi d'un message asynchrone à un autre utilisateur (élève ↔ professeur).
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class EnvoyerMessageDto {
  @ApiProperty({ description: 'UUID du destinataire' })
  @IsString()
  @MaxLength(64)
  destinataireId!: string;

  @ApiProperty({ example: 'Bonjour, serait-il possible de réserver un cours ?', maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  contenu!: string;
}
