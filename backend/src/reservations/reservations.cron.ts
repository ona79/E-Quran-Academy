import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../partages/prisma/prisma.service';
import { StatutReservation } from '@prisma/client';

@Injectable()
export class ReservationsCron {
  private readonly logger = new Logger(ReservationsCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async gererStatutsPasses() {
    this.logger.debug('Exécution du cron : vérification des statuts de réservations passées...');
    
    const maintenant = new Date();

    // Les réservations EN_ATTENTE dont le créneauDebut est passé doivent être ANNULE
    // (ou un équivalent, ici ANNULE car l'utilisateur l'a suggéré)
    const enAttenteExpir = await this.prisma.reservation.updateMany({
      where: {
        statut: StatutReservation.EN_ATTENTE,
        creneauDebut: { lt: maintenant },
      },
      data: {
        statut: StatutReservation.ANNULE,
      },
    });

    if (enAttenteExpir.count > 0) {
      this.logger.log(`Cron : ${enAttenteExpir.count} réservations EN_ATTENTE passées en ANNULE.`);
    }

    // Les réservations CONFIRME dont le creneauFin est passé doivent devenir REALISE
    const confirmeExpir = await this.prisma.reservation.updateMany({
      where: {
        statut: StatutReservation.CONFIRME,
        creneauFin: { lt: maintenant },
      },
      data: {
        statut: StatutReservation.REALISE,
      },
    });

    if (confirmeExpir.count > 0) {
      this.logger.log(`Cron : ${confirmeExpir.count} réservations CONFIRME passées en REALISE.`);
    }
  }
}
