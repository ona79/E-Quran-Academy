// Module Prisma : expose PrismaService globalement pour que tous les modules
// métier puissent l'injecter sans chacun le redéclarer.
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
