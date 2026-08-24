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

    let eleveIdFinal = dto.eleveId;
    const userEleve = await this.prisma.user.findUnique({ where: { id: eleveIdFinal } });
    if (!userEleve) {
      const seance = await this.prisma.seanceCours.findFirst({
        where: { OR: [{ id: dto.seanceId }, { id: eleveIdFinal }, { reservationId: eleveIdFinal }] },
      });
      if (seance) {
        eleveIdFinal = seance.eleveId;
      } else {
        const res = await this.prisma.reservation.findFirst({
          where: { OR: [{ id: dto.seanceId }, { id: eleveIdFinal }] },
        });
        if (res) {
          eleveIdFinal = res.eleveId;
        }
      }
    }

    const cree = await this.prisma.noteSession.create({
      data: {
        seanceId: dto.seanceId,
        eleveId: eleveIdFinal,
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

    const elevesIds = Array.from(new Set(lignes.map((n) => n.eleveId)));
    const eleves = await this.prisma.user.findMany({
      where: { id: { in: elevesIds } },
      select: { id: true, nomComplet: true },
    });
    const mapNoms = new Map(eleves.map((e) => [e.id, e.nomComplet]));

    // Résolution de secours si eleveId est un UUID de séance ou de réservation
    const manquantIds = elevesIds.filter((id) => !mapNoms.has(id));
    if (manquantIds.length > 0) {
      const seances = await this.prisma.seanceCours.findMany({
        where: { OR: [{ id: { in: manquantIds } }, { reservationId: { in: manquantIds } }] },
        include: { eleve: { select: { nomComplet: true } } },
      });
      for (const s of seances) {
        if (s.eleve?.nomComplet) {
          mapNoms.set(s.id, s.eleve.nomComplet);
          mapNoms.set(s.reservationId, s.eleve.nomComplet);
        }
      }

      const encoreManquants = manquantIds.filter((id) => !mapNoms.has(id));
      if (encoreManquants.length > 0) {
        const reservations = await this.prisma.reservation.findMany({
          where: { id: { in: encoreManquants } },
          include: { eleve: { select: { nomComplet: true } } },
        });
        for (const r of reservations) {
          if (r.eleve?.nomComplet) {
            mapNoms.set(r.id, r.eleve.nomComplet);
          }
        }
      }
    }

    return {
      total,
      page: pagination.page ?? 1,
      taille: take,
      donnees: lignes.map((n) => ({
        ...this.sanitiser(n),
        nomEleve: mapNoms.get(n.eleveId) ?? undefined,
      })),
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
