// Module NestJS : regroupe le contrôleur et le service du domaine
// "suivi-pedagogique".
// Domaine : formulaire de fin de cours, sourates mémorisées/révisées, tajwid.
// Ne dépend d'aucun autre module métier directement (PartagesModule global).
import { Module } from '@nestjs/common';
import { SuiviPedagogiqueControleur } from './suivi-pedagogique.controleur';
import { SuiviPedagogiqueService } from './suivi-pedagogique.service';

@Module({
  controllers: [SuiviPedagogiqueControleur],
  providers: [SuiviPedagogiqueService],
  exports: [SuiviPedagogiqueService],
})
export class SuiviPedagogiqueModule {}
