// Recueil du consentement parental pour l'enregistrement.
// CONTRAINTE NON NÉGOCIABLE : l'enregistrement exige le consentement parental
// AVANT son activation. On ne peut pas activer l'enregistrement sans ce
// consentement explicite.
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ConsentementEnregistrementDto {
  @ApiProperty({
    example: true,
    description: 'Consentement parental explicite à l’enregistrement de la séance',
  })
  @IsBoolean()
  consentementParental!: boolean;
}
