// Module NestJS : regroupe le contrôleur et le service du domaine "reservations".
// Domaine : disponibilités des professeurs + réservations de cours par les élèves.
// Ne dépend d'aucun autre module métier directement : la couche transverse
// (Prisma, JWT, gardes) est fournie par PartagesModule (Global).
import { Module } from '@nestjs/common';
import { ReservationsControleur } from './reservations.controleur';
import { ReservationsService } from './reservations.service';
import { ReservationsCron } from './reservations.cron';
import { PaiementModule } from '../paiement/paiement.module';

@Module({
  imports: [PaiementModule],
  controllers: [ReservationsControleur],
  providers: [ReservationsService, ReservationsCron],
  exports: [ReservationsService],
})
export class ReservationsModule {}
