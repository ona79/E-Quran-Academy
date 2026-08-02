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

    // Nettoyage des disponibilités PONCTUELLES (une seule fois) à la fin de leur journée.
    const ponctuelles = await this.prisma.disponibilite.findMany({
      where: { recurrence: 'PONCTUELLE' },
      include: { professeur: { select: { fuseauHoraire: true } } },
    });

    const JOURS = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
    let ponctuellesSupprimees = 0;

    for (const p of ponctuelles) {
      // Sécurité : si créé il y a plus de 7 jours, c'est forcément expiré.
      if (maintenant.getTime() - p.creeLe.getTime() > 7 * 24 * 3600 * 1000) {
        await this.prisma.disponibilite.delete({ where: { id: p.id } });
        ponctuellesSupprimees++;
        continue;
      }

      // Calcul simple : on vérifie si on a dépassé le jour cible dans le fuseau du prof
      // On utilise l'Intl API pour avoir le jour de la semaine et la date locale
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: p.professeur.fuseauHoraire,
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      const creeParts = formatter.formatToParts(p.creeLe);
      const mntParts = formatter.formatToParts(maintenant);

      const creeWeekday = creeParts.find(x => x.type === 'weekday')?.value.toUpperCase() || '';
      
      // On trouve le jour cible en anglais pour simplifier (car Intl renvoie Sunday, Monday...)
      const mappingEn = {
        'DIMANCHE': 'SUNDAY', 'LUNDI': 'MONDAY', 'MARDI': 'TUESDAY',
        'MERCREDI': 'WEDNESDAY', 'JEUDI': 'THURSDAY', 'VENDREDI': 'FRIDAY', 'SAMEDI': 'SATURDAY'
      };
      const cibleEn = mappingEn[p.jour];

      // Si le jour cible était aujourd'hui (le jour de création), et qu'on n'est plus ce jour-là (maintenant)
      const creeDateStr = formatter.format(p.creeLe);
      const mntDateStr = formatter.format(maintenant);

      if (creeWeekday === cibleEn) {
        // Le créneau était pour le jour même de sa création.
        if (creeDateStr !== mntDateStr) {
          // La journée est finie !
          await this.prisma.disponibilite.delete({ where: { id: p.id } });
          ponctuellesSupprimees++;
        }
      } else {
        // Le créneau était pour un des jours suivants. S'il s'est écoulé plus de jours que nécessaire
        // (ex: de lundi à mardi = 1 jour. Si on est mercredi, c'est passé).
        // Plus sûr : utiliser date-fns-tz si besoin, mais le délai de 7 jours nettoiera tout en filet de sécurité.
        // On peut juste se fier au délai de 7 jours ou faire un calcul de delta.
        // Pour être réactif :
        const getIndex = (d: string) => ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].indexOf(d);
        const cibleIdx = getIndex(cibleEn);
        const creeIdx = getIndex(creeWeekday);
        const mntIdx = getIndex(mntParts.find(x => x.type === 'weekday')?.value.toUpperCase() || '');
        
        let deltaCible = cibleIdx - creeIdx;
        if (deltaCible < 0) deltaCible += 7;

        let deltaMnt = mntIdx - creeIdx;
        if (deltaMnt < 0 && (maintenant.getTime() - p.creeLe.getTime() > 24*3600*1000)) deltaMnt += 7;

        if (deltaMnt > deltaCible && (maintenant.getTime() - p.creeLe.getTime() > deltaCible * 24 * 3600 * 1000)) {
          await this.prisma.disponibilite.delete({ where: { id: p.id } });
          ponctuellesSupprimees++;
        }
      }
    }

    if (ponctuellesSupprimees > 0) {
      this.logger.log(`Cron : ${ponctuellesSupprimees} disponibilités PONCTUELLE expirées ont été supprimées.`);
    }
  }
}
