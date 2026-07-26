// Module NestJS : regroupe le contrôleur et le service du domaine "avis".
// Domaine : notes et commentaires laissés par les élèves sur les professeurs.
// Ne dépend d'aucun autre module métier directement (PartagesModule global).
import { Module } from '@nestjs/common';
import { AvisControleur } from './avis.controleur';
import { AvisService } from './avis.service';

@Module({
  controllers: [AvisControleur],
  providers: [AvisService],
  exports: [AvisService],
})
export class AvisModule {}
