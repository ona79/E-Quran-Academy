// Logique métier du domaine "suivi-pédagogique".
// Domaine : formulaire de fin de cours, sourates mémorisées/révisées, tajwid.
//
// Règle d'architecture : ce service n'accède qu'à la table `notes_session`.
// L'identité (professeurId) vient du JWT ; eleveId/seanceId sont fournis par
// l'appelant. Une seule note par séance (contrainte d'unicité seanceId).
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NoteSession } from '@prisma/client';
import { PrismaService } from '../partages/prisma/prisma.service';
import {
  PageReponseDto,
  PaginationDto,
  calculerSkip,
  calculerTake,
} from '../partages/pagination/pagination.dto';
import { CreerNoteSessionDto } from './dto/creer-note-session.dto';
import { NoteSessionReponseDto } from './dto/note-session.reponse.dto';

@Injectable()
export class SuiviPedagogiqueService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée la note pédagogique d'une séance. Une seule note par séance.
   * Réservé au professeur (vérifié au contrôleur via @Roles(PROFESSEUR)).
   */
  async creerNote(
    professeurId: string,
    dto: CreerNoteSessionDto,
  ): Promise<NoteSessionReponseDto> {
    const existante = await this.prisma.noteSession.findUnique({
      where: { seanceId: dto.seanceId },
    });
    if (existante) {
      throw new ConflictException('Une note existe déjà pour cette séance');
    }

    const cree = await this.prisma.noteSession.create({
      data: {
        seanceId: dto.seanceId,
        eleveId: dto.eleveId,
        professeurId,
        sourateMemorisee: dto.sourateMemorisee,
        sourateRevisee: dto.sourateRevisee,
        pointsTajwid: dto.pointsTajwid,
        commentaire: dto.commentaire,
      },
    });

    return this.sanitiser(cree);
  }

  /**
   * Historique pédagogique d'un élève : l'élève consulte SES notes, le
   * professeur celles qu'il a rédigées. Liste paginée.
   */
  async listerNotes(
    demandeurId: string,
    pagination: PaginationDto,
    enTantQueProfesseur = false,
  ): Promise<PageReponseDto<NoteSessionReponseDto>> {
    const take = calculerTake(pagination);
    const skip = calculerSkip(pagination);
    const cle = enTantQueProfesseur ? 'professeurId' : 'eleveId';

    const [total, lignes] = await Promise.all([
      this.prisma.noteSession.count({ where: { [cle]: demandeurId } }),
      this.prisma.noteSession.findMany({
        where: { [cle]: demandeurId },
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

  /** Détail d'une note. L'élève concerné ou le professeur auteur uniquement. */
  async trouverNote(
    noteId: string,
    demandeurId: string,
  ): Promise<NoteSessionReponseDto> {
    const note = await this.prisma.noteSession.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException('Note introuvable');
    }
    if (note.eleveId !== demandeurId && note.professeurId !== demandeurId) {
      throw new NotFoundException('Note introuvable');
    }
    return this.sanitiser(note);
  }

  private sanitiser(n: NoteSession): NoteSessionReponseDto {
    return {
      id: n.id,
      seanceId: n.seanceId,
      eleveId: n.eleveId,
      professeurId: n.professeurId,
      sourateMemorisee: n.sourateMemorisee,
      sourateRevisee: n.sourateRevisee,
      pointsTajwid: n.pointsTajwid,
      commentaire: n.commentaire,
      creeLe: n.creeLe,
    };
  }
}
