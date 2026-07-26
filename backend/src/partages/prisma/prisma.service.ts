// Service d'accès à la base de données (PostgreSQL via Prisma).
// Transverse à tous les modules : permet d'accéder à Prisma sans que chaque
// module métier ait à réimporter le client Prisma — mais un module n'accède
// qu'à SES propres tables (règle #2 du cahier des charges).
import { INestApplicationContext, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Ferme proprement la connexion lors de l'arrêt de l'application.
   * Important avec au moins 2 instances derrière un load balancer : le
   * signal d'arrêt doit libérer les connexions DB avant que l'instance
   * disparaisse du pool.
   */
  async enableShutdownHooks(app: INestApplicationContext): Promise<void> {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
