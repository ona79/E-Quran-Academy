// État courant du Mushaf d'une séance. Renvoyé au client :
//   - à la connexion (reconnexion sans perte d'état) ;
//   - à chaque événement de surlignage du professeur (broadcast).
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EtatMushafDto {
  @ApiProperty({ minimum: 1, maximum: 114, example: 1 })
  numeroSourate!: number;

  @ApiProperty({ minimum: 1, example: 3 })
  numeroVerset!: number;

  @ApiPropertyOptional({ example: '5-9', nullable: true })
  plageSurlignage?: string | null;
}
