import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Sante')
@Controller('health')
export class HealthControleur {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Vérifie l'état de santé du backend et des dépendances (PostgreSQL)" })
  async verifier() {
    let bdOperationnelle = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      bdOperationnelle = true;
    } catch {
      bdOperationnelle = false;
    }

    const statutGlobal = bdOperationnelle ? 'ok' : 'degrade';

    return {
      statut: statutGlobal,
      horodatage: new Date().toISOString(),
      services: {
        api: 'ok',
        baseDeDonnees: bdOperationnelle ? 'ok' : 'erreur',
      },
    };
  }
}
