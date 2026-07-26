// Module NestJS : regroupe le contrôleur et le service du domaine "messagerie".
// Domaine : messagerie asynchrone entre élèves et professeurs.
// Ne dépend d'aucun autre module métier directement (PartagesModule global).
import { Module } from '@nestjs/common';
import { MessagerieControleur } from './messagerie.controleur';
import { MessagerieService } from './messagerie.service';

@Module({
  controllers: [MessagerieControleur],
  providers: [MessagerieService],
  exports: [MessagerieService],
})
export class MessagerieModule {}
