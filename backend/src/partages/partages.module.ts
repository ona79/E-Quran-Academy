// Point d'assemblage de l'infrastructure transverse (non métier).
// Tout ce qui n'est pas un domaine métier mais qui sert à plusieurs modules
// vit ici : Prisma, authentification, futurs utilitaires (cache, files…).
import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';

@Global()
@Module({
  imports: [PrismaModule, AuthModule, AuditModule],
  exports: [PrismaModule, AuthModule, AuditModule],
})
export class PartagesModule {}
