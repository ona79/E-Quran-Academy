// Logique métier du domaine "feature-flags".
// Domaine : activation/désactivation de fonctionnalités sans redéploiement.
//
// Ce service est CONSULTÉ par d'autres modules (paiement, reservations…) pour
// savoir si une fonctionnalité est active. Pour éviter une requête DB à chaque
// vérification, on maintient un cache en mémoire rechargé à la demande.
//
// Règle d'architecture : c'est bien ce module qui gère la table feature_flags ;
// les autres modules ne font qu'appeler `estActif(cle)`.
import { Injectable, OnModuleInit } from '@nestjs/common';
import { FeatureFlag } from '@prisma/client';
import { PrismaService } from '../partages/prisma/prisma.service';
import {
  PageReponseDto,
  PaginationDto,
  calculerSkip,
  calculerTake,
} from '../partages/pagination/pagination.dto';
import { CreerFeatureFlagDto } from './dto/creer-feature-flag.dto';
import { ModifierFeatureFlagDto } from './dto/modifier-feature-flag.dto';
import { FeatureFlagReponseDto } from './dto/feature-flag.reponse.dto';

@Injectable()
export class FeatureFlagsService implements OnModuleInit {
  // Cache en mémoire : clé -> actif. Rechargé via rechargerCache().
  private cache = new Map<string, boolean>();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.rechargerCache();
  }

  /**
   * Indique si une fonctionnalité est active. Consultation rapide (cache).
   * Par défaut, une fonctionnalité inconnue est considérée comme INACTIVE
   * (principe de prudence).
   */
  estActif(cle: string): boolean {
    return this.cache.get(cle) ?? false;
  }

  /** Recharge le cache depuis la base. À appeler après chaque modification. */
  async rechargerCache(): Promise<void> {
    const flags = await this.prisma.featureFlag.findMany();
    this.cache = new Map(flags.map((f) => [f.cle, f.actif]));
  }

  /** Liste paginée de tous les flags. */
  async lister(pagination: PaginationDto): Promise<PageReponseDto<FeatureFlagReponseDto>> {
    const take = calculerTake(pagination);
    const skip = calculerSkip(pagination);

    const [total, lignes] = await Promise.all([
      this.prisma.featureFlag.count(),
      this.prisma.featureFlag.findMany({
        orderBy: { cle: 'asc' },
        take,
        skip,
      }),
    ]);

    return {
      total,
      page: pagination.page ?? 1,
      taille: take,
      donnees: lignes.map(this.sanitiser),
    };
  }

  /** Crée un flag. Réservé à l'administrateur (contrôleur). */
  async creer(dto: CreerFeatureFlagDto): Promise<FeatureFlagReponseDto> {
    const cree = await this.prisma.featureFlag.create({
      data: { cle: dto.cle, actif: dto.actif, description: dto.description },
    });
    await this.rechargerCache();
    return this.sanitiser(cree);
  }

  /** Modifie un flag (activation/désactivation sans redéploiement). */
  async modifier(
    cle: string,
    dto: ModifierFeatureFlagDto,
  ): Promise<FeatureFlagReponseDto> {
    const maj = await this.prisma.featureFlag.update({
      where: { cle },
      data: {
        ...(dto.actif !== undefined && { actif: dto.actif }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
    await this.rechargerCache();
    return this.sanitiser(maj);
  }

  /** Supprime un flag. */
  async supprimer(cle: string): Promise<void> {
    await this.prisma.featureFlag.delete({ where: { cle } });
    await this.rechargerCache();
  }

  private sanitiser(f: FeatureFlag): FeatureFlagReponseDto {
    return {
      id: f.id,
      cle: f.cle,
      actif: f.actif,
      description: f.description,
    };
  }
}
