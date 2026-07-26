// Point d'assemblage : importe l'infrastructure transverse puis chacun des
// modules métier. N'effectue aucune logique elle-même — uniquement de la
// composition.
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PartagesModule } from './partages/partages.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ClasseVirtuelleModule } from './classe-virtuelle/classe-virtuelle.module';
import { SuiviPedagogiqueModule } from './suivi-pedagogique/suivi-pedagogique.module';
import { AvisModule } from './avis/avis.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { MessagerieModule } from './messagerie/messagerie.module';
import { PaiementModule } from './paiement/paiement.module';

@Module({
  imports: [
    // ── Sécurité : rate-limiting global ────────────────────────────────────
    // Limite par défaut : 100 requêtes par minute pour toutes les routes.
    // Les routes sensibles (/connexion, /inscription) surchargeront cette
    // limite avec @Throttle() au niveau du contrôleur.
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60_000,  // 1 minute en ms
        limit: 100,
      },
    ]),

    ScheduleModule.forRoot(),

    // Couche transverse (Prisma, JWT, gardes) — Global, disponible partout.
    PartagesModule,
    // Domaines métier :
    UtilisateursModule,
    ReservationsModule,
    ClasseVirtuelleModule,
    SuiviPedagogiqueModule,
    AvisModule,
    FeatureFlagsModule,
    MessagerieModule,
    PaiementModule,
  ],
  providers: [
    // ThrottlerGuard global : protège toutes les routes (100 req/min).
    // Les endpoints sensibles surchargent via @Throttle() dans le contrôleur.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

