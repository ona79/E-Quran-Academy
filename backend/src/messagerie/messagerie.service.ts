// Logique métier du domaine "messagerie".
// Domaine : messagerie asynchrone entre élèves et professeurs.
//
// Règle d'architecture : ce service n'accède qu'à la table `messages`.
// L'identité (expediteurId) vient du JWT. Un utilisateur ne peut consulter
// que les conversations où il est expéditeur OU destinataire.
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from '../partages/prisma/prisma.service';
import {
  PageReponseDto,
  PaginationDto,
  calculerSkip,
  calculerTake,
} from '../partages/pagination/pagination.dto';
import { EnvoyerMessageDto } from './dto/envoyer-message.dto';
import { MessageReponseDto } from './dto/message.reponse.dto';

@Injectable()
export class MessagerieService {
  constructor(private readonly prisma: PrismaService) {}

  /** Envoie un message. On ne peut pas s'écrire à soi-même. */
  async envoyer(expediteurId: string, dto: EnvoyerMessageDto): Promise<MessageReponseDto> {
    if (dto.destinataireId === expediteurId) {
      throw new BadRequestException('Impossible de s’envoyer un message à soi-même');
    }

    const message = await this.prisma.message.create({
      data: {
        expediteurId,
        destinataireId: dto.destinataireId,
        contenu: dto.contenu,
      },
    });

    return this.sanitiser(message);
  }

  /**
   * Conversation entre l'utilisateur connecté et un interlocuteur.
   * Liste paginée, triée par horodatage croissant.
   */
  async listerConversation(
    utilisateurId: string,
    interlocuteurId: string,
    pagination: PaginationDto,
  ): Promise<PageReponseDto<MessageReponseDto>> {
    const take = calculerTake(pagination);
    const skip = calculerSkip(pagination);

    const where = {
      OR: [
        { expediteurId: utilisateurId, destinataireId: interlocuteurId },
        { expediteurId: interlocuteurId, destinataireId: utilisateurId },
      ],
    };

    const [total, lignes] = await Promise.all([
      this.prisma.message.count({ where }),
      this.prisma.message.findMany({
        where,
        orderBy: { horodatage: 'asc' },
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

  /**
   * Boîte de réception de l'utilisateur : messages reçus, non lus d'abord.
   */
  async listerBoiteReception(
    utilisateurId: string,
    pagination: PaginationDto,
  ): Promise<PageReponseDto<MessageReponseDto>> {
    const take = calculerTake(pagination);
    const skip = calculerSkip(pagination);

    const where = { destinataireId: utilisateurId };

    const [total, lignes] = await Promise.all([
      this.prisma.message.count({ where }),
      this.prisma.message.findMany({
        where,
        orderBy: [{ lu: 'asc' }, { horodatage: 'desc' }],
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

  /** Marque un message comme lu. Seul le destinataire peut le faire. */
  async marquerCommeLu(messageId: string, demandeurId: string): Promise<MessageReponseDto> {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException('Message introuvable');
    }
    if (message.destinataireId !== demandeurId) {
      throw new NotFoundException('Message introuvable');
    }

    const maj = await this.prisma.message.update({
      where: { id: messageId },
      data: { lu: true },
    });
    return this.sanitiser(maj);
  }

  private sanitiser(m: Message): MessageReponseDto {
    return {
      id: m.id,
      expediteurId: m.expediteurId,
      destinataireId: m.destinataireId,
      contenu: m.contenu,
      lu: m.lu,
      horodatage: m.horodatage,
    };
  }
}
