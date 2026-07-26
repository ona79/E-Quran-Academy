import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enregistre un événement sensible dans le journal d'audit.
   * Cette action est encapsulée pour ne pas planter la requête si l'écriture échoue.
   */
  async enregistrer(
    acteurId: string | null,
    cibleId: string | null,
    evenement: string,
    details?: any,
  ): Promise<void> {
    try {
      await this.prisma.journalAudit.create({
        data: {
          acteurId,
          cibleId,
          evenement,
          details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        },
      });
    } catch (err) {
      this.logger.error(
        `Échec de l'enregistrement de l'audit (${evenement}) : ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
