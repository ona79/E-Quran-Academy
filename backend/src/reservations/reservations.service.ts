// Logique métier du domaine "reservations".
// Domaine : disponibilités des professeurs + réservations de cours par les élèves.
//
// Règles d'architecture :
// - Ce service n'accède qu'à ses tables (disponibilites, reservations).
// - Il ne lit JAMAIS les tables d'un autre module ; l'identité de l'utilisateur
//   (eleveId/professeurId, fuseau) est fournie par le contrôleur via la charge
//   utile JWT, pas par un appel au service utilisateurs.
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Disponibilite,
  JourSemaine,
  Reservation,
  StatutReservation,
} from '@prisma/client';
import { PrismaService } from '../partages/prisma/prisma.service';
import { PaiementService } from '../paiement/paiement.service';
import {
  PageReponseDto,
  PaginationDto,
  calculerSkip,
  calculerTake,
} from '../partages/pagination/pagination.dto';
import {
  heureLocaleVersUtc,
  utcVersHeureLocale,
} from '../partages/fuseau-horaire/fuseau-horaire.utilitaire';
import { CreerDisponibiliteDto } from './dto/creer-disponibilite.dto';
import { CreerReservationDto } from './dto/creer-reservation.dto';
import { DisponibiliteReponseDto } from './dto/disponibilite.reponse.dto';
import { ReservationReponseDto } from './dto/reservation.reponse.dto';

