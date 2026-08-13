import { Module } from '@nestjs/common';
import { HealthControleur } from './health.controleur';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HealthControleur],
})
export class HealthModule {}
