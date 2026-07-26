// DTO de pagination transverse. Tout module exposant une liste DOIT paginer
// (règle du cahier des charges). Placé dans `partages/` pour réutilisation sans
// coupler les modules métier entre eux.
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const TAILLE_PAGE_DEFAUT = 20;
export const TAILLE_PAGE_MAX = 100;

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Numéro de page (à partir de 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: TAILLE_PAGE_DEFAUT, maximum: TAILLE_PAGE_MAX, description: "Nombre d'éléments par page" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(TAILLE_PAGE_MAX)
  taille?: number = TAILLE_PAGE_DEFAUT;
}

/** Calcule l'offset Prisma (skip) à partir d'une pagination normalisée. */
export function calculerSkip(pagination: PaginationDto): number {
  const page = Math.max(1, pagination.page ?? 1);
  const taille = Math.min(TAILLE_PAGE_MAX, Math.max(1, pagination.taille ?? TAILLE_PAGE_DEFAUT));
  return (page - 1) * taille;
}

/** Normalise la taille de page (valeur bornée). */
export function calculerTake(pagination: PaginationDto): number {
  return Math.min(TAILLE_PAGE_MAX, Math.max(1, pagination.taille ?? TAILLE_PAGE_DEFAUT));
}

/** Enveloppe de réponse paginée standard. */
export class PageReponseDto<T> {
  donnees!: T[];
  total!: number;
  page!: number;
  taille!: number;
}
