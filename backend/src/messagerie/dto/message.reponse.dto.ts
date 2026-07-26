// Représentation d'un message renvoyée par l'API.
import { ApiProperty } from '@nestjs/swagger';

export class MessageReponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'UUID de l’expéditeur' })
  expediteurId!: string;

  @ApiProperty({ description: 'UUID du destinataire' })
  destinataireId!: string;

  @ApiProperty({ example: 'Bonjour, serait-il possible de réserver un cours ?' })
  contenu!: string;

  @ApiProperty({ description: 'Le destinataire a-t-il lu le message ?' })
  lu!: boolean;

  @ApiProperty({ example: '2024-09-02T10:00:00.000Z' })
  horodatage!: Date;
}
