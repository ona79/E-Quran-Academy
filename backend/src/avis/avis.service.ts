// Logique métier du domaine "avis".
// Domaine : notes et commentaires laissés par les élèves sur les professeurs.
//
// Règle d'architecture : ce service n'accède qu'à la table `avis`.
// L'identité (eleveId) vient du JWT. Un élève ne laisse qu'un seul avis par
// professeur (contrainte @@unique([eleveId, professeurId]) en base) ; en cas
// de doublon on fait une mise à jour (upsert) plutôt qu'une erreur.
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Avis } from '@prisma/client';
import { PrismaService } from '../partages/prisma/prisma.service';
import {
  PageReponseDto,
  PaginationDto,
  calculerSkip,
  calculerTake,
} from '../partages/pagination/pagination.dto';
import { CreerAvisDto } from './dto/creer-avis.dto';
import { AvisReponseDto, AvisRecentReponseDto } from './dto/avis.reponse.dto';

@Injectable()
export class AvisService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée ou met à jour l'avis d'un élève sur un professeur.
   * Un élève ne peut s'évaluer lui-même.
   */
  async creerOuMettreAJourAvis(
    eleveId: string,
    dto: CreerAvisDto,
  ): Promise<AvisReponseDto> {
    if (dto.professeurId === eleveId) {
      throw new BadRequestException('Impossible de laisser un avis sur soi-même');
    }

    const enregistre = await this.prisma.avis.upsert({
      where: {
        eleveId_professeurId: {
          eleveId,
          professeurId: dto.professeurId,
        },
      },
      create: {
        eleveId,
        professeurId: dto.professeurId,
        note: dto.note,
        commentaire: dto.commentaire,
      },
      update: {
        note: dto.note,
        commentaire: dto.commentaire,
      },
    });

    return this.sanitiser(enregistre);
  }

  /**
   * Liste paginée des avis reçus par un professeur (profil public).
   * Pas d'authentification forte requise côté contrôleur car c'est public,
   * mais on garde le garde JWT pour rester cohérent avec le reste de l'API.
   */
  async listerAvisProfesseur(
    professeurId: string,
    pagination: PaginationDto,
  ): Promise<PageReponseDto<AvisReponseDto>> {
    const take = calculerTake(pagination);
    const skip = calculerSkip(pagination);

    const [total, lignes] = await Promise.all([
      this.prisma.avis.count({ where: { professeurId } }),
      this.prisma.avis.findMany({
        where: { professeurId },
        orderBy: { creeLe: 'desc' },
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

  /** Note moyenne d'un professeur (sur 5) + nombre d'avis. */
  async calculerNoteMoyenne(professeurId: string): Promise<{ moyenne: number; total: number }> {
    const agregation = await this.prisma.avis.aggregate({
      where: { professeurId },
      _avg: { note: true },
      _count: { note: true },
    });

    return {
      moyenne: agregation._avg.note ?? 0,
      total: agregation._count.note,
    };
  }

  /**
   * Liste des derniers avis globaux pour la page d'accueil (Landing Page).
   * Retourne aussi les informations de l'élève (auteur).
   */
  async listerAvisRecents(limite: number = 3): Promise<AvisRecentReponseDto[]> {
    const avis = await this.prisma.avis.findMany({
      where: {
        commentaire: { not: null }, // On ne veut que les avis avec du texte
      },
      orderBy: { creeLe: 'desc' },
      take: limite,
      include: {
        eleve: {
          select: {
            nomComplet: true,
          },
        },
      },
    });

    return avis.map((a) => {
      const nomComplet = a.eleve?.nomComplet || 'Anonyme';
      const parts = nomComplet.split(' ');
      const prenom = parts[0];
      const nom = parts.slice(1).join(' ') || ' ';

      return {
        ...this.sanitiser(a),
        auteur: {
          prenom,
          nom,
        },
      };
    });
  }

  /** Détail d'un avis (auteur ou professeur concerné uniquement). */
  async trouverAvis(avisId: string, demandeurId: string): Promise<AvisReponseDto> {
    const avis = await this.prisma.avis.findUnique({ where: { id: avisId } });
    if (!avis) {
      throw new NotFoundException('Avis introuvable');
    }
    if (avis.eleveId !== demandeurId && avis.professeurId !== demandeurId) {
      throw new NotFoundException('Avis introuvable');
    }
    return this.sanitiser(avis);
  }

  private sanitiser(a: Avis): AvisReponseDto {
    return {
      id: a.id,
      professeurId: a.professeurId,
      eleveId: a.eleveId,
      note: a.note,
      commentaire: a.commentaire,
      creeLe: a.creeLe,
    };
  }
}
