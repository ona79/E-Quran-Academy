// Module NestJS : regroupe le contrôleur REST, le service métier, la gateway
// WebSocket et le service Daily.co du domaine "classe-virtuelle".
// Domaine : salle de classe virtuelle (visio + Mushaf synchronisé).
//
// Dépendances transverses (fournies globalement par PartagesModule) :
// - PrismaService
// - JwtModule (utilisé par la gateway pour vérifier les jetons au handshake)
import { Module } from '@nestjs/common';
import { ClasseVirtuelleControleur } from './classe-virtuelle.controleur';
import { ClasseVirtuelleService } from './classe-virtuelle.service';
import { MushafGateway } from './mushaf.gateway';
import { DailyCoService } from './daily-co/daily-co.service';
import { QuranHubService } from './quran-hub/quran-hub.service';

@Module({
  controllers: [ClasseVirtuelleControleur],
  providers: [ClasseVirtuelleService, MushafGateway, DailyCoService, QuranHubService],
  exports: [ClasseVirtuelleService],
})
export class ClasseVirtuelleModule {}
