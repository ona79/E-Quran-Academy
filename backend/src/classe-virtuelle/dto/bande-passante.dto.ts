// Signalement du niveau de bande passante par le client. Le serveur peut alors
// activer automatiquement le mode de repli « audio seul » si la qualité
// devient insuffisante — sans interrompre la séance.
//
// Signal réseau éphémère : NON persisté en base, d'où une énumération
// TypeScript locale (et non Prisma).
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum NiveauBandePassante {
  /// Bande passante suffisante pour la vidéo.
  BONNE = 'BONNE',
  /// Bande passante dégradée : on bascule en audio seul + Mushaf.
  FAIBLE = 'FAIBLE',
}

export class BandePassanteDto {
  @ApiProperty({
    enum: NiveauBandePassante,
    enumName: 'NiveauBandePassante',
    example: NiveauBandePassante.FAIBLE,
  })
  @IsEnum(NiveauBandePassante)
  niveau!: NiveauBandePassante;
}
