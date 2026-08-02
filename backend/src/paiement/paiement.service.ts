import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { PrismaService } from '../partages/prisma/prisma.service';

// Enums définis localement jusqu'à ce que `prisma db push` soit exécuté sur Neon
// et que le client Prisma soit régénéré (ils correspondent aux valeurs du schéma).
const StatutEscrow = { BLOQUE: 'BLOQUE', LIBERE: 'LIBERE', REMBOURSE: 'REMBOURSE' } as const;
type StatutEscrow = (typeof StatutEscrow)[keyof typeof StatutEscrow];
const MethodePaiement = { STRIPE: 'STRIPE', PAYDUNYA: 'PAYDUNYA', CINETPAY: 'CINETPAY', MANUEL: 'MANUEL' } as const;
type MethodePaiement = (typeof MethodePaiement)[keyof typeof MethodePaiement];

// NOTE : Le client Prisma sera regénéré lors du `prisma db push` sur Neon.
// En attendant, les nouveaux champs (solde sur User, table Paiement) sont
// accessibles via des casts `any` pour ne pas bloquer la compilation.

function userRepo(prisma: PrismaService) {
  return (prisma as any).user as any;
}

function paiementsRepo(prisma: PrismaService) {
  return (prisma as any).paiement as any;
}

@Injectable()
export class PaiementService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaiementService.name);
  private intervalleId?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // Tâche de fond : libère automatiquement les fonds séquestrés toutes les heures.
    this.intervalleId = setInterval(() => {
      this.libererEscrowsAutomatique().catch((err) => {
        this.logger.error('Erreur lors de la libération automatique des séquestres', err);
      });
    }, 60 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.intervalleId) {
      clearInterval(this.intervalleId);
    }
  }

  /** Récupère le solde actuel de l'utilisateur. */
  async chargerSolde(userId: string): Promise<number> {
    const utilisateur = await userRepo(this.prisma).findUnique({
      where: { id: userId },
      select: { solde: true },
    });
    if (!utilisateur) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return utilisateur.solde as number;
  }

  /** Recharge le solde de l'élève (simulation dev). */
  async simulerRecharge(userId: string, montant: number): Promise<{ solde: number }> {
    if (montant <= 0) {
      throw new BadRequestException('Le montant doit être supérieur à zéro');
    }
    const maj = await userRepo(this.prisma).update({
      where: { id: userId },
      data: { solde: { increment: montant } },
      select: { solde: true },
    });
    return { solde: maj.solde as number };
  }

  /** Crédite manuellement un compte (admin). */
  async crediterManuellement(email: string, montant: number): Promise<{ solde: number }> {
    if (montant <= 0) {
      throw new BadRequestException('Le montant doit être supérieur à zéro');
    }
    const utilisateur = await userRepo(this.prisma).findUnique({ where: { email } });
    if (!utilisateur) {
      throw new NotFoundException('Aucun utilisateur trouvé avec cet e-mail');
    }
    const maj = await userRepo(this.prisma).update({
      where: { id: utilisateur.id },
      data: { solde: { increment: montant } },
      select: { solde: true },
    });
    return { solde: maj.solde as number };
  }

  /** Vérifie si les paiements réels sont activés via feature flag */
  async isPaiementActif(): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { cle: 'paiement.actif' },
    });
    return flag?.actif ?? false;
  }

  /**
   * Bloque le tarif horaire en le prélevant du solde de l'élève et en créant
   * un enregistrement séquestré.
   */
  async bloquerFonds(eleveId: string, reservationId: string, montant: number): Promise<void> {
    const actif = await this.isPaiementActif();
    if (actif) {
      this.logger.log(`Paiement réel activé pour ${reservationId} (Intégration Stripe à venir)`);
      // TODO: Implémentation Stripe
    } else {
      this.logger.log(`Simulation escrow pour ${reservationId} (montant: ${montant})`);
    }

    const solde = await this.chargerSolde(eleveId);
    if (solde < montant) {
      throw new BadRequestException('Solde insuffisant pour réserver ce cours');
    }

    await this.prisma.$transaction(async (tx) => {
      await (tx as any).user.update({
        where: { id: eleveId },
        data: { solde: { decrement: montant } },
      });
      await (tx as any).paiement.create({
        data: {
          eleveId,
          reservationId,
          montant,
          statutEscrow: StatutEscrow.BLOQUE,
          methode: MethodePaiement.MANUEL,
        },
      });
    });
  }

  /** Restitue les fonds séquestrés à l'élève (annulation). */
  async restituerFonds(reservationId: string): Promise<void> {
    const repo = paiementsRepo(this.prisma);
    const paiement = await repo.findUnique({ where: { reservationId } });

    if (!paiement) {
      return; // Réservation sans paiement (gratuite ou antérieure à l'activation)
    }
    if (paiement.statutEscrow !== StatutEscrow.BLOQUE) {
      throw new BadRequestException("Le paiement n'est plus à l'état bloqué");
    }

    await this.prisma.$transaction(async (tx) => {
      await (tx as any).user.update({
        where: { id: paiement.eleveId },
        data: { solde: { increment: paiement.montant } },
      });
      await (tx as any).paiement.update({
        where: { id: paiement.id },
        data: { statutEscrow: StatutEscrow.REMBOURSE },
      });
    });
  }

  /** Libère les fonds séquestrés vers le compte du professeur. */
  async libererFonds(reservationId: string): Promise<void> {
    const repo = paiementsRepo(this.prisma);
    const paiement = await repo.findUnique({
      where: { reservationId },
      include: { reservation: true },
    });

    if (!paiement) {
      throw new NotFoundException('Séquestre introuvable pour cette réservation');
    }
    if (paiement.statutEscrow !== StatutEscrow.BLOQUE) {
      throw new BadRequestException("Le paiement n'est plus à l'état bloqué");
    }

    await this.prisma.$transaction(async (tx) => {
      await (tx as any).user.update({
        where: { id: paiement.reservation.professeurId },
        data: { solde: { increment: paiement.montant } },
      });
      await (tx as any).paiement.update({
        where: { id: paiement.id },
        data: { statutEscrow: StatutEscrow.LIBERE },
      });
    });
  }

  /** Libère automatiquement les séquestres des cours réalisés depuis plus de 24h. */
  async libererEscrowsAutomatique(): Promise<void> {
    const repo = paiementsRepo(this.prisma);
    const dateLimite = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const paiementsALiberer: any[] = await repo.findMany({
      where: {
        statutEscrow: StatutEscrow.BLOQUE,
        reservation: {
          statut: StatutReservation.REALISE,
          misAJourLe: { lte: dateLimite },
        },
      },
    });

    if (paiementsALiberer.length > 0) {
      this.logger.log(`Libération automatique de ${paiementsALiberer.length} séquestre(s)`);
      for (const paiement of paiementsALiberer) {
        try {
          await this.libererFonds(paiement.reservationId);
        } catch (err) {
          this.logger.error(`Impossible de libérer le séquestre ${paiement.id}`, err);
        }
      }
    }
  }

  /** Liste l'historique des transactions d'un utilisateur. */
  async listerTransactions(userId: string) {
    const repo = paiementsRepo(this.prisma);
    return repo.findMany({
      where: {
        OR: [
          { eleveId: userId },
          { reservation: { professeurId: userId } },
        ],
      },
      include: { reservation: true },
      orderBy: { creeLe: 'desc' },
    });
  }
}
