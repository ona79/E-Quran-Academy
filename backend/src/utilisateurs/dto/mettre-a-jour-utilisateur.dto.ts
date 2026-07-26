import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class MettreAJourUtilisateurDto {
  @ApiPropertyOptional({ example: 'Aminata Diallo' })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  nomComplet?: string;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  langue?: string;

  @ApiPropertyOptional({ example: 'Africa/Dakar' })
  @IsOptional()
  @IsString()
  fuseauHoraire?: string;
}