// Mapping numéro de jour JS (0=dimanche … 6=samedi) -> énumération métier.
const JOUR_VERS_ENUM: Record<number, JourSemaine> = {
  0: JourSemaine.DIMANCHE,
  1: JourSemaine.LUNDI,
  2: JourSemaine.MARDI,
  3: JourSemaine.MERCREDI,
  4: JourSemaine.JEUDI,
  5: JourSemaine.VENDREDI,
  6: JourSemaine.SAMEDI,
};

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paiementService: PaiementService,
  ) {}

  // ───────────────────────── Disponibilités ──────────────────────────

  /** Liste paginée des disponibilités d'un professeur. */
  async listerDisponibilites(
    professeurId: string,
    pagination: PaginationDto,
  ): Promise<PageReponseDto<DisponibiliteReponseDto>> {
    const take = calculerTake(pagination);
    const skip = calculerSkip(pagination);

    const [total, lignes] = await Promise.all([
      this.prisma.disponibilite.count({ where: { professeurId } }),
      this.prisma.disponibilite.findMany({
        where: { professeurId },
        orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
        take,
        skip,
      }),
    ]);

    return {
      total,
      page: pagination.page ?? 1,
      taille: take,
      donnees: lignes.map(this.sanitiserDisponibilite),
    };
  }

  /**
   * Crée un créneau de disponibilité pour le professeur connecté.
   * Vérifie la cohérence heureDebut < heureFin et l'absence de chevauchement
   * avec un créneau existant le même jour.
   */
  async creerDisponibilite(
    professeurId: string,
    dto: CreerDisponibiliteDto,
  ): Promise<DisponibiliteReponseDto> {
    this.verifierOrdreHeures(dto.heureDebut, dto.heureFin);

    const chevauchement = await this.prisma.disponibilite.findFirst({
      where: {
        professeurId,
        jour: dto.jour,
        AND: [
          { heureDebut: { lt: dto.heureFin } },
          { heureFin: { gt: dto.heureDebut } },
        ],
      },
    });
    if (chevauchement) {
      throw new ConflictException(
        'Ce créneau chevauche une disponibilité existante',
      );
    }

    const cree = await this.prisma.disponibilite.create({
      data: {
        professeurId,
        jour: dto.jour,
        heureDebut: dto.heureDebut,
        heureFin: dto.heureFin,
        recurrence: dto.recurrence,
      },
    });

    return this.sanitiserDisponibilite(cree);
  }

  /** Supprime un créneau. Seul le propriétaire peut (vérifié ici). */
  async supprimerDisponibilite(
    professeurId: string,
    disponibiliteId: string,
  ): Promise<void> {
    const dispo = await this.prisma.disponibilite.findUnique({
      where: { id: disponibiliteId },
    });
    if (!dispo || dispo.professeurId !== professeurId) {
      throw new NotFoundException('Disponibilité introuvable');
    }

    await this.prisma.disponibilite.delete({ where: { id: disponibiliteId } });
  }

  // ───────────────────────── Réservations ────────────────────────────

  /**
   * Crée une réservation. Le créneau élève (date + heures + fuseau) est
   * converti en UTC puis on vérifie :
   *   1. qu'il tombe bien dans une disponibilité du professeur ;
   *   2. qu'aucune autre réservation non annulée ne chevauche ce créneau.
   *
   * Statut initial : EN_ATTENTE. (La réservation instantanée — CONFIRME
   * d'emblée — sera activée via un feature flag sur le profil professeur.)
   */
  async creerReservation(
    eleveId: string,
    dto: CreerReservationDto,
  ): Promise<ReservationReponseDto> {
    if (dto.professeurId === eleveId) {
      throw new BadRequestException(
        'Impossible de réserver un cours avec soi-même',
      );
    }

    const creneauDebut = heureLocaleVersUtc(
      dto.dateLocale,
      dto.heureDebut,
      dto.fuseauHoraireEleve,
    );
    const creneauFin = heureLocaleVersUtc(
      dto.dateLocale,
      dto.heureFin,
      dto.fuseauHoraireEleve,
    );

    if (creneauFin <= creneauDebut) {
      throw new BadRequestException('La fin du créneau doit être après le début');
    }

    if (creneauDebut < new Date()) {
      throw new BadRequestException('Impossible de réserver un cours dans le passé');
    }

    // 1) Le créneau doit correspondre à une disponibilité hebdomadaire du
    //    professeur. On re-projette le début UTC dans le fuseau du professeur
    //    pour retrouver le jour et l'heure locale à comparer.
    const professeur = await this.prisma.user.findUnique({
      where: { id: dto.professeurId },
      select: { fuseauHoraire: true, role: true },
    });
    if (!professeur || professeur.role !== 'PROFESSEUR') {
      throw new NotFoundException('Professeur introuvable');
    }

    const debutLocalProf = this.projeterUtcVersLocale(creneauDebut, professeur.fuseauHoraire);
    const finLocalProf = this.projeterUtcVersLocale(creneauFin, professeur.fuseauHoraire);

    const dispoValide = await this.prisma.disponibilite.findFirst({
      where: {
        professeurId: dto.professeurId,
        jour: debutLocalProf.jour,
        AND: [
          { heureDebut: { lte: debutLocalProf.heure } },
          { heureFin: { gte: finLocalProf.heure } },
        ],
      },
    });
    if (!dispoValide) {
      throw new BadRequestException(
        'Ce créneau ne correspond à aucune disponibilité du professeur',
      );
    }

    // 2) Aucune réservation active ne doit chevaucher ce créneau.
    const conflit = await this.prisma.reservation.findFirst({
      where: {
        professeurId: dto.professeurId,
        statut: { not: StatutReservation.ANNULE },
        AND: [
          { creneauDebut: { lt: creneauFin } },
          { creneauFin: { gt: creneauDebut } },
        ],
      },
    });
    if (conflit) {
      throw new ConflictException('Le professeur a déjà un cours sur ce créneau');
    }

    const reference = `RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const cree = await this.prisma.reservation.create({
      data: {
        eleveId,
        professeurId: dto.professeurId,
        reference,
        creneauDebut,
        creneauFin,
        statut: StatutReservation.EN_ATTENTE,
        noteEleve: dto.noteEleve,
      },
    });

    return this.sanitiserReservation(cree);
  }

  /**
   * Change le statut d'une réservation en respectant les transitions licites :
   *   - CONFIRME  : EN_ATTENTE -> CONFIRME      (professeur ou résa. instantanée)
   *   - ANNULE    : EN_ATTENTE|CONFIRME -> ANNULE
   *   - REALISE   : CONFIRME -> REALISE
   *   - ABSENT    : CONFIRME -> ABSENT
   */
  async changerStatut(
    reservationId: string,
    nouveauStatut: StatutReservation,
    demandeurId: string,
  ): Promise<ReservationReponseDto> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    this.verifierTransition(reservation.statut, nouveauStatut);

    // Contrôle d'autorisation fin : seul l'élève peut annuler sa résa, seul
    // le professeur confirme/réalise/signale l'absence. La vérification du
    // rôle global reste faite par les gardes au niveau du contrôleur ; ici on
    // blinde l'appartenance.
    if (nouveauStatut === StatutReservation.ANNULE) {
      if (demandeurId !== reservation.eleveId && demandeurId !== reservation.professeurId) {
        throw new BadRequestException('Seuls les participants peuvent annuler');
      }
    } else {
      if (demandeurId !== reservation.professeurId) {
        throw new BadRequestException(
          'Seul le professeur peut changer ce statut',
        );
      }
    }

    const maj = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: { statut: nouveauStatut },
    });

    // ── Gestion du séquestre ──────────────────────────────────────────
    // Lors de la confirmation, on bloque le tarif du professeur sur le compte élève.
    if (nouveauStatut === StatutReservation.CONFIRME) {
      try {
        const profil = await this.prisma.teacherProfile.findUnique({
          where: { userId: reservation.professeurId },
          select: { tarifHoraire: true },
        });
        const montant = profil?.tarifHoraire ?? 0;
        if (montant > 0) {
          await this.paiementService.bloquerFonds(
            reservation.eleveId,
            reservationId,
            montant,
          );
        }
      } catch {
        // Si le solde est insuffisant la réservation reste en attente
        // et l'erreur est propagée pour que le contrôleur renvoie 400.
        await this.prisma.reservation.update({
          where: { id: reservationId },
          data: { statut: StatutReservation.EN_ATTENTE },
        });
        throw new BadRequestException(
          'Solde insuffisant — rechargez votre compte pour confirmer ce cours',
        );
      }
    }

    // Lors de l'annulation, les fonds séquestrés sont restitués à l'élève.
    if (nouveauStatut === StatutReservation.ANNULE) {
      await this.paiementService.restituerFonds(reservationId);
    }

    return this.sanitiserReservation(maj);
  }

  /** Détail d'une réservation (réservé à ses participants). */
  async trouverReservation(
    reservationId: string,
    demandeurId: string,
  ): Promise<ReservationReponseDto> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }
    if (reservation.eleveId !== demandeurId && reservation.professeurId !== demandeurId) {
      // On renvoie 404 plutôt que 403 pour ne pas révéler l'existence du cours.
      throw new NotFoundException('Réservation introuvable');
    }
    return this.sanitiserReservation(reservation);
  }

  /** Liste paginée des réservations d'un utilisateur (élève ou professeur). */
  async listerReservations(
    utilisateurId: string,
    pagination: PaginationDto,
    enTantQueProfesseur = false,
  ): Promise<PageReponseDto<ReservationReponseDto>> {
    const take = calculerTake(pagination);
    const skip = calculerSkip(pagination);
    const cle = enTantQueProfesseur ? 'professeurId' : 'eleveId';

    const [total, lignes] = await Promise.all([
      this.prisma.reservation.count({ where: { [cle]: utilisateurId } }),
      this.prisma.reservation.findMany({
        where: { [cle]: utilisateurId },
        orderBy: { creneauDebut: 'asc' },
        take,
        skip,
      }),
    ]);

    return {
      total,
      page: pagination.page ?? 1,
      taille: take,
      donnees: lignes.map(this.sanitiserReservation),
    };
  }

  // ─────────────────────────── Utilitaires ───────────────────────────

  /** Vérifie que l'heure de début précède strictement l'heure de fin. */
  private verifierOrdreHeures(heureDebut: string, heureFin: string): void {
    if (heureDebut >= heureFin) {
      throw new BadRequestException("L'heure de fin doit être après l'heure de début");
    }
  }

  /**
   * Projette une Date UTC vers le fuseau du professeur et renvoie le jour de
   * la semaine (énumération) + l'heure locale "HH:mm".
   */
  private projeterUtcVersLocale(
    dateUtc: Date,
    fuseauProfesseur: string,
  ): { jour: JourSemaine; heure: string } {
    const heure = utcVersHeureLocale(dateUtc, fuseauProfesseur);
    const jourEnum = JOUR_VERS_ENUM[dateUtc.getUTCDay()] ?? JourSemaine.DIMANCHE;
    return { jour: jourEnum, heure };
  }

  /** Vérifie qu'une transition de statut est licite, sinon lève une erreur. */
  private verifierTransition(
    ancien: StatutReservation,
    nouveau: StatutReservation,
  ): void {
    const transitions: Record<StatutReservation, StatutReservation[]> = {
      [StatutReservation.EN_ATTENTE]: [
        StatutReservation.CONFIRME,
        StatutReservation.ANNULE,
      ],
      [StatutReservation.CONFIRME]: [
        StatutReservation.REALISE,
        StatutReservation.ABSENT,
        StatutReservation.ANNULE,
      ],
      [StatutReservation.REALISE]: [],
      [StatutReservation.ANNULE]: [],
      [StatutReservation.ABSENT]: [],
    };

    const autorisees = transitions[ancien] ?? [];
    if (!autorisees.includes(nouveau)) {
      throw new BadRequestException(
        `Transition de statut interdite : ${ancien} -> ${nouveau}`,
      );
    }
  }

  private sanitiserDisponibilite(d: Disponibilite): DisponibiliteReponseDto {
    return {
      id: d.id,
      jour: d.jour,
      heureDebut: d.heureDebut,
      heureFin: d.heureFin,
      recurrence: d.recurrence,
    };
  }

  private sanitiserReservation(r: Reservation): ReservationReponseDto {
    return {
      id: r.id,
      eleveId: r.eleveId,
      professeurId: r.professeurId,
      creneauDebut: r.creneauDebut,
      creneauFin: r.creneauFin,
      statut: r.statut,
      noteEleve: r.noteEleve,
    };
  }
}
